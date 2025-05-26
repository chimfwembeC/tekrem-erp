<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
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

        $categories = $query->with('parent')->latest()->paginate(15)->withQueryString();

        $categoryTypes = [
            'income' => 'Income',
            'expense' => 'Expense',
            'both' => 'Both'
        ];

        return Inertia::render('Finance/Categories/Index', [
            'categories' => $categories,
            'categoryTypes' => $categoryTypes,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $parentCategories = Category::where('is_active', true)
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name']);

        $categoryTypes = [
            'income' => 'Income',
            'expense' => 'Expense',
            'both' => 'Both'
        ];

        $colors = [
            '#EF4444' => 'Red',
            '#F97316' => 'Orange',
            '#EAB308' => 'Yellow',
            '#22C55E' => 'Green',
            '#06B6D4' => 'Cyan',
            '#3B82F6' => 'Blue',
            '#8B5CF6' => 'Purple',
            '#EC4899' => 'Pink',
            '#6B7280' => 'Gray',
        ];

        return Inertia::render('Finance/Categories/Create', [
            'parentCategories' => $parentCategories,
            'categoryTypes' => $categoryTypes,
            'colors' => $colors,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name',
            'type' => 'required|string|in:income,expense,both',
            'description' => 'nullable|string|max:1000',
            'color' => 'required|string|max:7',
            'parent_id' => 'nullable|exists:categories,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        Category::create([
            'name' => $request->name,
            'type' => $request->type,
            'description' => $request->description,
            'color' => $request->color,
            'parent_id' => $request->parent_id,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('finance.categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load(['parent', 'children', 'transactions', 'expenses', 'budgets']);

        // Get category statistics
        $stats = [
            'transaction_count' => $category->transactions()->count(),
            'expense_count' => $category->expenses()->count(),
            'budget_count' => $category->budgets()->count(),
            'total_income' => $category->transactions()
                ->where('type', 'income')
                ->where('status', 'completed')
                ->sum('amount'),
            'total_expenses' => $category->transactions()
                ->where('type', 'expense')
                ->where('status', 'completed')
                ->sum('amount'),
        ];

        return Inertia::render('Finance/Categories/Show', [
            'category' => $category,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        $parentCategories = Category::where('is_active', true)
            ->whereNull('parent_id')
            ->where('id', '!=', $category->id) // Exclude self
            ->orderBy('name')
            ->get(['id', 'name']);

        $categoryTypes = [
            'income' => 'Income',
            'expense' => 'Expense',
            'both' => 'Both'
        ];

        $colors = [
            '#EF4444' => 'Red',
            '#F97316' => 'Orange',
            '#EAB308' => 'Yellow',
            '#22C55E' => 'Green',
            '#06B6D4' => 'Cyan',
            '#3B82F6' => 'Blue',
            '#8B5CF6' => 'Purple',
            '#EC4899' => 'Pink',
            '#6B7280' => 'Gray',
        ];

        return Inertia::render('Finance/Categories/Edit', [
            'category' => $category,
            'parentCategories' => $parentCategories,
            'categoryTypes' => $categoryTypes,
            'colors' => $colors,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'type' => 'required|string|in:income,expense,both',
            'description' => 'nullable|string|max:1000',
            'color' => 'required|string|max:7',
            'parent_id' => 'nullable|exists:categories,id',
            'is_active' => 'boolean',
        ]);

        // Prevent setting self as parent
        if ($request->parent_id == $category->id) {
            $validator->errors()->add('parent_id', 'A category cannot be its own parent.');
        }

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $category->update([
            'name' => $request->name,
            'type' => $request->type,
            'description' => $request->description,
            'color' => $request->color,
            'parent_id' => $request->parent_id,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('finance.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Check if category has transactions
        if ($category->transactions()->count() > 0) {
            return back()->with('error', 'Cannot delete category with existing transactions.');
        }

        // Check if category has expenses
        if ($category->expenses()->count() > 0) {
            return back()->with('error', 'Cannot delete category with existing expenses.');
        }

        // Check if category has budgets
        if ($category->budgets()->count() > 0) {
            return back()->with('error', 'Cannot delete category with existing budgets.');
        }

        // Check if category has children
        if ($category->children()->count() > 0) {
            return back()->with('error', 'Cannot delete category with subcategories. Delete subcategories first.');
        }

        $category->delete();

        return redirect()->route('finance.categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}
