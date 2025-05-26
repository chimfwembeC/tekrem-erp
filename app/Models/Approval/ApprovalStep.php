<?php

namespace App\Models\Approval;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalStep extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'request_id',
        'step_number',
        'step_name',
        'status',
        'approver_id',
        'assigned_at',
        'completed_at',
        'comments',
        'step_data',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'assigned_at' => 'datetime',
        'completed_at' => 'datetime',
        'step_data' => 'array',
    ];

    /**
     * Get the approval request for this step.
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(ApprovalRequest::class, 'request_id');
    }

    /**
     * Get the approver for this step.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    /**
     * Check if this step is pending.
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if this step is approved.
     */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /**
     * Check if this step is rejected.
     */
    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if this step is the current step.
     */
    public function isCurrent()
    {
        return $this->isPending() && $this->assigned_at !== null;
    }

    /**
     * Get the time elapsed for this step.
     */
    public function getElapsedTime()
    {
        if (!$this->assigned_at) {
            return null;
        }

        $endTime = $this->completed_at ?: now();
        return $this->assigned_at->diffForHumans($endTime);
    }

    /**
     * Get the processing time in hours.
     */
    public function getProcessingTimeInHours()
    {
        if (!$this->assigned_at || !$this->completed_at) {
            return null;
        }

        return $this->assigned_at->diffInHours($this->completed_at);
    }

    /**
     * Scope for pending steps.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for assigned steps.
     */
    public function scopeAssigned($query)
    {
        return $query->whereNotNull('assigned_at');
    }

    /**
     * Scope for steps assigned to a specific user.
     */
    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('approver_id', $userId);
    }

    /**
     * Scope for current steps (pending and assigned).
     */
    public function scopeCurrent($query)
    {
        return $query->pending()->assigned();
    }
}
