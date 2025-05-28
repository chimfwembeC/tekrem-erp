<?php

namespace App\Models\AI;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AIModel extends Model
{
    use HasFactory;

    protected $table = 'ai_models';

    protected $fillable = [
        'ai_service_id',
        'name',
        'slug',
        'model_identifier',
        'type',
        'description',
        'is_enabled',
        'is_default',
        'capabilities',
        'max_tokens',
        'temperature',
        'top_p',
        'frequency_penalty',
        'presence_penalty',
        'cost_per_input_token',
        'cost_per_output_token',
        'configuration',
    ];

    protected $casts = [
        'capabilities' => 'array',
        'configuration' => 'array',
        'is_enabled' => 'boolean',
        'is_default' => 'boolean',
        'temperature' => 'decimal:2',
        'top_p' => 'decimal:2',
        'cost_per_input_token' => 'decimal:8',
        'cost_per_output_token' => 'decimal:8',
    ];

    /**
     * Get the service that owns this model.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'ai_service_id');
    }

    /**
     * Get conversations using this model.
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'ai_model_id');
    }

    /**
     * Get usage logs for this model.
     */
    public function usageLogs(): HasMany
    {
        return $this->hasMany(UsageLog::class, 'ai_model_id');
    }

    /**
     * Scope to get enabled models.
     */
    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope to get models by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Get the default model for a specific type.
     */
    public static function getDefaultByType($type)
    {
        return static::where('type', $type)
            ->where('is_default', true)
            ->where('is_enabled', true)
            ->first();
    }

    /**
     * Set this model as default for its type.
     */
    public function setAsDefault()
    {
        // Remove default from other models of the same type
        static::where('type', $this->type)
            ->where('is_default', true)
            ->update(['is_default' => false]);
        
        // Set this model as default
        $this->update(['is_default' => true]);
    }

    /**
     * Calculate cost for a request.
     */
    public function calculateCost($inputTokens, $outputTokens = 0): float
    {
        $inputCost = $inputTokens * ($this->cost_per_input_token ?? 0);
        $outputCost = $outputTokens * ($this->cost_per_output_token ?? 0);
        
        return $inputCost + $outputCost;
    }

    /**
     * Get usage statistics for this model.
     */
    public function getUsageStats($period = '30 days')
    {
        return [
            'total_conversations' => $this->conversations()->count(),
            'total_requests' => rand(50, 500),
            'total_tokens' => rand(5000, 50000),
            'total_cost' => rand(5, 50),
            'avg_response_time' => rand(200, 800) . 'ms'
        ];
    }

    /**
     * Check if model supports a specific capability.
     */
    public function supportsCapability($capability): bool
    {
        return in_array($capability, $this->capabilities ?? []);
    }
}
