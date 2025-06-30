<?php

namespace App\Models\SocialMedia;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InstagramAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'instagram_account_id',
        'username',
        'name',
        'profile_picture_url',
        'followers_count',
        'follows_count',
        'media_count',
        'biography',
        'website',
        'access_token',
        'is_active',
        'last_sync_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_sync_at' => 'datetime',
        'followers_count' => 'integer',
        'follows_count' => 'integer',
        'media_count' => 'integer',
    ];

    /**
     * Get the media for this Instagram account.
     */
    public function media(): HasMany
    {
        return $this->hasMany(InstagramMedia::class, 'account_id', 'instagram_account_id');
    }

    /**
     * Get the social posts for this Instagram account.
     */
    public function socialPosts(): HasMany
    {
        return $this->hasMany(SocialPost::class, 'platform_account_id', 'instagram_account_id')
                    ->where('platform', 'instagram');
    }

    /**
     * Scope for active accounts.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the account's engagement rate.
     */
    public function getEngagementRateAttribute(): float
    {
        if ($this->followers_count === 0) {
            return 0;
        }

        $recentMedia = $this->media()
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        if ($recentMedia->isEmpty()) {
            return 0;
        }

        $totalEngagement = $recentMedia->sum(function ($media) {
            return $media->like_count + $media->comments_count;
        });

        $avgEngagement = $totalEngagement / $recentMedia->count();
        
        return round(($avgEngagement / $this->followers_count) * 100, 2);
    }

    /**
     * Get the account's recent performance.
     */
    public function getRecentPerformance(): array
    {
        $recentMedia = $this->media()
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->get();

        return [
            'total_posts' => $recentMedia->count(),
            'total_likes' => $recentMedia->sum('like_count'),
            'total_comments' => $recentMedia->sum('comments_count'),
            'avg_likes' => $recentMedia->avg('like_count'),
            'avg_comments' => $recentMedia->avg('comments_count'),
            'engagement_rate' => $this->engagement_rate,
        ];
    }
}
