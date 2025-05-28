<?php

namespace App\Models\AI;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    protected $table = 'ai_conversations';

    protected $fillable = [
        'user_id',
        'ai_model_id',
        'title',
        'context_type',
        'context_id',
        'messages',
        'metadata',
        'total_tokens',
        'total_cost',
        'message_count',
        'last_message_at',
        'is_archived',
    ];

    protected $casts = [
        'messages' => 'array',
        'metadata' => 'array',
        'total_cost' => 'decimal:4',
        'last_message_at' => 'datetime',
        'is_archived' => 'boolean',
    ];

    /**
     * Get the user that owns this conversation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the AI model used in this conversation.
     */
    public function aiModel(): BelongsTo
    {
        return $this->belongsTo(AIModel::class, 'ai_model_id');
    }

    /**
     * Get usage logs for this conversation.
     */
    public function usageLogs(): HasMany
    {
        return $this->hasMany(UsageLog::class, 'ai_conversation_id');
    }

    /**
     * Scope to get active conversations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    /**
     * Scope to get archived conversations.
     */
    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }

    /**
     * Scope to get conversations by context.
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
     * Add a message to the conversation.
     */
    public function addMessage($role, $content, $metadata = [])
    {
        $messages = $this->messages ?? [];

        $message = [
            'role' => $role,
            'content' => $content,
            'timestamp' => now()->toISOString(),
            'metadata' => $metadata
        ];

        $messages[] = $message;

        $this->update([
            'messages' => $messages,
            'message_count' => count($messages),
            'last_message_at' => now()
        ]);

        return $message;
    }

    /**
     * Get the last message in the conversation.
     */
    public function getLastMessage()
    {
        $messages = $this->messages ?? [];
        return end($messages) ?: null;
    }

    /**
     * Get messages by role.
     */
    public function getMessagesByRole($role)
    {
        return collect($this->messages ?? [])->where('role', $role)->values();
    }

    /**
     * Archive this conversation.
     */
    public function archive()
    {
        $this->update(['is_archived' => true]);
    }

    /**
     * Unarchive this conversation.
     */
    public function unarchive()
    {
        $this->update(['is_archived' => false]);
    }

    /**
     * Generate a title for the conversation based on the first message.
     */
    public function generateTitle()
    {
        $messages = $this->messages ?? [];

        if (empty($messages)) {
            return 'New Conversation';
        }

        $firstUserMessage = collect($messages)->where('role', 'user')->first();

        if (!$firstUserMessage) {
            return 'New Conversation';
        }

        $content = $firstUserMessage['content'];
        $title = substr($content, 0, 50);

        if (strlen($content) > 50) {
            $title .= '...';
        }

        return $title;
    }

    /**
     * Update conversation statistics.
     */
    public function updateStats($tokens = 0, $cost = 0)
    {
        $this->increment('total_tokens', $tokens);
        $this->increment('total_cost', $cost);
    }

    /**
     * Get recent conversations.
     */
    public static function getRecent($limit = 10)
    {
        return static::with(['user', 'aiModel'])
                    ->orderBy('last_message_at', 'desc')
                    ->limit($limit)
                    ->get();
    }
}
