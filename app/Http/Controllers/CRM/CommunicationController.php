<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Communication;
use App\Models\Lead;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CommunicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Communication::query()
            ->with(['communicable', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('subject', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            });

        $communications = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('CRM/Communications/Index', [
            'communications' => $communications,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $clients = Client::select('id', 'name')->get();
        $leads = Lead::select('id', 'name')->get();

        return Inertia::render('CRM/Communications/Create', [
            'clients' => $clients,
            'leads' => $leads,
            'communicableType' => $request->communicable_type,
            'communicableId' => $request->communicable_id,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(['email', 'call', 'meeting', 'note'])],
            'content' => ['required', 'string'],
            'subject' => ['nullable', 'string', 'max:255'],
            'communication_date' => ['required', 'date'],
            'direction' => ['nullable', 'string', Rule::in(['inbound', 'outbound'])],
            'status' => ['nullable', 'string', Rule::in(['completed', 'scheduled', 'cancelled'])],
            'communicable_type' => ['required', 'string', Rule::in(['App\\Models\\Client', 'App\\Models\\Lead'])],
            'communicable_id' => ['required', 'integer'],
        ]);

        // Verify the communicable exists
        $communicableType = $validated['communicable_type'];
        $communicableId = $validated['communicable_id'];
        $communicable = $communicableType::find($communicableId);

        if (!$communicable) {
            return redirect()->back()->withErrors([
                'communicable_id' => 'The selected client or lead does not exist.',
            ]);
        }

        $validated['user_id'] = Auth::id();

        $communication = Communication::create($validated);

        // Get the communicable entity
        $communicable = $communicableType::find($communicableId);

        // Create notifications for team members
        if ($communicable) {
            // Notify the assigned user if different from the current user
            if ($communicable->user_id && $communicable->user_id !== Auth::id()) {
                $assignedUser = User::find($communicable->user_id);
                if ($assignedUser) {
                    $entityType = $communicableType === 'App\\Models\\Client' ? 'client' : 'lead';
                    $message = Auth::user()->name . " added a new {$validated['type']} communication to your {$entityType} '{$communicable->name}'";

                    NotificationService::createCommunicationNotification($assignedUser, $message, $communication);
                }
            }

            // Notify admin users
            $adminUsers = User::role('admin')
                ->where('id', '!=', Auth::id())
                ->where('id', '!=', $communicable->user_id)
                ->get();

            foreach ($adminUsers as $admin) {
                $entityType = $communicableType === 'App\\Models\\Client' ? 'client' : 'lead';
                $message = Auth::user()->name . " added a new {$validated['type']} communication to {$entityType} '{$communicable->name}'";

                NotificationService::createCommunicationNotification($admin, $message, $communication);
            }
        }

        if ($communicableType === 'App\\Models\\Client') {
            return redirect()->route('crm.clients.show', $communicableId)
                ->with('success', 'Communication added successfully.');
        } else {
            return redirect()->route('crm.leads.show', $communicableId)
                ->with('success', 'Communication added successfully.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Communication $communication)
    {
        $communication->load(['communicable', 'user']);

        return Inertia::render('CRM/Communications/Show', [
            'communication' => $communication,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Communication $communication)
    {
        $communication->load('communicable');
        $clients = Client::select('id', 'name')->get();
        $leads = Lead::select('id', 'name')->get();

        return Inertia::render('CRM/Communications/Edit', [
            'communication' => $communication,
            'clients' => $clients,
            'leads' => $leads,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Communication $communication)
    {
        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(['email', 'call', 'meeting', 'note'])],
            'content' => ['required', 'string'],
            'subject' => ['nullable', 'string', 'max:255'],
            'communication_date' => ['required', 'date'],
            'direction' => ['nullable', 'string', Rule::in(['inbound', 'outbound'])],
            'status' => ['nullable', 'string', Rule::in(['completed', 'scheduled', 'cancelled'])],
        ]);

        $communication->update($validated);

        return redirect()->route('crm.communications.show', $communication)
            ->with('success', 'Communication updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Communication $communication)
    {
        $communicable = $communication->communicable;
        $communication->delete();

        if ($communicable instanceof Client) {
            return redirect()->route('crm.clients.show', $communicable)
                ->with('success', 'Communication deleted successfully.');
        } elseif ($communicable instanceof Lead) {
            return redirect()->route('crm.leads.show', $communicable)
                ->with('success', 'Communication deleted successfully.');
        } else {
            return redirect()->route('crm.communications.index')
                ->with('success', 'Communication deleted successfully.');
        }
    }
}
