<?php

namespace App\Models\HR;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveType extends Model
{
    use HasFactory;

    protected $table = 'hr_leave_types';

    protected $fillable = [
        'name',
        'code',
        'description',
        'days_per_year',
        'is_paid',
        'requires_approval',
        'max_consecutive_days',
        'min_notice_days',
        'carry_forward',
        'max_carry_forward_days',
        'color',
        'is_active',
        'rules',
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'requires_approval' => 'boolean',
        'carry_forward' => 'boolean',
        'is_active' => 'boolean',
        'rules' => 'array',
    ];

    /**
     * Get the leaves for this leave type.
     */
    public function leaves(): HasMany
    {
        return $this->hasMany(Leave::class, 'leave_type_id');
    }

    /**
     * Scope to get only active leave types.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get paid leave types.
     */
    public function scopePaid($query)
    {
        return $query->where('is_paid', true);
    }

    /**
     * Scope to get unpaid leave types.
     */
    public function scopeUnpaid($query)
    {
        return $query->where('is_paid', false);
    }

    /**
     * Check if leave type requires approval.
     */
    public function requiresApproval(): bool
    {
        return $this->requires_approval;
    }

    /**
     * Check if leave type allows carry forward.
     */
    public function allowsCarryForward(): bool
    {
        return $this->carry_forward;
    }

    /**
     * Get the maximum carry forward days.
     */
    public function getMaxCarryForwardDays(): ?int
    {
        return $this->carry_forward ? $this->max_carry_forward_days : null;
    }

    /**
     * Validate leave request against this leave type rules.
     */
    public function validateLeaveRequest(int $daysRequested, \DateTime $startDate): array
    {
        $errors = [];

        // Check maximum consecutive days
        if ($this->max_consecutive_days && $daysRequested > $this->max_consecutive_days) {
            $errors[] = "Maximum consecutive days for {$this->name} is {$this->max_consecutive_days}";
        }

        // Check minimum notice period
        if ($this->min_notice_days) {
            $noticeDate = new \DateTime();
            $noticeDate->add(new \DateInterval("P{$this->min_notice_days}D"));
            
            if ($startDate < $noticeDate) {
                $errors[] = "Minimum notice period for {$this->name} is {$this->min_notice_days} days";
            }
        }

        // Additional custom rules validation
        if ($this->rules) {
            foreach ($this->rules as $rule) {
                // Implement custom rule validation logic here
                // This can be extended based on specific business requirements
            }
        }

        return $errors;
    }

    /**
     * Get leave balance for an employee.
     */
    public function getLeaveBalance(Employee $employee, int $year = null): array
    {
        $year = $year ?? date('Y');
        
        // Calculate allocated days
        $allocatedDays = $this->days_per_year;
        
        // Calculate used days
        $usedDays = $this->leaves()
            ->where('employee_id', $employee->id)
            ->whereYear('start_date', $year)
            ->where('status', 'approved')
            ->sum('days_requested');

        // Calculate carry forward from previous year
        $carryForwardDays = 0;
        if ($this->carry_forward && $year > date('Y', strtotime($employee->hire_date))) {
            $previousYearBalance = $this->getLeaveBalance($employee, $year - 1);
            $carryForwardDays = min(
                $previousYearBalance['remaining'],
                $this->max_carry_forward_days ?? $previousYearBalance['remaining']
            );
        }

        $totalAllocated = $allocatedDays + $carryForwardDays;
        $remaining = $totalAllocated - $usedDays;

        return [
            'allocated' => $allocatedDays,
            'carry_forward' => $carryForwardDays,
            'total_allocated' => $totalAllocated,
            'used' => $usedDays,
            'remaining' => max(0, $remaining),
        ];
    }
}
