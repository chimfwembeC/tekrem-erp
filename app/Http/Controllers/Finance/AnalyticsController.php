<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Services\FinanceAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(FinanceAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Display the analytics dashboard.
     */
    public function dashboard(Request $request)
    {
        $period = $request->get('period', '30_days');
        $userId = auth()->id();

        $analytics = $this->analyticsService->getDashboardMetrics($userId);
        
        // Add period-specific data
        $quotationAnalytics = $this->analyticsService->getQuotationAnalytics($userId, $period);
        $invoiceAnalytics = $this->analyticsService->getInvoiceAnalytics($userId, $period);
        $revenueAnalytics = $this->analyticsService->getRevenueAnalytics($userId, $period);

        return Inertia::render('Finance/Analytics/Dashboard', [
            'analytics' => [
                'quotations' => $quotationAnalytics['overview'],
                'invoices' => $invoiceAnalytics['overview'],
                'revenue' => $revenueAnalytics,
                'alerts' => $analytics['alerts'],
            ],
            'period' => $period,
        ]);
    }

    /**
     * Get quotation analytics.
     */
    public function quotations(Request $request)
    {
        $period = $request->get('period', '30_days');
        $userId = auth()->id();

        $analytics = $this->analyticsService->getQuotationAnalytics($userId, $period);

        return Inertia::render('Finance/Analytics/Quotations', [
            'analytics' => $analytics,
            'period' => $period,
        ]);
    }

    /**
     * Get invoice analytics.
     */
    public function invoices(Request $request)
    {
        $period = $request->get('period', '30_days');
        $userId = auth()->id();

        $analytics = $this->analyticsService->getInvoiceAnalytics($userId, $period);

        return Inertia::render('Finance/Analytics/Invoices', [
            'analytics' => $analytics,
            'period' => $period,
        ]);
    }

    /**
     * Get revenue analytics.
     */
    public function revenue(Request $request)
    {
        $period = $request->get('period', '30_days');
        $userId = auth()->id();

        $analytics = $this->analyticsService->getRevenueAnalytics($userId, $period);

        return Inertia::render('Finance/Analytics/Revenue', [
            'analytics' => $analytics,
            'period' => $period,
        ]);
    }

    /**
     * Export analytics data.
     */
    public function export(Request $request)
    {
        $type = $request->get('type', 'dashboard');
        $period = $request->get('period', '30_days');
        $format = $request->get('format', 'csv');
        $userId = auth()->id();

        switch ($type) {
            case 'quotations':
                $data = $this->analyticsService->getQuotationAnalytics($userId, $period);
                break;
            case 'invoices':
                $data = $this->analyticsService->getInvoiceAnalytics($userId, $period);
                break;
            case 'revenue':
                $data = $this->analyticsService->getRevenueAnalytics($userId, $period);
                break;
            default:
                $data = $this->analyticsService->getDashboardMetrics($userId);
        }

        return $this->exportData($data, $type, $format);
    }

    /**
     * Export data in specified format.
     */
    private function exportData($data, $type, $format)
    {
        $filename = "finance-{$type}-" . now()->format('Y-m-d-H-i-s');

        switch ($format) {
            case 'json':
                return response()->json($data)
                    ->header('Content-Disposition', "attachment; filename=\"{$filename}.json\"");

            case 'csv':
                return $this->exportToCsv($data, $filename);

            case 'excel':
                return $this->exportToExcel($data, $filename);

            default:
                return response()->json(['error' => 'Unsupported format'], 400);
        }
    }

    /**
     * Export data to CSV.
     */
    private function exportToCsv($data, $filename)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            
            // Write headers
            fputcsv($file, ['Metric', 'Value']);
            
            // Write data
            $this->writeCsvData($file, $data);
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Write data to CSV file.
     */
    private function writeCsvData($file, $data, $prefix = '')
    {
        foreach ($data as $key => $value) {
            $fullKey = $prefix ? "{$prefix}.{$key}" : $key;
            
            if (is_array($value) || is_object($value)) {
                $this->writeCsvData($file, $value, $fullKey);
            } else {
                fputcsv($file, [$fullKey, $value]);
            }
        }
    }

    /**
     * Export data to Excel (placeholder - would need PhpSpreadsheet).
     */
    private function exportToExcel($data, $filename)
    {
        // This would require PhpSpreadsheet package
        // For now, return JSON with Excel headers
        return response()->json($data)
            ->header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}.xlsx\"");
    }
}
