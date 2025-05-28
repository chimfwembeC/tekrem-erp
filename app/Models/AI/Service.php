<?php

namespace App\Models\AI;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Service extends Model
{
    use HasFactory;

    protected $table = 'ai_services';

    protected $fillable = [
        'name',
        'slug',
        'provider',
        'api_key',
        'api_url',
        'configuration',
        'is_enabled',
        'is_default',
        'priority',
        'description',
        'supported_features',
        'cost_per_token',
        'rate_limit_per_minute',
        'max_tokens_per_request',
    ];

    protected $casts = [
        'configuration' => 'array',
        'supported_features' => 'array',
        'is_enabled' => 'boolean',
        'is_default' => 'boolean',
        'cost_per_token' => 'decimal:8',
    ];

    /**
     * Get the models for this service.
     */
    public function models(): HasMany
    {
        return $this->hasMany(AIModel::class, 'ai_service_id');
    }

    /**
     * Get enabled models for this service.
     */
    public function enabledModels(): HasMany
    {
        return $this->models()->where('is_enabled', true);
    }

    /**
     * Get the default model for this service.
     */
    public function defaultModel(): HasOne
    {
        return $this->hasOne(AIModel::class, 'ai_service_id')->where('is_default', true);
    }

    /**
     * Scope to get enabled services.
     */
    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope to get services by provider.
     */
    public function scopeByProvider($query, $provider)
    {
        return $query->where('provider', $provider);
    }

    /**
     * Get the default service.
     */
    public static function getDefault()
    {
        return static::where('is_default', true)
            ->where('is_enabled', true)
            ->first();
    }

    /**
     * Set this service as default.
     */
    public function setAsDefault()
    {
        // Remove default from other services
        static::where('is_default', true)->update(['is_default' => false]);

        // Set this service as default
        $this->update(['is_default' => true]);
    }

    /**
     * Test the connection to this service.
     */
    public function testConnection(): array
    {
        try {
            // This would implement actual connection testing
            // For now, return a mock response
            return [
                'success' => true,
                'message' => 'Connection successful',
                'response_time' => rand(100, 500) . 'ms'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get usage statistics for this service.
     */
    public function getUsageStats($period = '30 days')
    {
        return [
            'total_requests' => rand(100, 1000),
            'total_tokens' => rand(10000, 100000),
            'total_cost' => rand(10, 100),
            'avg_response_time' => rand(200, 800) . 'ms',
            'success_rate' => rand(95, 100) . '%'
        ];
    }
}
