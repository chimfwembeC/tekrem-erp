<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\Ticket;
use App\Models\Support\TicketCategory;
use App\Models\Support\TicketComment;
use App\Models\Support\SLA;
use App\Models\User;
use App\Models\Client;
use App\Models\Lead;
use App\Services\AIService;
use App\Services\NotificationService;
use App\Services\Support\AutomationService;
use App\Services\Support\EmailNotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function __construct(
        private AutomationService $automationService,
        private EmailNotificationService $emailService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Ticket::query()
            ->with(['category', 'assignedTo', 'createdBy', 'requester'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('ticket_number', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->priority, function ($query, $priority) {
                $query->where('priority', $priority);
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->assigned_to, function ($query, $assignedTo) {
                if ($assignedTo === 'unassigned') {
                    $query->whereNull('assigned_to');
                } else {
                    $query->where('assigned_to', $assignedTo);
                }
            })
            ->when($request->overdue === 'true', function ($query) {
                $query->overdue();
            });

        $tickets = $query->latest()->paginate(15)->withQueryString();

        $categories = TicketCategory::active()->ordered()->get(['id', 'name']);
        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->get(['id', 'name']);

        return Inertia::render('Support/Tickets/Index', [
            'tickets' => $tickets,
            'categories' => $categories,
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'priority', 'category_id', 'assigned_to', 'overdue']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $categories = TicketCategory::active()->ordered()->get();
        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->get(['id', 'name']);

        $clients = Client::select('id', 'name', 'email')->get();
        $leads = Lead::select('id', 'name', 'email')->get();

        return Inertia::render('Support/Tickets/Create', [
            'categories' => $categories,
            'users' => $users,
            'clients' => $clients,
            'leads' => $leads,
            'requesterType' => $request->requester_type,
            'requesterId' => $request->requester_id,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'string', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'category_id' => ['nullable', 'exists:ticket_categories,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'requester_type' => ['nullable', 'string', Rule::in(['App\\Models\\Client', 'App\\Models\\Lead', 'App\\Models\\User'])],
            'requester_id' => ['nullable', 'integer'],
            'tags' => ['nullable', 'array'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'], // 10MB max
        ]);

        $validated['created_by'] = Auth::id();
        $validated['status'] = 'open';

        // Handle file attachments
        if ($request->hasFile('attachments')) {
            $attachments = [];
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('support/tickets', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
            $validated['metadata'] = ['attachments' => $attachments];
        }

        // Set SLA policy based on category or use default
        if ($validated['category_id']) {
            $category = TicketCategory::find($validated['category_id']);
            if ($category && $category->default_sla_policy_id) {
                $validated['sla_policy_id'] = $category->default_sla_policy_id;
            }
        }

        if (!isset($validated['sla_policy_id'])) {
            $defaultSLA = SLA::default()->first();
            if ($defaultSLA) {
                $validated['sla_policy_id'] = $defaultSLA->id;
            }
        }

        // Calculate due date based on SLA
        if (isset($validated['sla_policy_id'])) {
            $sla = SLA::find($validated['sla_policy_id']);
            if ($sla) {
                $validated['due_date'] = $sla->calculateDueDate(now(), 'resolution');
            }
        }

        $ticket = Ticket::create($validated);

        // Process automation rules
        $this->automationService->processTicketCreated($ticket);

        // Send email notifications
        $this->emailService->sendTicketCreated($ticket);

        // Create notifications
        $notifiableUsers = NotificationService::getNotifiableUsers($ticket, Auth::user());
        $message = Auth::user()->name . " created a new support ticket: '{$ticket->title}'";
        $link = route('support.tickets.show', $ticket->id);

        NotificationService::notifyUsers($notifiableUsers, 'ticket', $message, $link, $ticket);

        return redirect()->route('support.tickets.show', $ticket)
            ->with('success', 'Ticket created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Ticket $ticket): Response
    {
        $ticket->load([
            'category',
            'assignedTo',
            'createdBy',
            'requester',
            'slaPolicy',
            'comments' => function ($query) {
                $query->with('user')->latest();
            },
            'escalations' => function ($query) {
                $query->with(['escalatedBy', 'escalatedTo'])->latest();
            }
        ]);

        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->get(['id', 'name']);

        return Inertia::render('Support/Tickets/Show', [
            'ticket' => $ticket,
            'users' => $users,
            'comments' => $ticket->comments()->with('user')->latest()->paginate(10),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Ticket $ticket): Response
    {
        $categories = TicketCategory::active()->ordered()->get();
        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->get(['id', 'name']);

        return Inertia::render('Support/Tickets/Edit', [
            'ticket' => $ticket,
            'categories' => $categories,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ticket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'status' => ['required', 'string', Rule::in(['open', 'in_progress', 'pending', 'resolved', 'closed'])],
            'priority' => ['required', 'string', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'category_id' => ['nullable', 'exists:ticket_categories,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'tags' => ['nullable', 'array'],
        ]);

        // Track changes for automation
        $changes = [];
        $oldStatus = $ticket->status;
        $oldPriority = $ticket->priority;
        $oldAssignedTo = $ticket->assigned_to;

        $newStatus = $validated['status'];
        $newPriority = $validated['priority'];
        $newAssignedTo = $validated['assigned_to'] ?? null;

        // Set timestamps based on status changes
        if ($oldStatus !== $newStatus) {
            $changes['status'] = ['from' => $oldStatus, 'to' => $newStatus];

            if ($newStatus === 'resolved' && !$ticket->resolved_at) {
                $validated['resolved_at'] = now();
                $validated['resolution_time_minutes'] = $ticket->created_at->diffInMinutes(now());
            } elseif ($newStatus === 'closed' && !$ticket->closed_at) {
                $validated['closed_at'] = now();
            }
        }

        if ($oldPriority !== $newPriority) {
            $changes['priority'] = ['from' => $oldPriority, 'to' => $newPriority];
        }

        if ($oldAssignedTo !== $newAssignedTo) {
            $changes['assigned_to'] = ['from' => $oldAssignedTo, 'to' => $newAssignedTo];
        }

        $ticket->update($validated);

        // Process automation rules for updates
        if (!empty($changes)) {
            $this->automationService->processTicketUpdated($ticket, $changes);

            // Send email notifications for changes
            if (isset($changes['status'])) {
                $this->emailService->sendTicketUpdated($ticket, 'status_changed', $changes);
            } elseif (isset($changes['assigned_to'])) {
                $this->emailService->sendTicketUpdated($ticket, 'assigned', $changes);
            } else {
                $this->emailService->sendTicketUpdated($ticket, 'updated', $changes);
            }
        }

        return redirect()->route('support.tickets.show', $ticket)
            ->with('success', 'Ticket updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ticket $ticket): RedirectResponse
    {
        $ticket->delete();

        return redirect()->route('support.tickets.index')
            ->with('success', 'Ticket deleted successfully.');
    }

    /**
     * Assign ticket to a user.
     */
    public function assign(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'assigned_to' => ['required', 'exists:users,id'],
        ]);

        $ticket->update($validated);

        // Create notification
        $assignedUser = User::find($validated['assigned_to']);
        $message = "You have been assigned to ticket: {$ticket->title}";
        $link = route('support.tickets.show', $ticket->id);

        NotificationService::notifyUsers([$assignedUser], 'ticket_assignment', $message, $link, $ticket);

        return response()->json(['message' => 'Ticket assigned successfully.']);
    }

    /**
     * Escalate ticket.
     */
    public function escalate(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'escalated_to' => ['required', 'exists:users,id'],
            'reason' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $escalationLevel = $ticket->escalation_level + 1;

        $ticket->escalations()->create([
            'escalated_by' => Auth::id(),
            'escalated_to' => $validated['escalated_to'],
            'escalation_level' => $escalationLevel,
            'reason' => $validated['reason'],
            'notes' => $validated['notes'] ?? null,
            'escalated_at' => now(),
        ]);

        $ticket->update([
            'escalation_level' => $escalationLevel,
            'escalated_at' => now(),
            'assigned_to' => $validated['escalated_to'],
        ]);

        // Create notification
        $escalatedUser = User::find($validated['escalated_to']);
        $message = "Ticket has been escalated to you: {$ticket->title}";
        $link = route('support.tickets.show', $ticket->id);

        NotificationService::notifyUsers([$escalatedUser], 'ticket_escalation', $message, $link, $ticket);

        return response()->json(['message' => 'Ticket escalated successfully.']);
    }

    /**
     * Close ticket.
     */
    public function close(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'resolution_notes' => ['nullable', 'string'],
        ]);

        $ticket->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        // Add resolution comment if provided
        if (!empty($validated['resolution_notes'])) {
            $ticket->comments()->create([
                'user_id' => Auth::id(),
                'content' => $validated['resolution_notes'],
                'is_internal' => false,
                'is_solution' => true,
            ]);
        }

        return response()->json(['message' => 'Ticket closed successfully.']);
    }

    /**
     * Reopen ticket.
     */
    public function reopen(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string'],
        ]);

        $ticket->update([
            'status' => 'open',
            'resolved_at' => null,
            'closed_at' => null,
        ]);

        // Add reopen comment
        $ticket->comments()->create([
            'user_id' => Auth::id(),
            'content' => "Ticket reopened. Reason: " . $validated['reason'],
            'is_internal' => false,
        ]);

        return response()->json(['message' => 'Ticket reopened successfully.']);
    }

    /**
     * Add comment to ticket.
     */
    public function addComment(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string'],
            'is_internal' => ['boolean'],
            'is_solution' => ['boolean'],
            'time_spent_minutes' => ['nullable', 'integer', 'min:0'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'], // 10MB max
        ]);

        $validated['user_id'] = Auth::id();

        // Handle file attachments
        if ($request->hasFile('attachments')) {
            $attachments = [];
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('support/comments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
            $validated['attachments'] = $attachments;
        }

        $comment = $ticket->comments()->create($validated);

        // Update first response time if this is the first response
        if (!$ticket->first_response_at && !$validated['is_internal']) {
            $ticket->update([
                'first_response_at' => now(),
                'response_time_minutes' => $ticket->created_at->diffInMinutes(now()),
            ]);
        }

        $comment->load('user');

        return response()->json([
            'message' => 'Comment added successfully.',
            'comment' => $comment,
        ]);
    }

    /**
     * Store comment for ticket.
     */
    public function storeComment(Request $request, Ticket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string'],
            'is_internal' => ['boolean'],
            'is_solution' => ['boolean'],
            'time_spent_minutes' => ['nullable', 'integer', 'min:0'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'], // 10MB max
        ]);

        $validated['user_id'] = Auth::id();

        // Handle file attachments
        if ($request->hasFile('attachments')) {
            $attachments = [];
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('support/comments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
            $validated['attachments'] = $attachments;
        }

        $comment = $ticket->comments()->create($validated);

        // Update first response time if this is the first response
        if (!$ticket->first_response_at && !$validated['is_internal']) {
            $ticket->update([
                'first_response_at' => now(),
                'response_time_minutes' => $ticket->created_at->diffInMinutes(now()),
            ]);
        }

        return redirect()->back()->with('success', 'Comment added successfully.');
    }

    /**
     * Get AI suggestions for ticket resolution.
     */
    public function getAISuggestions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ticket_id' => ['required', 'exists:tickets,id'],
        ]);

        $ticket = Ticket::with(['category', 'comments'])->find($validated['ticket_id']);

        try {
            $aiService = new AIService();

            $context = "Ticket: {$ticket->title}\n";
            $context .= "Description: {$ticket->description}\n";
            $context .= "Category: " . ($ticket->category->name ?? 'Uncategorized') . "\n";
            $context .= "Priority: {$ticket->priority}\n";

            if ($ticket->comments->count() > 0) {
                $context .= "Recent comments:\n";
                foreach ($ticket->comments->take(3) as $comment) {
                    $context .= "- {$comment->content}\n";
                }
            }

            $prompt = "Based on this support ticket information, provide helpful suggestions for resolution, similar issues, and next steps:\n\n{$context}";

            $suggestions = $aiService->generateResponse($prompt);

            return response()->json([
                'suggestions' => $suggestions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Unable to generate AI suggestions at this time.',
            ], 500);
        }
    }
}
