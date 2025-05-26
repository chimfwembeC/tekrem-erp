<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class AccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Account::where('user_id', auth()->id())
            ->with(['transactions' => function($query) {
                $query->latest()->limit(5);
            }]);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('account_number', 'like', "%{$search}%")
                  ->orWhere('bank_name', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        $accounts = $query->latest()->paginate(10)->withQueryString();

        // Get account types for filter
        $accountTypes = [
            'checking' => 'Checking',
            'savings' => 'Savings',
            'business' => 'Business',
            'credit_card' => 'Credit Card',
            'investment' => 'Investment',
            'loan' => 'Loan',
            'other' => 'Other'
        ];

        return Inertia::render('Finance/Accounts/Index', [
            'accounts' => $accounts,
            'accountTypes' => $accountTypes,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $accountTypes = [
            'checking' => 'Checking',
            'savings' => 'Savings',
            'business' => 'Business',
            'credit_card' => 'Credit Card',
            'investment' => 'Investment',
            'loan' => 'Loan',
            'other' => 'Other'
        ];

        $currencies = [
            'USD' => 'US Dollar',
            'EUR' => 'Euro',
            'GBP' => 'British Pound',
            'CAD' => 'Canadian Dollar',
            'AUD' => 'Australian Dollar',
            'JPY' => 'Japanese Yen',
        ];

        return Inertia::render('Finance/Accounts/Create', [
            'accountTypes' => $accountTypes,
            'currencies' => $currencies,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:checking,savings,business,credit_card,investment,loan,other',
            'account_number' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'initial_balance' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $account = Account::create([
            'name' => $request->name,
            'type' => $request->type,
            'account_number' => $request->account_number,
            'bank_name' => $request->bank_name,
            'initial_balance' => $request->initial_balance,
            'balance' => $request->initial_balance, // Set initial balance as current balance
            'currency' => $request->currency,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active', true),
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('finance.accounts.index')
            ->with('success', 'Account created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Account $account)
    {
        // Ensure user can only view their own accounts
        if ($account->user_id !== auth()->id()) {
            abort(403);
        }

        $account->load([
            'transactions' => function($query) {
                $query->with(['category', 'transferToAccount'])
                      ->latest()
                      ->paginate(20);
            }
        ]);

        // Get account statistics
        $stats = [
            'total_income' => $account->transactions()
                ->where('type', 'income')
                ->where('status', 'completed')
                ->sum('amount'),
            'total_expenses' => $account->transactions()
                ->where('type', 'expense')
                ->where('status', 'completed')
                ->sum('amount'),
            'total_transfers_in' => $account->transfersTo()
                ->where('status', 'completed')
                ->sum('amount'),
            'total_transfers_out' => $account->transfersFrom()
                ->where('status', 'completed')
                ->sum('amount'),
            'transaction_count' => $account->transactions()->count(),
        ];

        return Inertia::render('Finance/Accounts/Show', [
            'account' => $account,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Account $account)
    {
        // Ensure user can only edit their own accounts
        if ($account->user_id !== auth()->id()) {
            abort(403);
        }

        $accountTypes = [
            'checking' => 'Checking',
            'savings' => 'Savings',
            'business' => 'Business',
            'credit_card' => 'Credit Card',
            'investment' => 'Investment',
            'loan' => 'Loan',
            'other' => 'Other'
        ];

        $currencies = [
            'USD' => 'US Dollar',
            'EUR' => 'Euro',
            'GBP' => 'British Pound',
            'CAD' => 'Canadian Dollar',
            'AUD' => 'Australian Dollar',
            'JPY' => 'Japanese Yen',
        ];

        return Inertia::render('Finance/Accounts/Edit', [
            'account' => $account,
            'accountTypes' => $accountTypes,
            'currencies' => $currencies,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Account $account)
    {
        // Ensure user can only update their own accounts
        if ($account->user_id !== auth()->id()) {
            abort(403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:checking,savings,business,credit_card,investment,loan,other',
            'account_number' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'initial_balance' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $account->update([
            'name' => $request->name,
            'type' => $request->type,
            'account_number' => $request->account_number,
            'bank_name' => $request->bank_name,
            'initial_balance' => $request->initial_balance,
            'currency' => $request->currency,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active', true),
        ]);

        // Recalculate balance if initial balance changed
        $account->updateBalance();

        return redirect()->route('finance.accounts.index')
            ->with('success', 'Account updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Account $account)
    {
        // Ensure user can only delete their own accounts
        if ($account->user_id !== auth()->id()) {
            abort(403);
        }

        // Check if account has transactions
        if ($account->transactions()->count() > 0) {
            return back()->with('error', 'Cannot delete account with existing transactions.');
        }

        $account->delete();

        return redirect()->route('finance.accounts.index')
            ->with('success', 'Account deleted successfully.');
    }
}
