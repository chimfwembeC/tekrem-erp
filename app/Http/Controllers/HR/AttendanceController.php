<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Attendance;
use App\Models\HR\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Display a listing of attendance records.
     */
    public function index(Request $request): Response
    {
        $query = Attendance::with(['employee.user'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('employee.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->when($request->employee_id, function ($query, $employeeId) {
                $query->where('employee_id', $employeeId);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->date_from, function ($query, $dateFrom) {
                $query->where('date', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($query, $dateTo) {
                $query->where('date', '<=', $dateTo);
            });

        $attendances = $query->latest('date')->paginate(15)->withQueryString();

        $employees = Employee::with('user')->active()->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->full_name,
            ];
        });

        return Inertia::render('HR/Attendance/Index', [
            'attendances' => $attendances,
            'employees' => $employees,
            'filters' => $request->only(['search', 'employee_id', 'status', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the form for creating a new attendance record.
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

        return Inertia::render('HR/Attendance/Create', [
            'employees' => $employees,
        ]);
    }

    /**
     * Store a newly created attendance record.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:hr_employees,id',
            'date' => 'required|date',
            'clock_in' => 'nullable|date_format:H:i',
            'clock_out' => 'nullable|date_format:H:i|after:clock_in',
            'break_start' => 'nullable|date_format:H:i',
            'break_end' => 'nullable|date_format:H:i|after:break_start',
            'status' => 'required|in:present,absent,late,half_day,on_leave',
            'notes' => 'nullable|string|max:1000',
            'is_manual_entry' => 'boolean',
        ]);

        $validated['is_manual_entry'] = true;

        // Calculate total hours if both clock in and out are provided
        if ($validated['clock_in'] && $validated['clock_out']) {
            $clockIn = Carbon::parse($validated['date'] . ' ' . $validated['clock_in']);
            $clockOut = Carbon::parse($validated['date'] . ' ' . $validated['clock_out']);
            $totalMinutes = $clockIn->diffInMinutes($clockOut);

            // Calculate break duration
            $breakMinutes = 0;
            if ($validated['break_start'] && $validated['break_end']) {
                $breakStart = Carbon::parse($validated['date'] . ' ' . $validated['break_start']);
                $breakEnd = Carbon::parse($validated['date'] . ' ' . $validated['break_end']);
                $breakMinutes = $breakStart->diffInMinutes($breakEnd);
            }

            $validated['total_hours'] = $totalMinutes - $breakMinutes;
            $validated['break_duration'] = $breakMinutes;

            // Calculate overtime (assuming 8 hours = 480 minutes standard)
            $standardMinutes = 480;
            $validated['overtime_hours'] = max(0, ($totalMinutes - $breakMinutes) - $standardMinutes);
        }

        Attendance::create($validated);

        return redirect()->route('hr.attendance.index')
            ->with('success', 'Attendance record created successfully.');
    }

    /**
     * Display the specified attendance record.
     */
    public function show(Attendance $attendance): Response
    {
        $attendance->load(['employee.user', 'approver']);

        return Inertia::render('HR/Attendance/Show', [
            'attendance' => $attendance,
        ]);
    }

    /**
     * Show the form for editing the attendance record.
     */
    public function edit(Attendance $attendance): Response
    {
        $attendance->load(['employee.user']);

        return Inertia::render('HR/Attendance/Edit', [
            'attendance' => $attendance,
        ]);
    }

    /**
     * Update the specified attendance record.
     */
    public function update(Request $request, Attendance $attendance): RedirectResponse
    {
        $validated = $request->validate([
            'clock_in' => 'nullable|date_format:H:i',
            'clock_out' => 'nullable|date_format:H:i|after:clock_in',
            'break_start' => 'nullable|date_format:H:i',
            'break_end' => 'nullable|date_format:H:i|after:break_start',
            'status' => 'required|in:present,absent,late,half_day,on_leave',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Recalculate total hours if times are updated
        if ($validated['clock_in'] && $validated['clock_out']) {
            $clockIn = Carbon::parse($attendance->date->format('Y-m-d') . ' ' . $validated['clock_in']);
            $clockOut = Carbon::parse($attendance->date->format('Y-m-d') . ' ' . $validated['clock_out']);
            $totalMinutes = $clockIn->diffInMinutes($clockOut);

            // Calculate break duration
            $breakMinutes = 0;
            if ($validated['break_start'] && $validated['break_end']) {
                $breakStart = Carbon::parse($attendance->date->format('Y-m-d') . ' ' . $validated['break_start']);
                $breakEnd = Carbon::parse($attendance->date->format('Y-m-d') . ' ' . $validated['break_end']);
                $breakMinutes = $breakStart->diffInMinutes($breakEnd);
            }

            $validated['total_hours'] = $totalMinutes - $breakMinutes;
            $validated['break_duration'] = $breakMinutes;

            // Calculate overtime
            $standardMinutes = 480;
            $validated['overtime_hours'] = max(0, ($totalMinutes - $breakMinutes) - $standardMinutes);
        }

        $attendance->update($validated);

        return redirect()->route('hr.attendance.show', $attendance)
            ->with('success', 'Attendance record updated successfully.');
    }

    /**
     * Remove the specified attendance record.
     */
    public function destroy(Attendance $attendance): RedirectResponse
    {
        $attendance->delete();

        return redirect()->route('hr.attendance.index')
            ->with('success', 'Attendance record deleted successfully.');
    }

    /**
     * Clock in an employee.
     */
    public function clockIn(Request $request): RedirectResponse
    {
        $request->validate([
            'employee_id' => 'required|exists:hr_employees,id',
        ]);

        $today = now()->format('Y-m-d');
        $employee = Employee::findOrFail($request->employee_id);

        // Check if already clocked in today
        $existingAttendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        if ($existingAttendance && $existingAttendance->clock_in) {
            return back()->withErrors(['clock_in' => 'Employee already clocked in today.']);
        }

        if ($existingAttendance) {
            $existingAttendance->clockIn($request->location, $request->ip());
        } else {
            Attendance::create([
                'employee_id' => $employee->id,
                'date' => $today,
                'clock_in' => now(),
                'status' => 'present',
                'location' => $request->location,
                'ip_address' => $request->ip(),
            ]);
        }

        return back()->with('success', 'Clocked in successfully.');
    }

    /**
     * Clock out an employee.
     */
    public function clockOut(Request $request): RedirectResponse
    {
        $request->validate([
            'employee_id' => 'required|exists:hr_employees,id',
        ]);

        $today = now()->format('Y-m-d');
        $employee = Employee::findOrFail($request->employee_id);

        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        if (!$attendance || !$attendance->clock_in) {
            return back()->withErrors(['clock_out' => 'Employee must clock in first.']);
        }

        if ($attendance->clock_out) {
            return back()->withErrors(['clock_out' => 'Employee already clocked out today.']);
        }

        $attendance->clockOut();

        return back()->with('success', 'Clocked out successfully.');
    }

    /**
     * Display attendance reports.
     */
    public function reports(Request $request): Response
    {
        $startDate = $request->start_date ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $request->end_date ?? now()->endOfMonth()->format('Y-m-d');

        // Get attendance summary
        $attendanceSummary = Attendance::whereBetween('date', [$startDate, $endDate])
            ->selectRaw('
                COUNT(*) as total_records,
                SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN status = "absent" THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late_count,
                AVG(total_hours) as avg_hours_worked,
                SUM(overtime_hours) as total_overtime
            ')
            ->first();

        // Get department-wise attendance
        $departmentStats = Attendance::join('hr_employees', 'hr_attendances.employee_id', '=', 'hr_employees.id')
            ->join('hr_departments', 'hr_employees.department_id', '=', 'hr_departments.id')
            ->whereBetween('hr_attendances.date', [$startDate, $endDate])
            ->selectRaw('
                hr_departments.name as department_name,
                COUNT(*) as total_records,
                SUM(CASE WHEN hr_attendances.status = "present" THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN hr_attendances.status = "late" THEN 1 ELSE 0 END) as late_count
            ')
            ->groupBy('hr_departments.id', 'hr_departments.name')
            ->get();

        return Inertia::render('HR/Attendance/Reports', [
            'summary' => $attendanceSummary,
            'departmentStats' => $departmentStats,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
