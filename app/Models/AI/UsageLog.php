<?php

namespace App\Models\AI;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class UsageLog extends Model
{
    use HasFactory;

    protected $table = 'ai_usage_logs';

    protected $fillable = [
        'user_id',
        'ai_model_id',
        'ai_conversation_id',
        'ai_prompt_template_id',
        'operation_type',
        'context_type',
        'context_id',
        'prompt',
        'response',
        'input_tokens',
        'output_tokens',
        'total_tokens',
        'cost',
        'response_time_ms',
        'status',
        'error_message',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'cost' => 'decimal:4',
    ];

    /**
     * Get the user that made this request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the AI model used for this request.
     */
    public function aiModel(): BelongsTo
    {
        return $this->belongsTo(AIModel::class, 'ai_model_id');
    }

    /**
     * Get the conversation this log belongs to.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'ai_conversation_id');
    }

    /**
     * Get the prompt template used for this request.
     */
    public function promptTemplate(): BelongsTo
    {
        return $this->belongsTo(PromptTemplate::class, 'ai_prompt_template_id');
    }

    /**
     * Scope to get successful requests.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    /**
     * Scope to get failed requests.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', '!=', 'success');
    }

    /**
     * Scope to get logs by operation type.
     */
    public function scopeByOperation($query, $operation)
    {
        return $query->where('operation_type', $operation);
    }

    /**
     * Scope to get logs by context.
     */
    public function scopeByContext($query, $type, $id = null)
    {
        $query = $query->where('context_type', $type);

        if ($id !== null) {
            $query->where('context_id', $id);
        }

        return $query;
    }

    /**
     * Scope to get logs within a date range.
     */
    public function scopeWithinDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Get usage statistics for a period.
     */
    public static function getUsageStats($period = '30 days', $userId = null)
    {
        $query = static::query();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $query->where('created_at', '>=', now()->sub($period));

        return [
            'total_requests' => $query->count(),
            'successful_requests' => $query->where('status', 'success')->count(),
            'failed_requests' => $query->where('status', '!=', 'success')->count(),
            'total_tokens' => $query->sum('total_tokens'),
            'total_cost' => $query->sum('cost'),
            'avg_response_time' => $query->avg('response_time_ms'),
            'success_rate' => $query->count() > 0
                ? ($query->where('status', 'success')->count() / $query->count()) * 100
                : 0
        ];
    }

    /**
     * Get usage by operation type.
     */
    public static function getUsageByOperation($period = '30 days', $userId = null)
    {
        $query = static::query();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $query->where('created_at', '>=', now()->sub($period));

        return $query->groupBy('operation_type')
                    ->selectRaw('operation_type, count(*) as count, sum(total_tokens) as tokens, sum(cost) as cost')
                    ->get();
    }

    /**
     * Get usage by model.
     */
    public static function getUsageByModel($period = '30 days', $userId = null)
    {
        $query = static::query()->with('aiModel');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $query->where('created_at', '>=', now()->sub($period));

        return $query->groupBy('ai_model_id')
                    ->selectRaw('ai_model_id, count(*) as count, sum(total_tokens) as tokens, sum(cost) as cost')
                    ->get();
    }

    /**
     * Get daily usage for a period.
     */
    public static function getDailyUsage($period = '30 days', $userId = null)
    {
        $query = static::query();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $query->where('created_at', '>=', now()->sub($period));

        return $query->groupBy(DB::raw('DATE(created_at)'))
                    ->selectRaw('DATE(created_at) as date, count(*) as requests, sum(total_tokens) as tokens, sum(cost) as cost')
                    ->orderBy('date')
                    ->get();
    }
}
