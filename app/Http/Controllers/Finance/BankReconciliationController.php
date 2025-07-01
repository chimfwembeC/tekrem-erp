<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\BankReconciliation;
use App\Models\Finance\BankStatement;
use App\Models\Finance\BankStatementTransaction;
use App\Models\Finance\Transaction;
use App\Services\Finance\BankReconciliationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BankReconciliationController extends Controller
{
    protected BankReconciliationService $reconciliationService;

    public function __construct(BankReconciliationService $reconciliationService)
    {
        $this->reconciliationService = $reconciliationService;
    }

    /**
     * Display a listing of bank reconciliations.
     */
    public function index(Request $request): Response
    {

        $query = BankReconciliation::with(['account', 'bankStatement', 'reconciledBy'])
            ->latest('reconciliation_date');

        // Apply filters
        if ($request->filled('account_id')) {
            $query->where('account_id', $request->account_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('reconciliation_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('reconciliation_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reconciliation_number', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('account', function ($accountQuery) use ($search) {
                      $accountQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $reconciliations = $query->paginate(20)->withQueryString();

        // Get accounts for filter dropdown
        $accounts = Account::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'account_code']);

        return Inertia::render('Finance/BankReconciliation/Index', [
            'reconciliations' => $reconciliations,
            'accounts' => $accounts,
            'filters' => $request->only(['account_id', 'status', 'date_from', 'date_to', 'search']),
            'statuses' => [
                'in_progress' => 'In Progress',
                'completed' => 'Completed',
                'reviewed' => 'Reviewed',
                'approved' => 'Approved',
            ],
        ]);
    }

    /**
     * Show the form for creating a new reconciliation.
     */
    public function create(Request $request): Response
    {

        $accounts = Account::where('is_active', true)
            ->whereIn('type', ['checking', 'savings', 'business', 'cash'])
            ->orderBy('name')
            ->get(['id', 'name', 'account_code', 'balance']);

        $selectedAccount = null;
        $bankStatements = collect();

        if ($request->filled('account_id')) {
            $selectedAccount = Account::find($request->account_id);
            $bankStatements = BankStatement::where('account_id', $request->account_id)
                ->where('status', 'completed')
                ->whereDoesntHave('reconciliations', function ($query) {
                    $query->where('status', 'completed');
                })
                ->orderBy('statement_date', 'desc')
                ->get(['id', 'statement_number', 'statement_date', 'opening_balance', 'closing_balance']);
        }

        return Inertia::render('Finance/BankReconciliation/Create', [
            'accounts' => $accounts,
            'selectedAccount' => $selectedAccount,
            'bankStatements' => $bankStatements,
        ]);
    }

    /**
     * Store a newly created reconciliation.
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'bank_statement_id' => 'required|exists:bank_statements,id',
            'reconciliation_date' => 'required|date',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'statement_opening_balance' => 'required|numeric',
            'statement_closing_balance' => 'required|numeric',
            'book_opening_balance' => 'required|numeric',
            'book_closing_balance' => 'required|numeric',
            'notes' => 'nullable|string|max:1000',
        ]);

        $reconciliation = $this->reconciliationService->createReconciliation($validated);

        return redirect()->route('finance.bank-reconciliation.index')
            ->with('success', 'Bank reconciliation created successfully.');
    }

    /**
     * Display the specified reconciliation workspace.
     */
    public function show(BankReconciliation $bankReconciliation): Response
    {

        $bankReconciliation->load([
            'account',
            'bankStatement.transactions',
            'items.bankStatementTransaction',
            'items.transaction',
            'items.matchedBy',
        ]);

        // Get unmatched bank statement transactions
        $unmatchedBankTransactions = $bankReconciliation->bankStatement->transactions()
            ->whereDoesntHave('reconciliationItems', function ($query) use ($bankReconciliation) {
                $query->where('bank_reconciliation_id', $bankReconciliation->id)
                      ->where('match_type', 'matched');
            })
            ->orderBy('transaction_date')
            ->get();

        // Get unmatched book transactions
        $unmatchedBookTransactions = Transaction::where('account_id', $bankReconciliation->account_id)
            ->where('is_reconciled', false)
            ->where('status', 'completed')
            ->whereBetween('transaction_date', [
                $bankReconciliation->period_start,
                $bankReconciliation->period_end
            ])
            ->orderBy('transaction_date')
            ->get();

        // Get matched items
        $matchedItems = $bankReconciliation->matchedItems()
            ->with(['bankStatementTransaction', 'transaction', 'matchedBy'])
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Finance/BankReconciliation/Show', [
            'reconciliation' => $bankReconciliation,
            'unmatchedBankTransactions' => $unmatchedBankTransactions,
            'unmatchedBookTransactions' => $unmatchedBookTransactions,
            'matchedItems' => $matchedItems,
            'progressPercentage' => $bankReconciliation->progress_percentage,
            'isBalanced' => $bankReconciliation->isBalanced(),
        ]);
    }

    /**
     * Auto-match transactions using the reconciliation service.
     */
    public function autoMatch(BankReconciliation $bankReconciliation)
    {

        $matches = $this->reconciliationService->autoMatchTransactions($bankReconciliation);

        return back()->with('success', "Auto-matched {$matches} transactions.");
    }

    /**
     * Manually match a bank transaction with a book transaction.
     */
    public function manualMatch(Request $request, BankReconciliation $bankReconciliation)
    {

        $validated = $request->validate([
            'bank_statement_transaction_id' => 'required|exists:bank_statement_transactions,id',
            'transaction_id' => 'required|exists:transactions,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $this->reconciliationService->createManualMatch(
            $bankReconciliation,
            $validated['bank_statement_transaction_id'],
            $validated['transaction_id'],
            $validated['notes'] ?? null
        );

        return back()->with('success', 'Transactions matched successfully.');
    }

    /**
     * Unmatch a previously matched transaction pair.
     */
    public function unmatch(Request $request, BankReconciliation $bankReconciliation)
    {

        $validated = $request->validate([
            'reconciliation_item_id' => 'required|exists:bank_reconciliation_items,id',
        ]);

        $this->reconciliationService->unmatchTransactions(
            $bankReconciliation,
            $validated['reconciliation_item_id']
        );

        return back()->with('success', 'Transactions unmatched successfully.');
    }

    /**
     * Mark reconciliation as completed.
     */
    public function complete(BankReconciliation $bankReconciliation)
    {

        if (!$bankReconciliation->isBalanced()) {
            return back()->withErrors(['error' => 'Cannot complete reconciliation. The reconciliation is not balanced.']);
        }

        $this->reconciliationService->completeReconciliation($bankReconciliation);

        return back()->with('success', 'Reconciliation completed successfully.');
    }

    /**
     * Mark reconciliation as reviewed.
     */
    public function review(BankReconciliation $bankReconciliation)
    {

        if ($bankReconciliation->status !== 'completed') {
            return back()->withErrors(['error' => 'Can only review completed reconciliations.']);
        }

        $bankReconciliation->markAsReviewed(auth()->id());

        return back()->with('success', 'Reconciliation reviewed successfully.');
    }

    /**
     * Mark reconciliation as approved.
     */
    public function approve(BankReconciliation $bankReconciliation)
    {

        if ($bankReconciliation->status !== 'reviewed') {
            return back()->withErrors(['error' => 'Can only approve reviewed reconciliations.']);
        }

        $bankReconciliation->markAsApproved(auth()->id());

        return back()->with('success', 'Reconciliation approved successfully.');
    }

    /**
     * Delete the specified reconciliation.
     */
    public function destroy(BankReconciliation $bankReconciliation)
    {

        if ($bankReconciliation->status === 'approved') {
            return back()->withErrors(['error' => 'Cannot delete approved reconciliations.']);
        }

        // Unreconcile all matched transactions
        $this->reconciliationService->deleteReconciliation($bankReconciliation);

        return redirect()->route('finance.bank-reconciliation.index')
            ->with('success', 'Reconciliation deleted successfully.');
    }

    /**
     * Get suggested matches for a bank statement transaction.
     */
    public function getSuggestedMatches(Request $request, BankReconciliation $bankReconciliation)
    {

        $validated = $request->validate([
            'bank_statement_transaction_id' => 'required|exists:bank_statement_transactions,id',
        ]);

        $bankTransaction = BankStatementTransaction::find($validated['bank_statement_transaction_id']);
        $suggestions = $this->reconciliationService->getSuggestedMatches($bankReconciliation, $bankTransaction);

        return response()->json($suggestions);
    }

    /**
     * Export reconciliation report.
     */
    public function export(BankReconciliation $bankReconciliation)
    {

        // This would typically generate a PDF or Excel export
        // For now, return the data that would be exported
        return response()->json([
            'reconciliation' => $bankReconciliation->load([
                'account',
                'bankStatement',
                'items.bankStatementTransaction',
                'items.transaction',
            ]),
        ]);
    }
}
