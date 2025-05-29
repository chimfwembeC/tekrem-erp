<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ProjectTimeLog extends Model
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
        'user_id',
        'description',
        'hours',
        'log_date',
        'is_billable',
        'hourly_rate',
        'status',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'hours' => 'decimal:2',
        'log_date' => 'date',
        'is_billable' => 'boolean',
        'hourly_rate' => 'decimal:2',
        'metadata' => 'array',
    ];

    /**
     * Get the project that owns the time log.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the milestone that owns the time log.
     */
    public function milestone(): BelongsTo
    {
        return $this->belongsTo(ProjectMilestone::class, 'milestone_id');
    }

    /**
     * Get the user who logged the time.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the total amount for this time log.
     */
    protected function totalAmount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->is_billable && $this->hourly_rate 
                ? $this->hours * $this->hourly_rate 
                : 0
        );
    }

    /**
     * Get the status color attribute.
     */
    protected function statusColor(): Attribute
    {
        return Attribute::make(
            get: fn () => match ($this->status) {
                'draft' => 'bg-gray-100 text-gray-800',
                'submitted' => 'bg-blue-100 text-blue-800',
                'approved' => 'bg-green-100 text-green-800',
                'invoiced' => 'bg-purple-100 text-purple-800',
                default => 'bg-gray-100 text-gray-800',
            }
        );
    }

    /**
     * Submit the time log for approval.
     */
    public function submit(): void
    {
        $this->update(['status' => 'submitted']);
    }

    /**
     * Approve the time log.
     */
    public function approve(): void
    {
        $this->update(['status' => 'approved']);
    }

    /**
     * Mark the time log as invoiced.
     */
    public function markInvoiced(): void
    {
        $this->update(['status' => 'invoiced']);
    }

    /**
     * Scope a query to only include billable time logs.
     */
    public function scopeBillable($query)
    {
        return $query->where('is_billable', true);
    }

    /**
     * Scope a query to only include time logs of a specific status.
     */
    public function scopeOfStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include approved time logs.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include time logs for a specific date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('log_date', [$startDate, $endDate]);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();
        
        static::saved(function ($timeLog) {
            // Update project spent amount when time log is saved
            $timeLog->project->updateSpentAmount();
        });
        
        static::deleted(function ($timeLog) {
            // Update project spent amount when time log is deleted
            $timeLog->project->updateSpentAmount();
        });
    }
}
