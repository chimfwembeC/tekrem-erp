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
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the HR dashboard.
     */
    public function index(Request $request): Response
    {
        // Employee Statistics
        $totalEmployees = Employee::count();
        $activeEmployees = Employee::active()->count();
        $newEmployeesThisMonth = Employee::whereMonth('hire_date', now()->month)
            ->whereYear('hire_date', now()->year)
            ->count();

        // Department Statistics
        $totalDepartments = Department::active()->count();
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

        // Leave Statistics
        $pendingLeaves = Leave::pending()->count();
        $leavesToday = Leave::approved()
            ->whereDate('start_date', '<=', today())
            ->whereDate('end_date', '>=', today())
            ->count();

        $leaveStats = [
            'pending' => $pendingLeaves,
            'approved_today' => $leavesToday,
            'this_month' => Leave::approved()
                ->whereMonth('start_date', now()->month)
                ->count(),
        ];

        // Attendance Statistics
        $attendanceToday = Attendance::forDate(today())->count();
        $presentToday = Attendance::forDate(today())->present()->count();
        $lateToday = Attendance::forDate(today())->late()->count();

        $attendanceStats = [
            'total_today' => $attendanceToday,
            'present_today' => $presentToday,
            'late_today' => $lateToday,
            'attendance_rate' => $activeEmployees > 0 ? round(($presentToday / $activeEmployees) * 100, 1) : 0,
        ];

        // Performance Statistics
        $overdueReviews = Performance::overdue()->count();
        $completedReviewsThisQuarter = Performance::completed()
            ->whereBetween('completed_at', [
                now()->startOfQuarter(),
                now()->endOfQuarter()
            ])
            ->count();

        $performanceStats = [
            'overdue_reviews' => $overdueReviews,
            'completed_this_quarter' => $completedReviewsThisQuarter,
            'average_rating' => Performance::completed()
                ->whereNotNull('overall_rating')
                ->avg('overall_rating') ?? 0,
        ];

        // Training Statistics
        $upcomingTrainings = Training::scheduled()
            ->where('start_date', '>=', today())
            ->where('start_date', '<=', today()->addDays(30))
            ->count();

        $ongoingTrainings = Training::ongoing()->count();
        $mandatoryTrainings = Training::mandatory()->scheduled()->count();

        $trainingStats = [
            'upcoming' => $upcomingTrainings,
            'ongoing' => $ongoingTrainings,
            'mandatory' => $mandatoryTrainings,
        ];

        // Recent Activities
        $recentLeaves = Leave::with(['employee.user', 'leaveType'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'employee_name' => $leave->employee->full_name,
                    'leave_type' => $leave->leaveType->name,
                    'start_date' => $leave->start_date->format('M d, Y'),
                    'days' => $leave->days_requested,
                    'status' => $leave->status,
                    'created_at' => $leave->created_at->diffForHumans(),
                ];
            });

        $recentHires = Employee::with(['user', 'department'])
            ->where('hire_date', '>=', now()->subDays(30))
            ->latest('hire_date')
            ->limit(5)
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->full_name,
                    'job_title' => $employee->job_title,
                    'department' => $employee->department->name ?? 'N/A',
                    'hire_date' => $employee->hire_date->format('M d, Y'),
                ];
            });

        // Charts Data
        $employeeGrowthChart = $this->getEmployeeGrowthData();
        $attendanceChart = $this->getAttendanceChartData();
        $leaveTypesChart = $this->getLeaveTypesChartData();

        return Inertia::render('HR/Dashboard', [
            'stats' => [
                'employees' => [
                    'total' => $totalEmployees,
                    'active' => $activeEmployees,
                    'new_this_month' => $newEmployeesThisMonth,
                ],
                'departments' => [
                    'total' => $totalDepartments,
                    'breakdown' => $departmentStats,
                ],
                'leave' => $leaveStats,
                'attendance' => $attendanceStats,
                'performance' => $performanceStats,
                'training' => $trainingStats,
            ],
            'recent_activities' => [
                'leaves' => $recentLeaves,
                'hires' => $recentHires,
            ],
            'charts' => [
                'employee_growth' => $employeeGrowthChart,
                'attendance' => $attendanceChart,
                'leave_types' => $leaveTypesChart,
            ],
        ]);
    }

    /**
     * Get employee growth data for the last 12 months.
     */
    private function getEmployeeGrowthData(): array
    {
        $data = [];
        
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $hires = Employee::whereYear('hire_date', $date->year)
                ->whereMonth('hire_date', $date->month)
                ->count();
            
            $terminations = Employee::whereYear('termination_date', $date->year)
                ->whereMonth('termination_date', $date->month)
                ->count();

            $data[] = [
                'month' => $date->format('M Y'),
                'hires' => $hires,
                'terminations' => $terminations,
                'net_growth' => $hires - $terminations,
            ];
        }

        return $data;
    }

    /**
     * Get attendance chart data for the last 7 days.
     */
    private function getAttendanceChartData(): array
    {
        $data = [];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $present = Attendance::forDate($date)->present()->count();
            $late = Attendance::forDate($date)->late()->count();
            $absent = Attendance::forDate($date)->absent()->count();

            $data[] = [
                'date' => $date->format('M d'),
                'present' => $present,
                'late' => $late,
                'absent' => $absent,
            ];
        }

        return $data;
    }

    /**
     * Get leave types chart data for current year.
     */
    private function getLeaveTypesChartData(): array
    {
        return Leave::approved()
            ->whereYear('start_date', now()->year)
            ->join('hr_leave_types', 'hr_leaves.leave_type_id', '=', 'hr_leave_types.id')
            ->selectRaw('hr_leave_types.name, COUNT(*) as count, SUM(hr_leaves.days_requested) as total_days')
            ->groupBy('hr_leave_types.id', 'hr_leave_types.name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'count' => $item->count,
                    'total_days' => $item->total_days,
                ];
            })
            ->toArray();
    }
}
