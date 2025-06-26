<?php

namespace App\Models\Guest;

use App\Models\User;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class GuestProjectInquiry extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'reference_number',
        'name',
        'email',
        'phone',
        'company',
        'position',
        'project_type',
        'project_category',
        'project_title',
        'project_description',
        'project_goals',
        'target_audience',
        'features_required',
        'features_nice_to_have',
        'budget_range',
        'timeline',
        'preferred_start_date',
        'required_completion_date',
        'has_existing_system',
        'existing_system_details',
        'requires_maintenance',
        'requires_hosting',
        'requires_training',
        'technology_preferences',
        'design_preferences',
        'reference_websites',
        'priority',
        'status',
        'assigned_to',
        'project_id',
        'proposal_sent_at',
        'source',
        'metadata',
        'ip_address',
        'user_agent',
        'internal_notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'project_goals' => 'array',
        'target_audience' => 'array',
        'features_required' => 'array',
        'features_nice_to_have' => 'array',
        'technology_preferences' => 'array',
        'design_preferences' => 'array',
        'reference_websites' => 'array',
        'preferred_start_date' => 'date',
        'required_completion_date' => 'date',
        'has_existing_system' => 'boolean',
        'requires_maintenance' => 'boolean',
        'requires_hosting' => 'boolean',
        'requires_training' => 'boolean',
        'proposal_sent_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($inquiry) {
            if (empty($inquiry->reference_number)) {
                $inquiry->reference_number = 'PI-' . strtoupper(Str::random(8));
            }
            
            if (empty($inquiry->ip_address)) {
                $inquiry->ip_address = request()->ip();
            }
            
            if (empty($inquiry->user_agent)) {
                $inquiry->user_agent = request()->userAgent();
            }
        });
    }

    /**
     * Get the assigned user.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the related project.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Scope a query to only include inquiries of a specific project type.
     */
    public function scopeOfProjectType($query, $projectType)
    {
        return $query->where('project_type', $projectType);
    }

    /**
     * Scope a query to only include inquiries with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include unassigned inquiries.
     */
    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    /**
     * Scope a query to only include inquiries with proposals sent.
     */
    public function scopeProposalSent($query)
    {
        return $query->whereNotNull('proposal_sent_at');
    }

    /**
     * Assign inquiry to a user.
     */
    public function assignTo(User $user)
    {
        $this->update([
            'assigned_to' => $user->id,
            'status' => 'reviewing'
        ]);
    }

    /**
     * Mark proposal as sent.
     */
    public function markProposalSent()
    {
        $this->update([
            'proposal_sent_at' => now(),
            'status' => 'proposal_sent'
        ]);
    }

    /**
     * Get the priority color for UI display.
     */
    public function getPriorityColorAttribute()
    {
        return match($this->priority) {
            'low' => 'green',
            'normal' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get the status color for UI display.
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'new' => 'blue',
            'reviewing' => 'yellow',
            'proposal_sent' => 'purple',
            'accepted' => 'green',
            'rejected' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get formatted display name.
     */
    public function getDisplayNameAttribute()
    {
        $name = $this->name;
        if ($this->company) {
            $name .= " ({$this->company})";
        }
        return $name;
    }

    /**
     * Get formatted budget range.
     */
    public function getFormattedBudgetRangeAttribute()
    {
        return match($this->budget_range) {
            'under_5k' => 'Under $5,000',
            '5k_10k' => '$5,000 - $10,000',
            '10k_25k' => '$10,000 - $25,000',
            '25k_50k' => '$25,000 - $50,000',
            '50k_plus' => '$50,000+',
            default => 'Not specified'
        };
    }

    /**
     * Get formatted timeline.
     */
    public function getFormattedTimelineAttribute()
    {
        return match($this->timeline) {
            'asap' => 'ASAP',
            '1_month' => '1 Month',
            '3_months' => '3 Months',
            '6_months' => '6 Months',
            'flexible' => 'Flexible',
            default => 'Not specified'
        };
    }

    /**
     * Get estimated project complexity.
     */
    public function getEstimatedComplexityAttribute()
    {
        $score = 0;
        
        // Budget range scoring
        $score += match($this->budget_range) {
            'under_5k' => 1,
            '5k_10k' => 2,
            '10k_25k' => 3,
            '25k_50k' => 4,
            '50k_plus' => 5,
            default => 2
        };
        
        // Features scoring
        $requiredFeatures = count($this->features_required ?? []);
        $niceToHaveFeatures = count($this->features_nice_to_have ?? []);
        $score += min(5, ($requiredFeatures + $niceToHaveFeatures) / 2);
        
        // Additional requirements scoring
        if ($this->has_existing_system) $score += 1;
        if ($this->requires_maintenance) $score += 1;
        if ($this->requires_hosting) $score += 0.5;
        if ($this->requires_training) $score += 0.5;
        
        return match(true) {
            $score <= 3 => 'Simple',
            $score <= 6 => 'Medium',
            $score <= 9 => 'Complex',
            default => 'Very Complex'
        };
    }
}
