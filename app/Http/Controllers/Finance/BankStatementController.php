<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\BankStatement;
use App\Services\Finance\BankStatementImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BankStatementController extends Controller
{
    protected BankStatementImportService $importService;

    public function __construct(BankStatementImportService $importService)
    {
        $this->importService = $importService;
    }

    /**
     * Display a listing of bank statements.
     */
    public function index(Request $request): Response
    {
        $this->authorize('view finance');

        $query = BankStatement::with(['account', 'importedBy'])
            ->latest('statement_date');

        // Apply filters
        if ($request->filled('account_id')) {
            $query->where('account_id', $request->account_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('statement_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('statement_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('statement_number', 'like', "%{$search}%")
                  ->orWhere('file_name', 'like', "%{$search}%")
                  ->orWhereHas('account', function ($accountQuery) use ($search) {
                      $accountQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $statements = $query->paginate(20)->withQueryString();

        // Get accounts for filter dropdown
        $accounts = Account::where('is_active', true)
            ->whereIn('type', ['checking', 'savings', 'business', 'cash'])
            ->orderBy('name')
            ->get(['id', 'name', 'account_code']);

        return Inertia::render('Finance/BankStatement/Index', [
            'statements' => $statements,
            'accounts' => $accounts,
            'filters' => $request->only(['account_id', 'status', 'date_from', 'date_to', 'search']),
            'statuses' => [
                'pending' => 'Pending',
                'processing' => 'Processing',
                'completed' => 'Completed',
                'failed' => 'Failed',
            ],
        ]);
    }

    /**
     * Show the form for creating/importing a new bank statement.
     */
    public function create(): Response
    {
        $this->authorize('create finance');

        $accounts = Account::where('is_active', true)
            ->whereIn('type', ['checking', 'savings', 'business', 'cash'])
            ->orderBy('name')
            ->get(['id', 'name', 'account_code', 'balance']);

        return Inertia::render('Finance/BankStatement/Create', [
            'accounts' => $accounts,
            'importMethods' => [
                'manual' => 'Manual Entry',
                'csv' => 'CSV Import',
                'excel' => 'Excel Import',
                'api' => 'API Import',
            ],
        ]);
    }

    /**
     * Store a manually created bank statement.
     */
    public function store(Request $request)
    {
        $this->authorize('create finance');

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'statement_number' => 'required|string|max:100|unique:bank_statements,statement_number',
            'statement_date' => 'required|date',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'opening_balance' => 'required|numeric',
            'closing_balance' => 'required|numeric',
        ]);

        $statement = BankStatement::create([
            ...$validated,
            'import_method' => 'manual',
            'status' => 'completed',
            'imported_by' => auth()->id(),
            'imported_at' => now(),
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('finance.bank-statements.show', $statement)
            ->with('success', 'Bank statement created successfully.');
    }

    /**
     * Import bank statement from file.
     */
    public function import(Request $request)
    {
        $this->authorize('create finance');

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240', // 10MB max
            'import_method' => 'required|in:csv,excel',
            'statement_date' => 'required|date',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'opening_balance' => 'required|numeric',
            'closing_balance' => 'required|numeric',
            'has_header' => 'boolean',
            'date_column' => 'required|integer|min:0',
            'description_column' => 'required|integer|min:0',
            'amount_column' => 'required|integer|min:0',
            'type_column' => 'nullable|integer|min:0',
            'reference_column' => 'nullable|integer|min:0',
            'balance_column' => 'nullable|integer|min:0',
        ]);

        try {
            $statement = $this->importService->importFromFile(
                $validated['file'],
                $validated
            );

            return redirect()->route('finance.bank-statements.show', $statement)
                ->with('success', 'Bank statement imported successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Import failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified bank statement.
     */
    public function show(BankStatement $bankStatement): Response
    {
        $this->authorize('view finance');

        $bankStatement->load([
            'account',
            'importedBy',
            'transactions' => function ($query) {
                $query->orderBy('transaction_date')->orderBy('id');
            },
            'reconciliations.reconciledBy',
        ]);

        return Inertia::render('Finance/BankStatement/Show', [
            'statement' => $bankStatement,
            'transactionCount' => $bankStatement->transaction_count,
            'totalDebitAmount' => $bankStatement->total_debit_amount,
            'totalCreditAmount' => $bankStatement->total_credit_amount,
            'netChange' => $bankStatement->net_change,
            'isReconciled' => $bankStatement->isReconciled(),
            'latestReconciliation' => $bankStatement->getLatestReconciliation(),
        ]);
    }

    /**
     * Show the form for editing the specified bank statement.
     */
    public function edit(BankStatement $bankStatement): Response
    {
        $this->authorize('edit finance');

        // Only allow editing of manual statements that haven't been reconciled
        if ($bankStatement->import_method !== 'manual' || $bankStatement->isReconciled()) {
            return back()->withErrors(['error' => 'Cannot edit this bank statement.']);
        }

        $accounts = Account::where('is_active', true)
            ->whereIn('type', ['checking', 'savings', 'business', 'cash'])
            ->orderBy('name')
            ->get(['id', 'name', 'account_code']);

        return Inertia::render('Finance/BankStatement/Edit', [
            'statement' => $bankStatement,
            'accounts' => $accounts,
        ]);
    }

    /**
     * Update the specified bank statement.
     */
    public function update(Request $request, BankStatement $bankStatement)
    {
        $this->authorize('edit finance');

        // Only allow editing of manual statements that haven't been reconciled
        if ($bankStatement->import_method !== 'manual' || $bankStatement->isReconciled()) {
            return back()->withErrors(['error' => 'Cannot edit this bank statement.']);
        }

        $validated = $request->validate([
            'statement_number' => 'required|string|max:100|unique:bank_statements,statement_number,' . $bankStatement->id,
            'statement_date' => 'required|date',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'opening_balance' => 'required|numeric',
            'closing_balance' => 'required|numeric',
        ]);

        $bankStatement->update($validated);

        return redirect()->route('finance.bank-statements.show', $bankStatement)
            ->with('success', 'Bank statement updated successfully.');
    }

    /**
     * Remove the specified bank statement.
     */
    public function destroy(BankStatement $bankStatement)
    {
        $this->authorize('delete finance');

        // Check if statement has been reconciled
        if ($bankStatement->isReconciled()) {
            return back()->withErrors(['error' => 'Cannot delete reconciled bank statement.']);
        }

        // Delete associated file if exists
        if ($bankStatement->file_path && file_exists(storage_path('app/' . $bankStatement->file_path))) {
            unlink(storage_path('app/' . $bankStatement->file_path));
        }

        $bankStatement->delete();

        return redirect()->route('finance.bank-statements.index')
            ->with('success', 'Bank statement deleted successfully.');
    }

    /**
     * Download the original import file.
     */
    public function downloadFile(BankStatement $bankStatement)
    {
        $this->authorize('view finance');

        if (!$bankStatement->file_path || !file_exists(storage_path('app/' . $bankStatement->file_path))) {
            return back()->withErrors(['error' => 'File not found.']);
        }

        return response()->download(
            storage_path('app/' . $bankStatement->file_path),
            $bankStatement->file_name
        );
    }

    /**
     * Preview import file before processing.
     */
    public function preview(Request $request)
    {
        $this->authorize('create finance');

        $validated = $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
            'import_method' => 'required|in:csv,excel',
            'has_header' => 'boolean',
        ]);

        try {
            $preview = $this->importService->previewFile(
                $validated['file'],
                $validated['import_method'],
                $validated['has_header'] ?? false
            );

            return response()->json($preview);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Reprocess a failed import.
     */
    public function reprocess(BankStatement $bankStatement)
    {
        $this->authorize('edit finance');

        if ($bankStatement->status !== 'failed') {
            return back()->withErrors(['error' => 'Can only reprocess failed imports.']);
        }

        try {
            $this->importService->reprocessStatement($bankStatement);
            return back()->with('success', 'Statement reprocessing started.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Reprocessing failed: ' . $e->getMessage()]);
        }
    }
}
