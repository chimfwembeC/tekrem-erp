<?php

namespace App\Services;

use App\Models\Finance\Quotation;
use App\Models\Finance\Invoice;
use App\Models\Finance\Payment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinanceAnalyticsService
{
    /**
     * Get quotation analytics
     */
    public function getQuotationAnalytics($userId, $period = '30_days')
    {
        $dateRange = $this->getDateRange($period);
        
        $baseQuery = Quotation::where('user_id', $userId)
            ->whereBetween('created_at', $dateRange);

        // Basic metrics
        $totalQuotations = $baseQuery->count();
        $totalValue = $baseQuery->sum('total_amount');
        
        // Status breakdown
        $statusBreakdown = $baseQuery->select('status', DB::raw('count(*) as count'), DB::raw('sum(total_amount) as value'))
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        // Conversion metrics
        $acceptedQuotations = $baseQuery->where('status', 'accepted')->count();
        $convertedQuotations = $baseQuery->whereNotNull('converted_to_invoice_id')->count();
        
        $conversionRate = $totalQuotations > 0 ? ($acceptedQuotations / $totalQuotations) * 100 : 0;
        $invoiceConversionRate = $acceptedQuotations > 0 ? ($convertedQuotations / $acceptedQuotations) * 100 : 0;

        // Time-based analytics
        $dailyMetrics = $this->getQuotationDailyMetrics($userId, $dateRange);
        
        // Average metrics
        $avgQuotationValue = $totalQuotations > 0 ? $totalValue / $totalQuotations : 0;
        $avgTimeToAcceptance = $this->getAverageTimeToAcceptance($userId, $dateRange);

        // Top performing items
        $topItems = $this->getTopQuotationItems($userId, $dateRange);

        return [
            'period' => $period,
            'date_range' => $dateRange,
            'overview' => [
                'total_quotations' => $totalQuotations,
                'total_value' => $totalValue,
                'conversion_rate' => round($conversionRate, 2),
                'invoice_conversion_rate' => round($invoiceConversionRate, 2),
                'avg_quotation_value' => $avgQuotationValue,
                'avg_time_to_acceptance' => $avgTimeToAcceptance,
            ],
            'status_breakdown' => $statusBreakdown,
            'daily_metrics' => $dailyMetrics,
            'top_items' => $topItems,
        ];
    }

    /**
     * Get invoice analytics
     */
    public function getInvoiceAnalytics($userId, $period = '30_days')
    {
        $dateRange = $this->getDateRange($period);
        
        $baseQuery = Invoice::where('user_id', $userId)
            ->whereBetween('created_at', $dateRange);

        // Basic metrics
        $totalInvoices = $baseQuery->count();
        $totalValue = $baseQuery->sum('total_amount');
        $totalPaid = $baseQuery->sum('paid_amount');
        $totalOutstanding = $totalValue - $totalPaid;
        
        // Status breakdown
        $statusBreakdown = $baseQuery->select('status', DB::raw('count(*) as count'), DB::raw('sum(total_amount) as value'))
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        // Payment metrics
        $paidInvoices = $baseQuery->where('status', 'paid')->count();
        $overdueInvoices = $baseQuery->where('status', 'overdue')->count();
        
        $paymentRate = $totalInvoices > 0 ? ($paidInvoices / $totalInvoices) * 100 : 0;
        $overdueRate = $totalInvoices > 0 ? ($overdueInvoices / $totalInvoices) * 100 : 0;

        // Time-based analytics
        $dailyMetrics = $this->getInvoiceDailyMetrics($userId, $dateRange);
        
        // Average metrics
        $avgInvoiceValue = $totalInvoices > 0 ? $totalValue / $totalInvoices : 0;
        $avgTimeToPayment = $this->getAverageTimeToPayment($userId, $dateRange);

        // Aging analysis
        $agingAnalysis = $this->getInvoiceAgingAnalysis($userId);

        return [
            'period' => $period,
            'date_range' => $dateRange,
            'overview' => [
                'total_invoices' => $totalInvoices,
                'total_value' => $totalValue,
                'total_paid' => $totalPaid,
                'total_outstanding' => $totalOutstanding,
                'payment_rate' => round($paymentRate, 2),
                'overdue_rate' => round($overdueRate, 2),
                'avg_invoice_value' => $avgInvoiceValue,
                'avg_time_to_payment' => $avgTimeToPayment,
            ],
            'status_breakdown' => $statusBreakdown,
            'daily_metrics' => $dailyMetrics,
            'aging_analysis' => $agingAnalysis,
        ];
    }

    /**
     * Get revenue analytics
     */
    public function getRevenueAnalytics($userId, $period = '30_days')
    {
        $dateRange = $this->getDateRange($period);
        
        // Revenue from paid invoices
        $paidInvoices = Invoice::where('user_id', $userId)
            ->where('status', 'paid')
            ->whereBetween('updated_at', $dateRange)
            ->sum('total_amount');

        // Revenue from partial payments
        $partialPayments = Payment::whereHas('invoice', function($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->whereBetween('payment_date', $dateRange)
            ->sum('amount');

        // Monthly revenue trend
        $monthlyRevenue = $this->getMonthlyRevenueTrend($userId, 12);
        
        // Revenue by currency
        $revenueByCurrency = Invoice::where('user_id', $userId)
            ->where('status', 'paid')
            ->whereBetween('updated_at', $dateRange)
            ->select('currency', DB::raw('sum(total_amount) as total'))
            ->groupBy('currency')
            ->get();

        return [
            'period' => $period,
            'date_range' => $dateRange,
            'total_revenue' => $paidInvoices,
            'payment_revenue' => $partialPayments,
            'monthly_trend' => $monthlyRevenue,
            'revenue_by_currency' => $revenueByCurrency,
        ];
    }

    /**
     * Get comprehensive dashboard metrics
     */
    public function getDashboardMetrics($userId)
    {
        $quotationMetrics = $this->getQuotationAnalytics($userId, '30_days');
        $invoiceMetrics = $this->getInvoiceAnalytics($userId, '30_days');
        $revenueMetrics = $this->getRevenueAnalytics($userId, '30_days');

        // Recent activity
        $recentQuotations = Quotation::where('user_id', $userId)
            ->with('lead')
            ->latest()
            ->take(5)
            ->get();

        $recentInvoices = Invoice::where('user_id', $userId)
            ->with('billable')
            ->latest()
            ->take(5)
            ->get();

        // Alerts and notifications
        $alerts = $this->getFinanceAlerts($userId);

        return [
            'quotations' => $quotationMetrics['overview'],
            'invoices' => $invoiceMetrics['overview'],
            'revenue' => $revenueMetrics,
            'recent_quotations' => $recentQuotations,
            'recent_invoices' => $recentInvoices,
            'alerts' => $alerts,
        ];
    }

    /**
     * Get finance alerts
     */
    private function getFinanceAlerts($userId)
    {
        $alerts = [];

        // Expiring quotations
        $expiringQuotations = Quotation::where('user_id', $userId)
            ->where('status', 'sent')
            ->where('expiry_date', '<=', now()->addDays(3))
            ->count();

        if ($expiringQuotations > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Quotations Expiring Soon',
                'message' => "{$expiringQuotations} quotation(s) expire within 3 days",
                'action_url' => '/finance/quotations?status=sent',
            ];
        }

        // Overdue invoices
        $overdueInvoices = Invoice::where('user_id', $userId)
            ->where('status', 'overdue')
            ->count();

        if ($overdueInvoices > 0) {
            $alerts[] = [
                'type' => 'error',
                'title' => 'Overdue Invoices',
                'message' => "{$overdueInvoices} invoice(s) are overdue",
                'action_url' => '/finance/invoices?status=overdue',
            ];
        }

        // Pending quotations
        $pendingQuotations = Quotation::where('user_id', $userId)
            ->where('status', 'sent')
            ->where('created_at', '<=', now()->subDays(7))
            ->count();

        if ($pendingQuotations > 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Pending Quotations',
                'message' => "{$pendingQuotations} quotation(s) have been pending for over a week",
                'action_url' => '/finance/quotations?status=sent',
            ];
        }

        return $alerts;
    }

    /**
     * Get date range for period
     */
    private function getDateRange($period)
    {
        switch ($period) {
            case '7_days':
                return [now()->subDays(7), now()];
            case '30_days':
                return [now()->subDays(30), now()];
            case '90_days':
                return [now()->subDays(90), now()];
            case '1_year':
                return [now()->subYear(), now()];
            case 'this_month':
                return [now()->startOfMonth(), now()->endOfMonth()];
            case 'last_month':
                return [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()];
            default:
                return [now()->subDays(30), now()];
        }
    }

    /**
     * Get quotation daily metrics
     */
    private function getQuotationDailyMetrics($userId, $dateRange)
    {
        return Quotation::where('user_id', $userId)
            ->whereBetween('created_at', $dateRange)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count'),
                DB::raw('sum(total_amount) as value')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    /**
     * Get invoice daily metrics
     */
    private function getInvoiceDailyMetrics($userId, $dateRange)
    {
        return Invoice::where('user_id', $userId)
            ->whereBetween('created_at', $dateRange)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count'),
                DB::raw('sum(total_amount) as value'),
                DB::raw('sum(paid_amount) as paid')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    /**
     * Get average time to acceptance for quotations
     */
    private function getAverageTimeToAcceptance($userId, $dateRange)
    {
        $acceptedQuotations = Quotation::where('user_id', $userId)
            ->where('status', 'accepted')
            ->whereBetween('created_at', $dateRange)
            ->get();

        if ($acceptedQuotations->isEmpty()) {
            return 0;
        }

        $totalDays = $acceptedQuotations->sum(function ($quotation) {
            return $quotation->created_at->diffInDays($quotation->updated_at);
        });

        return round($totalDays / $acceptedQuotations->count(), 1);
    }

    /**
     * Get average time to payment for invoices
     */
    private function getAverageTimeToPayment($userId, $dateRange)
    {
        $paidInvoices = Invoice::where('user_id', $userId)
            ->where('status', 'paid')
            ->whereBetween('created_at', $dateRange)
            ->get();

        if ($paidInvoices->isEmpty()) {
            return 0;
        }

        $totalDays = $paidInvoices->sum(function ($invoice) {
            return $invoice->issue_date->diffInDays($invoice->updated_at);
        });

        return round($totalDays / $paidInvoices->count(), 1);
    }

    /**
     * Get top quotation items
     */
    private function getTopQuotationItems($userId, $dateRange)
    {
        return DB::table('quotation_items')
            ->join('quotations', 'quotation_items.quotation_id', '=', 'quotations.id')
            ->where('quotations.user_id', $userId)
            ->whereBetween('quotations.created_at', $dateRange)
            ->select(
                'quotation_items.description',
                DB::raw('sum(quotation_items.quantity) as total_quantity'),
                DB::raw('sum(quotation_items.total_price) as total_value'),
                DB::raw('count(*) as frequency')
            )
            ->groupBy('quotation_items.description')
            ->orderBy('total_value', 'desc')
            ->take(10)
            ->get();
    }

    /**
     * Get invoice aging analysis
     */
    private function getInvoiceAgingAnalysis($userId)
    {
        $today = now();
        
        return [
            'current' => Invoice::where('user_id', $userId)
                ->where('status', '!=', 'paid')
                ->where('due_date', '>=', $today)
                ->sum('total_amount'),
            '1_30_days' => Invoice::where('user_id', $userId)
                ->where('status', '!=', 'paid')
                ->whereBetween('due_date', [$today->copy()->subDays(30), $today->copy()->subDay()])
                ->sum('total_amount'),
            '31_60_days' => Invoice::where('user_id', $userId)
                ->where('status', '!=', 'paid')
                ->whereBetween('due_date', [$today->copy()->subDays(60), $today->copy()->subDays(31)])
                ->sum('total_amount'),
            '61_90_days' => Invoice::where('user_id', $userId)
                ->where('status', '!=', 'paid')
                ->whereBetween('due_date', [$today->copy()->subDays(90), $today->copy()->subDays(61)])
                ->sum('total_amount'),
            'over_90_days' => Invoice::where('user_id', $userId)
                ->where('status', '!=', 'paid')
                ->where('due_date', '<', $today->copy()->subDays(90))
                ->sum('total_amount'),
        ];
    }

    /**
     * Get monthly revenue trend
     */
    private function getMonthlyRevenueTrend($userId, $months = 12)
    {
        return Invoice::where('user_id', $userId)
            ->where('status', 'paid')
            ->where('updated_at', '>=', now()->subMonths($months))
            ->select(
                DB::raw('YEAR(updated_at) as year'),
                DB::raw('MONTH(updated_at) as month'),
                DB::raw('sum(total_amount) as revenue')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
    }
}
