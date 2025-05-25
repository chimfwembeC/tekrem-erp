<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Chat extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'conversation_id',
        'message',
        'message_type',
        'attachments',
        'is_read',
        'delivered_at',
        'read_at',
        'status',
        'reply_to_id',
        'is_internal_note',
        'metadata',
        'chattable_id',
        'chattable_type',
        'user_id',
        'recipient_id',
        'is_pinned',
        'pinned_at',
        'pinned_by',
        'is_edited',
        'edited_at',
        'original_message',
        'edit_history',
        'reactions',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_read' => 'boolean',
        'is_internal_note' => 'boolean',
        'is_pinned' => 'boolean',
        'is_edited' => 'boolean',
        'attachments' => 'array',
        'reactions' => 'array',
        'metadata' => 'array',
        'edit_history' => 'array',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'pinned_at' => 'datetime',
        'edited_at' => 'datetime',
    ];

    /**
     * Get the parent chattable model (client or lead).
     */
    public function chattable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user that sent the chat message.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the recipient user of the chat message.
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /**
     * Get the conversation this message belongs to.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the message this is a reply to.
     */
    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(Chat::class, 'reply_to_id');
    }

    /**
     * Get replies to this message.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Chat::class, 'reply_to_id');
    }

    /**
     * Get comments for this message.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(MessageComment::class, 'message_id');
    }

    /**
     * Get the user who pinned this message.
     */
    public function pinnedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pinned_by');
    }

    /**
     * Mark message as delivered.
     */
    public function markAsDelivered(): void
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    /**
     * Mark message as read.
     */
    public function markAsRead(): void
    {
        $this->update([
            'status' => 'read',
            'read_at' => now(),
            'is_read' => true,
        ]);
    }

    /**
     * Check if message has attachments.
     */
    public function hasAttachments(): bool
    {
        return !empty($this->attachments);
    }

    /**
     * Get attachment count.
     */
    public function getAttachmentCountAttribute(): int
    {
        return count($this->attachments ?? []);
    }

    /**
     * Get message type icon.
     */
    public function getTypeIconAttribute(): string
    {
        return match($this->message_type) {
            'text' => 'message-circle',
            'file' => 'file',
            'image' => 'image',
            'video' => 'video',
            'audio' => 'mic',
            default => 'message-circle',
        };
    }

    /**
     * Get status color for UI.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'sent' => 'gray',
            'delivered' => 'blue',
            'read' => 'green',
            default => 'gray',
        };
    }

    /**
     * Scope for unread messages.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for messages by type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('message_type', $type);
    }

    /**
     * Scope for internal notes.
     */
    public function scopeInternalNotes($query)
    {
        return $query->where('is_internal_note', true);
    }

    /**
     * Scope for public messages (not internal notes).
     */
    public function scopePublic($query)
    {
        return $query->where('is_internal_note', false);
    }

    /**
     * Scope for pinned messages.
     */
    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    /**
     * Add a reaction to this message.
     * Each user can only have one reaction per message.
     */
    public function addReaction(string $emoji, int $userId): void
    {
        $reactions = $this->reactions ?? [];

        // First, remove any existing reaction from this user
        $this->removeUserReaction($userId, $reactions);

        // Find if this emoji already exists
        $emojiIndex = null;
        foreach ($reactions as $index => $reaction) {
            if ($reaction['emoji'] === $emoji) {
                $emojiIndex = $index;
                break;
            }
        }

        if ($emojiIndex !== null) {
            // Add user to existing emoji reaction
            if (!in_array($userId, $reactions[$emojiIndex]['users'])) {
                $reactions[$emojiIndex]['users'][] = $userId;
                $reactions[$emojiIndex]['count'] = count($reactions[$emojiIndex]['users']);
            }
        } else {
            // Create new emoji reaction
            $reactions[] = [
                'emoji' => $emoji,
                'users' => [$userId],
                'count' => 1,
            ];
        }

        $this->update(['reactions' => $reactions]);
    }

    /**
     * Remove a reaction from this message.
     */
    public function removeReaction(string $emoji, int $userId): void
    {
        $reactions = $this->reactions ?? [];

        foreach ($reactions as $index => $reaction) {
            if ($reaction['emoji'] === $emoji) {
                $userIndex = array_search($userId, $reaction['users']);
                if ($userIndex !== false) {
                    unset($reactions[$index]['users'][$userIndex]);
                    $reactions[$index]['users'] = array_values($reactions[$index]['users']);
                    $reactions[$index]['count'] = count($reactions[$index]['users']);

                    // Remove emoji if no users left
                    if ($reactions[$index]['count'] === 0) {
                        unset($reactions[$index]);
                        $reactions = array_values($reactions);
                    }
                    break;
                }
            }
        }

        $this->update(['reactions' => $reactions]);
    }

    /**
     * Remove any existing reaction from a user (helper method for one-reaction-per-user rule).
     */
    private function removeUserReaction(int $userId, array &$reactions): void
    {
        foreach ($reactions as $index => $reaction) {
            $userIndex = array_search($userId, $reaction['users']);
            if ($userIndex !== false) {
                unset($reactions[$index]['users'][$userIndex]);
                $reactions[$index]['users'] = array_values($reactions[$index]['users']);
                $reactions[$index]['count'] = count($reactions[$index]['users']);

                // Remove emoji if no users left
                if ($reactions[$index]['count'] === 0) {
                    unset($reactions[$index]);
                    $reactions = array_values($reactions);
                }
                break; // User can only have one reaction, so we can break after finding it
            }
        }
    }

    /**
     * Pin this message.
     */
    public function pin(int $userId): void
    {
        $this->update([
            'is_pinned' => true,
            'pinned_at' => now(),
            'pinned_by' => $userId,
        ]);
    }

    /**
     * Unpin this message.
     */
    public function unpin(): void
    {
        $this->update([
            'is_pinned' => false,
            'pinned_at' => null,
            'pinned_by' => null,
        ]);
    }

    /**
     * Get reaction count for a specific emoji.
     */
    public function getReactionCount(string $emoji): int
    {
        $reactions = $this->reactions ?? [];

        foreach ($reactions as $reaction) {
            if ($reaction['emoji'] === $emoji) {
                return $reaction['count'];
            }
        }

        return 0;
    }

    /**
     * Check if user has reacted with specific emoji.
     */
    public function hasUserReacted(string $emoji, int $userId): bool
    {
        $reactions = $this->reactions ?? [];

        foreach ($reactions as $reaction) {
            if ($reaction['emoji'] === $emoji) {
                return in_array($userId, $reaction['users']);
            }
        }

        return false;
    }

    /**
     * Check if user has reacted to this message (with any emoji).
     */
    public function hasUserReactedAny(int $userId): bool
    {
        $reactions = $this->reactions ?? [];

        foreach ($reactions as $reaction) {
            if (in_array($userId, $reaction['users'])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the emoji that the user has reacted with (if any).
     */
    public function getUserReactionEmoji(int $userId): ?string
    {
        $reactions = $this->reactions ?? [];

        foreach ($reactions as $reaction) {
            if (in_array($userId, $reaction['users'])) {
                return $reaction['emoji'];
            }
        }

        return null;
    }

    /**
     * Edit this message.
     */
    public function editMessage(string $newMessage, int $userId): void
    {
        // Store original message if this is the first edit
        if (!$this->is_edited) {
            $this->original_message = $this->message;
        }

        // Add to edit history
        $editHistory = $this->edit_history ?? [];
        $editHistory[] = [
            'previous_message' => $this->message,
            'edited_by' => $userId,
            'edited_at' => now()->toISOString(),
        ];

        $this->update([
            'message' => $newMessage,
            'is_edited' => true,
            'edited_at' => now(),
            'edit_history' => $editHistory,
        ]);
    }

    /**
     * Check if message can be edited by user.
     */
    public function canBeEditedBy(int $userId): bool
    {
        // Only the message author can edit (within time limit if needed)
        if ($this->user_id !== $userId) {
            return false;
        }

        // Optional: Add time limit for editing (e.g., 15 minutes)
        $editTimeLimit = 15; // minutes
        if ($this->created_at->diffInMinutes(now()) > $editTimeLimit) {
            return false;
        }

        // Can't edit system messages
        if ($this->message_type === 'system') {
            return false;
        }

        return true;
    }

    /**
     * Get edit history count.
     */
    public function getEditCountAttribute(): int
    {
        return count($this->edit_history ?? []);
    }

    /**
     * Get time since last edit.
     */
    public function getTimeSinceEditAttribute(): ?string
    {
        if (!$this->is_edited || !$this->edited_at) {
            return null;
        }

        return $this->edited_at->diffForHumans();
    }

    /**
     * Scope for edited messages.
     */
    public function scopeEdited($query)
    {
        return $query->where('is_edited', true);
    }
}
