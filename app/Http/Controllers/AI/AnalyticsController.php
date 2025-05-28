<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\AI\Service;
use App\Models\AI\AIModel;
use App\Models\AI\Conversation;
use App\Models\AI\PromptTemplate;
use App\Models\AI\UsageLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    /**
     * Display the analytics dashboard.
     */
    public function dashboard(Request $request)
    {
        $period = $request->get('period', '30 days');
        $startDate = now()->sub($period);

        // Overview statistics
        $stats = [
            'total_requests' => UsageLog::where('created_at', '>=', $startDate)->count(),
            'successful_requests' => UsageLog::where('created_at', '>=', $startDate)->where('status', 'success')->count(),
            'total_tokens' => UsageLog::where('created_at', '>=', $startDate)->sum('total_tokens'),
            'total_cost' => UsageLog::where('created_at', '>=', $startDate)->sum('cost'),
            'avg_response_time' => UsageLog::where('created_at', '>=', $startDate)->avg('response_time_ms'),
            'active_conversations' => Conversation::where('last_message_at', '>=', $startDate)->count(),
            'new_conversations' => Conversation::where('created_at', '>=', $startDate)->count(),
            'template_usage' => PromptTemplate::where('updated_at', '>=', $startDate)->sum('usage_count'),
        ];

        // Calculate success rate
        $stats['success_rate'] = $stats['total_requests'] > 0 
            ? ($stats['successful_requests'] / $stats['total_requests']) * 100 
            : 0;

        // Daily usage trends
        $dailyUsage = UsageLog::where('created_at', '>=', $startDate)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->selectRaw('DATE(created_at) as date, count(*) as requests, sum(total_tokens) as tokens, sum(cost) as cost, avg(response_time_ms) as avg_response_time')
            ->orderBy('date')
            ->get();

        // Usage by operation type
        $usageByOperation = UsageLog::where('created_at', '>=', $startDate)
            ->groupBy('operation_type')
            ->selectRaw('operation_type, count(*) as count, sum(total_tokens) as tokens, sum(cost) as cost')
            ->get();

        // Usage by model
        $usageByModel = UsageLog::with('aiModel')
            ->where('created_at', '>=', $startDate)
            ->groupBy('ai_model_id')
            ->selectRaw('ai_model_id, count(*) as count, sum(total_tokens) as tokens, sum(cost) as cost')
            ->get()
            ->map(function ($item) {
                return [
                    'model_name' => $item->aiModel->name ?? 'Unknown',
                    'count' => $item->count,
                    'tokens' => $item->tokens,
                    'cost' => $item->cost,
                ];
            });

        // Usage by context
        $usageByContext = UsageLog::where('created_at', '>=', $startDate)
            ->whereNotNull('context_type')
            ->groupBy('context_type')
            ->selectRaw('context_type, count(*) as count, sum(total_tokens) as tokens, sum(cost) as cost')
            ->get();

        // Top users
        $topUsers = UsageLog::with('user')
            ->where('created_at', '>=', $startDate)
            ->groupBy('user_id')
            ->selectRaw('user_id, count(*) as requests, sum(total_tokens) as tokens, sum(cost) as cost')
            ->orderBy('requests', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'user_name' => $item->user->name ?? 'Unknown',
                    'requests' => $item->requests,
                    'tokens' => $item->tokens,
                    'cost' => $item->cost,
                ];
            });

        // Error analysis
        $errorStats = UsageLog::where('created_at', '>=', $startDate)
            ->where('status', '!=', 'success')
            ->groupBy('status')
            ->selectRaw('status, count(*) as count')
            ->get()
            ->pluck('count', 'status');

        return Inertia::render('AI/Analytics/Dashboard', [
            'stats' => $stats,
            'dailyUsage' => $dailyUsage,
            'usageByOperation' => $usageByOperation,
            'usageByModel' => $usageByModel,
            'usageByContext' => $usageByContext,
            'topUsers' => $topUsers,
            'errorStats' => $errorStats,
            'period' => $period,
        ]);
    }

    /**
     * Get detailed usage analytics.
     */
    public function usage(Request $request)
    {
        $period = $request->get('period', '30 days');
        $groupBy = $request->get('group_by', 'day'); // day, week, month
        $startDate = now()->sub($period);

        $dateFormat = match($groupBy) {
            'week' => 'YEARWEEK(created_at)',
            'month' => 'YEAR(created_at), MONTH(created_at)',
            default => 'DATE(created_at)',
        };

        $usage = UsageLog::where('created_at', '>=', $startDate)
            ->groupBy(DB::raw($dateFormat))
            ->selectRaw("
                {$dateFormat} as period,
                count(*) as total_requests,
                sum(case when status = 'success' then 1 else 0 end) as successful_requests,
                sum(total_tokens) as total_tokens,
                sum(input_tokens) as input_tokens,
                sum(output_tokens) as output_tokens,
                sum(cost) as total_cost,
                avg(response_time_ms) as avg_response_time
            ")
            ->orderBy('period')
            ->get();

        return response()->json($usage);
    }

    /**
     * Get cost analytics.
     */
    public function costs(Request $request)
    {
        $period = $request->get('period', '30 days');
        $startDate = now()->sub($period);

        // Cost breakdown by service
        $costByService = UsageLog::with('aiModel.service')
            ->where('created_at', '>=', $startDate)
            ->get()
            ->groupBy(function ($item) {
                return $item->aiModel->service->name ?? 'Unknown';
            })
            ->map(function ($items, $serviceName) {
                return [
                    'service_name' => $serviceName,
                    'total_cost' => $items->sum('cost'),
                    'total_tokens' => $items->sum('total_tokens'),
                    'requests' => $items->count(),
                    'avg_cost_per_request' => $items->count() > 0 ? $items->sum('cost') / $items->count() : 0,
                ];
            })
            ->values();

        // Cost breakdown by model
        $costByModel = UsageLog::with('aiModel')
            ->where('created_at', '>=', $startDate)
            ->groupBy('ai_model_id')
            ->selectRaw('ai_model_id, sum(cost) as total_cost, sum(total_tokens) as total_tokens, count(*) as requests')
            ->get()
            ->map(function ($item) {
                return [
                    'model_name' => $item->aiModel->name ?? 'Unknown',
                    'total_cost' => $item->total_cost,
                    'total_tokens' => $item->total_tokens,
                    'requests' => $item->requests,
                    'avg_cost_per_request' => $item->requests > 0 ? $item->total_cost / $item->requests : 0,
                ];
            });

        // Cost trends
        $costTrends = UsageLog::where('created_at', '>=', $startDate)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->selectRaw('DATE(created_at) as date, sum(cost) as daily_cost, sum(total_tokens) as daily_tokens')
            ->orderBy('date')
            ->get();

        // Cost by operation type
        $costByOperation = UsageLog::where('created_at', '>=', $startDate)
            ->groupBy('operation_type')
            ->selectRaw('operation_type, sum(cost) as total_cost, count(*) as requests, avg(cost) as avg_cost')
            ->get();

        return response()->json([
            'cost_by_service' => $costByService,
            'cost_by_model' => $costByModel,
            'cost_trends' => $costTrends,
            'cost_by_operation' => $costByOperation,
        ]);
    }

    /**
     * Get performance analytics.
     */
    public function performance(Request $request)
    {
        $period = $request->get('period', '30 days');
        $startDate = now()->sub($period);

        // Response time statistics
        $responseTimeStats = UsageLog::where('created_at', '>=', $startDate)
            ->whereNotNull('response_time_ms')
            ->selectRaw('
                avg(response_time_ms) as avg_response_time,
                min(response_time_ms) as min_response_time,
                max(response_time_ms) as max_response_time,
                stddev(response_time_ms) as stddev_response_time
            ')
            ->first();

        // Performance by model
        $performanceByModel = UsageLog::with('aiModel')
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('response_time_ms')
            ->groupBy('ai_model_id')
            ->selectRaw('
                ai_model_id,
                avg(response_time_ms) as avg_response_time,
                count(*) as requests,
                sum(case when status = "success" then 1 else 0 end) as successful_requests
            ')
            ->get()
            ->map(function ($item) {
                return [
                    'model_name' => $item->aiModel->name ?? 'Unknown',
                    'avg_response_time' => $item->avg_response_time,
                    'requests' => $item->requests,
                    'success_rate' => $item->requests > 0 ? ($item->successful_requests / $item->requests) * 100 : 0,
                ];
            });

        // Error rates
        $errorRates = UsageLog::where('created_at', '>=', $startDate)
            ->groupBy('status')
            ->selectRaw('status, count(*) as count')
            ->get()
            ->pluck('count', 'status');

        // Performance trends
        $performanceTrends = UsageLog::where('created_at', '>=', $startDate)
            ->whereNotNull('response_time_ms')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->selectRaw('
                DATE(created_at) as date,
                avg(response_time_ms) as avg_response_time,
                count(*) as requests,
                sum(case when status = "success" then 1 else 0 end) as successful_requests
            ')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                $item->success_rate = $item->requests > 0 ? ($item->successful_requests / $item->requests) * 100 : 0;
                return $item;
            });

        return response()->json([
            'response_time_stats' => $responseTimeStats,
            'performance_by_model' => $performanceByModel,
            'error_rates' => $errorRates,
            'performance_trends' => $performanceTrends,
        ]);
    }

    /**
     * Export analytics data.
     */
    public function export(Request $request)
    {
        $format = $request->get('format', 'csv');
        $period = $request->get('period', '30 days');
        $type = $request->get('type', 'usage'); // usage, costs, performance
        $startDate = now()->sub($period);

        $data = match($type) {
            'costs' => $this->getCostData($startDate),
            'performance' => $this->getPerformanceData($startDate),
            default => $this->getUsageData($startDate),
        };

        $filename = "ai_analytics_{$type}_" . now()->format('Y-m-d_H-i-s');

        switch ($format) {
            case 'csv':
                return $this->exportToCsv($data, $filename, $type);
            case 'json':
                return $this->exportToJson($data, $filename, $type);
            default:
                return response()->json(['error' => 'Invalid format'], 400);
        }
    }

    /**
     * Get usage data for export.
     */
    private function getUsageData($startDate)
    {
        return UsageLog::with(['user', 'aiModel.service'])
            ->where('created_at', '>=', $startDate)
            ->get();
    }

    /**
     * Get cost data for export.
     */
    private function getCostData($startDate)
    {
        return UsageLog::with(['user', 'aiModel.service'])
            ->where('created_at', '>=', $startDate)
            ->selectRaw('*, (input_tokens * cost_per_input_token + output_tokens * cost_per_output_token) as calculated_cost')
            ->get();
    }

    /**
     * Get performance data for export.
     */
    private function getPerformanceData($startDate)
    {
        return UsageLog::with(['user', 'aiModel.service'])
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('response_time_ms')
            ->get();
    }

    /**
     * Export data to CSV.
     */
    private function exportToCsv($data, $filename, $type)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
        ];

        $callback = function () use ($data, $type) {
            $file = fopen('php://output', 'w');
            
            // CSV headers based on type
            $csvHeaders = match($type) {
                'costs' => ['Date', 'User', 'Model', 'Service', 'Operation', 'Input Tokens', 'Output Tokens', 'Total Tokens', 'Cost'],
                'performance' => ['Date', 'User', 'Model', 'Service', 'Operation', 'Response Time (ms)', 'Status', 'Tokens'],
                default => ['Date', 'User', 'Model', 'Service', 'Operation', 'Context', 'Tokens', 'Cost', 'Status'],
            };
            
            fputcsv($file, $csvHeaders);

            foreach ($data as $item) {
                $row = match($type) {
                    'costs' => [
                        $item->created_at->toDateString(),
                        $item->user->name ?? 'Unknown',
                        $item->aiModel->name ?? 'Unknown',
                        $item->aiModel->service->name ?? 'Unknown',
                        $item->operation_type,
                        $item->input_tokens,
                        $item->output_tokens,
                        $item->total_tokens,
                        $item->cost,
                    ],
                    'performance' => [
                        $item->created_at->toDateString(),
                        $item->user->name ?? 'Unknown',
                        $item->aiModel->name ?? 'Unknown',
                        $item->aiModel->service->name ?? 'Unknown',
                        $item->operation_type,
                        $item->response_time_ms,
                        $item->status,
                        $item->total_tokens,
                    ],
                    default => [
                        $item->created_at->toDateString(),
                        $item->user->name ?? 'Unknown',
                        $item->aiModel->name ?? 'Unknown',
                        $item->aiModel->service->name ?? 'Unknown',
                        $item->operation_type,
                        $item->context_type,
                        $item->total_tokens,
                        $item->cost,
                        $item->status,
                    ],
                };
                
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export data to JSON.
     */
    private function exportToJson($data, $filename, $type)
    {
        $exportData = [
            'export_date' => now()->toISOString(),
            'export_type' => $type,
            'total_records' => $data->count(),
            'data' => $data->toArray(),
        ];

        $headers = [
            'Content-Type' => 'application/json',
            'Content-Disposition' => "attachment; filename=\"{$filename}.json\"",
        ];

        return response()->json($exportData, 200, $headers);
    }
}
