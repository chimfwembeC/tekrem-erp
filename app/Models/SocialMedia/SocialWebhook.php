<?php

namespace App\Models\SocialMedia;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialWebhook extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform',
        'event_type',
        'payload',
        'processed',
        'processed_at',
        'error_message',
    ];

    protected $casts = [
        'payload' => 'array',
        'processed' => 'boolean',
        'processed_at' => 'datetime',
    ];

    const PLATFORM_FACEBOOK = 'facebook';
    const PLATFORM_INSTAGRAM = 'instagram';
    const PLATFORM_LINKEDIN = 'linkedin';

    /**
     * Scope for unprocessed webhooks.
     */
    public function scopeUnprocessed($query)
    {
        return $query->where('processed', false);
    }

    /**
     * Scope for processed webhooks.
     */
    public function scopeProcessed($query)
    {
        return $query->where('processed', true);
    }

    /**
     * Scope by platform.
     */
    public function scopeByPlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    /**
     * Scope by event type.
     */
    public function scopeByEventType($query, string $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    /**
     * Mark webhook as processed.
     */
    public function markAsProcessed(): void
    {
        $this->update([
            'processed' => true,
            'processed_at' => now(),
            'error_message' => null,
        ]);
    }

    /**
     * Mark webhook as failed.
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'processed' => false,
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Get formatted platform name.
     */
    public function getFormattedPlatformAttribute(): string
    {
        return ucfirst($this->platform);
    }

    /**
     * Get formatted event type.
     */
    public function getFormattedEventTypeAttribute(): string
    {
        return str_replace('_', ' ', ucwords($this->event_type, '_'));
    }

    /**
     * Check if webhook has error.
     */
    public function hasError(): bool
    {
        return !empty($this->error_message);
    }

    /**
     * Get payload summary for display.
     */
    public function getPayloadSummaryAttribute(): string
    {
        if (!$this->payload) {
            return 'No payload data';
        }

        $summary = [];
        
        // Extract key information based on platform
        switch ($this->platform) {
            case self::PLATFORM_FACEBOOK:
                if (isset($this->payload['entry'])) {
                    $entryCount = count($this->payload['entry']);
                    $summary[] = "{$entryCount} entries";
                }
                if (isset($this->payload['object'])) {
                    $summary[] = "Object: {$this->payload['object']}";
                }
                break;
                
            case self::PLATFORM_INSTAGRAM:
                if (isset($this->payload['entry'])) {
                    $entryCount = count($this->payload['entry']);
                    $summary[] = "{$entryCount} entries";
                }
                if (isset($this->payload['object'])) {
                    $summary[] = "Object: {$this->payload['object']}";
                }
                break;
                
            case self::PLATFORM_LINKEDIN:
                if (isset($this->payload['eventType'])) {
                    $summary[] = "Event: {$this->payload['eventType']}";
                }
                if (isset($this->payload['actor'])) {
                    $summary[] = "Actor: {$this->payload['actor']}";
                }
                break;
        }

        return !empty($summary) ? implode(', ', $summary) : 'Webhook data received';
    }
}
