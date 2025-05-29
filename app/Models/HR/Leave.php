<?php

namespace App\Models\HR;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Leave extends Model
{
    use HasFactory;

    protected $table = 'hr_leaves';

    protected $fillable = [
        'employee_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'days_requested',
        'reason',
        'status',
        'approved_by',
        'approved_at',
        'approval_notes',
        'rejection_reason',
        'is_half_day',
        'half_day_period',
        'attachments',
        'submitted_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
        'submitted_at' => 'datetime',
        'is_half_day' => 'boolean',
        'attachments' => 'array',
    ];

    /**
     * Get the employee who requested the leave.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    /**
     * Get the leave type.
     */
    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class, 'leave_type_id');
    }

    /**
     * Get the user who approved the leave.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope to get pending leaves.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get approved leaves.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope to get rejected leaves.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope to get leaves for a specific employee.
     */
    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    /**
     * Scope to get leaves for a specific date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
              ->orWhereBetween('end_date', [$startDate, $endDate])
              ->orWhere(function ($q2) use ($startDate, $endDate) {
                  $q2->where('start_date', '<=', $startDate)
                     ->where('end_date', '>=', $endDate);
              });
        });
    }

    /**
     * Check if leave is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if leave is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if leave is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if leave is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if leave can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return $this->isPending() || ($this->isApproved() && $this->start_date->isFuture());
    }

    /**
     * Check if leave can be edited.
     */
    public function canBeEdited(): bool
    {
        return $this->isPending() && $this->start_date->isFuture();
    }

    /**
     * Approve the leave.
     */
    public function approve(User $approver, string $notes = null): bool
    {
        if (!$this->isPending()) {
            return false;
        }

        $this->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'approval_notes' => $notes,
        ]);

        return true;
    }

    /**
     * Reject the leave.
     */
    public function reject(User $approver, string $reason): bool
    {
        if (!$this->isPending()) {
            return false;
        }

        $this->update([
            'status' => 'rejected',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);

        return true;
    }

    /**
     * Cancel the leave.
     */
    public function cancel(): bool
    {
        if (!$this->canBeCancelled()) {
            return false;
        }

        $this->update(['status' => 'cancelled']);

        return true;
    }

    /**
     * Calculate the number of working days for the leave.
     */
    public function calculateWorkingDays(): int
    {
        if ($this->is_half_day) {
            return 0.5;
        }

        $workingDays = 0;
        $currentDate = $this->start_date->copy();

        while ($currentDate->lte($this->end_date)) {
            // Skip weekends (Saturday = 6, Sunday = 0)
            if (!in_array($currentDate->dayOfWeek, [0, 6])) {
                $workingDays++;
            }
            $currentDate->addDay();
        }

        return $workingDays;
    }

    /**
     * Get the duration in a human readable format.
     */
    public function getDurationAttribute(): string
    {
        if ($this->is_half_day) {
            return "Half day ({$this->half_day_period})";
        }

        if ($this->start_date->eq($this->end_date)) {
            return '1 day';
        }

        $days = $this->start_date->diffInDays($this->end_date) + 1;
        return "{$days} days";
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($leave) {
            if (!$leave->submitted_at) {
                $leave->submitted_at = now();
            }

            // Auto-calculate days if not provided
            if (!$leave->days_requested) {
                $leave->days_requested = $leave->calculateWorkingDays();
            }
        });
    }
}
