<?php

namespace App\Models\SocialMedia;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FacebookPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'facebook_page_id',
        'name',
        'category',
        'access_token',
        'picture_url',
        'is_active',
        'webhook_subscribed',
        'last_sync_at',
        'settings'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'webhook_subscribed' => 'boolean',
        'last_sync_at' => 'datetime',
        'settings' => 'array'
    ];

    /**
     * Get the Facebook leads for this page
     */
    public function facebookLeads(): HasMany
    {
        return $this->hasMany(FacebookLead::class, 'page_id', 'facebook_page_id');
    }

    /**
     * Get the social posts for this page
     */
    public function socialPosts(): HasMany
    {
        return $this->hasMany(SocialPost::class, 'platform_page_id', 'facebook_page_id')
                    ->where('platform', 'facebook');
    }

    /**
     * Scope for active pages
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for pages with webhook subscriptions
     */
    public function scopeWebhookSubscribed($query)
    {
        return $query->where('webhook_subscribed', true);
    }
}
