<?php

namespace App\Models\SocialMedia;

use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacebookLead extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'facebook_lead_id',
        'page_id',
        'ad_id',
        'ad_name',
        'adset_id',
        'adset_name',
        'campaign_id',
        'campaign_name',
        'form_id',
        'field_data',
        'created_time',
        'processed_at'
    ];

    protected $casts = [
        'field_data' => 'array',
        'created_time' => 'datetime',
        'processed_at' => 'datetime'
    ];

    /**
     * Get the CRM lead associated with this Facebook lead
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Get the Facebook page this lead came from
     */
    public function facebookPage(): BelongsTo
    {
        return $this->belongsTo(FacebookPage::class, 'page_id', 'facebook_page_id');
    }

    /**
     * Scope for unprocessed leads
     */
    public function scopeUnprocessed($query)
    {
        return $query->whereNull('processed_at');
    }

    /**
     * Scope for leads from a specific campaign
     */
    public function scopeFromCampaign($query, string $campaignId)
    {
        return $query->where('campaign_id', $campaignId);
    }

    /**
     * Scope for leads from a specific ad
     */
    public function scopeFromAd($query, string $adId)
    {
        return $query->where('ad_id', $adId);
    }

    /**
     * Mark lead as processed
     */
    public function markAsProcessed(): void
    {
        $this->update(['processed_at' => now()]);
    }

    /**
     * Get formatted field data for display
     */
    public function getFormattedFieldDataAttribute(): array
    {
        $formatted = [];
        foreach ($this->field_data as $key => $value) {
            $formatted[ucwords(str_replace('_', ' ', $key))] = $value;
        }
        return $formatted;
    }
}
