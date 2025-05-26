<?php

namespace App\Services\Support;

use App\Models\Support\Ticket;
use App\Models\Support\TicketCategory;
use App\Models\Support\SLA;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportService
{
    /**
     * Generate ticket analytics report.
     */
    public function generateTicketAnalyticsReport(array $filters = []): array
    {
        $startDate = Carbon::parse($filters['start_date'] ?? now()->subDays(30));
        $endDate = Carbon::parse($filters['end_date'] ?? now());

        $tickets = Ticket::with(['category', 'assignedTo', 'createdBy'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if (!empty($filters['category_id'])) {
            $tickets->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['assigned_to'])) {
            $tickets->where('assigned_to', $filters['assigned_to']);
        }

        if (!empty($filters['status'])) {
            $tickets->where('status', $filters['status']);
        }

        if (!empty($filters['priority'])) {
            $tickets->where('priority', $filters['priority']);
        }

        $ticketData = $tickets->get();

        return [
            'summary' => $this->getTicketSummary($ticketData),
            'by_status' => $this->getTicketsByStatus($ticketData),
            'by_priority' => $this->getTicketsByPriority($ticketData),
            'by_category' => $this->getTicketsByCategory($ticketData),
            'by_assignee' => $this->getTicketsByAssignee($ticketData),
            'resolution_times' => $this->getResolutionTimes($ticketData),
            'sla_compliance' => $this->getSLACompliance($ticketData),
            'daily_trends' => $this->getDailyTrends($ticketData, $startDate, $endDate),
            'filters' => $filters,
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
        ];
    }

    /**
     * Generate agent performance report.
     */
    public function generateAgentPerformanceReport(array $filters = []): array
    {
        $startDate = Carbon::parse($filters['start_date'] ?? now()->subDays(30));
        $endDate = Carbon::parse($filters['end_date'] ?? now());

        $agents = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->with(['assignedTickets' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }])->get();

        $agentData = [];

        foreach ($agents as $agent) {
            $tickets = $agent->assignedTickets;
            $resolvedTickets = $tickets->where('status', 'resolved');
            $closedTickets = $tickets->where('status', 'closed');

            $agentData[] = [
                'agent' => $agent,
                'total_assigned' => $tickets->count(),
                'resolved' => $resolvedTickets->count(),
                'closed' => $closedTickets->count(),
                'resolution_rate' => $tickets->count() > 0 
                    ? round(($resolvedTickets->count() + $closedTickets->count()) / $tickets->count() * 100, 2)
                    : 0,
                'avg_resolution_time' => $this->calculateAverageResolutionTime($resolvedTickets),
                'avg_response_time' => $this->calculateAverageResponseTime($tickets),
                'sla_compliance' => $this->calculateAgentSLACompliance($tickets),
            ];
        }

        return [
            'agents' => collect($agentData)->sortByDesc('resolution_rate'),
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
        ];
    }

    /**
     * Generate SLA compliance report.
     */
    public function generateSLAComplianceReport(array $filters = []): array
    {
        $startDate = Carbon::parse($filters['start_date'] ?? now()->subDays(30));
        $endDate = Carbon::parse($filters['end_date'] ?? now());

        $slaData = [];
        $slas = SLA::with(['tickets' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }])->get();

        foreach ($slas as $sla) {
            $tickets = $sla->tickets;
            $responseCompliant = 0;
            $resolutionCompliant = 0;

            foreach ($tickets as $ticket) {
                if ($ticket->response_time_minutes && 
                    $ticket->response_time_minutes <= ($sla->response_time_hours * 60)) {
                    $responseCompliant++;
                }

                if ($ticket->resolution_time_minutes && 
                    $ticket->resolution_time_minutes <= ($sla->resolution_time_hours * 60)) {
                    $resolutionCompliant++;
                }
            }

            $slaData[] = [
                'sla' => $sla,
                'total_tickets' => $tickets->count(),
                'response_compliance' => $tickets->count() > 0 
                    ? round($responseCompliant / $tickets->count() * 100, 2) 
                    : 0,
                'resolution_compliance' => $tickets->count() > 0 
                    ? round($resolutionCompliant / $tickets->count() * 100, 2) 
                    : 0,
                'avg_response_time' => $this->calculateAverageResponseTime($tickets),
                'avg_resolution_time' => $this->calculateAverageResolutionTime($tickets),
            ];
        }

        return [
            'slas' => collect($slaData),
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
        ];
    }

    /**
     * Export report as PDF.
     */
    public function exportToPDF(string $reportType, array $data, array $options = []): \Illuminate\Http\Response
    {
        $view = match($reportType) {
            'ticket_analytics' => 'reports.support.ticket-analytics',
            'agent_performance' => 'reports.support.agent-performance',
            'sla_compliance' => 'reports.support.sla-compliance',
            default => 'reports.support.general',
        };

        $pdf = Pdf::loadView($view, $data);

        if (!empty($options['orientation'])) {
            $pdf->setPaper('a4', $options['orientation']);
        }

        $filename = $this->generateReportFilename($reportType, $data);

        return $pdf->download($filename);
    }

    /**
     * Export report as Excel.
     */
    public function exportToExcel(string $reportType, array $data): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        // This would integrate with Laravel Excel package
        // For now, returning a CSV export
        return $this->exportToCSV($reportType, $data);
    }

    /**
     * Export report as CSV.
     */
    public function exportToCSV(string $reportType, array $data): \Illuminate\Http\Response
    {
        $csvData = $this->convertDataToCSV($reportType, $data);
        $filename = $this->generateReportFilename($reportType, $data, 'csv');

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    /**
     * Get ticket summary statistics.
     */
    private function getTicketSummary(Collection $tickets): array
    {
        return [
            'total' => $tickets->count(),
            'open' => $tickets->where('status', 'open')->count(),
            'in_progress' => $tickets->where('status', 'in_progress')->count(),
            'pending' => $tickets->where('status', 'pending')->count(),
            'resolved' => $tickets->where('status', 'resolved')->count(),
            'closed' => $tickets->where('status', 'closed')->count(),
            'overdue' => $tickets->filter(function ($ticket) {
                return $ticket->due_date && 
                       Carbon::parse($ticket->due_date)->isPast() && 
                       !in_array($ticket->status, ['resolved', 'closed']);
            })->count(),
        ];
    }

    /**
     * Get tickets grouped by status.
     */
    private function getTicketsByStatus(Collection $tickets): array
    {
        return $tickets->groupBy('status')
            ->map(function ($group) {
                return $group->count();
            })
            ->toArray();
    }

    /**
     * Get tickets grouped by priority.
     */
    private function getTicketsByPriority(Collection $tickets): array
    {
        return $tickets->groupBy('priority')
            ->map(function ($group) {
                return $group->count();
            })
            ->toArray();
    }

    /**
     * Get tickets grouped by category.
     */
    private function getTicketsByCategory(Collection $tickets): array
    {
        return $tickets->groupBy('category.name')
            ->map(function ($group) {
                return $group->count();
            })
            ->toArray();
    }

    /**
     * Get tickets grouped by assignee.
     */
    private function getTicketsByAssignee(Collection $tickets): array
    {
        return $tickets->groupBy('assignedTo.name')
            ->map(function ($group) {
                return $group->count();
            })
            ->toArray();
    }

    /**
     * Calculate resolution times.
     */
    private function getResolutionTimes(Collection $tickets): array
    {
        $resolvedTickets = $tickets->whereNotNull('resolution_time_minutes');
        
        if ($resolvedTickets->isEmpty()) {
            return [
                'average' => 0,
                'median' => 0,
                'min' => 0,
                'max' => 0,
            ];
        }

        $times = $resolvedTickets->pluck('resolution_time_minutes')->sort();

        return [
            'average' => round($times->average(), 2),
            'median' => $times->median(),
            'min' => $times->min(),
            'max' => $times->max(),
        ];
    }

    /**
     * Calculate SLA compliance.
     */
    private function getSLACompliance(Collection $tickets): array
    {
        $ticketsWithSLA = $tickets->whereNotNull('sla_policy_id');
        
        if ($ticketsWithSLA->isEmpty()) {
            return [
                'response_compliance' => 0,
                'resolution_compliance' => 0,
            ];
        }

        $responseCompliant = 0;
        $resolutionCompliant = 0;

        foreach ($ticketsWithSLA as $ticket) {
            if ($ticket->slaPolicy) {
                if ($ticket->response_time_minutes && 
                    $ticket->response_time_minutes <= ($ticket->slaPolicy->response_time_hours * 60)) {
                    $responseCompliant++;
                }

                if ($ticket->resolution_time_minutes && 
                    $ticket->resolution_time_minutes <= ($ticket->slaPolicy->resolution_time_hours * 60)) {
                    $resolutionCompliant++;
                }
            }
        }

        return [
            'response_compliance' => round($responseCompliant / $ticketsWithSLA->count() * 100, 2),
            'resolution_compliance' => round($resolutionCompliant / $ticketsWithSLA->count() * 100, 2),
        ];
    }

    /**
     * Get daily ticket trends.
     */
    private function getDailyTrends(Collection $tickets, Carbon $startDate, Carbon $endDate): array
    {
        $trends = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            $dayTickets = $tickets->filter(function ($ticket) use ($current) {
                return Carbon::parse($ticket->created_at)->isSameDay($current);
            });

            $trends[] = [
                'date' => $current->format('Y-m-d'),
                'created' => $dayTickets->count(),
                'resolved' => $dayTickets->where('status', 'resolved')->count(),
                'closed' => $dayTickets->where('status', 'closed')->count(),
            ];

            $current->addDay();
        }

        return $trends;
    }

    /**
     * Calculate average resolution time.
     */
    private function calculateAverageResolutionTime(Collection $tickets): float
    {
        $resolvedTickets = $tickets->whereNotNull('resolution_time_minutes');
        return $resolvedTickets->isEmpty() ? 0 : round($resolvedTickets->avg('resolution_time_minutes'), 2);
    }

    /**
     * Calculate average response time.
     */
    private function calculateAverageResponseTime(Collection $tickets): float
    {
        $respondedTickets = $tickets->whereNotNull('response_time_minutes');
        return $respondedTickets->isEmpty() ? 0 : round($respondedTickets->avg('response_time_minutes'), 2);
    }

    /**
     * Calculate agent SLA compliance.
     */
    private function calculateAgentSLACompliance(Collection $tickets): float
    {
        $ticketsWithSLA = $tickets->whereNotNull('sla_policy_id');
        
        if ($ticketsWithSLA->isEmpty()) {
            return 0;
        }

        $compliant = 0;
        foreach ($ticketsWithSLA as $ticket) {
            if ($ticket->slaPolicy && 
                $ticket->resolution_time_minutes && 
                $ticket->resolution_time_minutes <= ($ticket->slaPolicy->resolution_time_hours * 60)) {
                $compliant++;
            }
        }

        return round($compliant / $ticketsWithSLA->count() * 100, 2);
    }

    /**
     * Convert data to CSV format.
     */
    private function convertDataToCSV(string $reportType, array $data): string
    {
        $csv = '';
        
        switch ($reportType) {
            case 'ticket_analytics':
                $csv = $this->ticketAnalyticsToCSV($data);
                break;
            case 'agent_performance':
                $csv = $this->agentPerformanceToCSV($data);
                break;
            case 'sla_compliance':
                $csv = $this->slaComplianceToCSV($data);
                break;
        }

        return $csv;
    }

    /**
     * Generate report filename.
     */
    private function generateReportFilename(string $reportType, array $data, string $extension = 'pdf'): string
    {
        $date = now()->format('Y-m-d');
        $type = str_replace('_', '-', $reportType);
        
        return "support-{$type}-report-{$date}.{$extension}";
    }

    /**
     * Convert ticket analytics to CSV.
     */
    private function ticketAnalyticsToCSV(array $data): string
    {
        $output = "Ticket Analytics Report\n";
        $output .= "Period: {$data['period']['start']} to {$data['period']['end']}\n\n";
        
        $output .= "Summary\n";
        $output .= "Total,Open,In Progress,Pending,Resolved,Closed,Overdue\n";
        $summary = $data['summary'];
        $output .= "{$summary['total']},{$summary['open']},{$summary['in_progress']},{$summary['pending']},{$summary['resolved']},{$summary['closed']},{$summary['overdue']}\n\n";
        
        return $output;
    }

    /**
     * Convert agent performance to CSV.
     */
    private function agentPerformanceToCSV(array $data): string
    {
        $output = "Agent Performance Report\n";
        $output .= "Period: {$data['period']['start']} to {$data['period']['end']}\n\n";
        
        $output .= "Agent,Total Assigned,Resolved,Closed,Resolution Rate,Avg Resolution Time,Avg Response Time,SLA Compliance\n";
        
        foreach ($data['agents'] as $agent) {
            $output .= "{$agent['agent']['name']},{$agent['total_assigned']},{$agent['resolved']},{$agent['closed']},{$agent['resolution_rate']}%,{$agent['avg_resolution_time']},{$agent['avg_response_time']},{$agent['sla_compliance']}%\n";
        }
        
        return $output;
    }

    /**
     * Convert SLA compliance to CSV.
     */
    private function slaComplianceToCSV(array $data): string
    {
        $output = "SLA Compliance Report\n";
        $output .= "Period: {$data['period']['start']} to {$data['period']['end']}\n\n";
        
        $output .= "SLA Policy,Total Tickets,Response Compliance,Resolution Compliance,Avg Response Time,Avg Resolution Time\n";
        
        foreach ($data['slas'] as $sla) {
            $output .= "{$sla['sla']['name']},{$sla['total_tickets']},{$sla['response_compliance']}%,{$sla['resolution_compliance']}%,{$sla['avg_response_time']},{$sla['avg_resolution_time']}\n";
        }
        
        return $output;
    }
}
