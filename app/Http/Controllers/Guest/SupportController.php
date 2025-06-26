<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Guest\GuestSupportTicket;
use App\Models\Support\KnowledgeBaseArticle;
use App\Models\Support\KnowledgeBaseCategory;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    /**
     * Show the support portal.
     */
    public function index(): Response
    {
        $featuredArticles = KnowledgeBaseArticle::where('status', 'published')
            ->where('is_featured', true)
            ->orderBy('view_count', 'desc')
            ->take(6)
            ->get(['id', 'title', 'slug', 'excerpt', 'view_count']);

        $categories = KnowledgeBaseCategory::where('is_active', true)
            ->withCount(['articles' => function($query) {
                $query->where('status', 'published');
            }])
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'description', 'icon']);

        return Inertia::render('Guest/Support/Index', [
            'featuredArticles' => $featuredArticles,
            'categories' => $categories
        ]);
    }

    /**
     * Show the knowledge base.
     */
    public function knowledgeBase(Request $request): Response
    {
        $query = KnowledgeBaseArticle::where('status', 'published');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        $articles = $query->with('category:id,name,slug')
            ->orderBy('is_featured', 'desc')
            ->orderBy('view_count', 'desc')
            ->paginate(12)
            ->withQueryString();

        $categories = KnowledgeBaseCategory::where('is_active', true)
            ->withCount(['articles' => function($query) {
                $query->where('status', 'published');
            }])
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug']);

        return Inertia::render('Guest/Support/KnowledgeBase', [
            'articles' => $articles,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category'])
        ]);
    }

    /**
     * Show a knowledge base article.
     */
    public function article(string $slug): Response
    {
        $article = KnowledgeBaseArticle::where('slug', $slug)
            ->where('status', 'published')
            ->with('category:id,name,slug')
            ->firstOrFail();

        // Increment view count
        $article->increment('view_count');

        // Get related articles
        $relatedArticles = KnowledgeBaseArticle::where('status', 'published')
            ->where('category_id', $article->category_id)
            ->where('id', '!=', $article->id)
            ->orderBy('view_count', 'desc')
            ->take(3)
            ->get(['id', 'title', 'slug', 'excerpt']);

        return Inertia::render('Guest/Support/Article', [
            'article' => $article,
            'relatedArticles' => $relatedArticles
        ]);
    }

    /**
     * Rate an article as helpful or not.
     */
    public function rateArticle(Request $request, string $slug): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'helpful' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $article = KnowledgeBaseArticle::where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        if ($request->helpful) {
            $article->increment('helpful_count');
        } else {
            $article->increment('not_helpful_count');
        }

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your feedback!'
        ]);
    }

    /**
     * Show the ticket creation form.
     */
    public function createTicket(): Response
    {
        return Inertia::render('Guest/Support/CreateTicket', [
            'categories' => [
                'general' => 'General Support',
                'technical' => 'Technical Issue',
                'billing' => 'Billing Question',
                'feature_request' => 'Feature Request'
            ],
            'priorities' => [
                'low' => 'Low',
                'normal' => 'Normal',
                'high' => 'High',
                'urgent' => 'Urgent'
            ]
        ]);
    }

    /**
     * Store a new support ticket.
     */
    public function storeTicket(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'category' => 'required|string|in:general,technical,billing,feature_request',
            'priority' => 'required|string|in:low,normal,high,urgent',
            'subject' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'product_version' => 'nullable|string|max:100',
            'browser' => 'nullable|string|max:100',
            'operating_system' => 'nullable|string|max:100',
            'steps_to_reproduce' => 'nullable|string|max:2000',
            'expected_behavior' => 'nullable|string|max:1000',
            'actual_behavior' => 'nullable|string|max:1000',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx,txt',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        // Handle file attachments
        if ($request->hasFile('attachments')) {
            $attachments = [];
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('guest-support-attachments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType()
                ];
            }
            $data['attachments'] = $attachments;
        }

        try {
            $ticket = GuestSupportTicket::create($data);

            // Send notification to support staff
            $this->notifySupport($ticket);

            return response()->json([
                'success' => true,
                'message' => 'Your support ticket has been created successfully. We will get back to you soon.',
                'ticket_number' => $ticket->ticket_number
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating your ticket. Please try again.'
            ], 500);
        }
    }

    /**
     * Show ticket status by ticket number.
     */
    public function ticketStatus(Request $request): Response|JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ticket_number' => 'required|string|exists:guest_support_tickets,ticket_number'
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return Inertia::render('Guest/Support/TicketStatus', [
                'error' => 'Invalid ticket number.'
            ]);
        }

        $ticket = GuestSupportTicket::where('ticket_number', $request->ticket_number)
            ->with('assignedTo:id,name')
            ->first();

        $ticketData = [
            'ticket_number' => $ticket->ticket_number,
            'category' => $ticket->category,
            'priority' => $ticket->priority,
            'subject' => $ticket->subject,
            'status' => $ticket->status,
            'created_at' => $ticket->created_at,
            'first_response_at' => $ticket->first_response_at,
            'resolved_at' => $ticket->resolved_at,
            'closed_at' => $ticket->closed_at,
            'assigned_to' => $ticket->assignedTo?->name,
            'needs_first_response' => $ticket->needsFirstResponse(),
            'response_time_hours' => $ticket->getResponseTimeHours(),
            'resolution_time_hours' => $ticket->getResolutionTimeHours(),
        ];

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'ticket' => $ticketData
            ]);
        }

        return Inertia::render('Guest/Support/TicketStatus', [
            'ticket' => $ticketData
        ]);
    }

    /**
     * Show the ticket status check form.
     */
    public function ticketStatusForm(): Response
    {
        return Inertia::render('Guest/Support/TicketStatusCheck');
    }

    /**
     * Notify support staff about new ticket.
     */
    private function notifySupport(GuestSupportTicket $ticket): void
    {
        try {
            $notificationService = app(NotificationService::class);
            
            // Get support staff
            $users = \App\Models\User::whereHas('roles', function($q) {
                $q->whereIn('name', ['admin', 'staff']);
            })->orWhereHas('permissions', function($q) {
                $q->whereIn('name', ['manage support', 'view support tickets']);
            })->get();
            
            foreach ($users as $user) {
                $notificationService->send(
                    $user,
                    'New Support Ticket',
                    "New {$ticket->category} ticket from {$ticket->name} - {$ticket->subject}",
                    [
                        'type' => 'guest_support_ticket',
                        'ticket_id' => $ticket->id,
                        'ticket_number' => $ticket->ticket_number,
                        'priority' => $ticket->priority,
                        'category' => $ticket->category
                    ]
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send support ticket notification: ' . $e->getMessage());
        }
    }
}
