<?php

namespace App\Models\SocialMedia;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocialPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'platform',
        'platform_page_id',
        'platform_post_id',
        'title',
        'content',
        'media_urls',
        'link_url',
        'status',
        'scheduled_at',
        'published_at',
        'engagement_stats',
        'error_message'
    ];

    protected $casts = [
        'media_urls' => 'array',
        'scheduled_at' => 'datetime',
        'published_at' => 'datetime',
        'engagement_stats' => 'array'
    ];

    const STATUS_DRAFT = 'draft';
    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_PUBLISHED = 'published';
    const STATUS_FAILED = 'failed';

    const PLATFORMS = [
        'facebook' => 'Facebook',
        'instagram' => 'Instagram',
        'linkedin' => 'LinkedIn',
        'twitter' => 'Twitter'
    ];

    /**
     * Get the user who created this post
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for posts on a specific platform
     */
    public function scopePlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    /**
     * Scope for published posts
     */
    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    /**
     * Scope for scheduled posts
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    /**
     * Scope for draft posts
     */
    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    /**
     * Scope for failed posts
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope for posts ready to be published
     */
    public function scopeReadyToPublish($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED)
                    ->where('scheduled_at', '<=', now());
    }

    /**
     * Mark post as published
     */
    public function markAsPublished(string $platformPostId = null): void
    {
        $this->update([
            'status' => self::STATUS_PUBLISHED,
            'published_at' => now(),
            'platform_post_id' => $platformPostId
        ]);
    }

    /**
     * Mark post as failed
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'error_message' => $errorMessage
        ]);
    }

    /**
     * Update engagement statistics
     */
    public function updateEngagementStats(array $stats): void
    {
        $this->update(['engagement_stats' => $stats]);
    }

    /**
     * Get platform display name
     */
    public function getPlatformNameAttribute(): string
    {
        return self::PLATFORMS[$this->platform] ?? ucfirst($this->platform);
    }

    /**
     * Check if post has media
     */
    public function hasMedia(): bool
    {
        return !empty($this->media_urls);
    }

    /**
     * Get total engagement count
     */
    public function getTotalEngagementAttribute(): int
    {
        $stats = $this->engagement_stats ?? [];
        return ($stats['likes'] ?? 0) + 
               ($stats['comments'] ?? 0) + 
               ($stats['shares'] ?? 0) + 
               ($stats['reactions'] ?? 0);
    }
}
