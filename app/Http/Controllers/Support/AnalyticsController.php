<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\Ticket;
use App\Models\Support\TicketCategory;
use App\Models\Support\KnowledgeBaseArticle;
use App\Models\Support\FAQ;
use App\Models\Support\SLA;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Display the analytics dashboard.
     */
    public function index(Request $request): Response
    {
        $dateRange = $this->getDateRange($request);
        
        // Ticket metrics
        $ticketMetrics = $this->getTicketMetrics($dateRange);
        
        // Performance metrics
        $performanceMetrics = $this->getPerformanceMetrics($dateRange);
        
        // Agent performance
        $agentPerformance = $this->getAgentPerformance($dateRange);
        
        // Category analytics
        $categoryAnalytics = $this->getCategoryAnalytics($dateRange);
        
        // SLA compliance
        $slaCompliance = $this->getSLACompliance($dateRange);
        
        // Satisfaction metrics
        $satisfactionMetrics = $this->getSatisfactionMetrics($dateRange);
        
        // Knowledge base metrics
        $knowledgeBaseMetrics = $this->getKnowledgeBaseMetrics($dateRange);

        return Inertia::render('Support/Analytics/Dashboard', [
            'dateRange' => $dateRange,
            'ticketMetrics' => $ticketMetrics,
            'performanceMetrics' => $performanceMetrics,
            'agentPerformance' => $agentPerformance,
            'categoryAnalytics' => $categoryAnalytics,
            'slaCompliance' => $slaCompliance,
            'satisfactionMetrics' => $satisfactionMetrics,
            'knowledgeBaseMetrics' => $knowledgeBaseMetrics,
        ]);
    }

    /**
     * Display detailed reports.
     */
    public function reports(Request $request): Response
    {
        $reportType = $request->get('type', 'tickets');
        $dateRange = $this->getDateRange($request);

        $data = match($reportType) {
            'tickets' => $this->getTicketReport($dateRange),
            'agents' => $this->getAgentReport($dateRange),
            'categories' => $this->getCategoryReport($dateRange),
            'sla' => $this->getSLAReport($dateRange),
            'satisfaction' => $this->getSatisfactionReport($dateRange),
            'knowledge_base' => $this->getKnowledgeBaseReport($dateRange),
            default => $this->getTicketReport($dateRange),
        };

        return Inertia::render('Support/Analytics/Reports', [
            'reportType' => $reportType,
            'dateRange' => $dateRange,
            'data' => $data,
        ]);
    }

    /**
     * Export analytics data.
     */
    public function export(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:tickets,agents,categories,sla,satisfaction,knowledge_base'],
            'format' => ['required', 'string', 'in:csv,excel,pdf'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        $dateRange = [
            'from' => $validated['date_from'] ? Carbon::parse($validated['date_from']) : Carbon::now()->subDays(30),
            'to' => $validated['date_to'] ? Carbon::parse($validated['date_to']) : Carbon::now(),
        ];

        try {
            $data = match($validated['type']) {
                'tickets' => $this->getTicketReport($dateRange),
                'agents' => $this->getAgentReport($dateRange),
                'categories' => $this->getCategoryReport($dateRange),
                'sla' => $this->getSLAReport($dateRange),
                'satisfaction' => $this->getSatisfactionReport($dateRange),
                'knowledge_base' => $this->getKnowledgeBaseReport($dateRange),
            };

            // Here you would implement the actual export logic
            // For now, return a success message
            return response()->json([
                'message' => 'Export will be available for download shortly.',
                'download_url' => '#', // Would be actual download URL
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to export data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get date range from request.
     */
    private function getDateRange(Request $request): array
    {
        $from = $request->get('date_from') 
            ? Carbon::parse($request->get('date_from'))
            : Carbon::now()->subDays(30);
            
        $to = $request->get('date_to')
            ? Carbon::parse($request->get('date_to'))
            : Carbon::now();

        return ['from' => $from, 'to' => $to];
    }

    /**
     * Get ticket metrics.
     */
    private function getTicketMetrics(array $dateRange): array
    {
        $query = Ticket::whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);

        return [
            'total' => $query->count(),
            'open' => $query->where('status', 'open')->count(),
            'in_progress' => $query->where('status', 'in_progress')->count(),
            'resolved' => $query->where('status', 'resolved')->count(),
            'closed' => $query->where('status', 'closed')->count(),
            'overdue' => Ticket::overdue()->count(),
            'by_priority' => $query->select('priority', DB::raw('count(*) as count'))
                ->groupBy('priority')
                ->get(),
            'daily_trend' => $this->getDailyTicketTrend($dateRange),
        ];
    }

    /**
     * Get performance metrics.
     */
    private function getPerformanceMetrics(array $dateRange): array
    {
        $tickets = Ticket::whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);

        $avgResponseTime = $tickets->whereNotNull('first_response_at')
            ->avg('response_time_minutes');

        $avgResolutionTime = $tickets->whereNotNull('resolved_at')
            ->avg('resolution_time_minutes');

        return [
            'avg_response_time' => round($avgResponseTime ?? 0, 2),
            'avg_resolution_time' => round($avgResolutionTime ?? 0, 2),
            'first_response_sla_met' => $this->getFirstResponseSLAMet($dateRange),
            'resolution_sla_met' => $this->getResolutionSLAMet($dateRange),
        ];
    }

    /**
     * Get agent performance.
     */
    private function getAgentPerformance(array $dateRange): array
    {
        return User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['admin', 'staff']);
            })
            ->withCount([
                'assignedTickets as tickets_assigned' => function ($query) use ($dateRange) {
                    $query->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
                },
                'assignedTickets as tickets_resolved' => function ($query) use ($dateRange) {
                    $query->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
                        ->where('status', 'resolved');
                },
            ])
            ->get()
            ->map(function ($user) use ($dateRange) {
                $avgResolutionTime = $user->assignedTickets()
                    ->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
                    ->whereNotNull('resolved_at')
                    ->avg('resolution_time_minutes');

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'tickets_assigned' => $user->tickets_assigned,
                    'tickets_resolved' => $user->tickets_resolved,
                    'avg_resolution_time' => round($avgResolutionTime ?? 0, 2),
                    'resolution_rate' => $user->tickets_assigned > 0 
                        ? round(($user->tickets_resolved / $user->tickets_assigned) * 100, 2)
                        : 0,
                ];
            });
    }

    /**
     * Get category analytics.
     */
    private function getCategoryAnalytics(array $dateRange): array
    {
        return TicketCategory::withCount([
                'tickets as total_tickets' => function ($query) use ($dateRange) {
                    $query->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
                },
                'tickets as resolved_tickets' => function ($query) use ($dateRange) {
                    $query->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
                        ->where('status', 'resolved');
                },
            ])
            ->get()
            ->map(function ($category) use ($dateRange) {
                $avgResolutionTime = $category->tickets()
                    ->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
                    ->whereNotNull('resolved_at')
                    ->avg('resolution_time_minutes');

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'total_tickets' => $category->total_tickets,
                    'resolved_tickets' => $category->resolved_tickets,
                    'avg_resolution_time' => round($avgResolutionTime ?? 0, 2),
                    'resolution_rate' => $category->total_tickets > 0 
                        ? round(($category->resolved_tickets / $category->total_tickets) * 100, 2)
                        : 0,
                ];
            });
    }

    /**
     * Get SLA compliance.
     */
    private function getSLACompliance(array $dateRange): array
    {
        return SLA::active()->get()->map(function ($sla) use ($dateRange) {
            $compliance = $sla->getCompliancePercentage($dateRange['from'], $dateRange['to']);
            $ticketsCount = $sla->tickets()
                ->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
                ->count();

            return [
                'id' => $sla->id,
                'name' => $sla->name,
                'compliance_percentage' => $compliance,
                'tickets_count' => $ticketsCount,
                'response_time_hours' => $sla->response_time_hours,
                'resolution_time_hours' => $sla->resolution_time_hours,
            ];
        });
    }

    /**
     * Get satisfaction metrics.
     */
    private function getSatisfactionMetrics(array $dateRange): array
    {
        $tickets = Ticket::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->whereNotNull('satisfaction_rating');

        $avgRating = $tickets->avg('satisfaction_rating');
        $totalRatings = $tickets->count();

        $ratingDistribution = $tickets->select('satisfaction_rating', DB::raw('count(*) as count'))
            ->groupBy('satisfaction_rating')
            ->get();

        return [
            'avg_rating' => round($avgRating ?? 0, 2),
            'total_ratings' => $totalRatings,
            'rating_distribution' => $ratingDistribution,
            'satisfaction_rate' => $totalRatings > 0 
                ? round(($tickets->where('satisfaction_rating', '>=', 4)->count() / $totalRatings) * 100, 2)
                : 0,
        ];
    }

    /**
     * Get knowledge base metrics.
     */
    private function getKnowledgeBaseMetrics(array $dateRange): array
    {
        $articles = KnowledgeBaseArticle::published();
        $faqs = FAQ::published();

        return [
            'total_articles' => $articles->count(),
            'total_faqs' => $faqs->count(),
            'total_views' => $articles->sum('view_count') + $faqs->sum('view_count'),
            'most_viewed_articles' => $articles->orderBy('view_count', 'desc')->take(5)->get(['id', 'title', 'view_count']),
            'most_helpful_articles' => $articles->orderBy('helpful_count', 'desc')->take(5)->get(['id', 'title', 'helpful_count']),
            'articles_by_category' => KnowledgeBaseCategory::withCount('articles')->get(['id', 'name', 'articles_count']),
        ];
    }

    // Additional helper methods would go here...
    private function getDailyTicketTrend(array $dateRange): array
    {
        // Implementation for daily ticket trend
        return [];
    }

    private function getFirstResponseSLAMet(array $dateRange): float
    {
        // Implementation for first response SLA compliance
        return 0.0;
    }

    private function getResolutionSLAMet(array $dateRange): float
    {
        // Implementation for resolution SLA compliance
        return 0.0;
    }

    private function getTicketReport(array $dateRange): array
    {
        // Implementation for detailed ticket report
        return [];
    }

    private function getAgentReport(array $dateRange): array
    {
        // Implementation for agent report
        return [];
    }

    private function getCategoryReport(array $dateRange): array
    {
        // Implementation for category report
        return [];
    }

    private function getSLAReport(array $dateRange): array
    {
        // Implementation for SLA report
        return [];
    }

    private function getSatisfactionReport(array $dateRange): array
    {
        // Implementation for satisfaction report
        return [];
    }

    private function getKnowledgeBaseReport(array $dateRange): array
    {
        // Implementation for knowledge base report
        return [];
    }
}
