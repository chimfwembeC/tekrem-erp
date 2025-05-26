<?php

namespace App\Models\Approval;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ApprovalRequest extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'workflow_id',
        'approvable_type',
        'approvable_id',
        'status',
        'requested_by',
        'requested_at',
        'completed_at',
        'notes',
        'current_step_data',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'requested_at' => 'datetime',
        'completed_at' => 'datetime',
        'current_step_data' => 'array',
    ];

    /**
     * Get the workflow for this request.
     */
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'workflow_id');
    }

    /**
     * Get the user who requested approval.
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the item being approved.
     */
    public function approvable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the approval steps for this request.
     */
    public function steps(): HasMany
    {
        return $this->hasMany(ApprovalStep::class, 'request_id')->orderBy('step_number');
    }

    /**
     * Get the current step.
     */
    public function getCurrentStep()
    {
        return $this->steps()
            ->where('status', 'pending')
            ->orderBy('step_number')
            ->first();
    }

    /**
     * Get the next step.
     */
    public function getNextStep()
    {
        $currentStep = $this->getCurrentStep();
        
        if (!$currentStep) {
            return null;
        }

        return $this->steps()
            ->where('step_number', '>', $currentStep->step_number)
            ->orderBy('step_number')
            ->first();
    }

    /**
     * Approve the current step.
     */
    public function approveCurrentStep($approverId, $comments = null)
    {
        $currentStep = $this->getCurrentStep();
        
        if (!$currentStep) {
            throw new \Exception('No pending step to approve');
        }

        if ($currentStep->approver_id && $currentStep->approver_id !== $approverId) {
            throw new \Exception('You are not authorized to approve this step');
        }

        $currentStep->update([
            'status' => 'approved',
            'approver_id' => $approverId,
            'completed_at' => now(),
            'comments' => $comments,
        ]);

        // Check if there are more steps
        $nextStep = $this->getNextStep();
        
        if ($nextStep) {
            // Assign next step
            $nextStep->update([
                'assigned_at' => now(),
            ]);
        } else {
            // All steps completed, approve the request
            $this->update([
                'status' => 'approved',
                'completed_at' => now(),
            ]);

            // Update the approvable item status if needed
            $this->updateApprovableStatus('approved');
        }

        return $this;
    }

    /**
     * Reject the current step.
     */
    public function rejectCurrentStep($approverId, $comments = null)
    {
        $currentStep = $this->getCurrentStep();
        
        if (!$currentStep) {
            throw new \Exception('No pending step to reject');
        }

        if ($currentStep->approver_id && $currentStep->approver_id !== $approverId) {
            throw new \Exception('You are not authorized to reject this step');
        }

        $currentStep->update([
            'status' => 'rejected',
            'approver_id' => $approverId,
            'completed_at' => now(),
            'comments' => $comments,
        ]);

        // Reject the entire request
        $this->update([
            'status' => 'rejected',
            'completed_at' => now(),
        ]);

        // Update the approvable item status if needed
        $this->updateApprovableStatus('rejected');

        return $this;
    }

    /**
     * Cancel the approval request.
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => 'cancelled',
            'completed_at' => now(),
            'notes' => $reason,
        ]);

        // Cancel all pending steps
        $this->steps()
            ->where('status', 'pending')
            ->update([
                'status' => 'cancelled',
                'completed_at' => now(),
            ]);

        return $this;
    }

    /**
     * Update the status of the approvable item.
     */
    private function updateApprovableStatus($status)
    {
        $approvable = $this->approvable;
        
        if (!$approvable) {
            return;
        }

        // Update status based on the approvable type
        switch (get_class($approvable)) {
            case 'App\Models\Finance\Quotation':
                if ($status === 'approved') {
                    $approvable->update(['status' => 'approved']);
                }
                break;
                
            case 'App\Models\Finance\Invoice':
                if ($status === 'approved') {
                    $approvable->update(['status' => 'sent']);
                }
                break;
        }
    }

    /**
     * Get approval progress percentage.
     */
    public function getProgressPercentage()
    {
        $totalSteps = $this->steps()->count();
        $completedSteps = $this->steps()->whereIn('status', ['approved', 'rejected'])->count();

        if ($totalSteps === 0) {
            return 0;
        }

        return round(($completedSteps / $totalSteps) * 100);
    }

    /**
     * Check if the request can be approved by the given user.
     */
    public function canBeApprovedBy($userId)
    {
        $currentStep = $this->getCurrentStep();
        
        if (!$currentStep) {
            return false;
        }

        // If no specific approver is set, any user can approve
        if (!$currentStep->approver_id) {
            return true;
        }

        return $currentStep->approver_id === $userId;
    }

    /**
     * Get the time elapsed since request.
     */
    public function getElapsedTime()
    {
        if ($this->completed_at) {
            return $this->requested_at->diffForHumans($this->completed_at);
        }

        return $this->requested_at->diffForHumans();
    }

    /**
     * Scope for pending requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for requests that can be approved by a user.
     */
    public function scopeApprovableBy($query, $userId)
    {
        return $query->pending()
            ->whereHas('steps', function ($stepQuery) use ($userId) {
                $stepQuery->where('status', 'pending')
                    ->where(function ($q) use ($userId) {
                        $q->where('approver_id', $userId)
                          ->orWhereNull('approver_id');
                    });
            });
    }
}
