<?php

namespace App\Models\HR;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Performance extends Model
{
    use HasFactory;

    protected $table = 'hr_performances';

    protected $fillable = [
        'employee_id',
        'reviewer_id',
        'review_period',
        'review_start_date',
        'review_end_date',
        'due_date',
        'status',
        'goals',
        'achievements',
        'areas_for_improvement',
        'development_plan',
        'overall_rating',
        'ratings',
        'employee_comments',
        'reviewer_comments',
        'manager_comments',
        'is_self_review',
        'submitted_at',
        'completed_at',
        'attachments',
    ];

    protected $casts = [
        'review_start_date' => 'date',
        'review_end_date' => 'date',
        'due_date' => 'date',
        'overall_rating' => 'decimal:2',
        'ratings' => 'array',
        'is_self_review' => 'boolean',
        'submitted_at' => 'datetime',
        'completed_at' => 'datetime',
        'attachments' => 'array',
    ];

    /**
     * Get the employee being reviewed.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    /**
     * Get the reviewer.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * Scope to get draft reviews.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope to get submitted reviews.
     */
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    /**
     * Scope to get reviews in review.
     */
    public function scopeInReview($query)
    {
        return $query->where('status', 'in_review');
    }

    /**
     * Scope to get completed reviews.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to get overdue reviews.
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
                    ->whereNotIn('status', ['completed', 'cancelled']);
    }

    /**
     * Scope to get self reviews.
     */
    public function scopeSelfReview($query)
    {
        return $query->where('is_self_review', true);
    }

    /**
     * Check if review is draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if review is submitted.
     */
    public function isSubmitted(): bool
    {
        return $this->status === 'submitted';
    }

    /**
     * Check if review is in review.
     */
    public function isInReview(): bool
    {
        return $this->status === 'in_review';
    }

    /**
     * Check if review is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if review is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->due_date->isPast() && !$this->isCompleted();
    }

    /**
     * Check if review can be edited.
     */
    public function canBeEdited(): bool
    {
        return $this->isDraft() || $this->isSubmitted();
    }

    /**
     * Submit the review.
     */
    public function submit(): bool
    {
        if (!$this->isDraft()) {
            return false;
        }

        $this->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return true;
    }

    /**
     * Start review process.
     */
    public function startReview(): bool
    {
        if (!$this->isSubmitted()) {
            return false;
        }

        $this->update(['status' => 'in_review']);

        return true;
    }

    /**
     * Complete the review.
     */
    public function complete(): bool
    {
        if (!$this->isInReview()) {
            return false;
        }

        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return true;
    }

    /**
     * Calculate overall rating from individual ratings.
     */
    public function calculateOverallRating(): float
    {
        if (!$this->ratings || empty($this->ratings)) {
            return 0;
        }

        $total = 0;
        $count = 0;

        foreach ($this->ratings as $category => $rating) {
            if (is_numeric($rating)) {
                $total += $rating;
                $count++;
            }
        }

        return $count > 0 ? round($total / $count, 2) : 0;
    }

    /**
     * Get performance rating label.
     */
    public function getRatingLabelAttribute(): string
    {
        $rating = $this->overall_rating;

        if ($rating >= 4.5) return 'Exceptional';
        if ($rating >= 4.0) return 'Exceeds Expectations';
        if ($rating >= 3.0) return 'Meets Expectations';
        if ($rating >= 2.0) return 'Below Expectations';
        if ($rating >= 1.0) return 'Unsatisfactory';

        return 'Not Rated';
    }

    /**
     * Get days until due date.
     */
    public function getDaysUntilDueAttribute(): int
    {
        return now()->diffInDays($this->due_date, false);
    }

    /**
     * Get review progress percentage.
     */
    public function getProgressPercentageAttribute(): int
    {
        switch ($this->status) {
            case 'draft':
                return 25;
            case 'submitted':
                return 50;
            case 'in_review':
                return 75;
            case 'completed':
                return 100;
            default:
                return 0;
        }
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($performance) {
            // Auto-calculate overall rating if ratings are provided
            if ($performance->ratings && !$performance->overall_rating) {
                $performance->overall_rating = $performance->calculateOverallRating();
            }
        });
    }
}
