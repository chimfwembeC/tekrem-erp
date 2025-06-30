<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Support\Ticket;
use App\Models\Support\TicketCategory;
use App\Models\Support\KnowledgeBaseArticle;
use App\Models\Support\FAQ;
use App\Services\Support\EmailNotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function __construct(
        private EmailNotificationService $emailService
    ) {}

    /**
     * Display customer support portal.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        // Get customer's tickets
        $tickets = Ticket::where('requester_type', get_class($user))
            ->where('requester_id', $user->id)
            ->with(['category', 'assignedTo'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Get popular knowledge base articles
        $popularArticles = KnowledgeBaseArticle::published()
            ->orderBy('view_count', 'desc')
            ->limit(5)
            ->get(['id', 'title', 'excerpt', 'view_count']);

        // Get featured FAQs
        $featuredFAQs = FAQ::published()
            ->featured()
            ->orderBy('sort_order')
            ->limit(5)
            ->get(['id', 'question', 'answer']);

        // Get ticket statistics
        $ticketStats = [
            'total' => $tickets->total(),
            'open' => Ticket::where('requester_type', get_class($user))
                ->where('requester_id', $user->id)
                ->where('status', 'open')
                ->count(),
            'in_progress' => Ticket::where('requester_type', get_class($user))
                ->where('requester_id', $user->id)
                ->where('status', 'in_progress')
                ->count(),
            'resolved' => Ticket::where('requester_type', get_class($user))
                ->where('requester_id', $user->id)
                ->whereIn('status', ['resolved', 'closed'])
                ->count(),
        ];

        return Inertia::render('Customer/Support/Dashboard', [
            'tickets' => $tickets,
            'popularArticles' => $popularArticles,
            'featuredFAQs' => $featuredFAQs,
            'ticketStats' => $ticketStats,
        ]);
    }

    /**
     * Display ticket creation form.
     */
    public function create(): Response
    {
        $categories = TicketCategory::active()
            ->ordered()
            ->get(['id', 'name', 'description', 'color']);

        // Get suggested articles based on common issues
        $suggestedArticles = KnowledgeBaseArticle::published()
            ->orderBy('helpful_count', 'desc')
            ->limit(3)
            ->get(['id', 'title', 'excerpt']);

        return Inertia::render('Customer/Support/Create', [
            'categories' => $categories,
            'suggestedArticles' => $suggestedArticles,
        ]);
    }

    /**
     * Store a new ticket.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category_id' => ['nullable', 'exists:ticket_categories,id'],
            'priority' => ['required', 'in:low,medium,high,urgent'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'], // 10MB max
        ]);

        $user = Auth::user();

        // Handle file attachments
        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('support/tickets', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
        }

        // Create ticket
        $ticket = Ticket::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category_id' => $validated['category_id'],
            'priority' => $validated['priority'],
            'status' => 'open',
            'requester_type' => get_class($user),
            'requester_id' => $user->id,
            'requester_email' => $user->email,
            'created_by' => $user->id,
            'attachments' => $attachments,
        ]);

        // Auto-assign if category has auto-assignment
        if ($ticket->category && $ticket->category->auto_assign_user) {
            $ticket->update(['assigned_to' => $ticket->category->auto_assign_user->id]);
        }

        // Set SLA policy
        if ($ticket->category && $ticket->category->default_sla_policy_id) {
            $ticket->update(['sla_policy_id' => $ticket->category->default_sla_policy_id]);
        }

        // Send email notifications
        $this->emailService->sendTicketCreated($ticket);

        return redirect()->route('customer.support.tickets.show', $ticket->id)
            ->with('success', 'Your support ticket has been created successfully. We will respond as soon as possible.');
    }

    /**
     * Display the specified ticket.
     */
    public function show(Ticket $ticket): Response
    {
        $user = Auth::user();

        // Ensure user can only view their own tickets
        if ($ticket->requester_type !== get_class($user) || $ticket->requester_id !== $user->id) {
            abort(403);
        }

        $ticket->load([
            'category',
            'assignedTo',
            'slaPolicy',
            'comments' => function ($query) {
                $query->where('is_internal', false)
                    ->with('user')
                    ->orderBy('created_at', 'asc');
            }
        ]);

        // Increment view count
        $ticket->increment('view_count');

        return Inertia::render('Customer/Support/ShowTicket', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * Add comment to ticket.
     */
    public function addComment(Request $request, Ticket $ticket): RedirectResponse
    {
        $user = Auth::user();

        // Ensure user can only comment on their own tickets
        if ($ticket->requester_type !== get_class($user) || $ticket->requester_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'], // 10MB max
        ]);

        // Handle file attachments
        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('support/comments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
        }

        $comment = $ticket->comments()->create([
            'content' => $validated['content'],
            'user_id' => $user->id,
            'is_internal' => false,
            'attachments' => $attachments,
        ]);

        // Update ticket status if closed
        if ($ticket->status === 'closed') {
            $ticket->update(['status' => 'open']);
        }

        // Send email notifications
        $this->emailService->sendCommentAdded($ticket, $comment);

        return redirect()->back()->with('success', 'Your comment has been added successfully.');
    }

    /**
     * Close ticket (customer satisfaction).
     */
    public function close(Request $request, Ticket $ticket): RedirectResponse
    {
        $user = Auth::user();

        // Ensure user can only close their own tickets
        if ($ticket->requester_type !== get_class($user) || $ticket->requester_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'satisfaction_rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'satisfaction_feedback' => ['nullable', 'string', 'max:1000'],
        ]);

        $ticket->update([
            'status' => 'closed',
            'closed_at' => now(),
            'satisfaction_rating' => $validated['satisfaction_rating'],
            'satisfaction_feedback' => $validated['satisfaction_feedback'],
        ]);

        // Send email notification
        $this->emailService->sendTicketUpdated($ticket, 'closed');

        return redirect()->back()->with('success', 'Thank you for your feedback. The ticket has been closed.');
    }

    /**
     * Reopen ticket.
     */
    public function reopen(Request $request, Ticket $ticket): RedirectResponse
    {
        $user = Auth::user();

        // Ensure user can only reopen their own tickets
        if ($ticket->requester_type !== get_class($user) || $ticket->requester_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $ticket->update([
            'status' => 'open',
            'closed_at' => null,
            'satisfaction_rating' => null,
            'satisfaction_feedback' => null,
        ]);

        // Add system comment
        $ticket->comments()->create([
            'content' => "Ticket reopened by customer. Reason: {$validated['reason']}",
            'user_id' => $user->id,
            'is_internal' => false,
        ]);

        // Send email notification
        $this->emailService->sendTicketUpdated($ticket, 'reopened');

        return redirect()->back()->with('success', 'Your ticket has been reopened successfully.');
    }

    /**
     * Search knowledge base.
     */
    public function searchKnowledgeBase(Request $request): Response
    {
        $query = $request->get('q', '');
        $categoryId = $request->get('category_id');

        $articles = KnowledgeBaseArticle::published()
            ->when($query, function ($q) use ($query) {
                $q->search($query);
            })
            ->when($categoryId, function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->with('category')
            ->orderBy('view_count', 'desc')
            ->paginate(12);

        $categories = \App\Models\Support\KnowledgeBaseCategory::whereHas('articles', function ($q) {
            $q->published();
        })->get(['id', 'name', 'color']);

        return Inertia::render('Customer/Support/KnowledgeBase', [
            'articles' => $articles,
            'categories' => $categories,
            'query' => $query,
            'selectedCategory' => $categoryId,
        ]);
    }

    /**
     * View knowledge base article.
     */
    public function viewArticle(KnowledgeBaseArticle $article): Response
    {
        if ($article->status !== 'published') {
            abort(404);
        }

        $article->load('category');
        $article->increment('view_count');

        // Get related articles
        $relatedArticles = KnowledgeBaseArticle::published()
            ->where('id', '!=', $article->id)
            ->when($article->category_id, function ($q) use ($article) {
                $q->where('category_id', $article->category_id);
            })
            ->orderBy('view_count', 'desc')
            ->limit(3)
            ->get(['id', 'title', 'excerpt']);

        return Inertia::render('Customer/Support/ViewArticle', [
            'article' => $article,
            'relatedArticles' => $relatedArticles,
        ]);
    }

    /**
     * Mark article as helpful.
     */
    public function markArticleHelpful(KnowledgeBaseArticle $article): RedirectResponse
    {
        $article->markAsHelpful();
        return redirect()->back()->with('success', 'Thank you for your feedback!');
    }

    /**
     * Mark article as not helpful.
     */
    public function markArticleNotHelpful(KnowledgeBaseArticle $article): RedirectResponse
    {
        $article->markAsNotHelpful();
        return redirect()->back()->with('success', 'Thank you for your feedback!');
    }

    /**
     * View FAQ.
     */
    public function viewFAQ(): Response
    {
        $faqs = FAQ::published()
            ->with('category')
            ->ordered()
            ->get();

        $categories = \App\Models\Support\KnowledgeBaseCategory::whereHas('faqs', function ($q) {
            $q->published();
        })->get(['id', 'name', 'color']);

        return Inertia::render('Customer/Support/FAQ', [
            'faqs' => $faqs,
            'categories' => $categories,
        ]);
    }
}
