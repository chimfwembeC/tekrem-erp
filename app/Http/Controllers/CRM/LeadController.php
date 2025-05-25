<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LeadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Lead::query()
            ->with('user')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('company', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->source, function ($query, $source) {
                $query->where('source', $source);
            });

        $leads = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('CRM/Leads/Index', [
            'leads' => $leads,
            'filters' => $request->only(['search', 'status', 'source']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('CRM/Leads/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'company' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'source' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', Rule::in(['new', 'contacted', 'qualified', 'unqualified'])],
        ]);

        $validated['user_id'] = Auth::id();

        $lead = Lead::create($validated);

        // Create notifications for relevant users
        $notifiableUsers = NotificationService::getNotifiableUsers($lead, Auth::user());
        $message = Auth::user()->name . " created a new lead: '{$lead->name}'";
        $link = route('crm.leads.show', $lead->id);

        NotificationService::notifyUsers($notifiableUsers, 'lead', $message, $link, $lead);

        return redirect()->route('crm.leads.show', $lead)
            ->with('success', 'Lead created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Lead $lead)
    {
        $lead->load(['user', 'communications' => function ($query) {
            $query->with('user')->latest();
        }]);

        return Inertia::render('CRM/Leads/Show', [
            'lead' => $lead,
            'communications' => $lead->communications()->with('user')->latest()->paginate(5),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Lead $lead)
    {
        return Inertia::render('CRM/Leads/Edit', [
            'lead' => $lead,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'company' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'source' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', Rule::in(['new', 'contacted', 'qualified', 'unqualified'])],
        ]);

        $lead->update($validated);

        return redirect()->route('crm.leads.show', $lead)
            ->with('success', 'Lead updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lead $lead)
    {
        $lead->delete();

        return redirect()->route('crm.leads.index')
            ->with('success', 'Lead deleted successfully.');
    }

    /**
     * Convert a lead to a client.
     */
    public function convertToClient(Lead $lead)
    {
        // Check if lead is already converted
        if ($lead->converted_to_client) {
            return redirect()->route('crm.leads.show', $lead)
                ->with('error', 'Lead has already been converted to a client.');
        }

        DB::beginTransaction();

        try {
            // Create a new client from the lead data
            $client = Client::create([
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'company' => $lead->company,
                'position' => $lead->position,
                'address' => $lead->address,
                'city' => $lead->city,
                'state' => $lead->state,
                'postal_code' => $lead->postal_code,
                'country' => $lead->country,
                'notes' => $lead->notes,
                'status' => 'active',
                'user_id' => $lead->user_id,
                'converted_from_lead_id' => $lead->id,
            ]);

            // Update the lead to mark it as converted
            $lead->update([
                'converted_to_client' => true,
                'converted_to_client_id' => $client->id,
                'converted_at' => now(),
            ]);

            DB::commit();

            // Create notifications for admin users
            $adminUsers = User::role('admin')->where('id', '!=', Auth::id())->get();
            foreach ($adminUsers as $admin) {
                NotificationService::createLeadNotification(
                    $admin,
                    "Lead '{$lead->name}' was converted to a client by " . Auth::user()->name,
                    $lead
                );

                NotificationService::createClientNotification(
                    $admin,
                    "New client '{$client->name}' was created from a lead by " . Auth::user()->name,
                    $client
                );
            }

            return redirect()->route('crm.clients.show', $client)
                ->with('success', 'Lead successfully converted to client.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('crm.leads.show', $lead)
                ->with('error', 'Failed to convert lead to client: ' . $e->getMessage());
        }
    }
}
