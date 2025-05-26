<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\Category;
use App\Models\Finance\Expense;
use App\Services\FinanceAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Expense::where('user_id', auth()->id())
            ->with(['account', 'category']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('vendor', 'like', "%{$search}%");
            });
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
            $query->whereDate('expense_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('expense_date', '<=', $request->date_to);
        }

        $expenses = $query->orderBy('expense_date', 'desc')->paginate(15);

        $categories = Category::where('type', 'expense')
            ->orWhere('type', 'both')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        $statuses = [
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'paid' => 'Paid'
        ];

        return Inertia::render('Finance/Expenses/Index', [
            'expenses' => $expenses,
            'categories' => $categories,
            'statuses' => $statuses,
            'filters' => $request->only(['search', 'status', 'category', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $accounts = Account::where('user_id', auth()->id())
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'currency']);

        $categories = Category::where('type', 'expense')
            ->orWhere('type', 'both')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        $statuses = [
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'paid' => 'Paid'
        ];

        return Inertia::render('Finance/Expenses/Create', [
            'accounts' => $accounts,
            'categories' => $categories,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'vendor' => 'nullable|string|max:255',
            'receipt_number' => 'nullable|string|max:255',
            'status' => 'required|string|in:pending,approved,rejected,paid',
            'is_billable' => 'boolean',
            'is_reimbursable' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'account_id' => 'nullable|exists:accounts,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        Expense::create([
            'title' => $request->title,
            'description' => $request->description,
            'amount' => $request->amount,
            'expense_date' => $request->expense_date,
            'vendor' => $request->vendor,
            'receipt_number' => $request->receipt_number,
            'status' => $request->status,
            'is_billable' => $request->boolean('is_billable', false),
            'is_reimbursable' => $request->boolean('is_reimbursable', false),
            'category_id' => $request->category_id,
            'account_id' => $request->account_id,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('finance.expenses.index')
            ->with('success', 'Expense created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Expense $expense)
    {
        // Ensure user can only view their own expenses
        if ($expense->user_id !== auth()->id()) {
            abort(403);
        }

        $expense->load(['account', 'category', 'user']);

        return Inertia::render('Finance/Expenses/Show', [
            'expense' => $expense,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Expense $expense)
    {
        // Ensure user can only edit their own expenses
        if ($expense->user_id !== auth()->id()) {
            abort(403);
        }

        $accounts = Account::where('user_id', auth()->id())
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'currency']);

        $categories = Category::where('type', 'expense')
            ->orWhere('type', 'both')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        $statuses = [
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'paid' => 'Paid'
        ];

        return Inertia::render('Finance/Expenses/Edit', [
            'expense' => $expense,
            'accounts' => $accounts,
            'categories' => $categories,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Expense $expense)
    {
        // Ensure user can only update their own expenses
        if ($expense->user_id !== auth()->id()) {
            abort(403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'vendor' => 'nullable|string|max:255',
            'receipt_number' => 'nullable|string|max:255',
            'status' => 'required|string|in:pending,approved,rejected,paid',
            'is_billable' => 'boolean',
            'is_reimbursable' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'account_id' => 'nullable|exists:accounts,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $expense->update([
            'title' => $request->title,
            'description' => $request->description,
            'amount' => $request->amount,
            'expense_date' => $request->expense_date,
            'vendor' => $request->vendor,
            'receipt_number' => $request->receipt_number,
            'status' => $request->status,
            'is_billable' => $request->boolean('is_billable', false),
            'is_reimbursable' => $request->boolean('is_reimbursable', false),
            'category_id' => $request->category_id,
            'account_id' => $request->account_id,
        ]);

        return redirect()->route('finance.expenses.index')
            ->with('success', 'Expense updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expense $expense)
    {
        // Ensure user can only delete their own expenses
        if ($expense->user_id !== auth()->id()) {
            abort(403);
        }

        $expense->delete();

        return redirect()->route('finance.expenses.index')
            ->with('success', 'Expense deleted successfully.');
    }

    /**
     * Process receipt text and extract expense data.
     */
    public function processReceipt(Request $request, FinanceAIService $financeAI)
    {
        $validator = Validator::make($request->all(), [
            'receipt_text' => 'required|string|max:10000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $expenseData = $financeAI->processReceiptForExpense($request->receipt_text);

            if ($expenseData) {
                return response()->json([
                    'success' => true,
                    'expense_data' => $expenseData,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Could not extract expense data from receipt',
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process receipt',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
