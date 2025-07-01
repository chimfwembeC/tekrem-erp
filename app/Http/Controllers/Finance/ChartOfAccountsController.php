<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChartOfAccountsController extends Controller
{
    /**
     * Display a listing of the chart of accounts.
     */
    public function index(Request $request): Response
    {

        $query = Account::with(['parentAccount', 'childAccounts'])
            ->orderBy('account_code')
            ->orderBy('level')
            ->orderBy('name');

        // Apply filters
        if ($request->filled('category')) {
            $query->where('account_category', $request->category);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('account_code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }

        if ($request->boolean('system_accounts_only')) {
            $query->where('is_system_account', true);
        }

        if ($request->boolean('manual_entries_only')) {
            $query->where('allow_manual_entries', true);
        }

        $accounts = $query->paginate(50)->withQueryString();

        // Get account categories for filter dropdown
        $categories = Account::select('account_category')
            ->distinct()
            ->whereNotNull('account_category')
            ->pluck('account_category')
            ->sort()
            ->values();

        // Get account types for filter dropdown
        $types = Account::select('type')
            ->distinct()
            ->whereNotNull('type')
            ->pluck('type')
            ->sort()
            ->values();

        return Inertia::render('Finance/ChartOfAccounts/Index', [
            'accounts' => $accounts,
            'categories' => $categories,
            'types' => $types,
            'filters' => $request->only(['category', 'type', 'search', 'level', 'system_accounts_only', 'manual_entries_only']),
        ]);
    }

    /**
     * Show the form for creating a new account.
     */
    public function create(Request $request): Response
    {

        $parentAccount = null;
        if ($request->filled('parent_id')) {
            $parentAccount = Account::find($request->parent_id);
        }

        // Get potential parent accounts (only those that allow child accounts)
        $parentAccounts = Account::where('allow_manual_entries', false)
            ->orWhereNull('allow_manual_entries')
            ->orderBy('account_code')
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'name' => $account->getFullAccountPath(),
                    'account_code' => $account->account_code,
                    'level' => $account->level,
                ];
            });

        return Inertia::render('Finance/ChartOfAccounts/Create', [
            'parentAccount' => $parentAccount,
            'parentAccounts' => $parentAccounts,
            'accountCategories' => [
                'assets' => 'Assets',
                'liabilities' => 'Liabilities',
                'equity' => 'Equity',
                'income' => 'Income',
                'expenses' => 'Expenses',
            ],
            'accountTypes' => [
                'asset' => 'Asset',
                'liability' => 'Liability',
                'equity' => 'Equity',
                'income' => 'Income',
                'expense' => 'Expense',
                'cash' => 'Cash',
                'checking' => 'Checking',
                'savings' => 'Savings',
                'business' => 'Business',
                'credit_card' => 'Credit Card',
            ],
            'normalBalances' => [
                'debit' => 'Debit',
                'credit' => 'Credit',
            ],
        ]);
    }

    /**
     * Store a newly created account in storage.
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_code' => 'nullable|string|max:50|unique:accounts,account_code',
            'type' => 'required|string|in:asset,liability,equity,income,expense,cash,checking,savings,business,credit_card',
            'account_category' => 'required|string|in:assets,liabilities,equity,income,expenses',
            'account_subcategory' => 'nullable|string|max:100',
            'parent_account_id' => 'nullable|exists:accounts,id',
            'normal_balance' => 'required|string|in:debit,credit',
            'description' => 'nullable|string|max:1000',
            'is_system_account' => 'boolean',
            'allow_manual_entries' => 'boolean',
            'account_settings' => 'nullable|array',
            'currency' => 'required|string|max:3',
            'initial_balance' => 'nullable|numeric|min:0',
        ]);

        // Generate account code if not provided
        if (empty($validated['account_code'])) {
            $validated['account_code'] = Account::generateAccountCode(
                $validated['parent_account_id'] ?? null,
                $validated['account_category']
            );
        }

        // Determine level based on parent
        $level = 0;
        if ($validated['parent_account_id']) {
            $parent = Account::find($validated['parent_account_id']);
            $level = $parent ? $parent->level + 1 : 0;
        }

        $account = Account::create([
            ...$validated,
            'level' => $level,
            'balance' => $validated['initial_balance'] ?? 0,
            'is_active' => true,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('finance.chart-of-accounts.index')
            ->with('success', 'Account created successfully.');
    }

    /**
     * Display the specified account.
     */
    public function show(Account $account): Response
    {

        $account->load([
            'parentAccount',
            'childAccounts' => function ($query) {
                $query->orderBy('account_code');
            },
            'transactions' => function ($query) {
                $query->latest()->limit(10);
            },
        ]);

        // Get account hierarchy path
        $hierarchyPath = [];
        $current = $account;
        while ($current) {
            array_unshift($hierarchyPath, [
                'id' => $current->id,
                'name' => $current->name,
                'account_code' => $current->account_code,
            ]);
            $current = $current->parentAccount;
        }

        return Inertia::render('Finance/ChartOfAccounts/Show', [
            'account' => $account,
            'hierarchyPath' => $hierarchyPath,
        ]);
    }

    /**
     * Show the form for editing the specified account.
     */
    public function edit(Account $account): Response
    {

        // Get potential parent accounts (excluding self and descendants)
        $parentAccounts = Account::where('id', '!=', $account->id)
            ->where(function ($query) use ($account) {
                // Exclude descendants to prevent circular references
                $query->where('parent_account_id', '!=', $account->id);
                if ($account->childAccounts->isNotEmpty()) {
                    $descendantIds = $this->getDescendantIds($account);
                    $query->whereNotIn('id', $descendantIds);
                }
            })
            ->where(function ($query) {
                $query->where('allow_manual_entries', false)
                      ->orWhereNull('allow_manual_entries');
            })
            ->orderBy('account_code')
            ->get()
            ->map(function ($acc) {
                return [
                    'id' => $acc->id,
                    'name' => $acc->getFullAccountPath(),
                    'account_code' => $acc->account_code,
                    'level' => $acc->level,
                ];
            });

        return Inertia::render('Finance/ChartOfAccounts/Edit', [
            'account' => $account,
            'parentAccounts' => $parentAccounts,
            'accountCategories' => [
                'assets' => 'Assets',
                'liabilities' => 'Liabilities',
                'equity' => 'Equity',
                'income' => 'Income',
                'expenses' => 'Expenses',
            ],
            'accountTypes' => [
                'asset' => 'Asset',
                'liability' => 'Liability',
                'equity' => 'Equity',
                'income' => 'Income',
                'expense' => 'Expense',
                'cash' => 'Cash',
                'checking' => 'Checking',
                'savings' => 'Savings',
                'business' => 'Business',
                'credit_card' => 'Credit Card',
            ],
            'normalBalances' => [
                'debit' => 'Debit',
                'credit' => 'Credit',
            ],
        ]);
    }

    /**
     * Update the specified account in storage.
     */
    public function update(Request $request, Account $account)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_code' => 'nullable|string|max:50|unique:accounts,account_code,' . $account->id,
            'type' => 'required|string|in:asset,liability,equity,income,expense,cash,checking,savings,business,credit_card',
            'account_category' => 'required|string|in:assets,liabilities,equity,income,expenses',
            'account_subcategory' => 'nullable|string|max:100',
            'parent_account_id' => 'nullable|exists:accounts,id',
            'normal_balance' => 'required|string|in:debit,credit',
            'description' => 'nullable|string|max:1000',
            'is_system_account' => 'boolean',
            'allow_manual_entries' => 'boolean',
            'account_settings' => 'nullable|array',
            'currency' => 'required|string|max:3',
            'is_active' => 'boolean',
        ]);

        // Prevent circular references
        if ($validated['parent_account_id'] && $this->wouldCreateCircularReference($account, $validated['parent_account_id'])) {
            return back()->withErrors(['parent_account_id' => 'Cannot set parent account as it would create a circular reference.']);
        }

        // Update level if parent changed
        if ($account->parent_account_id !== $validated['parent_account_id']) {
            $level = 0;
            if ($validated['parent_account_id']) {
                $parent = Account::find($validated['parent_account_id']);
                $level = $parent ? $parent->level + 1 : 0;
            }
            $validated['level'] = $level;
        }

        $account->update($validated);

        return redirect()->route('finance.chart-of-accounts.index')
            ->with('success', 'Account updated successfully.');
    }

    /**
     * Remove the specified account from storage.
     */
    public function destroy(Account $account)
    {

        // Check if account has child accounts
        if ($account->childAccounts()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete account with child accounts.']);
        }

        // Check if account has transactions
        if ($account->transactions()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete account with existing transactions.']);
        }

        $account->delete();

        return redirect()->route('finance.chart-of-accounts.index')
            ->with('success', 'Account deleted successfully.');
    }

    /**
     * Get tree view of chart of accounts.
     */
    public function tree(): Response
    {

        $accounts = Account::with(['childAccounts' => function ($query) {
            $query->orderBy('account_code');
        }])
        ->whereNull('parent_account_id')
        ->orderBy('account_code')
        ->get();

        return Inertia::render('Finance/ChartOfAccounts/Tree', [
            'accounts' => $this->buildAccountTree($accounts),
        ]);
    }

    /**
     * Build hierarchical account tree.
     */
    private function buildAccountTree($accounts): array
    {
        return $accounts->map(function ($account) {
            return [
                'id' => $account->id,
                'name' => $account->name,
                'account_code' => $account->account_code,
                'type' => $account->type,
                'account_category' => $account->account_category,
                'balance' => $account->balance,
                'level' => $account->level,
                'is_system_account' => $account->is_system_account,
                'allow_manual_entries' => $account->allow_manual_entries,
                'children' => $account->childAccounts->isNotEmpty() 
                    ? $this->buildAccountTree($account->childAccounts) 
                    : [],
            ];
        })->toArray();
    }

    /**
     * Get all descendant IDs for an account.
     */
    private function getDescendantIds(Account $account): array
    {
        $ids = [];
        foreach ($account->childAccounts as $child) {
            $ids[] = $child->id;
            $ids = array_merge($ids, $this->getDescendantIds($child));
        }
        return $ids;
    }

    /**
     * Check if setting a parent would create a circular reference.
     */
    private function wouldCreateCircularReference(Account $account, int $parentId): bool
    {
        $descendantIds = $this->getDescendantIds($account);
        return in_array($parentId, $descendantIds) || $parentId === $account->id;
    }
}
