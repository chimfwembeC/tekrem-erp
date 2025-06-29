<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SetupController extends Controller
{
    /**
     * Display the HR module setup page.
     */
    public function index(): Response
    {
        $this->authorize('manage-hr-settings');

        return Inertia::render('HR/Setup/Index', [
            'payrollSettings' => $this->getPayrollSettings(),
            'attendanceSettings' => $this->getAttendanceSettings(),
            'leaveSettings' => $this->getLeaveSettings(),
            'performanceSettings' => $this->getPerformanceSettings(),
            'trainingSettings' => $this->getTrainingSettings(),
            'generalSettings' => $this->getGeneralSettings(),
        ]);
    }

    /**
     * Update payroll settings.
     */
    public function updatePayroll(Request $request)
    {
        $this->authorize('manage-hr-settings');

        $validated = $request->validate([
            'payroll_frequency' => 'required|in:weekly,bi-weekly,monthly,quarterly',
            'default_currency' => 'required|string|max:3',
            'tax_calculation_method' => 'required|in:percentage,fixed,progressive',
            'default_tax_rate' => 'required|numeric|min:0|max:100',
            'overtime_rate_multiplier' => 'required|numeric|min:1|max:5',
            'enable_overtime' => 'boolean',
            'enable_bonuses' => 'boolean',
            'enable_deductions' => 'boolean',
            'enable_benefits' => 'boolean',
            'payroll_approval_required' => 'boolean',
            'auto_generate_payslips' => 'boolean',
            'payslip_template' => 'nullable|string',
            'payroll_start_day' => 'required|integer|min:1|max:31',
            'payroll_cutoff_day' => 'required|integer|min:1|max:31',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("hr.payroll.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Payroll settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update attendance settings.
     */
    public function updateAttendance(Request $request)
    {
        $this->authorize('manage-hr-settings');

        $validated = $request->validate([
            'work_hours_per_day' => 'required|numeric|min:1|max:24',
            'work_days_per_week' => 'required|integer|min:1|max:7',
            'default_start_time' => 'required|string',
            'default_end_time' => 'required|string',
            'break_duration_minutes' => 'required|integer|min:0|max:480',
            'grace_period_minutes' => 'required|integer|min:0|max:60',
            'late_threshold_minutes' => 'required|integer|min:1|max:120',
            'enable_overtime_tracking' => 'boolean',
            'enable_break_tracking' => 'boolean',
            'require_clock_in_location' => 'boolean',
            'allowed_clock_locations' => 'nullable|array',
            'enable_mobile_attendance' => 'boolean',
            'enable_biometric_attendance' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("hr.attendance.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Attendance settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update leave settings.
     */
    public function updateLeave(Request $request)
    {
        $this->authorize('manage-hr-settings');

        $validated = $request->validate([
            'annual_leave_days' => 'required|integer|min:0|max:365',
            'sick_leave_days' => 'required|integer|min:0|max:365',
            'maternity_leave_days' => 'required|integer|min:0|max:365',
            'paternity_leave_days' => 'required|integer|min:0|max:365',
            'casual_leave_days' => 'required|integer|min:0|max:365',
            'leave_accrual_method' => 'required|in:monthly,quarterly,annually',
            'leave_approval_required' => 'boolean',
            'allow_negative_balance' => 'boolean',
            'carry_forward_enabled' => 'boolean',
            'max_carry_forward_days' => 'nullable|integer|min:0|max:365',
            'advance_notice_days' => 'required|integer|min:0|max:90',
            'weekend_included' => 'boolean',
            'holidays_included' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("hr.leave.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Leave settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update performance settings.
     */
    public function updatePerformance(Request $request)
    {
        $this->authorize('manage-hr-settings');

        $validated = $request->validate([
            'review_frequency' => 'required|in:quarterly,semi-annually,annually',
            'enable_360_feedback' => 'boolean',
            'enable_self_assessment' => 'boolean',
            'enable_peer_review' => 'boolean',
            'enable_goal_setting' => 'boolean',
            'performance_scale' => 'required|in:5-point,10-point,percentage',
            'auto_reminder_enabled' => 'boolean',
            'reminder_days_before' => 'nullable|integer|min:1|max:90',
            'require_manager_approval' => 'boolean',
            'enable_performance_analytics' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("hr.performance.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Performance settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update training settings.
     */
    public function updateTraining(Request $request)
    {
        $this->authorize('manage-hr-settings');

        $validated = $request->validate([
            'enable_mandatory_training' => 'boolean',
            'enable_certification_tracking' => 'boolean',
            'enable_training_calendar' => 'boolean',
            'enable_external_training' => 'boolean',
            'training_budget_tracking' => 'boolean',
            'auto_enrollment_enabled' => 'boolean',
            'completion_reminder_days' => 'nullable|integer|min:1|max:90',
            'certificate_validity_months' => 'nullable|integer|min:1|max:120',
            'enable_training_analytics' => 'boolean',
            'require_training_approval' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("hr.training.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Training settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update general HR settings.
     */
    public function updateGeneral(Request $request)
    {
        $this->authorize('manage-hr-settings');

        $validated = $request->validate([
            'employee_id_format' => 'required|string|max:50',
            'employee_id_prefix' => 'nullable|string|max:10',
            'probation_period_months' => 'required|integer|min:1|max:24',
            'notice_period_days' => 'required|integer|min:1|max:365',
            'enable_employee_portal' => 'boolean',
            'enable_document_management' => 'boolean',
            'enable_org_chart' => 'boolean',
            'enable_employee_directory' => 'boolean',
            'enable_hr_analytics' => 'boolean',
            'data_retention_years' => 'required|integer|min:1|max:50',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("hr.general.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'General HR settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Get payroll settings.
     */
    private function getPayrollSettings(): array
    {
        return [
            'payroll_frequency' => Setting::get('hr.payroll.payroll_frequency', 'monthly'),
            'default_currency' => Setting::get('hr.payroll.default_currency', 'USD'),
            'tax_calculation_method' => Setting::get('hr.payroll.tax_calculation_method', 'percentage'),
            'default_tax_rate' => Setting::get('hr.payroll.default_tax_rate', 10),
            'overtime_rate_multiplier' => Setting::get('hr.payroll.overtime_rate_multiplier', 1.5),
            'enable_overtime' => Setting::get('hr.payroll.enable_overtime', true),
            'enable_bonuses' => Setting::get('hr.payroll.enable_bonuses', true),
            'enable_deductions' => Setting::get('hr.payroll.enable_deductions', true),
            'enable_benefits' => Setting::get('hr.payroll.enable_benefits', true),
            'payroll_approval_required' => Setting::get('hr.payroll.payroll_approval_required', true),
            'auto_generate_payslips' => Setting::get('hr.payroll.auto_generate_payslips', true),
            'payslip_template' => Setting::get('hr.payroll.payslip_template', 'default'),
            'payroll_start_day' => Setting::get('hr.payroll.payroll_start_day', 1),
            'payroll_cutoff_day' => Setting::get('hr.payroll.payroll_cutoff_day', 25),
        ];
    }

    /**
     * Get attendance settings.
     */
    private function getAttendanceSettings(): array
    {
        return [
            'work_hours_per_day' => Setting::get('hr.attendance.work_hours_per_day', 8),
            'work_days_per_week' => Setting::get('hr.attendance.work_days_per_week', 5),
            'default_start_time' => Setting::get('hr.attendance.default_start_time', '09:00'),
            'default_end_time' => Setting::get('hr.attendance.default_end_time', '17:00'),
            'break_duration_minutes' => Setting::get('hr.attendance.break_duration_minutes', 60),
            'grace_period_minutes' => Setting::get('hr.attendance.grace_period_minutes', 15),
            'late_threshold_minutes' => Setting::get('hr.attendance.late_threshold_minutes', 30),
            'enable_overtime_tracking' => Setting::get('hr.attendance.enable_overtime_tracking', true),
            'enable_break_tracking' => Setting::get('hr.attendance.enable_break_tracking', false),
            'require_clock_in_location' => Setting::get('hr.attendance.require_clock_in_location', false),
            'allowed_clock_locations' => Setting::get('hr.attendance.allowed_clock_locations', []),
            'enable_mobile_attendance' => Setting::get('hr.attendance.enable_mobile_attendance', true),
            'enable_biometric_attendance' => Setting::get('hr.attendance.enable_biometric_attendance', false),
        ];
    }

    /**
     * Get leave settings.
     */
    private function getLeaveSettings(): array
    {
        return [
            'annual_leave_days' => Setting::get('hr.leave.annual_leave_days', 21),
            'sick_leave_days' => Setting::get('hr.leave.sick_leave_days', 10),
            'maternity_leave_days' => Setting::get('hr.leave.maternity_leave_days', 90),
            'paternity_leave_days' => Setting::get('hr.leave.paternity_leave_days', 14),
            'casual_leave_days' => Setting::get('hr.leave.casual_leave_days', 5),
            'leave_accrual_method' => Setting::get('hr.leave.leave_accrual_method', 'monthly'),
            'leave_approval_required' => Setting::get('hr.leave.leave_approval_required', true),
            'allow_negative_balance' => Setting::get('hr.leave.allow_negative_balance', false),
            'carry_forward_enabled' => Setting::get('hr.leave.carry_forward_enabled', true),
            'max_carry_forward_days' => Setting::get('hr.leave.max_carry_forward_days', 5),
            'advance_notice_days' => Setting::get('hr.leave.advance_notice_days', 7),
            'weekend_included' => Setting::get('hr.leave.weekend_included', false),
            'holidays_included' => Setting::get('hr.leave.holidays_included', false),
        ];
    }

    /**
     * Get performance settings.
     */
    private function getPerformanceSettings(): array
    {
        return [
            'review_frequency' => Setting::get('hr.performance.review_frequency', 'annually'),
            'enable_360_feedback' => Setting::get('hr.performance.enable_360_feedback', false),
            'enable_self_assessment' => Setting::get('hr.performance.enable_self_assessment', true),
            'enable_peer_review' => Setting::get('hr.performance.enable_peer_review', false),
            'enable_goal_setting' => Setting::get('hr.performance.enable_goal_setting', true),
            'performance_scale' => Setting::get('hr.performance.performance_scale', '5-point'),
            'auto_reminder_enabled' => Setting::get('hr.performance.auto_reminder_enabled', true),
            'reminder_days_before' => Setting::get('hr.performance.reminder_days_before', 30),
            'require_manager_approval' => Setting::get('hr.performance.require_manager_approval', true),
            'enable_performance_analytics' => Setting::get('hr.performance.enable_performance_analytics', true),
        ];
    }

    /**
     * Get training settings.
     */
    private function getTrainingSettings(): array
    {
        return [
            'enable_mandatory_training' => Setting::get('hr.training.enable_mandatory_training', true),
            'enable_certification_tracking' => Setting::get('hr.training.enable_certification_tracking', true),
            'enable_training_calendar' => Setting::get('hr.training.enable_training_calendar', true),
            'enable_external_training' => Setting::get('hr.training.enable_external_training', true),
            'training_budget_tracking' => Setting::get('hr.training.training_budget_tracking', false),
            'auto_enrollment_enabled' => Setting::get('hr.training.auto_enrollment_enabled', false),
            'completion_reminder_days' => Setting::get('hr.training.completion_reminder_days', 7),
            'certificate_validity_months' => Setting::get('hr.training.certificate_validity_months', 12),
            'enable_training_analytics' => Setting::get('hr.training.enable_training_analytics', true),
            'require_training_approval' => Setting::get('hr.training.require_training_approval', true),
        ];
    }

    /**
     * Get general settings.
     */
    private function getGeneralSettings(): array
    {
        return [
            'employee_id_format' => Setting::get('hr.general.employee_id_format', 'EMP-{YYYY}-{####}'),
            'employee_id_prefix' => Setting::get('hr.general.employee_id_prefix', 'EMP'),
            'probation_period_months' => Setting::get('hr.general.probation_period_months', 3),
            'notice_period_days' => Setting::get('hr.general.notice_period_days', 30),
            'enable_employee_portal' => Setting::get('hr.general.enable_employee_portal', true),
            'enable_document_management' => Setting::get('hr.general.enable_document_management', true),
            'enable_org_chart' => Setting::get('hr.general.enable_org_chart', true),
            'enable_employee_directory' => Setting::get('hr.general.enable_employee_directory', true),
            'enable_hr_analytics' => Setting::get('hr.general.enable_hr_analytics', true),
            'data_retention_years' => Setting::get('hr.general.data_retention_years', 7),
        ];
    }
}
