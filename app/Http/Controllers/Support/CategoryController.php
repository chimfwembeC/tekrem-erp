<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\TicketCategory;
use App\Models\Support\SLA;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = TicketCategory::query()
            ->withCount('tickets')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('active'));
            });

        $categories = $query->ordered()->paginate(15)->withQueryString();

        return Inertia::render('Support/Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'active']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $slaOptions = SLA::active()->get(['id', 'name']);
        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->get(['id', 'name']);

        return Inertia::render('Support/Categories/Create', [
            'slaOptions' => $slaOptions,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:ticket_categories,name'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'icon' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'default_priority' => ['required', 'string', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'default_sla_policy_id' => ['nullable', 'exists:s_l_a_s,id'],
            'auto_assign_to' => ['nullable', 'exists:users,id'],
        ]);

        $category = TicketCategory::create($validated);

        return redirect()->route('support.categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(TicketCategory $category): Response
    {
        $category->load(['defaultSlaPolicy']);
        $category->loadCount('tickets');

        // Get recent tickets in this category
        $recentTickets = $category->tickets()
            ->with(['assignedTo', 'createdBy', 'requester'])
            ->latest()
            ->take(10)
            ->get();

        // Get ticket statistics for this category
        $ticketStats = [
            'total' => $category->tickets()->count(),
            'open' => $category->tickets()->where('status', 'open')->count(),
            'in_progress' => $category->tickets()->where('status', 'in_progress')->count(),
            'resolved' => $category->tickets()->where('status', 'resolved')->count(),
            'closed' => $category->tickets()->where('status', 'closed')->count(),
        ];

        return Inertia::render('Support/Categories/Show', [
            'category' => $category,
            'recentTickets' => $recentTickets,
            'ticketStats' => $ticketStats,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TicketCategory $category): Response
    {
        $slaOptions = SLA::active()->get(['id', 'name']);
        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->get(['id', 'name']);

        return Inertia::render('Support/Categories/Edit', [
            'category' => $category,
            'slaOptions' => $slaOptions,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TicketCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('ticket_categories', 'name')->ignore($category->id)],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'icon' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'default_priority' => ['required', 'string', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'default_sla_policy_id' => ['nullable', 'exists:s_l_a_s,id'],
            'auto_assign_to' => ['nullable', 'exists:users,id'],
        ]);

        $category->update($validated);

        return redirect()->route('support.categories.show', $category)
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TicketCategory $category): RedirectResponse
    {
        // Check if category has tickets
        if ($category->tickets()->count() > 0) {
            return redirect()->route('support.categories.index')
                ->with('error', 'Cannot delete category that has tickets. Please reassign tickets first.');
        }

        $category->delete();

        return redirect()->route('support.categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}
