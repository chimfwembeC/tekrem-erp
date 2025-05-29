<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ProjectTask extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'milestone_id',
        'title',
        'description',
        'type',
        'status',
        'priority',
        'assigned_to',
        'created_by',
        'due_date',
        'start_date',
        'completed_date',
        'progress',
        'estimated_hours',
        'actual_hours',
        'dependencies',
        'parent_task_id',
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
        'start_date' => 'date',
        'completed_date' => 'date',
        'progress' => 'integer',
        'estimated_hours' => 'decimal:2',
        'actual_hours' => 'decimal:2',
        'dependencies' => 'array',
        'order' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Get the project that owns the task.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the milestone that owns the task.
     */
    public function milestone(): BelongsTo
    {
        return $this->belongsTo(ProjectMilestone::class, 'milestone_id');
    }

    /**
     * Get the user assigned to the task.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who created the task.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the parent task.
     */
    public function parentTask(): BelongsTo
    {
        return $this->belongsTo(ProjectTask::class, 'parent_task_id');
    }

    /**
     * Get the child tasks (subtasks).
     */
    public function subtasks(): HasMany
    {
        return $this->hasMany(ProjectTask::class, 'parent_task_id');
    }

    /**
     * Get the tags for the task.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'project_task_tags');
    }

    /**
     * Get the time logs for the task.
     */
    public function timeLogs(): HasMany
    {
        return $this->hasMany(ProjectTimeLog::class, 'task_id');
    }

    /**
     * Get the status color attribute.
     */
    protected function statusColor(): Attribute
    {
        return Attribute::make(
            get: fn () => match ($this->status) {
                'todo' => 'bg-gray-100 text-gray-800',
                'in-progress' => 'bg-blue-100 text-blue-800',
                'review' => 'bg-yellow-100 text-yellow-800',
                'testing' => 'bg-purple-100 text-purple-800',
                'done' => 'bg-green-100 text-green-800',
                'cancelled' => 'bg-red-100 text-red-800',
                default => 'bg-gray-100 text-gray-800',
            }
        );
    }

    /**
     * Get the priority color attribute.
     */
    protected function priorityColor(): Attribute
    {
        return Attribute::make(
            get: fn () => match ($this->priority) {
                'low' => 'bg-green-100 text-green-800',
                'medium' => 'bg-yellow-100 text-yellow-800',
                'high' => 'bg-orange-100 text-orange-800',
                'critical' => 'bg-red-100 text-red-800',
                default => 'bg-gray-100 text-gray-800',
            }
        );
    }

    /**
     * Get the type color attribute.
     */
    protected function typeColor(): Attribute
    {
        return Attribute::make(
            get: fn () => match ($this->type) {
                'task' => 'bg-blue-100 text-blue-800',
                'issue' => 'bg-red-100 text-red-800',
                'bug' => 'bg-red-100 text-red-800',
                'feature' => 'bg-green-100 text-green-800',
                'improvement' => 'bg-purple-100 text-purple-800',
                default => 'bg-gray-100 text-gray-800',
            }
        );
    }

    /**
     * Check if the task is overdue.
     */
    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->due_date && $this->due_date->isPast() && !in_array($this->status, ['done', 'cancelled'])
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
     * Check if the task can start based on dependencies.
     */
    protected function canStart(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->dependencies) {
                    return true;
                }

                $dependentTasks = static::whereIn('id', $this->dependencies)->get();
                return $dependentTasks->every(fn($task) => $task->status === 'done');
            }
        );
    }

    /**
     * Mark the task as completed.
     */
    public function markCompleted(): void
    {
        $this->update([
            'status' => 'done',
            'progress' => 100,
            'completed_date' => now(),
        ]);

        // Update milestone progress if task belongs to a milestone
        if ($this->milestone) {
            $this->milestone->updateProgress();
        }

        // Update project progress
        $this->project->updateProgress();
    }

    /**
     * Update task status based on progress.
     */
    public function updateStatus(): void
    {
        if ($this->progress >= 100) {
            $this->markCompleted();
            return;
        }

        if ($this->is_overdue && !in_array($this->status, ['done', 'cancelled'])) {
            // Don't automatically change status for overdue tasks
            return;
        }

        if ($this->progress > 0 && $this->status === 'todo') {
            $this->update(['status' => 'in-progress']);
        }
    }

    /**
     * Scope a query to only include tasks of a specific status.
     */
    public function scopeOfStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include tasks of a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include overdue tasks.
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
                    ->whereNotIn('status', ['done', 'cancelled']);
    }

    /**
     * Scope a query to only include tasks assigned to a specific user.
     */
    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope a query to only include tasks that can start.
     */
    public function scopeCanStart($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('dependencies')
              ->orWhere('dependencies', '[]');
        });
    }
}
