<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Project extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'status',
        'priority',
        'category',
        'start_date',
        'end_date',
        'deadline',
        'budget',
        'spent_amount',
        'progress',
        'client_id',
        'manager_id',
        'team_members',
        'tags',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'deadline' => 'date',
        'budget' => 'decimal:2',
        'spent_amount' => 'decimal:2',
        'progress' => 'integer',
        'team_members' => 'array',
        'tags' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Get the client that owns the project.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the manager that owns the project.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the team members for the project.
     */
    public function team(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_team_members', 'project_id', 'user_id')
                    ->withPivot('role', 'joined_at')
                    ->withTimestamps();
    }

    /**
     * Get team members from the JSON array.
     */
    public function getTeamMembersUsersAttribute()
    {
        if (!$this->team_members) {
            return collect();
        }

        return User::whereIn('id', $this->team_members)->get();
    }

    /**
     * Get the milestones for the project.
     */
    public function milestones(): HasMany
    {
        return $this->hasMany(ProjectMilestone::class)->orderBy('order');
    }

    /**
     * Get the files for the project.
     */
    public function files(): HasMany
    {
        return $this->hasMany(ProjectFile::class);
    }

    /**
     * Get the time logs for the project.
     */
    public function timeLogs(): HasMany
    {
        return $this->hasMany(ProjectTimeLog::class);
    }

    /**
     * Get the tasks for the project.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(ProjectTask::class);
    }

    /**
     * Get the tags for the project.
     */
    public function projectTags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'project_tags');
    }

    /**
     * Get the conversations for the project.
     */
    public function conversations(): MorphMany
    {
        return $this->morphMany(Conversation::class, 'conversable');
    }

    /**
     * Get the expenses for the project.
     */
    public function expenses(): MorphMany
    {
        return $this->morphMany(\App\Models\Finance\Expense::class, 'expensable');
    }

    /**
     * Get the invoices for the project.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(\App\Models\Finance\Invoice::class);
    }

    /**
     * Get the status color attribute.
     */
    protected function statusColor(): Attribute
    {
        return Attribute::make(
            get: fn () => match ($this->status) {
                'draft' => 'bg-gray-100 text-gray-800',
                'active' => 'bg-blue-100 text-blue-800',
                'on-hold' => 'bg-yellow-100 text-yellow-800',
                'completed' => 'bg-green-100 text-green-800',
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
     * Get the progress color attribute.
     */
    protected function progressColor(): Attribute
    {
        return Attribute::make(
            get: fn () => match (true) {
                $this->progress >= 90 => 'bg-green-500',
                $this->progress >= 70 => 'bg-blue-500',
                $this->progress >= 50 => 'bg-yellow-500',
                $this->progress >= 25 => 'bg-orange-500',
                default => 'bg-red-500',
            }
        );
    }

    /**
     * Check if the project is overdue.
     */
    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->deadline && $this->deadline->isPast() && $this->status !== 'completed'
        );
    }

    /**
     * Get the days remaining until deadline.
     */
    protected function daysRemaining(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->deadline ? now()->diffInDays($this->deadline, false) : null
        );
    }

    /**
     * Calculate completion percentage based on milestones.
     */
    protected function completionPercentage(): Attribute
    {
        return Attribute::make(
            get: function () {
                $milestones = $this->milestones;
                if ($milestones->isEmpty()) {
                    return $this->progress;
                }

                $totalProgress = $milestones->sum('progress');
                return round($totalProgress / $milestones->count());
            }
        );
    }

    /**
     * Update project progress based on milestones.
     */
    public function updateProgress(): void
    {
        $this->update(['progress' => $this->completion_percentage]);
    }

    /**
     * Update spent amount from expenses and time logs.
     */
    public function updateSpentAmount(): void
    {
        $expenseAmount = $this->expenses()->sum('amount');
        $timeLogAmount = $this->timeLogs()
            ->where('is_billable', true)
            ->whereNotNull('hourly_rate')
            ->get()
            ->sum(fn($log) => $log->hours * $log->hourly_rate);

        $this->update(['spent_amount' => $expenseAmount + $timeLogAmount]);
    }

    /**
     * Scope a query to only include projects of a specific status.
     */
    public function scopeOfStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include projects of a specific priority.
     */
    public function scopeOfPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope a query to only include overdue projects.
     */
    public function scopeOverdue($query)
    {
        return $query->where('deadline', '<', now())
                    ->whereNotIn('status', ['completed', 'cancelled']);
    }

    /**
     * Scope a query to only include active projects.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
