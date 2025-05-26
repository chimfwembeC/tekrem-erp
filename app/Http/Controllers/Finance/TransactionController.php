<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\Category;
use App\Models\Finance\Transaction;
use App\Services\FinanceAIService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Transaction::where('user_id', auth()->id())
            ->with(['account', 'category', 'transferToAccount', 'invoice', 'expense']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        // Filter by account
        if ($request->filled('account')) {
            $query->where('account_id', $request->account);
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('transaction_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('transaction_date', '<=', $request->date_to);
        }

        $transactions = $query->latest('transaction_date')->paginate(15)->withQueryString();

        // Get filter options
        $accounts = Account::where('user_id', auth()->id())
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'color']);

        $transactionTypes = [
            'income' => 'Income',
            'expense' => 'Expense',
            'transfer' => 'Transfer'
        ];

        $statuses = [
            'pending' => 'Pending',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled'
        ];

        return Inertia::render('Finance/Transactions/Index', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'categories' => $categories,
            'transactionTypes' => $transactionTypes,
            'statuses' => $statuses,
            'filters' => $request->only(['search', 'account', 'type', 'status', 'category', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $accounts = Account::where('user_id', auth()->id())
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'currency']);

        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'color']);

        $transactionTypes = [
            'income' => 'Income',
            'expense' => 'Expense',
            'transfer' => 'Transfer'
        ];

        $statuses = [
            'pending' => 'Pending',
            'completed' => 'Completed'
        ];

        // Pre-fill account if provided
        $selectedAccount = null;
        if ($request->filled('account')) {
            $selectedAccount = Account::where('user_id', auth()->id())
                ->where('id', $request->account)
                ->first();
        }

        return Inertia::render('Finance/Transactions/Create', [
            'accounts' => $accounts,
            'categories' => $categories,
            'transactionTypes' => $transactionTypes,
            'statuses' => $statuses,
            'selectedAccount' => $selectedAccount,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'transfer_to_account_id' => 'nullable|exists:accounts,id|different:account_id',
            'reference_number' => 'nullable|string|max:255',
            'status' => 'required|string|in:pending,completed,cancelled',
        ]);

        // Additional validation for transfers
        if ($request->type === 'transfer') {
            $validator->after(function ($validator) use ($request) {
                if (!$request->transfer_to_account_id) {
                    $validator->errors()->add('transfer_to_account_id', 'Transfer destination account is required for transfers.');
                }
            });
        }

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Verify account ownership
        $account = Account::where('id', $request->account_id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$account) {
            return back()->with('error', 'Account not found or access denied.');
        }

        // Verify transfer account ownership if applicable
        if ($request->transfer_to_account_id) {
            $transferAccount = Account::where('id', $request->transfer_to_account_id)
                ->where('user_id', auth()->id())
                ->first();

            if (!$transferAccount) {
                return back()->with('error', 'Transfer destination account not found or access denied.');
            }
        }

        DB::transaction(function () use ($request, $account) {
            // Create the transaction
            $transaction = Transaction::create([
                'type' => $request->type,
                'amount' => $request->amount,
                'description' => $request->description,
                'transaction_date' => $request->transaction_date,
                'reference_number' => $request->reference_number,
                'status' => $request->status,
                'account_id' => $request->account_id,
                'category_id' => $request->category_id,
                'transfer_to_account_id' => $request->transfer_to_account_id,
                'user_id' => auth()->id(),
            ]);

            // Update account balances if transaction is completed
            if ($request->status === 'completed') {
                $account->updateBalance();

                if ($request->transfer_to_account_id) {
                    $transferAccount = Account::find($request->transfer_to_account_id);
                    $transferAccount->updateBalance();
                }
            }
        });

        return redirect()->route('finance.transactions.index')
            ->with('success', 'Transaction created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        // Ensure user can only view their own transactions
        if ($transaction->user_id !== auth()->id()) {
            abort(403);
        }

        $transaction->load(['account', 'category', 'transferToAccount', 'invoice', 'expense']);

        return Inertia::render('Finance/Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaction $transaction)
    {
        // Ensure user can only edit their own transactions
        if ($transaction->user_id !== auth()->id()) {
            abort(403);
        }

        $accounts = Account::where('user_id', auth()->id())
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'currency']);

        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'color']);

        $transactionTypes = [
            'income' => 'Income',
            'expense' => 'Expense',
            'transfer' => 'Transfer'
        ];

        $statuses = [
            'pending' => 'Pending',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled'
        ];

        return Inertia::render('Finance/Transactions/Edit', [
            'transaction' => $transaction,
            'accounts' => $accounts,
            'categories' => $categories,
            'transactionTypes' => $transactionTypes,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transaction $transaction)
    {
        // Ensure user can only update their own transactions
        if ($transaction->user_id !== auth()->id()) {
            abort(403);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'transfer_to_account_id' => 'nullable|exists:accounts,id|different:account_id',
            'reference_number' => 'nullable|string|max:255',
            'status' => 'required|string|in:pending,completed,cancelled',
        ]);

        // Additional validation for transfers
        if ($request->type === 'transfer') {
            $validator->after(function ($validator) use ($request) {
                if (!$request->transfer_to_account_id) {
                    $validator->errors()->add('transfer_to_account_id', 'Transfer destination account is required for transfers.');
                }
            });
        }

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Verify account ownership
        $account = Account::where('id', $request->account_id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$account) {
            return back()->with('error', 'Account not found or access denied.');
        }

        // Verify transfer account ownership if applicable
        if ($request->transfer_to_account_id) {
            $transferAccount = Account::where('id', $request->transfer_to_account_id)
                ->where('user_id', auth()->id())
                ->first();

            if (!$transferAccount) {
                return back()->with('error', 'Transfer destination account not found or access denied.');
            }
        }

        DB::transaction(function () use ($request, $transaction, $account) {
            // Store old account IDs for balance updates
            $oldAccountId = $transaction->account_id;
            $oldTransferAccountId = $transaction->transfer_to_account_id;
            $oldStatus = $transaction->status;

            // Update the transaction
            $transaction->update([
                'type' => $request->type,
                'amount' => $request->amount,
                'description' => $request->description,
                'transaction_date' => $request->transaction_date,
                'reference_number' => $request->reference_number,
                'status' => $request->status,
                'account_id' => $request->account_id,
                'category_id' => $request->category_id,
                'transfer_to_account_id' => $request->transfer_to_account_id,
            ]);

            // Update account balances
            if ($oldStatus === 'completed' || $request->status === 'completed') {
                // Update old account if it changed
                if ($oldAccountId !== $request->account_id) {
                    $oldAccount = Account::find($oldAccountId);
                    if ($oldAccount) {
                        $oldAccount->updateBalance();
                    }
                }

                // Update old transfer account if it changed
                if ($oldTransferAccountId && $oldTransferAccountId !== $request->transfer_to_account_id) {
                    $oldTransferAccount = Account::find($oldTransferAccountId);
                    if ($oldTransferAccount) {
                        $oldTransferAccount->updateBalance();
                    }
                }

                // Update current account
                $account->updateBalance();

                // Update current transfer account
                if ($request->transfer_to_account_id) {
                    $transferAccount = Account::find($request->transfer_to_account_id);
                    if ($transferAccount) {
                        $transferAccount->updateBalance();
                    }
                }
            }
        });

        return redirect()->route('finance.transactions.index')
            ->with('success', 'Transaction updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction)
    {
        // Ensure user can only delete their own transactions
        if ($transaction->user_id !== auth()->id()) {
            abort(403);
        }

        DB::transaction(function () use ($transaction) {
            $account = $transaction->account;
            $transferAccount = $transaction->transferToAccount;

            // Delete the transaction
            $transaction->delete();

            // Update account balances
            if ($account) {
                $account->updateBalance();
            }
            if ($transferAccount) {
                $transferAccount->updateBalance();
            }
        });

        return redirect()->route('finance.transactions.index')
            ->with('success', 'Transaction deleted successfully.');
    }

    /**
     * Get AI suggestions for transaction.
     */
    public function aiSuggestions(Request $request, FinanceAIService $financeAI)
    {
        $validator = Validator::make($request->all(), [
            'description' => 'required|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'vendor' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $suggestions = $financeAI->getTransactionSuggestions([
                'description' => $request->description,
                'amount' => $request->amount,
                'vendor' => $request->vendor,
                'date' => $request->date ?? now()->format('Y-m-d'),
            ]);

            return response()->json([
                'success' => true,
                'suggestions' => $suggestions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get AI suggestions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
