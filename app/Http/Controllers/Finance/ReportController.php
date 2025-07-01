<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\Transaction;
use App\Models\Finance\Expense;
use App\Models\Finance\Invoice;
use App\Models\Finance\Payment;
use App\Models\Finance\Budget;
use App\Models\Finance\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // For now, return a simple list of available reports
        // In a real implementation, you might store generated reports in the database
        $reports = collect([
            [
                'id' => 1,
                'name' => 'Income Statement',
                'description' => 'Profit and loss statement for the selected period',
                'type' => 'income_statement',
                'status' => 'available',
                'generated_at' => now()->subDays(1),
                'file_size' => 1024 * 150, // 150KB
                'created_by' => ['id' => $user->id, 'name' => $user->name],
                'created_at' => now()->subDays(7),
                'updated_at' => now()->subDays(1),
            ],
            [
                'id' => 2,
                'name' => 'Cash Flow Statement',
                'description' => 'Cash inflows and outflows for the selected period',
                'type' => 'cash_flow',
                'status' => 'available',
                'generated_at' => now()->subDays(2),
                'file_size' => 1024 * 200, // 200KB
                'created_by' => ['id' => $user->id, 'name' => $user->name],
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(2),
            ],
            [
                'id' => 3,
                'name' => 'Balance Sheet',
                'description' => 'Assets, liabilities, and equity at a specific point in time',
                'type' => 'balance_sheet',
                'status' => 'available',
                'generated_at' => now()->subDays(3),
                'file_size' => 1024 * 180, // 180KB
                'created_by' => ['id' => $user->id, 'name' => $user->name],
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(3),
            ],
            [
                'id' => 4,
                'name' => 'Expense Report',
                'description' => 'Detailed breakdown of expenses by category',
                'type' => 'expense_report',
                'status' => 'processing',
                'generated_at' => null,
                'file_size' => null,
                'created_by' => ['id' => $user->id, 'name' => $user->name],
                'created_at' => now()->subHours(2),
                'updated_at' => now()->subHours(1),
            ],
            [
                'id' => 5,
                'name' => 'Chart of Accounts',
                'description' => 'Complete listing of all accounts with balances and hierarchy',
                'type' => 'chart_of_accounts',
                'status' => 'available',
                'generated_at' => now()->subDays(1),
                'file_size' => 1024 * 120, // 120KB
                'created_by' => ['id' => $user->id, 'name' => $user->name],
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(1),
            ],
            [
                'id' => 6,
                'name' => 'Trial Balance',
                'description' => 'Trial balance showing all account balances for verification',
                'type' => 'trial_balance',
                'status' => 'available',
                'generated_at' => now()->subDays(2),
                'file_size' => 1024 * 95, // 95KB
                'created_by' => ['id' => $user->id, 'name' => $user->name],
                'created_at' => now()->subDays(8),
                'updated_at' => now()->subDays(2),
            ],
            [
                'id' => 7,
                'name' => 'Bank Reconciliation Summary',
                'description' => 'Summary of all bank reconciliations with status indicators',
                'type' => 'reconciliation_summary',
                'status' => 'available',
                'generated_at' => now()->subDays(1),
                'file_size' => 1024 * 85, // 85KB
                'created_by' => ['id' => $user->id, 'name' => $user->name],
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(1),
            ],
            [
                'id' => 8,
                'name' => 'Unreconciled Transactions',
                'description' => 'List of transactions that require reconciliation attention',
                'type' => 'unreconciled_transactions',
                'status' => 'processing',
                'generated_at' => null,
                'file_size' => null,
                'created_by' => ['id' => $user->id, 'name' => $user->name],
                'created_at' => now()->subHours(1),
                'updated_at' => now()->subMinutes(30),
            ],
        ]);

        // Apply filters
        if ($request->filled('search')) {
            $reports = $reports->filter(function ($report) use ($request) {
                return stripos($report['name'], $request->search) !== false ||
                       stripos($report['description'], $request->search) !== false;
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $reports = $reports->where('type', $request->type);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $reports = $reports->where('status', $request->status);
        }

        // Convert to paginated format
        $reportsData = [
            'data' => $reports->values()->all(),
            'links' => [],
            'meta' => [
                'total' => $reports->count(),
                'from' => 1,
                'to' => $reports->count(),
                'last_page' => 1,
                'current_page' => 1,
            ]
        ];

        $types = [
            'income_statement' => 'Income Statement',
            'cash_flow' => 'Cash Flow',
            'balance_sheet' => 'Balance Sheet',
            'expense_report' => 'Expense Report',
            'budget_analysis' => 'Budget Analysis',
            'tax_report' => 'Tax Report',
            'chart_of_accounts' => 'Chart of Accounts',
            'trial_balance' => 'Trial Balance',
            'account_activity' => 'Account Activity Report',
            'bank_reconciliation' => 'Bank Reconciliation Report',
            'reconciliation_summary' => 'Reconciliation Summary',
            'unreconciled_transactions' => 'Unreconciled Transactions',
        ];

        $statuses = [
            'available' => 'Available',
            'processing' => 'Processing',
            'failed' => 'Failed',
            'pending' => 'Pending',
        ];

        return Inertia::render('Finance/Reports/Index', [
            'reports' => $reportsData,
            'types' => $types,
            'statuses' => $statuses,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $types = [
            'income_statement' => 'Income Statement',
            'cash_flow' => 'Cash Flow',
            'balance_sheet' => 'Balance Sheet',
            'expense_report' => 'Expense Report',
            'budget_analysis' => 'Budget Analysis',
            'tax_report' => 'Tax Report',
            'chart_of_accounts' => 'Chart of Accounts',
            'trial_balance' => 'Trial Balance',
            'account_activity' => 'Account Activity Report',
            'bank_reconciliation' => 'Bank Reconciliation Report',
            'reconciliation_summary' => 'Reconciliation Summary',
            'unreconciled_transactions' => 'Unreconciled Transactions',
        ];

        return Inertia::render('Finance/Reports/Create', [
            'types' => $types,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'description' => 'nullable|string|max:1000',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        // In a real implementation, you would queue a job to generate the report
        // For now, just redirect back with success message

        return redirect()->route('finance.reports.index')
            ->with('success', 'Report generation has been queued. You will be notified when it\'s ready.');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // In a real implementation, you would fetch the report from the database
        $report = [
            'id' => $id,
            'name' => 'Sample Report',
            'description' => 'This is a sample report',
            'type' => 'income_statement',
            'status' => 'available',
            'generated_at' => now()->subDays(1),
            'file_size' => 1024 * 150,
            'created_by' => ['id' => auth()->id(), 'name' => auth()->user()->name],
            'created_at' => now()->subDays(7),
            'updated_at' => now()->subDays(1),
        ];

        return Inertia::render('Finance/Reports/Show', [
            'report' => $report,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $report = [
            'id' => $id,
            'name' => 'Sample Report',
            'description' => 'This is a sample report',
            'type' => 'income_statement',
            'status' => 'available',
        ];

        $types = [
            'income_statement' => 'Income Statement',
            'cash_flow' => 'Cash Flow',
            'balance_sheet' => 'Balance Sheet',
            'expense_report' => 'Expense Report',
            'budget_analysis' => 'Budget Analysis',
            'tax_report' => 'Tax Report',
            'chart_of_accounts' => 'Chart of Accounts',
            'trial_balance' => 'Trial Balance',
            'account_activity' => 'Account Activity Report',
            'bank_reconciliation' => 'Bank Reconciliation Report',
            'reconciliation_summary' => 'Reconciliation Summary',
            'unreconciled_transactions' => 'Unreconciled Transactions',
        ];

        return Inertia::render('Finance/Reports/Edit', [
            'report' => $report,
            'types' => $types,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'description' => 'nullable|string|max:1000',
        ]);

        return redirect()->route('finance.reports.index')
            ->with('success', 'Report updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        // In a real implementation, you would delete the report from the database
        return redirect()->route('finance.reports.index')
            ->with('success', 'Report deleted successfully.');
    }

    /**
     * Download the specified report.
     */
    public function download($id)
    {
        // In a real implementation, you would return the actual file
        return response()->json(['message' => 'Download functionality not implemented yet.']);
    }

    /**
     * Generate Chart of Accounts report.
     */
    public function chartOfAccounts(Request $request)
    {
        $request->validate([
            'as_of_date' => 'nullable|date',
            'include_inactive' => 'boolean',
            'category' => 'nullable|string',
            'format' => 'nullable|in:pdf,excel,csv',
        ]);

        // Get Chart of Accounts data
        $accounts = \App\Models\Finance\ChartOfAccount::query()
            ->when(!$request->boolean('include_inactive'), function ($query) {
                $query->where('is_active', true);
            })
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->where('account_category', $request->category);
            })
            ->with('parent', 'children')
            ->orderBy('account_code')
            ->get();

        $reportData = [
            'title' => 'Chart of Accounts Report',
            'generated_at' => now(),
            'as_of_date' => $request->as_of_date ?? now()->toDateString(),
            'parameters' => $request->only(['include_inactive', 'category']),
            'accounts' => $accounts->map(function ($account) {
                return [
                    'account_code' => $account->account_code,
                    'name' => $account->name,
                    'type' => $account->type,
                    'category' => $account->account_category,
                    'subcategory' => $account->account_subcategory,
                    'parent_code' => $account->parent?->account_code,
                    'level' => $account->level,
                    'balance' => $account->balance,
                    'normal_balance' => $account->normal_balance,
                    'is_active' => $account->is_active,
                    'is_system_account' => $account->is_system_account,
                ];
            }),
            'summary' => [
                'total_accounts' => $accounts->count(),
                'active_accounts' => $accounts->where('is_active', true)->count(),
                'by_category' => $accounts->groupBy('account_category')->map->count(),
                'total_balance' => $accounts->sum('balance'),
            ],
        ];

        return Inertia::render('Finance/Reports/ChartOfAccounts', [
            'reportData' => $reportData,
        ]);
    }

    /**
     * Generate Trial Balance report.
     */
    public function trialBalance(Request $request)
    {
        $request->validate([
            'as_of_date' => 'nullable|date',
            'include_zero_balances' => 'boolean',
            'format' => 'nullable|in:pdf,excel,csv',
        ]);

        $asOfDate = $request->as_of_date ?? now()->toDateString();

        // Get accounts with balances
        $accounts = \App\Models\Finance\ChartOfAccount::query()
            ->where('is_active', true)
            ->when(!$request->boolean('include_zero_balances'), function ($query) {
                $query->where('balance', '!=', 0);
            })
            ->orderBy('account_code')
            ->get();

        $totalDebits = $accounts->where('normal_balance', 'debit')->sum('balance');
        $totalCredits = $accounts->where('normal_balance', 'credit')->sum('balance');

        $reportData = [
            'title' => 'Trial Balance Report',
            'generated_at' => now(),
            'as_of_date' => $asOfDate,
            'parameters' => $request->only(['include_zero_balances']),
            'accounts' => $accounts->map(function ($account) {
                return [
                    'account_code' => $account->account_code,
                    'name' => $account->name,
                    'debit_balance' => $account->normal_balance === 'debit' ? $account->balance : 0,
                    'credit_balance' => $account->normal_balance === 'credit' ? $account->balance : 0,
                ];
            }),
            'totals' => [
                'total_debits' => $totalDebits,
                'total_credits' => $totalCredits,
                'difference' => $totalDebits - $totalCredits,
                'is_balanced' => abs($totalDebits - $totalCredits) < 0.01,
            ],
        ];

        return Inertia::render('Finance/Reports/TrialBalance', [
            'reportData' => $reportData,
        ]);
    }

    /**
     * Generate Bank Reconciliation Summary report.
     */
    public function reconciliationSummary(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'account_id' => 'nullable|exists:chart_of_accounts,id',
            'status' => 'nullable|in:pending,in_progress,completed,approved',
            'format' => 'nullable|in:pdf,excel,csv',
        ]);

        $query = \App\Models\Finance\BankReconciliation::query()
            ->with(['account', 'bankStatement', 'reconciledBy', 'approvedBy'])
            ->when($request->filled('date_from'), function ($query) use ($request) {
                $query->where('reconciliation_date', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($query) use ($request) {
                $query->where('reconciliation_date', '<=', $request->date_to);
            })
            ->when($request->filled('account_id'), function ($query) use ($request) {
                $query->where('account_id', $request->account_id);
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->orderBy('reconciliation_date', 'desc');

        $reconciliations = $query->get();

        $reportData = [
            'title' => 'Bank Reconciliation Summary Report',
            'generated_at' => now(),
            'period' => [
                'from' => $request->date_from ?? $reconciliations->min('reconciliation_date'),
                'to' => $request->date_to ?? $reconciliations->max('reconciliation_date'),
            ],
            'parameters' => $request->only(['account_id', 'status']),
            'reconciliations' => $reconciliations->map(function ($reconciliation) {
                return [
                    'id' => $reconciliation->id,
                    'reconciliation_number' => $reconciliation->reconciliation_number,
                    'account_name' => $reconciliation->account->name,
                    'reconciliation_date' => $reconciliation->reconciliation_date,
                    'period_start' => $reconciliation->period_start,
                    'period_end' => $reconciliation->period_end,
                    'statement_opening_balance' => $reconciliation->statement_opening_balance,
                    'statement_closing_balance' => $reconciliation->statement_closing_balance,
                    'book_opening_balance' => $reconciliation->book_opening_balance,
                    'book_closing_balance' => $reconciliation->book_closing_balance,
                    'difference' => $reconciliation->difference,
                    'status' => $reconciliation->status,
                    'matched_transactions_count' => $reconciliation->matched_transactions_count,
                    'unmatched_bank_transactions_count' => $reconciliation->unmatched_bank_transactions_count,
                    'unmatched_book_transactions_count' => $reconciliation->unmatched_book_transactions_count,
                    'reconciled_by' => $reconciliation->reconciledBy?->name,
                    'reconciled_at' => $reconciliation->reconciled_at,
                    'approved_by' => $reconciliation->approvedBy?->name,
                    'approved_at' => $reconciliation->approved_at,
                ];
            }),
            'summary' => [
                'total_reconciliations' => $reconciliations->count(),
                'by_status' => $reconciliations->groupBy('status')->map->count(),
                'total_difference' => $reconciliations->sum('difference'),
                'avg_difference' => $reconciliations->avg('difference'),
                'total_matched_transactions' => $reconciliations->sum('matched_transactions_count'),
                'total_unmatched_bank' => $reconciliations->sum('unmatched_bank_transactions_count'),
                'total_unmatched_book' => $reconciliations->sum('unmatched_book_transactions_count'),
            ],
        ];

        return Inertia::render('Finance/Reports/ReconciliationSummary', [
            'reportData' => $reportData,
        ]);
    }
}
