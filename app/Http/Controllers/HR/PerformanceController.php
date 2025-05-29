<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Performance;
use App\Models\HR\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PerformanceController extends Controller
{
    /**
     * Display a listing of performance reviews.
     */
    public function index(Request $request): Response
    {
        $query = Performance::with(['employee.user', 'reviewer'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('employee.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->employee_id, function ($query, $employeeId) {
                $query->where('employee_id', $employeeId);
            })
            ->when($request->reviewer_id, function ($query, $reviewerId) {
                $query->where('reviewer_id', $reviewerId);
            })
            ->when($request->period, function ($query, $period) {
                $query->where('review_period', 'like', "%{$period}%");
            });

        $performances = $query->latest()->paginate(15)->withQueryString();

        $employees = Employee::with('user')->active()->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->full_name,
            ];
        });

        $reviewers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->orderBy('name')->get(['id', 'name']);

        return Inertia::render('HR/Performance/Index', [
            'performances' => $performances,
            'employees' => $employees,
            'reviewers' => $reviewers,
            'filters' => $request->only(['search', 'status', 'employee_id', 'reviewer_id', 'period']),
        ]);
    }

    /**
     * Show the form for creating a new performance review.
     */
    public function create(): Response
    {
        $employees = Employee::with('user')->active()->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->full_name,
                'employee_id' => $employee->employee_id,
            ];
        });

        $reviewers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->orderBy('name')->get(['id', 'name']);

        return Inertia::render('HR/Performance/Create', [
            'employees' => $employees,
            'reviewers' => $reviewers,
        ]);
    }

    /**
     * Store a newly created performance review.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:hr_employees,id',
            'reviewer_id' => 'required|exists:users,id',
            'review_period' => 'required|string|max:255',
            'review_start_date' => 'required|date',
            'review_end_date' => 'required|date|after_or_equal:review_start_date',
            'due_date' => 'required|date|after_or_equal:review_start_date',
            'goals' => 'nullable|string',
            'is_self_review' => 'boolean',
        ]);

        $performance = Performance::create($validated);

        return redirect()->route('hr.performance.show', $performance)
            ->with('success', 'Performance review created successfully.');
    }

    /**
     * Display the specified performance review.
     */
    public function show(Performance $performance): Response
    {
        $performance->load(['employee.user', 'reviewer']);

        return Inertia::render('HR/Performance/Show', [
            'performance' => $performance,
        ]);
    }

    /**
     * Show the form for editing the performance review.
     */
    public function edit(Performance $performance): Response
    {
        if (!$performance->canBeEdited()) {
            return back()->withErrors(['performance' => 'This performance review cannot be edited.']);
        }

        $performance->load(['employee.user', 'reviewer']);

        $reviewers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->orderBy('name')->get(['id', 'name']);

        return Inertia::render('HR/Performance/Edit', [
            'performance' => $performance,
            'reviewers' => $reviewers,
        ]);
    }

    /**
     * Update the specified performance review.
     */
    public function update(Request $request, Performance $performance): RedirectResponse
    {
        if (!$performance->canBeEdited()) {
            return back()->withErrors(['performance' => 'This performance review cannot be edited.']);
        }

        $validated = $request->validate([
            'reviewer_id' => 'required|exists:users,id',
            'review_period' => 'required|string|max:255',
            'review_start_date' => 'required|date',
            'review_end_date' => 'required|date|after_or_equal:review_start_date',
            'due_date' => 'required|date|after_or_equal:review_start_date',
            'goals' => 'nullable|string',
            'achievements' => 'nullable|string',
            'areas_for_improvement' => 'nullable|string',
            'development_plan' => 'nullable|string',
            'overall_rating' => 'nullable|numeric|min:0|max:5',
            'ratings' => 'nullable|array',
            'employee_comments' => 'nullable|string',
            'reviewer_comments' => 'nullable|string',
            'manager_comments' => 'nullable|string',
        ]);

        $performance->update($validated);

        return redirect()->route('hr.performance.show', $performance)
            ->with('success', 'Performance review updated successfully.');
    }

    /**
     * Remove the specified performance review.
     */
    public function destroy(Performance $performance): RedirectResponse
    {
        if ($performance->isCompleted()) {
            return back()->withErrors(['performance' => 'Cannot delete completed performance review.']);
        }

        $performance->delete();

        return redirect()->route('hr.performance.index')
            ->with('success', 'Performance review deleted successfully.');
    }

    /**
     * Submit a performance review.
     */
    public function submit(Performance $performance): RedirectResponse
    {
        if (!$performance->submit()) {
            return back()->withErrors(['performance' => 'Unable to submit this performance review.']);
        }

        return back()->with('success', 'Performance review submitted successfully.');
    }

    /**
     * Approve a performance review.
     */
    public function approve(Performance $performance): RedirectResponse
    {
        if (!$performance->complete()) {
            return back()->withErrors(['performance' => 'Unable to approve this performance review.']);
        }

        return back()->with('success', 'Performance review approved successfully.');
    }
}
