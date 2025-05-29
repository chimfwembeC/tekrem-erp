<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Leave;
use App\Models\HR\LeaveType;
use App\Models\HR\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    /**
     * Display a listing of leaves.
     */
    public function index(Request $request): Response
    {
        $query = Leave::with(['employee.user', 'leaveType', 'approver'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('employee.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('leaveType', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->leave_type_id, function ($query, $leaveTypeId) {
                $query->where('leave_type_id', $leaveTypeId);
            })
            ->when($request->employee_id, function ($query, $employeeId) {
                $query->where('employee_id', $employeeId);
            })
            ->when($request->date_from, function ($query, $dateFrom) {
                $query->where('start_date', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($query, $dateTo) {
                $query->where('end_date', '<=', $dateTo);
            });

        $leaves = $query->latest()->paginate(15)->withQueryString();

        $leaveTypes = LeaveType::active()->orderBy('name')->get(['id', 'name']);
        $employees = Employee::with('user')->active()->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->full_name,
            ];
        });

        return Inertia::render('HR/Leave/Index', [
            'leaves' => $leaves,
            'leaveTypes' => $leaveTypes,
            'employees' => $employees,
            'filters' => $request->only(['search', 'status', 'leave_type_id', 'employee_id', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the form for creating a new leave.
     */
    public function create(): Response
    {
        $leaveTypes = LeaveType::active()->orderBy('name')->get();
        $employees = Employee::with('user')->active()->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->full_name,
                'employee_id' => $employee->employee_id,
            ];
        });

        return Inertia::render('HR/Leave/Create', [
            'leaveTypes' => $leaveTypes,
            'employees' => $employees,
        ]);
    }

    /**
     * Store a newly created leave.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:hr_employees,id',
            'leave_type_id' => 'required|exists:hr_leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:1000',
            'is_half_day' => 'boolean',
            'half_day_period' => 'nullable|in:morning,afternoon',
            'attachments' => 'nullable|array',
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);
        $leaveType = LeaveType::findOrFail($validated['leave_type_id']);

        // Calculate working days
        $workingDays = $this->calculateWorkingDays(
            $validated['start_date'],
            $validated['end_date'],
            $validated['is_half_day'] ?? false
        );

        // Validate leave request
        $validationErrors = $leaveType->validateLeaveRequest(
            $workingDays,
            new \DateTime($validated['start_date'])
        );

        if (!empty($validationErrors)) {
            return back()->withErrors(['validation' => $validationErrors]);
        }

        // Check leave balance
        $balance = $leaveType->getLeaveBalance($employee);
        if ($workingDays > $balance['remaining']) {
            return back()->withErrors([
                'days' => "Insufficient leave balance. Available: {$balance['remaining']} days"
            ]);
        }

        $validated['days_requested'] = $workingDays;
        $validated['submitted_at'] = now();

        $leave = Leave::create($validated);

        return redirect()->route('hr.leave.show', $leave)
            ->with('success', 'Leave request submitted successfully.');
    }

    /**
     * Display the specified leave.
     */
    public function show(Leave $leave): Response
    {
        $leave->load(['employee.user', 'leaveType', 'approver']);

        // Get leave balance for the employee
        $balance = $leave->leaveType->getLeaveBalance($leave->employee);

        return Inertia::render('HR/Leave/Show', [
            'leave' => $leave,
            'balance' => $balance,
        ]);
    }

    /**
     * Show the form for editing the leave.
     */
    public function edit(Leave $leave): Response
    {
        if (!$leave->canBeEdited()) {
            return back()->withErrors(['leave' => 'This leave request cannot be edited.']);
        }

        $leave->load(['employee.user', 'leaveType']);

        $leaveTypes = LeaveType::active()->orderBy('name')->get();

        return Inertia::render('HR/Leave/Edit', [
            'leave' => $leave,
            'leaveTypes' => $leaveTypes,
        ]);
    }

    /**
     * Update the specified leave.
     */
    public function update(Request $request, Leave $leave): RedirectResponse
    {
        if (!$leave->canBeEdited()) {
            return back()->withErrors(['leave' => 'This leave request cannot be edited.']);
        }

        $validated = $request->validate([
            'leave_type_id' => 'required|exists:hr_leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:1000',
            'is_half_day' => 'boolean',
            'half_day_period' => 'nullable|in:morning,afternoon',
            'attachments' => 'nullable|array',
        ]);

        $leaveType = LeaveType::findOrFail($validated['leave_type_id']);

        // Calculate working days
        $workingDays = $this->calculateWorkingDays(
            $validated['start_date'],
            $validated['end_date'],
            $validated['is_half_day'] ?? false
        );

        $validated['days_requested'] = $workingDays;

        $leave->update($validated);

        return redirect()->route('hr.leave.show', $leave)
            ->with('success', 'Leave request updated successfully.');
    }

    /**
     * Remove the specified leave.
     */
    public function destroy(Leave $leave): RedirectResponse
    {
        if (!$leave->canBeCancelled()) {
            return back()->withErrors(['leave' => 'This leave request cannot be cancelled.']);
        }

        $leave->cancel();

        return redirect()->route('hr.leave.index')
            ->with('success', 'Leave request cancelled successfully.');
    }

    /**
     * Approve a leave request.
     */
    public function approve(Request $request, Leave $leave): RedirectResponse
    {
        $request->validate([
            'approval_notes' => 'nullable|string|max:1000',
        ]);

        if (!$leave->approve(Auth::user(), $request->approval_notes)) {
            return back()->withErrors(['leave' => 'Unable to approve this leave request.']);
        }

        return back()->with('success', 'Leave request approved successfully.');
    }

    /**
     * Reject a leave request.
     */
    public function reject(Request $request, Leave $leave): RedirectResponse
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        if (!$leave->reject(Auth::user(), $request->rejection_reason)) {
            return back()->withErrors(['leave' => 'Unable to reject this leave request.']);
        }

        return back()->with('success', 'Leave request rejected.');
    }

    /**
     * Display leave types.
     */
    public function leaveTypes(): Response
    {
        $leaveTypes = LeaveType::orderBy('name')->paginate(15);

        return Inertia::render('HR/Leave/Types', [
            'leaveTypes' => $leaveTypes,
        ]);
    }

    /**
     * Store a new leave type.
     */
    public function storeLeaveType(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:hr_leave_types,code',
            'description' => 'nullable|string',
            'days_per_year' => 'required|integer|min:0',
            'is_paid' => 'boolean',
            'requires_approval' => 'boolean',
            'max_consecutive_days' => 'nullable|integer|min:1',
            'min_notice_days' => 'required|integer|min:0',
            'carry_forward' => 'boolean',
            'max_carry_forward_days' => 'nullable|integer|min:0',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'is_active' => 'boolean',
        ]);

        LeaveType::create($validated);

        return back()->with('success', 'Leave type created successfully.');
    }

    /**
     * Calculate working days between two dates.
     */
    private function calculateWorkingDays(string $startDate, string $endDate, bool $isHalfDay = false): float
    {
        if ($isHalfDay) {
            return 0.5;
        }

        $start = new \DateTime($startDate);
        $end = new \DateTime($endDate);
        $workingDays = 0;

        while ($start <= $end) {
            // Skip weekends (Saturday = 6, Sunday = 0)
            if (!in_array($start->format('w'), [0, 6])) {
                $workingDays++;
            }
            $start->add(new \DateInterval('P1D'));
        }

        return $workingDays;
    }
}
