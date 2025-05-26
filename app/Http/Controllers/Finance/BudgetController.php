<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\Budget;
use App\Models\Finance\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class BudgetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Budget::where('user_id', auth()->id())
            ->with(['category', 'account']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('category', function($categoryQuery) use ($search) {
                      $categoryQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by period
        if ($request->filled('period')) {
            $query->where('period_type', $request->period);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        $budgets = $query->latest()->paginate(15)->withQueryString();

        // Calculate spending for each budget
        $budgets->getCollection()->transform(function ($budget) {
            $budget->spent_amount = $budget->getSpentAmount();
            $budget->remaining_amount = $budget->amount - $budget->spent_amount;
            $budget->percentage_used = $budget->amount > 0 ? ($budget->spent_amount / $budget->amount) * 100 : 0;
            return $budget;
        });

        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        $periods = [
            'weekly' => 'Weekly',
            'monthly' => 'Monthly',
            'quarterly' => 'Quarterly',
            'yearly' => 'Yearly'
        ];

        return Inertia::render('Finance/Budgets/Index', [
            'budgets' => $budgets,
            'categories' => $categories,
            'periods' => $periods,
            'filters' => $request->only(['search', 'period', 'status', 'category']),
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
            ->get(['id', 'name', 'type', 'currency']);

        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        $periodTypes = [
            'weekly' => 'Weekly',
            'monthly' => 'Monthly',
            'quarterly' => 'Quarterly',
            'yearly' => 'Yearly'
        ];

        $statuses = [
            'active' => 'Active',
            'inactive' => 'Inactive',
            'completed' => 'Completed'
        ];

        return Inertia::render('Finance/Budgets/Create', [
            'accounts' => $accounts,
            'categories' => $categories,
            'periodTypes' => $periodTypes,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'account_id' => 'required|exists:accounts,id',
            'period_type' => 'required|string|in:weekly,monthly,quarterly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|string|in:active,inactive,completed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        Budget::create([
            'name' => $request->name,
            'amount' => $request->amount,
            'account_id' => $request->account_id,
            'period_type' => $request->period_type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'category_id' => $request->category_id === 'none' ? null : $request->category_id,
            'description' => $request->description,
            'status' => $request->status,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('finance.budgets.index')
            ->with('success', 'Budget created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Budget $budget)
    {
        // Ensure user can only view their own budgets
        if ($budget->user_id !== auth()->id()) {
            abort(403);
        }

        $budget->load(['category', 'account']);

        // Get budget statistics
        $spentAmount = $budget->getSpentAmount();
        $remainingAmount = $budget->amount - $spentAmount;
        $percentageUsed = $budget->amount > 0 ? ($spentAmount / $budget->amount) * 100 : 0;

        // Get recent transactions for this budget
        $transactions = $budget->getTransactions()
            ->with(['account', 'category'])
            ->latest()
            ->limit(10)
            ->get();

        $stats = [
            'spent_amount' => $spentAmount,
            'remaining_amount' => $remainingAmount,
            'percentage_used' => $percentageUsed,
            'days_remaining' => now()->diffInDays($budget->end_date, false),
            'is_over_budget' => $spentAmount > $budget->amount,
            'is_near_threshold' => $percentageUsed >= $budget->alert_threshold,
        ];

        return Inertia::render('Finance/Budgets/Show', [
            'budget' => $budget,
            'stats' => $stats,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Budget $budget)
    {
        // Ensure user can only edit their own budgets
        if ($budget->user_id !== auth()->id()) {
            abort(403);
        }

        $accounts = Account::where('user_id', auth()->id())
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'currency']);

        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        $periodTypes = [
            'weekly' => 'Weekly',
            'monthly' => 'Monthly',
            'quarterly' => 'Quarterly',
            'yearly' => 'Yearly'
        ];

        $statuses = [
            'active' => 'Active',
            'inactive' => 'Inactive',
            'completed' => 'Completed'
        ];

        return Inertia::render('Finance/Budgets/Edit', [
            'budget' => $budget,
            'accounts' => $accounts,
            'categories' => $categories,
            'periodTypes' => $periodTypes,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Budget $budget)
    {
        // Ensure user can only update their own budgets
        if ($budget->user_id !== auth()->id()) {
            abort(403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'account_id' => 'required|exists:accounts,id',
            'period_type' => 'required|string|in:weekly,monthly,quarterly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|string|in:active,inactive,completed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $budget->update([
            'name' => $request->name,
            'amount' => $request->amount,
            'account_id' => $request->account_id,
            'period_type' => $request->period_type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'category_id' => $request->category_id === 'none' ? null : $request->category_id,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        return redirect()->route('finance.budgets.index')
            ->with('success', 'Budget updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Budget $budget)
    {
        // Ensure user can only delete their own budgets
        if ($budget->user_id !== auth()->id()) {
            abort(403);
        }

        $budget->delete();

        return redirect()->route('finance.budgets.index')
            ->with('success', 'Budget deleted successfully.');
    }
}
