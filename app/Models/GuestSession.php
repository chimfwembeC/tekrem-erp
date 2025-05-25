<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class GuestSession extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'session_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'ip_address',
        'user_agent',
        'inquiry_type',
        'metadata',
        'last_activity_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'metadata' => 'array',
        'last_activity_at' => 'datetime',
    ];

    /**
     * Get the conversation associated with this guest session.
     */
    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class, 'conversable_id')
            ->where('conversable_type', self::class);
    }

    /**
     * Get all conversations for this guest session.
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'conversable_id')
            ->where('conversable_type', self::class);
    }

    /**
     * Update the last activity timestamp.
     */
    public function updateActivity(): void
    {
        $this->update(['last_activity_at' => now()]);
    }

    /**
     * Check if the guest session is active (within last 30 minutes).
     */
    public function isActive(): bool
    {
        return $this->last_activity_at && 
               $this->last_activity_at->diffInMinutes(now()) <= 30;
    }

    /**
     * Get or create a guest session by session ID.
     */
    public static function getOrCreateBySessionId(string $sessionId, array $attributes = []): self
    {
        return self::firstOrCreate(
            ['session_id' => $sessionId],
            array_merge($attributes, [
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'last_activity_at' => now(),
            ])
        );
    }

    /**
     * Get the display name for the guest.
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->guest_name) {
            return $this->guest_name;
        }

        if ($this->guest_email) {
            return $this->guest_email;
        }

        return "Guest #{$this->id}";
    }

    /**
     * Get the inquiry type label.
     */
    public function getInquiryTypeLabelAttribute(): string
    {
        return match($this->inquiry_type) {
            'support' => 'Support Request',
            'sales' => 'Sales Inquiry',
            'general' => 'General Inquiry',
            default => 'General Inquiry',
        };
    }
}
