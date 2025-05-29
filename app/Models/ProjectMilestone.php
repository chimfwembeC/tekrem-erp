<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ProjectMilestone extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'name',
        'description',
        'due_date',
        'completion_date',
        'progress',
        'status',
        'priority',
        'assigned_to',
        'dependencies',
        'order',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'due_date' => 'date',
        'completion_date' => 'date',
        'progress' => 'integer',
        'dependencies' => 'array',
        'order' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Get the project that owns the milestone.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user assigned to the milestone.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the files for the milestone.
     */
    public function files(): HasMany
    {
        return $this->hasMany(ProjectFile::class, 'milestone_id');
    }

    /**
     * Get the time logs for the milestone.
     */
    public function timeLogs(): HasMany
    {
        return $this->hasMany(ProjectTimeLog::class, 'milestone_id');
    }

    /**
     * Get the milestones that this milestone depends on.
     */
    public function dependentMilestones()
    {
        if (!$this->dependencies) {
            return collect();
        }

        return static::whereIn('id', $this->dependencies)->get();
    }

    /**
     * Get the milestones that depend on this milestone.
     */
    public function blockingMilestones()
    {
        return static::where('project_id', $this->project_id)
                    ->whereJsonContains('dependencies', $this->id)
                    ->get();
    }

    /**
     * Get the status color attribute.
     */
    protected function statusColor(): Attribute
    {
        return Attribute::make(
            get: fn () => match ($this->status) {
                'pending' => 'bg-gray-100 text-gray-800',
                'in-progress' => 'bg-blue-100 text-blue-800',
                'completed' => 'bg-green-100 text-green-800',
                'overdue' => 'bg-red-100 text-red-800',
                default => 'bg-gray-100 text-gray-800',
            }
        );
    }

    /**
     * Check if the milestone is overdue.
     */
    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->due_date && $this->due_date->isPast() && $this->status !== 'completed'
        );
    }

    /**
     * Get the days remaining until due date.
     */
    protected function daysRemaining(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->due_date ? now()->diffInDays($this->due_date, false) : null
        );
    }

    /**
     * Check if the milestone can start based on dependencies.
     */
    protected function canStart(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->dependencies) {
                    return true;
                }

                $dependentMilestones = $this->dependentMilestones();
                return $dependentMilestones->every(fn($milestone) => $milestone->status === 'completed');
            }
        );
    }

    /**
     * Mark the milestone as completed.
     */
    public function markCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'progress' => 100,
            'completion_date' => now(),
        ]);

        // Update project progress
        $this->project->updateProgress();

        // Check if all milestones are completed to mark project as completed
        $this->checkProjectCompletion();
    }

    /**
     * Check if all project milestones are completed and update project status.
     */
    protected function checkProjectCompletion(): void
    {
        $project = $this->project;
        $allMilestonesCompleted = $project->milestones()
            ->where('status', '!=', 'completed')
            ->doesntExist();

        if ($allMilestonesCompleted && $project->status !== 'completed') {
            $project->update(['status' => 'completed', 'progress' => 100]);
        }
    }

    /**
     * Update milestone status based on progress and due date.
     */
    public function updateStatus(): void
    {
        if ($this->progress >= 100) {
            $this->markCompleted();
            return;
        }

        if ($this->is_overdue) {
            $this->update(['status' => 'overdue']);
            return;
        }

        if ($this->progress > 0) {
            $this->update(['status' => 'in-progress']);
            return;
        }

        if ($this->can_start) {
            // Keep current status if it's already in-progress or pending
            if (!in_array($this->status, ['in-progress', 'pending'])) {
                $this->update(['status' => 'pending']);
            }
        }
    }

    /**
     * Scope a query to only include milestones of a specific status.
     */
    public function scopeOfStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include overdue milestones.
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
                    ->where('status', '!=', 'completed');
    }

    /**
     * Scope a query to only include completed milestones.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include milestones that can start.
     */
    public function scopeCanStart($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('dependencies')
              ->orWhere('dependencies', '[]');
        });
    }
}
