<?php

namespace App\Models\HR;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingEnrollment extends Model
{
    use HasFactory;

    protected $table = 'hr_training_enrollments';

    protected $fillable = [
        'training_id',
        'employee_id',
        'enrolled_at',
        'status',
        'progress_percentage',
        'started_at',
        'completed_at',
        'score',
        'passed',
        'feedback',
        'assessments',
        'certificate_issued',
        'certificate_number',
        'certificate_expiry',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'score' => 'decimal:2',
        'passed' => 'boolean',
        'assessments' => 'array',
        'certificate_issued' => 'boolean',
        'certificate_expiry' => 'date',
    ];

    /**
     * Get the training for this enrollment.
     */
    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class, 'training_id');
    }

    /**
     * Get the employee for this enrollment.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    /**
     * Scope to get enrolled enrollments.
     */
    public function scopeEnrolled($query)
    {
        return $query->where('status', 'enrolled');
    }

    /**
     * Scope to get in progress enrollments.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope to get completed enrollments.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to get dropped enrollments.
     */
    public function scopeDropped($query)
    {
        return $query->where('status', 'dropped');
    }

    /**
     * Scope to get failed enrollments.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Check if enrollment is enrolled.
     */
    public function isEnrolled(): bool
    {
        return $this->status === 'enrolled';
    }

    /**
     * Check if enrollment is in progress.
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if enrollment is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if enrollment is dropped.
     */
    public function isDropped(): bool
    {
        return $this->status === 'dropped';
    }

    /**
     * Check if enrollment is failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Start the training for this enrollment.
     */
    public function start(): bool
    {
        if (!$this->isEnrolled()) {
            return false;
        }

        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return true;
    }

    /**
     * Complete the training for this enrollment.
     */
    public function complete(float $score = null, bool $passed = null): bool
    {
        if (!$this->isInProgress()) {
            return false;
        }

        $updateData = [
            'status' => 'completed',
            'completed_at' => now(),
            'progress_percentage' => 100,
        ];

        if ($score !== null) {
            $updateData['score'] = $score;
        }

        if ($passed !== null) {
            $updateData['passed'] = $passed;
        } elseif ($score !== null) {
            // Auto-determine pass/fail based on score (assuming 70% is passing)
            $updateData['passed'] = $score >= 70;
        }

        $this->update($updateData);

        // Issue certificate if training requires it and employee passed
        if ($this->training->requires_certification && ($this->passed ?? true)) {
            $this->issueCertificate();
        }

        return true;
    }

    /**
     * Drop the enrollment.
     */
    public function drop(): bool
    {
        if ($this->isCompleted()) {
            return false;
        }

        $this->update(['status' => 'dropped']);

        // Decrement enrollment count
        $this->training->decrement('enrolled_count');

        return true;
    }

    /**
     * Mark as failed.
     */
    public function fail(string $reason = null): bool
    {
        if (!$this->isInProgress()) {
            return false;
        }

        $updateData = [
            'status' => 'failed',
            'passed' => false,
        ];

        if ($reason) {
            $updateData['feedback'] = $reason;
        }

        $this->update($updateData);

        return true;
    }

    /**
     * Update progress percentage.
     */
    public function updateProgress(int $percentage): bool
    {
        if (!$this->isInProgress() || $percentage < 0 || $percentage > 100) {
            return false;
        }

        $this->update(['progress_percentage' => $percentage]);

        // Auto-complete if 100%
        if ($percentage === 100) {
            $this->complete();
        }

        return true;
    }

    /**
     * Issue certificate.
     */
    public function issueCertificate(): bool
    {
        if (!$this->isCompleted() || !($this->passed ?? true)) {
            return false;
        }

        $certificateNumber = $this->generateCertificateNumber();
        $expiryDate = null;

        if ($this->training->certification_validity_months) {
            $expiryDate = now()->addMonths($this->training->certification_validity_months);
        }

        $this->update([
            'certificate_issued' => true,
            'certificate_number' => $certificateNumber,
            'certificate_expiry' => $expiryDate,
        ]);

        return true;
    }

    /**
     * Generate certificate number.
     */
    private function generateCertificateNumber(): string
    {
        $prefix = 'CERT';
        $year = date('Y');
        $trainingId = str_pad($this->training_id, 4, '0', STR_PAD_LEFT);
        $employeeId = str_pad($this->employee_id, 4, '0', STR_PAD_LEFT);
        $timestamp = time();

        return "{$prefix}-{$year}-{$trainingId}-{$employeeId}-{$timestamp}";
    }

    /**
     * Check if certificate is expired.
     */
    public function isCertificateExpired(): bool
    {
        return $this->certificate_expiry && $this->certificate_expiry->isPast();
    }

    /**
     * Get grade based on score.
     */
    public function getGradeAttribute(): ?string
    {
        if (!$this->score) {
            return null;
        }

        $score = $this->score;

        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';

        return 'F';
    }

    /**
     * Get status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'enrolled' => 'Enrolled',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'dropped' => 'Dropped',
            'failed' => 'Failed',
            default => 'Unknown'
        };
    }

    /**
     * Get progress bar color.
     */
    public function getProgressColorAttribute(): string
    {
        return match($this->status) {
            'enrolled' => 'blue',
            'in_progress' => 'yellow',
            'completed' => 'green',
            'dropped' => 'gray',
            'failed' => 'red',
            default => 'gray'
        };
    }
}
