<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\Ticket;
use App\Models\Support\TicketCategory;
use App\Models\Support\KnowledgeBaseArticle;
use App\Models\Support\FAQ;
use App\Models\Support\SLA;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Support dashboard.
     */
    public function index(): Response
    {
        // Get ticket statistics
        $totalTickets = Ticket::count();
        $openTickets = Ticket::where('status', 'open')->count();
        $inProgressTickets = Ticket::where('status', 'in_progress')->count();
        $pendingTickets = Ticket::where('status', 'pending')->count();
        $resolvedTickets = Ticket::where('status', 'resolved')->count();
        $closedTickets = Ticket::where('status', 'closed')->count();
        $overdueTickets = Ticket::overdue()->count();

        // Get tickets by priority
        $ticketsByPriority = Ticket::selectRaw('priority, count(*) as count')
            ->groupBy('priority')
            ->get();

        // Get tickets by category
        $ticketsByCategory = Ticket::with('category')
            ->selectRaw('category_id, count(*) as count')
            ->groupBy('category_id')
            ->get();

        // Get recent tickets
        $recentTickets = Ticket::with(['category', 'assignedTo', 'createdBy', 'requester'])
            ->latest()
            ->take(10)
            ->get();

        // Get my assigned tickets (for staff)
        $myTickets = Ticket::with(['category', 'requester'])
            ->where('assigned_to', auth()->id())
            ->whereNotIn('status', ['resolved', 'closed'])
            ->latest()
            ->take(5)
            ->get();

        // Get overdue tickets
        $overdueTicketsList = Ticket::with(['category', 'assignedTo', 'requester'])
            ->overdue()
            ->latest()
            ->take(5)
            ->get();

        // Get SLA compliance data
        $slaCompliance = $this->getSLACompliance();

        // Get knowledge base stats
        $totalArticles = KnowledgeBaseArticle::published()->count();
        $totalFAQs = FAQ::published()->count();
        $popularArticles = KnowledgeBaseArticle::published()
            ->orderBy('view_count', 'desc')
            ->take(5)
            ->get(['id', 'title', 'view_count', 'helpful_count']);

        // Get ticket resolution metrics
        $avgResolutionTime = Ticket::whereNotNull('resolved_at')
            ->whereNotNull('resolution_time_minutes')
            ->avg('resolution_time_minutes');

        $avgResponseTime = Ticket::whereNotNull('first_response_at')
            ->whereNotNull('response_time_minutes')
            ->avg('response_time_minutes');

        // Get satisfaction ratings
        $avgSatisfactionRating = Ticket::whereNotNull('satisfaction_rating')
            ->avg('satisfaction_rating');

        $satisfactionRatings = Ticket::whereNotNull('satisfaction_rating')
            ->selectRaw('satisfaction_rating, count(*) as count')
            ->groupBy('satisfaction_rating')
            ->get();

        return Inertia::render('Support/Dashboard', [
            'stats' => [
                'totalTickets' => $totalTickets,
                'openTickets' => $openTickets,
                'inProgressTickets' => $inProgressTickets,
                'pendingTickets' => $pendingTickets,
                'resolvedTickets' => $resolvedTickets,
                'closedTickets' => $closedTickets,
                'overdueTickets' => $overdueTickets,
                'totalArticles' => $totalArticles,
                'totalFAQs' => $totalFAQs,
                'avgResolutionTime' => round($avgResolutionTime ?? 0, 2),
                'avgResponseTime' => round($avgResponseTime ?? 0, 2),
                'avgSatisfactionRating' => round($avgSatisfactionRating ?? 0, 2),
            ],
            'ticketsByPriority' => $ticketsByPriority,
            'ticketsByCategory' => $ticketsByCategory,
            'recentTickets' => $recentTickets,
            'myTickets' => $myTickets,
            'overdueTickets' => $overdueTicketsList,
            'slaCompliance' => $slaCompliance,
            'popularArticles' => $popularArticles,
            'satisfactionRatings' => $satisfactionRatings,
        ]);
    }

    /**
     * Get SLA compliance data.
     */
    private function getSLACompliance(): array
    {
        $slaCompliance = [];
        $slas = SLA::active()->get();

        foreach ($slas as $sla) {
            $startDate = now()->subDays(30);
            $endDate = now();
            
            $compliance = $sla->getCompliancePercentage($startDate, $endDate);
            
            $slaCompliance[] = [
                'name' => $sla->name,
                'compliance' => $compliance,
                'tickets_count' => $sla->tickets()
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
            ];
        }

        return $slaCompliance;
    }
}
