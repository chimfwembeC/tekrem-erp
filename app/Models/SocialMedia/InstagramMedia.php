<?php

namespace App\Models\SocialMedia;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstagramMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'instagram_media_id',
        'account_id',
        'media_type',
        'media_url',
        'thumbnail_url',
        'caption',
        'permalink',
        'timestamp',
        'like_count',
        'comments_count',
        'impressions',
        'reach',
        'engagement',
        'saves',
        'profile_visits',
        'website_clicks',
        'last_sync_at',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'last_sync_at' => 'datetime',
        'like_count' => 'integer',
        'comments_count' => 'integer',
        'impressions' => 'integer',
        'reach' => 'integer',
        'engagement' => 'integer',
        'saves' => 'integer',
        'profile_visits' => 'integer',
        'website_clicks' => 'integer',
    ];

    const MEDIA_TYPE_IMAGE = 'IMAGE';
    const MEDIA_TYPE_VIDEO = 'VIDEO';
    const MEDIA_TYPE_CAROUSEL_ALBUM = 'CAROUSEL_ALBUM';

    /**
     * Get the Instagram account that owns this media.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(InstagramAccount::class, 'account_id', 'instagram_account_id');
    }

    /**
     * Scope for images only.
     */
    public function scopeImages($query)
    {
        return $query->where('media_type', self::MEDIA_TYPE_IMAGE);
    }

    /**
     * Scope for videos only.
     */
    public function scopeVideos($query)
    {
        return $query->where('media_type', self::MEDIA_TYPE_VIDEO);
    }

    /**
     * Scope for carousel albums only.
     */
    public function scopeCarousels($query)
    {
        return $query->where('media_type', self::MEDIA_TYPE_CAROUSEL_ALBUM);
    }

    /**
     * Scope for recent media.
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('timestamp', '>=', now()->subDays($days));
    }

    /**
     * Get the engagement rate for this media.
     */
    public function getEngagementRateAttribute(): float
    {
        if (!$this->reach || $this->reach === 0) {
            return 0;
        }

        $totalEngagement = $this->like_count + $this->comments_count;
        return round(($totalEngagement / $this->reach) * 100, 2);
    }

    /**
     * Get the media performance metrics.
     */
    public function getPerformanceMetrics(): array
    {
        return [
            'likes' => $this->like_count,
            'comments' => $this->comments_count,
            'total_engagement' => $this->like_count + $this->comments_count,
            'impressions' => $this->impressions,
            'reach' => $this->reach,
            'engagement_rate' => $this->engagement_rate,
            'saves' => $this->saves,
            'profile_visits' => $this->profile_visits,
            'website_clicks' => $this->website_clicks,
        ];
    }

    /**
     * Check if media has high engagement.
     */
    public function hasHighEngagement(): bool
    {
        return $this->engagement_rate > 3.0; // 3% is considered good engagement
    }

    /**
     * Get hashtags from caption.
     */
    public function getHashtagsAttribute(): array
    {
        if (!$this->caption) {
            return [];
        }

        preg_match_all('/#([a-zA-Z0-9_]+)/', $this->caption, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Get mentions from caption.
     */
    public function getMentionsAttribute(): array
    {
        if (!$this->caption) {
            return [];
        }

        preg_match_all('/@([a-zA-Z0-9_.]+)/', $this->caption, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Get the display URL for the media.
     */
    public function getDisplayUrlAttribute(): string
    {
        if ($this->media_type === self::MEDIA_TYPE_VIDEO && $this->thumbnail_url) {
            return $this->thumbnail_url;
        }

        return $this->media_url ?? '';
    }

    /**
     * Check if the media is a video.
     */
    public function isVideo(): bool
    {
        return $this->media_type === self::MEDIA_TYPE_VIDEO;
    }

    /**
     * Check if the media is an image.
     */
    public function isImage(): bool
    {
        return $this->media_type === self::MEDIA_TYPE_IMAGE;
    }

    /**
     * Check if the media is a carousel.
     */
    public function isCarousel(): bool
    {
        return $this->media_type === self::MEDIA_TYPE_CAROUSEL_ALBUM;
    }
}
