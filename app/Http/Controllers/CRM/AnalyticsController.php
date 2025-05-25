<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Communication;
use App\Models\Lead;
use App\Models\Chat;
use App\Models\Conversation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Display the CRM analytics dashboard.
     */
    public function index(Request $request): Response
    {
        $dateRange = $this->getDateRange($request);

        return Inertia::render('CRM/Analytics/Dashboard', [
            'overview' => $this->getOverviewMetrics($dateRange),
            'leadMetrics' => $this->getLeadMetrics($dateRange),
            'clientMetrics' => $this->getClientMetrics($dateRange),
            'communicationMetrics' => $this->getCommunicationMetrics($dateRange),
            'liveChatMetrics' => $this->getLiveChatMetrics($dateRange),
            'conversionFunnel' => $this->getConversionFunnel($dateRange),
            'timeSeriesData' => $this->getTimeSeriesData($dateRange),
            'topPerformers' => $this->getTopPerformers($dateRange),
            'dateRange' => $dateRange,
        ]);
    }

    /**
     * Display the reports page.
     */
    public function reports(): Response
    {
        return Inertia::render('CRM/Analytics/Reports');
    }

    /**
     * Generate comprehensive report.
     */
    public function generateReport(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reportType' => 'required|string|in:overview,leads,clients,communications,livechat,performance,conversion,revenue',
            'format' => 'required|string|in:pdf,excel,csv,json',
            'dateRange.from' => 'required|date',
            'dateRange.to' => 'required|date|after_or_equal:dateRange.from',
            'groupBy' => 'string|in:hourly,daily,weekly,monthly',
            'status' => 'string',
            'assignedTo' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $dateRange = [
            'start' => Carbon::parse($request->input('dateRange.from'))->startOfDay(),
            'end' => Carbon::parse($request->input('dateRange.to'))->endOfDay(),
        ];

        $reportData = $this->generateReportData($request->reportType, $dateRange, $request->all());

        $filename = "crm_{$request->reportType}_report_" . now()->format('Y-m-d_H-i-s');

        switch ($request->format) {
            case 'pdf':
                return $this->generatePdfReport($reportData, $filename);
            case 'excel':
                return $this->generateExcelReport($reportData, $filename);
            case 'csv':
                return $this->generateCsvReport($reportData, $filename);
            case 'json':
                return response()->json($reportData)
                    ->header('Content-Disposition', "attachment; filename={$filename}.json");
            default:
                return response()->json(['error' => 'Invalid format'], 400);
        }
    }

    /**
     * Export analytics data.
     */
    public function export(Request $request): JsonResponse
    {
        $format = $request->get('format', 'csv');
        $type = $request->get('type', 'overview');
        $dateRange = $this->getDateRange($request);

        $data = match($type) {
            'leads' => $this->getLeadExportData($dateRange),
            'clients' => $this->getClientExportData($dateRange),
            'communications' => $this->getCommunicationExportData($dateRange),
            'livechat' => $this->getLiveChatExportData($dateRange),
            'ai-conversations' => $this->getAIConversationExportData($dateRange, $this->getAIExportFilters($request)),
            default => $this->getOverviewExportData($dateRange),
        };

        $filename = "crm_{$type}_analytics_" . now()->format('Y-m-d_H-i-s') . ".{$format}";

        if ($format === 'json') {
            return response()->json($data)
                ->header('Content-Disposition', "attachment; filename={$filename}");
        }

        // Convert to CSV
        $csv = $this->arrayToCsv($data);

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename={$filename}");
    }

    /**
     * Get date range from request or default to last 30 days.
     */
    private function getDateRange(Request $request): array
    {
        $startDate = $request->get('start_date', now()->subDays(30)->startOfDay());
        $endDate = $request->get('end_date', now()->endOfDay());

        if (is_string($startDate)) {
            $startDate = Carbon::parse($startDate)->startOfDay();
        }
        if (is_string($endDate)) {
            $endDate = Carbon::parse($endDate)->endOfDay();
        }

        return [
            'start' => $startDate,
            'end' => $endDate,
        ];
    }

    /**
     * Get overview metrics.
     */
    private function getOverviewMetrics(array $dateRange): array
    {
        $totalLeads = Lead::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->count();
        $totalClients = Client::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->count();
        $totalCommunications = Communication::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->count();
        $totalConversations = Conversation::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->count();

        // Previous period for comparison
        $previousStart = $dateRange['start']->copy()->subDays($dateRange['start']->diffInDays($dateRange['end']));
        $previousEnd = $dateRange['start']->copy()->subSecond();

        $previousLeads = Lead::whereBetween('created_at', [$previousStart, $previousEnd])->count();
        $previousClients = Client::whereBetween('created_at', [$previousStart, $previousEnd])->count();
        $previousCommunications = Communication::whereBetween('created_at', [$previousStart, $previousEnd])->count();
        $previousConversations = Conversation::whereBetween('created_at', [$previousStart, $previousEnd])->count();

        return [
            'totalLeads' => $totalLeads,
            'totalClients' => $totalClients,
            'totalCommunications' => $totalCommunications,
            'totalConversations' => $totalConversations,
            'leadGrowth' => $this->calculateGrowthPercentage($totalLeads, $previousLeads),
            'clientGrowth' => $this->calculateGrowthPercentage($totalClients, $previousClients),
            'communicationGrowth' => $this->calculateGrowthPercentage($totalCommunications, $previousCommunications),
            'conversationGrowth' => $this->calculateGrowthPercentage($totalConversations, $previousConversations),
        ];
    }

    /**
     * Get lead metrics.
     */
    private function getLeadMetrics(array $dateRange): array
    {
        $leads = Lead::whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);

        $leadsByStatus = $leads->clone()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $leadsBySource = $leads->clone()
            ->select('source', DB::raw('count(*) as count'))
            ->groupBy('source')
            ->get();

        $conversionRate = $this->getConversionRate($dateRange);

        return [
            'leadsByStatus' => $leadsByStatus,
            'leadsBySource' => $leadsBySource,
            'conversionRate' => $conversionRate,
            'averageTimeToConversion' => $this->getAverageTimeToConversion($dateRange),
        ];
    }

    /**
     * Get client metrics.
     */
    private function getClientMetrics(array $dateRange): array
    {
        $clients = Client::whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);

        $clientsByStatus = $clients->clone()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return [
            'clientsByStatus' => $clientsByStatus,
            'clientRetentionRate' => $this->getClientRetentionRate($dateRange),
            'averageClientValue' => $this->getAverageClientValue($dateRange),
        ];
    }

    /**
     * Get communication metrics.
     */
    private function getCommunicationMetrics(array $dateRange): array
    {
        $communications = Communication::whereBetween('communications.created_at', [$dateRange['start'], $dateRange['end']]);

        $communicationsByType = $communications->clone()
            ->select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->get();

        $communicationsByUser = $communications->clone()
            ->join('users', 'communications.user_id', '=', 'users.id')
            ->select('users.name', DB::raw('count(*) as count'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        return [
            'communicationsByType' => $communicationsByType,
            'communicationsByUser' => $communicationsByUser,
            'averageResponseTime' => $this->getAverageResponseTime($dateRange),
        ];
    }

    /**
     * Get LiveChat metrics.
     */
    private function getLiveChatMetrics(array $dateRange): array
    {
        $conversations = Conversation::whereBetween('conversations.created_at', [$dateRange['start'], $dateRange['end']]);
        $messages = Chat::whereBetween('chats.created_at', [$dateRange['start'], $dateRange['end']]);

        $conversationsByStatus = $conversations->clone()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $messagesByType = $messages->clone()
            ->select('message_type', DB::raw('count(*) as count'))
            ->groupBy('message_type')
            ->get();

        return [
            'conversationsByStatus' => $conversationsByStatus,
            'messagesByType' => $messagesByType,
            'averageConversationLength' => $this->getAverageConversationLength($dateRange),
            'customerSatisfactionScore' => $this->getCustomerSatisfactionScore($dateRange),
        ];
    }

    /**
     * Get conversion funnel data.
     */
    private function getConversionFunnel(array $dateRange): array
    {
        $totalLeads = Lead::whereBetween('leads.created_at', [$dateRange['start'], $dateRange['end']])->count();
        $qualifiedLeads = Lead::whereBetween('leads.created_at', [$dateRange['start'], $dateRange['end']])
            ->where('status', 'qualified')->count();
        $convertedLeads = Lead::whereBetween('leads.created_at', [$dateRange['start'], $dateRange['end']])
            ->whereNotNull('converted_to_client')->count();
        $activeClients = Client::whereBetween('clients.created_at', [$dateRange['start'], $dateRange['end']])
            ->where('status', 'active')->count();

        return [
            ['stage' => 'Leads', 'count' => $totalLeads, 'percentage' => 100],
            ['stage' => 'Qualified', 'count' => $qualifiedLeads, 'percentage' => $totalLeads > 0 ? round(($qualifiedLeads / $totalLeads) * 100, 2) : 0],
            ['stage' => 'Converted', 'count' => $convertedLeads, 'percentage' => $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 2) : 0],
            ['stage' => 'Active Clients', 'count' => $activeClients, 'percentage' => $totalLeads > 0 ? round(($activeClients / $totalLeads) * 100, 2) : 0],
        ];
    }

    /**
     * Get time series data for charts.
     */
    private function getTimeSeriesData(array $dateRange): array
    {
        $days = [];
        $current = $dateRange['start']->copy();

        while ($current <= $dateRange['end']) {
            $dayStart = $current->copy()->startOfDay();
            $dayEnd = $current->copy()->endOfDay();

            $days[] = [
                'date' => $current->format('Y-m-d'),
                'leads' => Lead::whereBetween('leads.created_at', [$dayStart, $dayEnd])->count(),
                'clients' => Client::whereBetween('clients.created_at', [$dayStart, $dayEnd])->count(),
                'communications' => Communication::whereBetween('communications.created_at', [$dayStart, $dayEnd])->count(),
                'conversations' => Conversation::whereBetween('conversations.created_at', [$dayStart, $dayEnd])->count(),
            ];

            $current->addDay();
        }

        return $days;
    }

    /**
     * Get top performers.
     */
    private function getTopPerformers(array $dateRange): array
    {
        $topSalesUsers = Communication::whereBetween('communications.created_at', [$dateRange['start'], $dateRange['end']])
            ->join('users', 'communications.user_id', '=', 'users.id')
            ->select('users.name', DB::raw('count(*) as communications_count'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('communications_count')
            ->limit(5)
            ->get();

        return [
            'topSalesUsers' => $topSalesUsers,
        ];
    }

    // Helper methods for calculations
    private function calculateGrowthPercentage($current, $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        return round((($current - $previous) / $previous) * 100, 2);
    }

    private function getConversionRate(array $dateRange): float
    {
        $totalLeads = Lead::whereBetween('leads.created_at', [$dateRange['start'], $dateRange['end']])->count();
        $convertedLeads = Lead::whereBetween('leads.created_at', [$dateRange['start'], $dateRange['end']])
            ->whereNotNull('converted_to_client')->count();

        return $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 2) : 0;
    }

    private function getAverageTimeToConversion(array $dateRange): float
    {
        $convertedLeads = Lead::whereBetween('leads.created_at', [$dateRange['start'], $dateRange['end']])
            ->whereNotNull('converted_to_client')
            ->whereNotNull('converted_at')
            ->get();

        if ($convertedLeads->isEmpty()) {
            return 0;
        }

        $totalDays = $convertedLeads->sum(function ($lead) {
            return $lead->created_at->diffInDays($lead->converted_at);
        });

        return round($totalDays / $convertedLeads->count(), 2);
    }

    private function getClientRetentionRate(array $dateRange): float
    {
        // This is a simplified calculation - you might want to implement more sophisticated retention logic
        $totalClients = Client::where('created_at', '<', $dateRange['start'])->count();
        $activeClients = Client::where('created_at', '<', $dateRange['start'])
            ->where('status', 'active')->count();

        return $totalClients > 0 ? round(($activeClients / $totalClients) * 100, 2) : 0;
    }

    private function getAverageClientValue(array $dateRange): float
    {
        // This would typically come from your billing/finance module
        // For now, return a placeholder value
        return 0;
    }

    private function getAverageResponseTime(array $dateRange): float
    {
        // This would require more sophisticated tracking of response times
        // For now, return a placeholder value
        return 0;
    }

    private function getAverageConversationLength(array $dateRange): float
    {
        $conversations = Conversation::whereBetween('conversations.created_at', [$dateRange['start'], $dateRange['end']])
            ->with('messages')
            ->get();

        if ($conversations->isEmpty()) {
            return 0;
        }

        $totalMessages = $conversations->sum(function ($conversation) {
            return $conversation->messages->count();
        });

        return round($totalMessages / $conversations->count(), 2);
    }

    private function getCustomerSatisfactionScore(array $dateRange): float
    {
        // This would typically come from customer feedback/ratings
        // For now, return a placeholder value
        return 0;
    }

    // Export helper methods
    private function getOverviewExportData(array $dateRange): array
    {
        return $this->getOverviewMetrics($dateRange);
    }

    private function getLeadExportData(array $dateRange): array
    {
        return Lead::whereBetween('leads.created_at', [$dateRange['start'], $dateRange['end']])
            ->with('user')
            ->get()
            ->toArray();
    }

    private function getClientExportData(array $dateRange): array
    {
        return Client::whereBetween('clients.created_at', [$dateRange['start'], $dateRange['end']])
            ->with('user')
            ->get()
            ->toArray();
    }

    private function getCommunicationExportData(array $dateRange): array
    {
        return Communication::whereBetween('communications.created_at', [$dateRange['start'], $dateRange['end']])
            ->with(['user', 'communicable'])
            ->get()
            ->toArray();
    }

    private function getLiveChatExportData(array $dateRange): array
    {
        return Conversation::whereBetween('conversations.created_at', [$dateRange['start'], $dateRange['end']])
            ->with(['messages', 'creator', 'assignee'])
            ->get()
            ->toArray();
    }

    /**
     * Get AI conversation export data for ML training.
     */
    private function getAIConversationExportData(array $dateRange, array $filters = []): array
    {
        $query = Conversation::whereBetween('conversations.created_at', [$dateRange['start'], $dateRange['end']])
            ->with(['messages' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }, 'conversable']);

        // Filter for guest conversations that have AI responses
        $query->where('conversable_type', \App\Models\GuestSession::class)
              ->whereHas('messages', function ($q) {
                  $q->whereJsonContains('metadata->is_ai_response', true);
              });

        // Apply additional filters
        if (!empty($filters['ai_service'])) {
            $query->whereHas('messages', function ($q) use ($filters) {
                $q->whereJsonContains('metadata->ai_service', $filters['ai_service']);
            });
        }

        if (!empty($filters['min_messages'])) {
            $query->has('messages', '>=', $filters['min_messages']);
        }

        $conversations = $query->get();

        $exportData = [];
        foreach ($conversations as $conversation) {
            $conversationData = [
                'conversation_id' => $conversation->id,
                'conversation_title' => $conversation->display_title,
                'created_at' => $conversation->created_at->toISOString(),
                'guest_info' => $this->getAnonymizedGuestInfo($conversation->conversable, $filters['anonymize'] ?? false),
                'messages' => [],
                'ai_services_used' => [],
                'conversation_outcome' => $conversation->status,
                'total_messages' => $conversation->messages->count(),
                'ai_message_count' => $conversation->messages->where('metadata.is_ai_response', true)->count(),
            ];

            foreach ($conversation->messages as $message) {
                $isAI = $message->metadata['is_ai_response'] ?? false;

                $messageData = [
                    'message_id' => $message->id,
                    'timestamp' => $message->created_at->toISOString(),
                    'sender_type' => $isAI ? 'ai' : 'guest',
                    'message' => $message->message,
                    'message_type' => $message->message_type,
                ];

                if ($isAI) {
                    $messageData['ai_metadata'] = [
                        'service' => $message->metadata['ai_service'] ?? null,
                        'model' => $message->metadata['ai_model'] ?? null,
                        'reply_to_message_id' => $message->metadata['reply_to_message_id'] ?? null,
                        'generated_at' => $message->metadata['generated_at'] ?? null,
                    ];

                    if (!in_array($message->metadata['ai_service'] ?? 'unknown', $conversationData['ai_services_used'])) {
                        $conversationData['ai_services_used'][] = $message->metadata['ai_service'] ?? 'unknown';
                    }
                } else {
                    $messageData['guest_metadata'] = [
                        'ip_address' => $filters['include_ip'] ?? false ? ($message->metadata['ip_address'] ?? null) : null,
                        'guest_session_id' => $message->metadata['guest_session_id'] ?? null,
                    ];
                }

                $conversationData['messages'][] = $messageData;
            }

            $exportData[] = $conversationData;
        }

        return $exportData;
    }

    /**
     * Get anonymized guest information.
     */
    private function getAnonymizedGuestInfo($guestSession, bool $anonymize = false): array
    {
        if (!$guestSession) {
            return [];
        }

        if ($anonymize) {
            return [
                'guest_id' => 'guest_' . hash('sha256', $guestSession->id),
                'guest_name' => 'Guest_' . substr(hash('sha256', $guestSession->guest_name ?? ''), 0, 8),
                'guest_email' => $guestSession->guest_email ? 'guest_' . substr(hash('sha256', $guestSession->guest_email), 0, 8) . '@example.com' : null,
                'anonymized' => true,
            ];
        }

        return [
            'guest_id' => $guestSession->id,
            'guest_name' => $guestSession->guest_name,
            'guest_email' => $guestSession->guest_email,
            'anonymized' => false,
        ];
    }

    /**
     * Get AI export filters from request.
     */
    private function getAIExportFilters(Request $request): array
    {
        return [
            'ai_service' => $request->get('ai_service'),
            'min_messages' => $request->get('min_messages', 2),
            'anonymize' => $request->boolean('anonymize', true),
            'include_ip' => $request->boolean('include_ip', false),
            'format_for_ml' => $request->boolean('format_for_ml', false),
        ];
    }

    private function arrayToCsv(array $data): string
    {
        if (empty($data)) {
            return '';
        }

        $output = fopen('php://temp', 'r+');

        // Add headers
        fputcsv($output, array_keys($data[0]));

        // Add data rows
        foreach ($data as $row) {
            fputcsv($output, $row);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Generate report data based on type.
     */
    private function generateReportData(string $reportType, array $dateRange, array $filters): array
    {
        return match($reportType) {
            'overview' => $this->generateOverviewReport($dateRange, $filters),
            'leads' => $this->generateLeadsReport($dateRange, $filters),
            'clients' => $this->generateClientsReport($dateRange, $filters),
            'communications' => $this->generateCommunicationsReport($dateRange, $filters),
            'livechat' => $this->generateLiveChatReport($dateRange, $filters),
            'performance' => $this->generatePerformanceReport($dateRange, $filters),
            'conversion' => $this->generateConversionReport($dateRange, $filters),
            'revenue' => $this->generateRevenueReport($dateRange, $filters),
            default => [],
        };
    }

    /**
     * Generate overview report.
     */
    private function generateOverviewReport(array $dateRange, array $filters): array
    {
        return [
            'title' => 'CRM Overview Report',
            'period' => $dateRange['start']->format('M d, Y') . ' - ' . $dateRange['end']->format('M d, Y'),
            'overview' => $this->getOverviewMetrics($dateRange),
            'leadMetrics' => $this->getLeadMetrics($dateRange),
            'clientMetrics' => $this->getClientMetrics($dateRange),
            'communicationMetrics' => $this->getCommunicationMetrics($dateRange),
            'liveChatMetrics' => $this->getLiveChatMetrics($dateRange),
            'conversionFunnel' => $this->getConversionFunnel($dateRange),
            'timeSeriesData' => $this->getTimeSeriesData($dateRange),
            'topPerformers' => $this->getTopPerformers($dateRange),
        ];
    }

    /**
     * Generate leads report.
     */
    private function generateLeadsReport(array $dateRange, array $filters): array
    {
        $leads = Lead::whereBetween('leads.created_at', [$dateRange['start'], $dateRange['end']])
            ->with(['user', 'communications'])
            ->get();

        return [
            'title' => 'Lead Analysis Report',
            'period' => $dateRange['start']->format('M d, Y') . ' - ' . $dateRange['end']->format('M d, Y'),
            'summary' => [
                'totalLeads' => $leads->count(),
                'qualifiedLeads' => $leads->where('status', 'qualified')->count(),
                'convertedLeads' => $leads->whereNotNull('converted_to_client')->count(),
                'conversionRate' => $this->getConversionRate($dateRange),
            ],
            'leadsByStatus' => $leads->groupBy('status')->map->count(),
            'leadsBySource' => $leads->groupBy('source')->map->count(),
            'detailedLeads' => $leads->map(function ($lead) {
                return [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'email' => $lead->email,
                    'phone' => $lead->phone,
                    'company' => $lead->company,
                    'status' => $lead->status,
                    'source' => $lead->source,
                    'created_at' => $lead->created_at->format('Y-m-d H:i:s'),
                    'converted_at' => $lead->converted_at?->format('Y-m-d H:i:s'),
                    'communications_count' => $lead->communications->count(),
                ];
            }),
        ];
    }

    /**
     * Generate clients report.
     */
    private function generateClientsReport(array $dateRange, array $filters): array
    {
        $clients = Client::whereBetween('clients.created_at', [$dateRange['start'], $dateRange['end']])
            ->with(['user', 'communications'])
            ->get();

        return [
            'title' => 'Client Analysis Report',
            'period' => $dateRange['start']->format('M d, Y') . ' - ' . $dateRange['end']->format('M d, Y'),
            'summary' => [
                'totalClients' => $clients->count(),
                'activeClients' => $clients->where('status', 'active')->count(),
                'retentionRate' => $this->getClientRetentionRate($dateRange),
            ],
            'clientsByStatus' => $clients->groupBy('status')->map->count(),
            'detailedClients' => $clients->map(function ($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'phone' => $client->phone,
                    'company' => $client->company,
                    'status' => $client->status,
                    'created_at' => $client->created_at->format('Y-m-d H:i:s'),
                    'communications_count' => $client->communications->count(),
                ];
            }),
        ];
    }

    /**
     * Generate communications report.
     */
    private function generateCommunicationsReport(array $dateRange, array $filters): array
    {
        $communications = Communication::whereBetween('communications.created_at', [$dateRange['start'], $dateRange['end']])
            ->with(['user', 'communicable'])
            ->get();

        return [
            'title' => 'Communication Analysis Report',
            'period' => $dateRange['start']->format('M d, Y') . ' - ' . $dateRange['end']->format('M d, Y'),
            'summary' => [
                'totalCommunications' => $communications->count(),
                'averagePerDay' => round($communications->count() / max(1, $dateRange['start']->diffInDays($dateRange['end'])), 2),
            ],
            'communicationsByType' => $communications->groupBy('type')->map->count(),
            'communicationsByUser' => $communications->groupBy('user.name')->map->count(),
            'detailedCommunications' => $communications->map(function ($comm) {
                return [
                    'id' => $comm->id,
                    'type' => $comm->type,
                    'subject' => $comm->subject,
                    'content' => substr($comm->content, 0, 100) . '...',
                    'user' => $comm->user->name,
                    'communicable_type' => class_basename($comm->communicable_type),
                    'created_at' => $comm->created_at->format('Y-m-d H:i:s'),
                ];
            }),
        ];
    }

    /**
     * Generate LiveChat report.
     */
    private function generateLiveChatReport(array $dateRange, array $filters): array
    {
        $conversations = Conversation::whereBetween('conversations.created_at', [$dateRange['start'], $dateRange['end']])
            ->with(['messages', 'creator', 'assignee'])
            ->get();

        return [
            'title' => 'LiveChat Analysis Report',
            'period' => $dateRange['start']->format('M d, Y') . ' - ' . $dateRange['end']->format('M d, Y'),
            'summary' => [
                'totalConversations' => $conversations->count(),
                'totalMessages' => $conversations->sum(fn($conv) => $conv->messages->count()),
                'averageConversationLength' => $this->getAverageConversationLength($dateRange),
            ],
            'conversationsByStatus' => $conversations->groupBy('status')->map->count(),
            'detailedConversations' => $conversations->map(function ($conv) {
                return [
                    'id' => $conv->id,
                    'title' => $conv->title,
                    'status' => $conv->status,
                    'priority' => $conv->priority,
                    'creator' => $conv->creator->name,
                    'assignee' => $conv->assignee?->name,
                    'messages_count' => $conv->messages->count(),
                    'created_at' => $conv->created_at->format('Y-m-d H:i:s'),
                ];
            }),
        ];
    }

    /**
     * Generate performance report.
     */
    private function generatePerformanceReport(array $dateRange, array $filters): array
    {
        return [
            'title' => 'Team Performance Report',
            'period' => $dateRange['start']->format('M d, Y') . ' - ' . $dateRange['end']->format('M d, Y'),
            'topPerformers' => $this->getTopPerformers($dateRange),
            'metrics' => $this->getOverviewMetrics($dateRange),
        ];
    }

    /**
     * Generate conversion report.
     */
    private function generateConversionReport(array $dateRange, array $filters): array
    {
        return [
            'title' => 'Conversion Funnel Report',
            'period' => $dateRange['start']->format('M d, Y') . ' - ' . $dateRange['end']->format('M d, Y'),
            'conversionFunnel' => $this->getConversionFunnel($dateRange),
            'conversionRate' => $this->getConversionRate($dateRange),
            'averageTimeToConversion' => $this->getAverageTimeToConversion($dateRange),
        ];
    }

    /**
     * Generate revenue report.
     */
    private function generateRevenueReport(array $dateRange, array $filters): array
    {
        return [
            'title' => 'Revenue Analysis Report',
            'period' => $dateRange['start']->format('M d, Y') . ' - ' . $dateRange['end']->format('M d, Y'),
            'summary' => [
                'totalRevenue' => 0, // Would come from billing module
                'averageClientValue' => $this->getAverageClientValue($dateRange),
                'projectedRevenue' => 0, // Would be calculated based on pipeline
            ],
        ];
    }

    /**
     * Generate PDF report.
     */
    private function generatePdfReport(array $data, string $filename): JsonResponse
    {
        // This would use a PDF library like DomPDF or wkhtmltopdf
        // For now, return JSON with PDF flag
        return response()->json($data)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "attachment; filename={$filename}.pdf");
    }

    /**
     * Generate Excel report.
     */
    private function generateExcelReport(array $data, string $filename): JsonResponse
    {
        // This would use PhpSpreadsheet or similar
        // For now, return JSON with Excel flag
        return response()->json($data)
            ->header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            ->header('Content-Disposition', "attachment; filename={$filename}.xlsx");
    }

    /**
     * Generate CSV report.
     */
    private function generateCsvReport(array $data, string $filename): JsonResponse
    {
        $csv = $this->arrayToCsv($data);

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename={$filename}.csv");
    }
}
