<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Conversation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'conversable_type',
        'conversable_id',
        'created_by',
        'assigned_to',
        'status',
        'priority',
        'participants',
        'tags',
        'last_message_at',
        'unread_count',
        'is_internal',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'participants' => 'array',
        'tags' => 'array',
        'metadata' => 'array',
        'last_message_at' => 'datetime',
        'is_internal' => 'boolean',
        'unread_count' => 'integer',
    ];

    /**
     * Get the conversable entity (client, lead, etc.).
     */
    public function conversable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who created the conversation.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user assigned to the conversation.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get all messages in this conversation in chronological order (oldest first).
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Chat::class, 'conversation_id')->orderBy('created_at', 'asc');
    }

    /**
     * Get the latest message in this conversation.
     */
    public function latestMessage()
    {
        return $this->hasOne(Chat::class, 'conversation_id')->latest();
    }

    /**
     * Get unread messages for a specific user.
     */
    public function unreadMessagesFor(User $user): HasMany
    {
        return $this->hasMany(Chat::class, 'conversation_id')
            ->where('user_id', '!=', $user->id)
            ->where('status', '!=', 'read');
    }

    /**
     * Mark all messages as read for a specific user.
     */
    public function markAsReadFor(User $user): void
    {
        $this->messages()
            ->where('user_id', '!=', $user->id)
            ->where('status', '!=', 'read')
            ->update([
                'status' => 'read',
                'read_at' => now(),
            ]);

        // Update unread count
        $this->update(['unread_count' => 0]);
    }

    /**
     * Add a participant to the conversation.
     */
    public function addParticipant(int $userId): void
    {
        $participants = $this->participants ?? [];
        if (!in_array($userId, $participants)) {
            $participants[] = $userId;
            $this->update(['participants' => $participants]);
        }
    }

    /**
     * Remove a participant from the conversation.
     */
    public function removeParticipant(int $userId): void
    {
        $participants = $this->participants ?? [];
        $participants = array_filter($participants, fn($id) => $id !== $userId);
        $this->update(['participants' => array_values($participants)]);
    }

    /**
     * Check if a user is a participant in this conversation.
     */
    public function hasParticipant(int $userId): bool
    {
        return in_array($userId, $this->participants ?? []);
    }

    /**
     * Get all participant users.
     */
    public function getParticipantUsersAttribute()
    {
        if (empty($this->participants)) {
            return collect();
        }

        return User::whereIn('id', $this->participants)->get();
    }

    /**
     * Scope for active conversations.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for archived conversations.
     */
    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    /**
     * Scope for conversations assigned to a user.
     */
    public function scopeAssignedTo($query, int $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope for conversations with unread messages.
     */
    public function scopeWithUnread($query)
    {
        return $query->where('unread_count', '>', 0);
    }

    /**
     * Get the conversation title or generate one.
     */
    public function getDisplayTitleAttribute(): string
    {
        if ($this->title) {
            return $this->title;
        }

        if ($this->conversable) {
            // Handle guest sessions
            if ($this->conversable instanceof \App\Models\GuestSession) {
                return "Guest Chat - {$this->conversable->display_name}";
            }

            // Handle projects
            if ($this->conversable instanceof \App\Models\Project) {
                return "Project Chat - {$this->conversable->name}";
            }

            return "Chat with {$this->conversable->name}";
        }

        return "Conversation #{$this->id}";
    }

    /**
     * Check if this is a guest conversation.
     */
    public function isGuestConversation(): bool
    {
        return $this->conversable_type === \App\Models\GuestSession::class;
    }

    /**
     * Get the conversation status badge color.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'active' => 'green',
            'archived' => 'gray',
            'closed' => 'red',
            default => 'blue',
        };
    }

    /**
     * Get the priority badge color.
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'low' => 'gray',
            'normal' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'blue',
        };
    }
}
