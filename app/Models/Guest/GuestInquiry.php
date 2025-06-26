<?php

namespace App\Models\Guest;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class GuestInquiry extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'reference_number',
        'type',
        'name',
        'email',
        'phone',
        'company',
        'position',
        'subject',
        'message',
        'preferred_contact_method',
        'urgency',
        'status',
        'source',
        'metadata',
        'ip_address',
        'user_agent',
        'responded_at',
        'assigned_to',
        'internal_notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'metadata' => 'array',
        'responded_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($inquiry) {
            if (empty($inquiry->reference_number)) {
                $inquiry->reference_number = 'INQ-' . strtoupper(Str::random(8));
            }
            
            if (empty($inquiry->ip_address)) {
                $inquiry->ip_address = request()->ip();
            }
            
            if (empty($inquiry->user_agent)) {
                $inquiry->user_agent = request()->userAgent();
            }
        });
    }

    /**
     * Get the assigned user.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Scope a query to only include inquiries of a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include inquiries with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include unassigned inquiries.
     */
    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    /**
     * Scope a query to only include responded inquiries.
     */
    public function scopeResponded($query)
    {
        return $query->whereNotNull('responded_at');
    }

    /**
     * Scope a query to only include unresponded inquiries.
     */
    public function scopeUnresponded($query)
    {
        return $query->whereNull('responded_at');
    }

    /**
     * Mark inquiry as responded.
     */
    public function markAsResponded()
    {
        $this->update([
            'responded_at' => now(),
            'status' => 'in_progress'
        ]);
    }

    /**
     * Assign inquiry to a user.
     */
    public function assignTo(User $user)
    {
        $this->update([
            'assigned_to' => $user->id,
            'status' => 'in_progress'
        ]);
    }

    /**
     * Get the urgency color for UI display.
     */
    public function getUrgencyColorAttribute()
    {
        return match($this->urgency) {
            'low' => 'green',
            'normal' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get the status color for UI display.
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'new' => 'blue',
            'in_progress' => 'yellow',
            'resolved' => 'green',
            'closed' => 'gray',
            default => 'gray'
        };
    }

    /**
     * Get formatted display name.
     */
    public function getDisplayNameAttribute()
    {
        $name = $this->name;
        if ($this->company) {
            $name .= " ({$this->company})";
        }
        return $name;
    }
}
