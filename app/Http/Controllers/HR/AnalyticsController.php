<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Department;
use App\Models\HR\Employee;
use App\Models\HR\Leave;
use App\Models\HR\Performance;
use App\Models\HR\Attendance;
use App\Models\HR\Training;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Display HR analytics dashboard.
     */
    public function index(Request $request): \Inertia\Response
    {
        $startDate = $request->start_date ?? now()->startOfYear()->format('Y-m-d');
        $endDate = $request->end_date ?? now()->endOfYear()->format('Y-m-d');

        // Employee Analytics
        $employeeStats = [
            'total' => Employee::count(),
            'active' => Employee::active()->count(),
            'new_hires' => Employee::whereBetween('hire_date', [$startDate, $endDate])->count(),
            'terminations' => Employee::whereBetween('termination_date', [$startDate, $endDate])->count(),
            'turnover_rate' => $this->calculateTurnoverRate($startDate, $endDate),
        ];

        // Department Analytics
        $departmentStats = Department::active()
            ->withCount(['employees' => function ($query) {
                $query->where('employment_status', 'active');
            }])
            ->get()
            ->map(function ($dept) {
                return [
                    'name' => $dept->name,
                    'employee_count' => $dept->employees_count,
                    'budget' => $dept->budget,
                ];
            });

        // Leave Analytics
        $leaveStats = [
            'total_requests' => Leave::whereBetween('start_date', [$startDate, $endDate])->count(),
            'approved' => Leave::approved()->whereBetween('start_date', [$startDate, $endDate])->count(),
            'pending' => Leave::pending()->count(),
            'total_days_taken' => Leave::approved()->whereBetween('start_date', [$startDate, $endDate])->sum('days_requested'),
        ];

        // Attendance Analytics
        $attendanceStats = [
            'average_attendance_rate' => $this->calculateAverageAttendanceRate($startDate, $endDate),
            'total_late_arrivals' => Attendance::late()->whereBetween('date', [$startDate, $endDate])->count(),
            'total_absences' => Attendance::absent()->whereBetween('date', [$startDate, $endDate])->count(),
            'average_overtime_hours' => Attendance::whereBetween('date', [$startDate, $endDate])->avg('overtime_hours') ?? 0,
        ];

        // Performance Analytics
        $performanceStats = [
            'total_reviews' => Performance::whereBetween('review_start_date', [$startDate, $endDate])->count(),
            'completed_reviews' => Performance::completed()->whereBetween('review_start_date', [$startDate, $endDate])->count(),
            'overdue_reviews' => Performance::overdue()->count(),
            'average_rating' => Performance::completed()->whereNotNull('overall_rating')->avg('overall_rating') ?? 0,
        ];

        // Training Analytics
        $trainingStats = [
            'total_programs' => Training::whereBetween('start_date', [$startDate, $endDate])->count(),
            'completed_programs' => Training::completed()->whereBetween('start_date', [$startDate, $endDate])->count(),
            'total_enrollments' => Training::whereBetween('start_date', [$startDate, $endDate])->sum('enrolled_count'),
            'completion_rate' => $this->calculateTrainingCompletionRate($startDate, $endDate),
        ];

        // Charts Data
        $charts = [
            'employee_growth' => $this->getEmployeeGrowthChart($startDate, $endDate),
            'leave_trends' => $this->getLeaveTrendsChart($startDate, $endDate),
            'attendance_trends' => $this->getAttendanceTrendsChart($startDate, $endDate),
            'performance_distribution' => $this->getPerformanceDistributionChart($startDate, $endDate),
            'training_completion' => $this->getTrainingCompletionChart($startDate, $endDate),
        ];

        return Inertia::render('HR/Analytics/Dashboard', [
            'stats' => [
                'employees' => $employeeStats,
                'departments' => $departmentStats,
                'leave' => $leaveStats,
                'attendance' => $attendanceStats,
                'performance' => $performanceStats,
                'training' => $trainingStats,
            ],
            'charts' => $charts,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Display detailed reports.
     */
    public function reports(Request $request): \Inertia\Response
    {
        $reportType = $request->type ?? 'employees';
        $startDate = $request->start_date ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $request->end_date ?? now()->endOfMonth()->format('Y-m-d');

        $reportData = match($reportType) {
            'employees' => $this->getEmployeeReport($startDate, $endDate),
            'attendance' => $this->getAttendanceReport($startDate, $endDate),
            'leave' => $this->getLeaveReport($startDate, $endDate),
            'performance' => $this->getPerformanceReport($startDate, $endDate),
            'training' => $this->getTrainingReport($startDate, $endDate),
            default => $this->getEmployeeReport($startDate, $endDate),
        };

        return Inertia::render('HR/Analytics/Reports', [
            'reportType' => $reportType,
            'reportData' => $reportData,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Export analytics data.
     */
    public function export(Request $request): Response
    {
        $request->validate([
            'type' => 'required|in:employees,attendance,leave,performance,training',
            'format' => 'required|in:csv,excel,pdf',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Implementation would depend on your export library
        // This is a placeholder for the export functionality

        return response()->json([
            'message' => 'Export functionality would be implemented here',
            'type' => $request->type,
            'format' => $request->format,
        ]);
    }

    /**
     * Calculate turnover rate.
     */
    private function calculateTurnoverRate(string $startDate, string $endDate): float
    {
        $averageEmployees = Employee::whereBetween('hire_date', [$startDate, $endDate])->count();
        $terminations = Employee::whereBetween('termination_date', [$startDate, $endDate])->count();

        if ($averageEmployees === 0) {
            return 0;
        }

        return round(($terminations / $averageEmployees) * 100, 2);
    }

    /**
     * Calculate average attendance rate.
     */
    private function calculateAverageAttendanceRate(string $startDate, string $endDate): float
    {
        $totalRecords = Attendance::whereBetween('date', [$startDate, $endDate])->count();
        $presentRecords = Attendance::whereIn('status', ['present', 'late'])
            ->whereBetween('date', [$startDate, $endDate])
            ->count();

        if ($totalRecords === 0) {
            return 0;
        }

        return round(($presentRecords / $totalRecords) * 100, 2);
    }

    /**
     * Calculate training completion rate.
     */
    private function calculateTrainingCompletionRate(string $startDate, string $endDate): float
    {
        $totalEnrollments = Training::whereBetween('start_date', [$startDate, $endDate])
            ->sum('enrolled_count');

        $completedEnrollments = Training::whereBetween('start_date', [$startDate, $endDate])
            ->whereHas('enrollments', function ($query) {
                $query->where('status', 'completed');
            })
            ->withCount(['enrollments' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->get()
            ->sum('enrollments_count');

        if ($totalEnrollments === 0) {
            return 0;
        }

        return round(($completedEnrollments / $totalEnrollments) * 100, 2);
    }

    /**
     * Get employee growth chart data.
     */
    private function getEmployeeGrowthChart(string $startDate, string $endDate): array
    {
        $data = [];
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        while ($start->lte($end)) {
            $monthStart = $start->copy()->startOfMonth();
            $monthEnd = $start->copy()->endOfMonth();

            $hires = Employee::whereBetween('hire_date', [$monthStart, $monthEnd])->count();
            $terminations = Employee::whereBetween('termination_date', [$monthStart, $monthEnd])->count();

            $data[] = [
                'month' => $start->format('M Y'),
                'hires' => $hires,
                'terminations' => $terminations,
                'net_growth' => $hires - $terminations,
            ];

            $start->addMonth();
        }

        return $data;
    }

    /**
     * Get leave trends chart data.
     */
    private function getLeaveTrendsChart(string $startDate, string $endDate): array
    {
        return Leave::join('hr_leave_types', 'hr_leaves.leave_type_id', '=', 'hr_leave_types.id')
            ->whereBetween('hr_leaves.start_date', [$startDate, $endDate])
            ->selectRaw('hr_leave_types.name, COUNT(*) as count, SUM(hr_leaves.days_requested) as total_days')
            ->groupBy('hr_leave_types.id', 'hr_leave_types.name')
            ->get()
            ->toArray();
    }

    /**
     * Get attendance trends chart data.
     */
    private function getAttendanceTrendsChart(string $startDate, string $endDate): array
    {
        $data = [];
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        while ($start->lte($end)) {
            $present = Attendance::where('date', $start->format('Y-m-d'))
                ->whereIn('status', ['present', 'late'])
                ->count();

            $absent = Attendance::where('date', $start->format('Y-m-d'))
                ->where('status', 'absent')
                ->count();

            $data[] = [
                'date' => $start->format('M d'),
                'present' => $present,
                'absent' => $absent,
            ];

            $start->addDay();
        }

        return $data;
    }

    /**
     * Get performance distribution chart data.
     */
    private function getPerformanceDistributionChart(string $startDate, string $endDate): array
    {
        return Performance::completed()
            ->whereBetween('review_start_date', [$startDate, $endDate])
            ->whereNotNull('overall_rating')
            ->selectRaw('
                CASE
                    WHEN overall_rating >= 4.5 THEN "Exceptional"
                    WHEN overall_rating >= 4.0 THEN "Exceeds Expectations"
                    WHEN overall_rating >= 3.0 THEN "Meets Expectations"
                    WHEN overall_rating >= 2.0 THEN "Below Expectations"
                    ELSE "Unsatisfactory"
                END as rating_category,
                COUNT(*) as count
            ')
            ->groupBy('rating_category')
            ->get()
            ->toArray();
    }

    /**
     * Get training completion chart data.
     */
    private function getTrainingCompletionChart(string $startDate, string $endDate): array
    {
        return Training::whereBetween('start_date', [$startDate, $endDate])
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->toArray();
    }

    /**
     * Get employee report data.
     */
    private function getEmployeeReport(string $startDate, string $endDate): array
    {
        return Employee::with(['user', 'department'])
            ->whereBetween('hire_date', [$startDate, $endDate])
            ->get()
            ->map(function ($employee) {
                return [
                    'name' => $employee->full_name,
                    'employee_id' => $employee->employee_id,
                    'department' => $employee->department->name ?? 'N/A',
                    'job_title' => $employee->job_title,
                    'hire_date' => $employee->hire_date->format('Y-m-d'),
                    'employment_status' => $employee->employment_status,
                ];
            })
            ->toArray();
    }

    /**
     * Get attendance report data.
     */
    private function getAttendanceReport(string $startDate, string $endDate): array
    {
        return Attendance::with(['employee.user'])
            ->whereBetween('date', [$startDate, $endDate])
            ->get()
            ->map(function ($attendance) {
                return [
                    'employee_name' => $attendance->employee->full_name,
                    'date' => $attendance->date->format('Y-m-d'),
                    'clock_in' => $attendance->clock_in,
                    'clock_out' => $attendance->clock_out,
                    'total_hours' => $attendance->total_hours_formatted,
                    'status' => $attendance->status,
                ];
            })
            ->toArray();
    }

    /**
     * Get leave report data.
     */
    private function getLeaveReport(string $startDate, string $endDate): array
    {
        return Leave::with(['employee.user', 'leaveType'])
            ->whereBetween('start_date', [$startDate, $endDate])
            ->get()
            ->map(function ($leave) {
                return [
                    'employee_name' => $leave->employee->full_name,
                    'leave_type' => $leave->leaveType->name,
                    'start_date' => $leave->start_date->format('Y-m-d'),
                    'end_date' => $leave->end_date->format('Y-m-d'),
                    'days_requested' => $leave->days_requested,
                    'status' => $leave->status,
                ];
            })
            ->toArray();
    }

    /**
     * Get performance report data.
     */
    private function getPerformanceReport(string $startDate, string $endDate): array
    {
        return Performance::with(['employee.user', 'reviewer'])
            ->whereBetween('review_start_date', [$startDate, $endDate])
            ->get()
            ->map(function ($performance) {
                return [
                    'employee_name' => $performance->employee->full_name,
                    'reviewer_name' => $performance->reviewer->name,
                    'review_period' => $performance->review_period,
                    'overall_rating' => $performance->overall_rating,
                    'status' => $performance->status,
                ];
            })
            ->toArray();
    }

    /**
     * Get training report data.
     */
    private function getTrainingReport(string $startDate, string $endDate): array
    {
        return Training::with(['instructor'])
            ->whereBetween('start_date', [$startDate, $endDate])
            ->get()
            ->map(function ($training) {
                return [
                    'title' => $training->title,
                    'instructor' => $training->instructor->name ?? $training->provider,
                    'start_date' => $training->start_date->format('Y-m-d'),
                    'end_date' => $training->end_date->format('Y-m-d'),
                    'enrolled_count' => $training->enrolled_count,
                    'completion_rate' => $training->completion_rate,
                    'status' => $training->status,
                ];
            })
            ->toArray();
    }
}
