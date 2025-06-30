<?php

namespace App\Models\SocialMedia;

use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LinkedInLead extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'linkedin_profile_id',
        'company_id',
        'first_name',
        'last_name',
        'headline',
        'profile_url',
        'profile_picture_url',
        'current_company',
        'current_position',
        'location',
        'industry',
        'connections_count',
        'summary',
        'skills',
        'experience',
        'education',
        'contact_info',
        'lead_source',
        'lead_score',
        'engagement_level',
        'last_activity_at',
        'is_processed',
    ];

    protected $casts = [
        'skills' => 'array',
        'experience' => 'array',
        'education' => 'array',
        'contact_info' => 'array',
        'last_activity_at' => 'datetime',
        'is_processed' => 'boolean',
        'connections_count' => 'integer',
        'lead_score' => 'integer',
    ];

    const ENGAGEMENT_LEVEL_LOW = 'low';
    const ENGAGEMENT_LEVEL_MEDIUM = 'medium';
    const ENGAGEMENT_LEVEL_HIGH = 'high';

    const LEAD_SOURCE_SEARCH = 'search';
    const LEAD_SOURCE_CONNECTION = 'connection';
    const LEAD_SOURCE_MESSAGE = 'message';
    const LEAD_SOURCE_POST_ENGAGEMENT = 'post_engagement';
    const LEAD_SOURCE_COMPANY_PAGE = 'company_page';

    /**
     * Get the CRM lead associated with this LinkedIn lead.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Get the LinkedIn company associated with this lead.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(LinkedInCompany::class, 'company_id', 'linkedin_company_id');
    }

    /**
     * Scope for high-value leads.
     */
    public function scopeHighValue($query)
    {
        return $query->where('lead_score', '>=', 80);
    }

    /**
     * Scope for unprocessed leads.
     */
    public function scopeUnprocessed($query)
    {
        return $query->where('is_processed', false);
    }

    /**
     * Scope for recent leads.
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope by engagement level.
     */
    public function scopeByEngagement($query, string $level)
    {
        return $query->where('engagement_level', $level);
    }

    /**
     * Get the lead's full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get the lead's professional title.
     */
    public function getProfessionalTitleAttribute(): string
    {
        $parts = [];
        
        if ($this->current_position) {
            $parts[] = $this->current_position;
        }
        
        if ($this->current_company) {
            $parts[] = "at {$this->current_company}";
        }

        return implode(' ', $parts) ?: 'Professional';
    }

    /**
     * Calculate lead score based on profile data.
     */
    public function calculateLeadScore(): int
    {
        $score = 0;

        // Base score for having a complete profile
        if ($this->first_name && $this->last_name) $score += 10;
        if ($this->headline) $score += 10;
        if ($this->current_company) $score += 15;
        if ($this->current_position) $score += 15;
        if ($this->profile_picture_url) $score += 5;

        // Connection count scoring
        if ($this->connections_count >= 500) {
            $score += 20;
        } elseif ($this->connections_count >= 100) {
            $score += 15;
        } elseif ($this->connections_count >= 50) {
            $score += 10;
        }

        // Skills and experience scoring
        if ($this->skills && count($this->skills) >= 5) $score += 10;
        if ($this->experience && count($this->experience) >= 2) $score += 10;
        if ($this->education && count($this->education) >= 1) $score += 5;

        // Engagement level scoring
        switch ($this->engagement_level) {
            case self::ENGAGEMENT_LEVEL_HIGH:
                $score += 20;
                break;
            case self::ENGAGEMENT_LEVEL_MEDIUM:
                $score += 10;
                break;
            case self::ENGAGEMENT_LEVEL_LOW:
                $score += 5;
                break;
        }

        return min($score, 100); // Cap at 100
    }

    /**
     * Update lead score.
     */
    public function updateLeadScore(): void
    {
        $this->update(['lead_score' => $this->calculateLeadScore()]);
    }

    /**
     * Check if lead is qualified.
     */
    public function isQualified(): bool
    {
        return $this->lead_score >= 60;
    }

    /**
     * Get formatted skills list.
     */
    public function getFormattedSkillsAttribute(): string
    {
        if (!$this->skills || empty($this->skills)) {
            return 'Not specified';
        }

        return implode(', ', array_slice($this->skills, 0, 5));
    }

    /**
     * Get current experience.
     */
    public function getCurrentExperienceAttribute(): ?array
    {
        if (!$this->experience || empty($this->experience)) {
            return null;
        }

        return collect($this->experience)
            ->sortByDesc('start_date')
            ->first();
    }

    /**
     * Get latest education.
     */
    public function getLatestEducationAttribute(): ?array
    {
        if (!$this->education || empty($this->education)) {
            return null;
        }

        return collect($this->education)
            ->sortByDesc('end_date')
            ->first();
    }

    /**
     * Mark as processed.
     */
    public function markAsProcessed(): void
    {
        $this->update(['is_processed' => true]);
    }

    /**
     * Get lead priority based on score and engagement.
     */
    public function getPriorityAttribute(): string
    {
        if ($this->lead_score >= 80 && $this->engagement_level === self::ENGAGEMENT_LEVEL_HIGH) {
            return 'urgent';
        } elseif ($this->lead_score >= 60) {
            return 'high';
        } elseif ($this->lead_score >= 40) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Get contact methods available.
     */
    public function getAvailableContactMethodsAttribute(): array
    {
        $methods = [];

        if ($this->contact_info && isset($this->contact_info['email'])) {
            $methods[] = 'email';
        }

        if ($this->contact_info && isset($this->contact_info['phone'])) {
            $methods[] = 'phone';
        }

        if ($this->profile_url) {
            $methods[] = 'linkedin';
        }

        return $methods;
    }
}
