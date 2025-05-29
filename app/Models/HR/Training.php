<?php

namespace App\Models\HR;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Training extends Model
{
    use HasFactory;

    protected $table = 'hr_trainings';

    protected $fillable = [
        'title',
        'description',
        'type',
        'category',
        'instructor_id',
        'provider',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'location',
        'mode',
        'max_participants',
        'enrolled_count',
        'cost_per_participant',
        'currency',
        'prerequisites',
        'learning_objectives',
        'materials',
        'status',
        'is_mandatory',
        'requires_certification',
        'certification_validity_months',
        'attachments',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'cost_per_participant' => 'decimal:2',
        'materials' => 'array',
        'is_mandatory' => 'boolean',
        'requires_certification' => 'boolean',
        'attachments' => 'array',
    ];

    /**
     * Get the instructor for this training.
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * Get the enrollments for this training.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(TrainingEnrollment::class, 'training_id');
    }

    /**
     * Scope to get scheduled trainings.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope to get ongoing trainings.
     */
    public function scopeOngoing($query)
    {
        return $query->where('status', 'ongoing');
    }

    /**
     * Scope to get completed trainings.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to get mandatory trainings.
     */
    public function scopeMandatory($query)
    {
        return $query->where('is_mandatory', true);
    }

    /**
     * Scope to get trainings by category.
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to get trainings by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Check if training is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if training is ongoing.
     */
    public function isOngoing(): bool
    {
        return $this->status === 'ongoing';
    }

    /**
     * Check if training is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if training is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if training has available spots.
     */
    public function hasAvailableSpots(): bool
    {
        if (!$this->max_participants) {
            return true; // No limit
        }

        return $this->enrolled_count < $this->max_participants;
    }

    /**
     * Check if employee can enroll.
     */
    public function canEnroll(Employee $employee): bool
    {
        // Check if training is scheduled
        if (!$this->isScheduled()) {
            return false;
        }

        // Check if there are available spots
        if (!$this->hasAvailableSpots()) {
            return false;
        }

        // Check if employee is already enrolled
        if ($this->enrollments()->where('employee_id', $employee->id)->exists()) {
            return false;
        }

        // Check prerequisites (simplified - can be extended)
        if ($this->prerequisites) {
            // Implement prerequisite checking logic here
        }

        return true;
    }

    /**
     * Enroll an employee in the training.
     */
    public function enrollEmployee(Employee $employee): ?TrainingEnrollment
    {
        if (!$this->canEnroll($employee)) {
            return null;
        }

        $enrollment = $this->enrollments()->create([
            'employee_id' => $employee->id,
            'enrolled_at' => now(),
            'status' => 'enrolled',
        ]);

        $this->increment('enrolled_count');

        return $enrollment;
    }

    /**
     * Start the training.
     */
    public function start(): bool
    {
        if (!$this->isScheduled()) {
            return false;
        }

        $this->update(['status' => 'ongoing']);

        // Update enrollments to in_progress
        $this->enrollments()->where('status', 'enrolled')->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return true;
    }

    /**
     * Complete the training.
     */
    public function complete(): bool
    {
        if (!$this->isOngoing()) {
            return false;
        }

        $this->update(['status' => 'completed']);

        return true;
    }

    /**
     * Get completion rate.
     */
    public function getCompletionRateAttribute(): float
    {
        $totalEnrollments = $this->enrollments()->count();
        
        if ($totalEnrollments === 0) {
            return 0;
        }

        $completedEnrollments = $this->enrollments()->where('status', 'completed')->count();

        return round(($completedEnrollments / $totalEnrollments) * 100, 2);
    }

    /**
     * Get average score.
     */
    public function getAverageScoreAttribute(): ?float
    {
        $scores = $this->enrollments()
            ->whereNotNull('score')
            ->pluck('score');

        if ($scores->isEmpty()) {
            return null;
        }

        return round($scores->avg(), 2);
    }

    /**
     * Get duration in days.
     */
    public function getDurationInDaysAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    /**
     * Get total cost.
     */
    public function getTotalCostAttribute(): float
    {
        return $this->cost_per_participant * $this->enrolled_count;
    }

    /**
     * Check if training is upcoming.
     */
    public function isUpcoming(): bool
    {
        return $this->start_date->isFuture();
    }

    /**
     * Check if training is past.
     */
    public function isPast(): bool
    {
        return $this->end_date->isPast();
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($training) {
            // Auto-update status based on dates
            if ($training->start_date->isFuture()) {
                $training->status = 'scheduled';
            } elseif ($training->start_date->isPast() && $training->end_date->isFuture()) {
                if ($training->status === 'scheduled') {
                    $training->status = 'ongoing';
                }
            } elseif ($training->end_date->isPast()) {
                if (in_array($training->status, ['scheduled', 'ongoing'])) {
                    $training->status = 'completed';
                }
            }
        });
    }
}
