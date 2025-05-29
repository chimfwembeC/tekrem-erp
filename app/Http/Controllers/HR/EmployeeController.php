<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Employee;
use App\Models\HR\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees.
     */
    public function index(Request $request): Response
    {
        $query = Employee::with(['user', 'department', 'manager.user'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('job_title', 'like', "%{$search}%");
            })
            ->when($request->department_id, function ($query, $departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($request->employment_status, function ($query, $status) {
                $query->where('employment_status', $status);
            })
            ->when($request->employment_type, function ($query, $type) {
                $query->where('employment_type', $type);
            });

        $employees = $query->latest()->paginate(15)->withQueryString();

        $departments = Department::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('HR/Employees/Index', [
            'employees' => $employees,
            'departments' => $departments,
            'filters' => $request->only(['search', 'department_id', 'employment_status', 'employment_type']),
        ]);
    }

    /**
     * Show the form for creating a new employee.
     */
    public function create(): Response
    {
        $departments = Department::active()->orderBy('name')->get(['id', 'name']);
        $managers = Employee::with('user')
            ->whereHas('user')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->full_name,
                    'job_title' => $employee->job_title,
                ];
            });

        $users = User::whereDoesntHave('employee')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('HR/Employees/Create', [
            'departments' => $departments,
            'managers' => $managers,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created employee.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:hr_employees,user_id',
            'department_id' => 'nullable|exists:hr_departments,id',
            'job_title' => 'required|string|max:255',
            'employment_type' => 'required|in:full_time,part_time,contract,intern',
            'employment_status' => 'required|in:active,inactive,terminated,on_leave',
            'hire_date' => 'required|date',
            'probation_end_date' => 'nullable|date|after:hire_date',
            'salary' => 'nullable|numeric|min:0',
            'salary_currency' => 'nullable|string|size:3',
            'pay_frequency' => 'required|in:weekly,bi_weekly,monthly,annually',
            'manager_id' => 'nullable|exists:hr_employees,id',
            'work_location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
            'marital_status' => 'nullable|in:single,married,divorced,widowed,separated',
            'address' => 'nullable|string',
            'national_id' => 'nullable|string|max:50',
            'passport_number' => 'nullable|string|max:50',
            'tax_id' => 'nullable|string|max:50',
        ]);

        $employee = Employee::create($validated);

        return redirect()->route('hr.employees.show', $employee)
            ->with('success', 'Employee created successfully.');
    }

    /**
     * Display the specified employee.
     */
    public function show(Employee $employee): Response
    {
        $employee->load([
            'user',
            'department',
            'manager.user',
            'subordinates.user',
            'leaves.leaveType',
            'performances',
            'attendances' => function ($query) {
                $query->latest()->limit(10);
            },
            'trainingEnrollments.training',
            'employeeSkills.skill'
        ]);

        // Calculate some statistics
        $stats = [
            'total_leaves' => $employee->leaves()->count(),
            'pending_leaves' => $employee->leaves()->pending()->count(),
            'approved_leaves_this_year' => $employee->leaves()
                ->approved()
                ->whereYear('start_date', now()->year)
                ->sum('days_requested'),
            'average_performance_rating' => $employee->performances()
                ->completed()
                ->avg('overall_rating'),
            'attendance_rate_this_month' => $this->calculateAttendanceRate($employee),
            'completed_trainings' => $employee->trainingEnrollments()
                ->completed()
                ->count(),
        ];

        return Inertia::render('HR/Employees/Show', [
            'employee' => $employee,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the employee.
     */
    public function edit(Employee $employee): Response
    {
        $employee->load(['user', 'department', 'manager']);

        $departments = Department::active()->orderBy('name')->get(['id', 'name']);
        $managers = Employee::with('user')
            ->where('id', '!=', $employee->id)
            ->whereHas('user')
            ->get()
            ->map(function ($emp) {
                return [
                    'id' => $emp->id,
                    'name' => $emp->full_name,
                    'job_title' => $emp->job_title,
                ];
            });

        return Inertia::render('HR/Employees/Edit', [
            'employee' => $employee,
            'departments' => $departments,
            'managers' => $managers,
        ]);
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validate([
            'department_id' => 'nullable|exists:hr_departments,id',
            'job_title' => 'required|string|max:255',
            'employment_type' => 'required|in:full_time,part_time,contract,intern',
            'employment_status' => 'required|in:active,inactive,terminated,on_leave',
            'hire_date' => 'required|date',
            'probation_end_date' => 'nullable|date|after:hire_date',
            'termination_date' => 'nullable|date|after:hire_date',
            'termination_reason' => 'nullable|string',
            'salary' => 'nullable|numeric|min:0',
            'salary_currency' => 'nullable|string|size:3',
            'pay_frequency' => 'required|in:weekly,bi_weekly,monthly,annually',
            'manager_id' => [
                'nullable',
                'exists:hr_employees,id',
                Rule::notIn([$employee->id]), // Prevent self-management
            ],
            'work_location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
            'marital_status' => 'nullable|in:single,married,divorced,widowed,separated',
            'address' => 'nullable|string',
            'national_id' => 'nullable|string|max:50',
            'passport_number' => 'nullable|string|max:50',
            'tax_id' => 'nullable|string|max:50',
        ]);

        $employee->update($validated);

        return redirect()->route('hr.employees.show', $employee)
            ->with('success', 'Employee updated successfully.');
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(Employee $employee): RedirectResponse
    {
        // Soft delete by setting employment status to terminated
        $employee->update([
            'employment_status' => 'terminated',
            'termination_date' => now(),
        ]);

        return redirect()->route('hr.employees.index')
            ->with('success', 'Employee terminated successfully.');
    }

    /**
     * Activate an employee.
     */
    public function activate(Employee $employee): RedirectResponse
    {
        $employee->update([
            'employment_status' => 'active',
            'termination_date' => null,
            'termination_reason' => null,
        ]);

        return back()->with('success', 'Employee activated successfully.');
    }

    /**
     * Deactivate an employee.
     */
    public function deactivate(Employee $employee): RedirectResponse
    {
        $employee->update(['employment_status' => 'inactive']);

        return back()->with('success', 'Employee deactivated successfully.');
    }

    /**
     * Calculate attendance rate for current month.
     */
    private function calculateAttendanceRate(Employee $employee): float
    {
        $workingDaysThisMonth = now()->startOfMonth()->diffInWeekdays(now());
        
        if ($workingDaysThisMonth === 0) {
            return 0;
        }

        $presentDays = $employee->attendances()
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->whereIn('status', ['present', 'late'])
            ->count();

        return round(($presentDays / $workingDaysThisMonth) * 100, 1);
    }
}
