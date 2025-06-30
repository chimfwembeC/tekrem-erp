<?php

namespace App\Models\SocialMedia;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LinkedInCompany extends Model
{
    use HasFactory;

    protected $fillable = [
        'linkedin_company_id',
        'name',
        'description',
        'logo_url',
        'website_url',
        'industries',
        'specialties',
        'founded_on',
        'locations',
        'follower_count',
        'employee_count',
        'access_token',
        'is_active',
        'last_sync_at',
    ];

    protected $casts = [
        'industries' => 'array',
        'specialties' => 'array',
        'locations' => 'array',
        'founded_on' => 'date',
        'is_active' => 'boolean',
        'last_sync_at' => 'datetime',
        'follower_count' => 'integer',
        'employee_count' => 'integer',
    ];

    /**
     * Get the social posts for this LinkedIn company.
     */
    public function socialPosts(): HasMany
    {
        return $this->hasMany(SocialPost::class, 'platform_account_id', 'linkedin_company_id')
                    ->where('platform', 'linkedin');
    }

    /**
     * Get the leads generated from this LinkedIn company.
     */
    public function leads(): HasMany
    {
        return $this->hasMany(LinkedInLead::class, 'company_id', 'linkedin_company_id');
    }

    /**
     * Scope for active companies.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the company's recent performance.
     */
    public function getRecentPerformance(): array
    {
        $recentPosts = $this->socialPosts()
            ->where('created_at', '>=', now()->subDays(30))
            ->where('status', SocialPost::STATUS_PUBLISHED)
            ->get();

        return [
            'total_posts' => $recentPosts->count(),
            'total_likes' => $recentPosts->sum('likes_count'),
            'total_comments' => $recentPosts->sum('comments_count'),
            'total_shares' => $recentPosts->sum('shares_count'),
            'total_impressions' => $recentPosts->sum('impressions'),
            'avg_engagement' => $recentPosts->avg('engagement_rate'),
        ];
    }

    /**
     * Get the company's engagement rate.
     */
    public function getEngagementRateAttribute(): float
    {
        if ($this->follower_count === 0) {
            return 0;
        }

        $recentPosts = $this->socialPosts()
            ->where('created_at', '>=', now()->subDays(30))
            ->where('status', SocialPost::STATUS_PUBLISHED)
            ->get();

        if ($recentPosts->isEmpty()) {
            return 0;
        }

        $totalEngagement = $recentPosts->sum(function ($post) {
            return $post->likes_count + $post->comments_count + $post->shares_count;
        });

        $avgEngagement = $totalEngagement / $recentPosts->count();
        
        return round(($avgEngagement / $this->follower_count) * 100, 2);
    }

    /**
     * Get the company's top performing posts.
     */
    public function getTopPerformingPosts(int $limit = 5): \Illuminate\Database\Eloquent\Collection
    {
        return $this->socialPosts()
            ->where('status', SocialPost::STATUS_PUBLISHED)
            ->orderByRaw('(likes_count + comments_count + shares_count) DESC')
            ->limit($limit)
            ->get();
    }

    /**
     * Get the company's posting frequency.
     */
    public function getPostingFrequency(int $days = 30): array
    {
        $posts = $this->socialPosts()
            ->where('created_at', '>=', now()->subDays($days))
            ->where('status', SocialPost::STATUS_PUBLISHED)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'total_posts' => $posts->sum('count'),
            'avg_posts_per_day' => round($posts->avg('count'), 2),
            'daily_breakdown' => $posts->toArray(),
        ];
    }

    /**
     * Check if company has recent activity.
     */
    public function hasRecentActivity(int $days = 7): bool
    {
        return $this->socialPosts()
            ->where('created_at', '>=', now()->subDays($days))
            ->exists();
    }

    /**
     * Get company URN for LinkedIn API.
     */
    public function getUrnAttribute(): string
    {
        return "urn:li:organization:{$this->linkedin_company_id}";
    }

    /**
     * Get formatted industries string.
     */
    public function getFormattedIndustriesAttribute(): string
    {
        if (!$this->industries || empty($this->industries)) {
            return 'Not specified';
        }

        return implode(', ', $this->industries);
    }

    /**
     * Get formatted specialties string.
     */
    public function getFormattedSpecialtiesAttribute(): string
    {
        if (!$this->specialties || empty($this->specialties)) {
            return 'Not specified';
        }

        return implode(', ', $this->specialties);
    }

    /**
     * Get primary location.
     */
    public function getPrimaryLocationAttribute(): ?string
    {
        if (!$this->locations || empty($this->locations)) {
            return null;
        }

        $primaryLocation = collect($this->locations)->first();
        
        if (!$primaryLocation) {
            return null;
        }

        $parts = [];
        
        if (isset($primaryLocation['city'])) {
            $parts[] = $primaryLocation['city'];
        }
        
        if (isset($primaryLocation['country'])) {
            $parts[] = $primaryLocation['country'];
        }

        return implode(', ', $parts);
    }
}
