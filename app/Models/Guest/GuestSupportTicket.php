<?php

namespace App\Models\Guest;

use App\Models\User;
use App\Models\Support\Ticket;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class GuestSupportTicket extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ticket_number',
        'name',
        'email',
        'phone',
        'company',
        'category',
        'priority',
        'subject',
        'description',
        'status',
        'attachments',
        'product_version',
        'browser',
        'operating_system',
        'steps_to_reproduce',
        'expected_behavior',
        'actual_behavior',
        'assigned_to',
        'support_ticket_id',
        'first_response_at',
        'resolved_at',
        'closed_at',
        'satisfaction_rating',
        'satisfaction_feedback',
        'source',
        'metadata',
        'ip_address',
        'user_agent',
        'internal_notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'attachments' => 'array',
        'first_response_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'satisfaction_rating' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = 'GST-' . strtoupper(Str::random(8));
            }

            if (empty($ticket->ip_address)) {
                $ticket->ip_address = request()->ip();
            }

            if (empty($ticket->user_agent)) {
                $ticket->user_agent = request()->userAgent();
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
     * Get the related support ticket.
     */
    public function supportTicket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'support_ticket_id');
    }

    /**
     * Scope a query to only include tickets of a specific category.
     */
    public function scopeOfCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope a query to only include tickets with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include tickets with a specific priority.
     */
    public function scopeWithPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope a query to only include unassigned tickets.
     */
    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    /**
     * Scope a query to only include open tickets.
     */
    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['open', 'in_progress', 'waiting_customer']);
    }

    /**
     * Scope a query to only include closed tickets.
     */
    public function scopeClosed($query)
    {
        return $query->whereIn('status', ['resolved', 'closed']);
    }

    /**
     * Assign ticket to a user.
     */
    public function assignTo(User $user)
    {
        $this->update([
            'assigned_to' => $user->id,
            'status' => 'in_progress'
        ]);
    }

    /**
     * Mark ticket as first responded.
     */
    public function markFirstResponse()
    {
        if (!$this->first_response_at) {
            $this->update([
                'first_response_at' => now(),
                'status' => 'in_progress'
            ]);
        }
    }

    /**
     * Mark ticket as resolved.
     */
    public function markAsResolved()
    {
        $this->update([
            'status' => 'resolved',
            'resolved_at' => now()
        ]);
    }

    /**
     * Mark ticket as closed.
     */
    public function markAsClosed()
    {
        $this->update([
            'status' => 'closed',
            'closed_at' => now()
        ]);
    }

    /**
     * Add satisfaction rating.
     */
    public function addSatisfactionRating($rating, $feedback = null)
    {
        $this->update([
            'satisfaction_rating' => $rating,
            'satisfaction_feedback' => $feedback
        ]);
    }

    /**
     * Get the priority color for UI display.
     */
    public function getPriorityColorAttribute()
    {
        return match($this->priority) {
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
            'open' => 'blue',
            'in_progress' => 'yellow',
            'waiting_customer' => 'orange',
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

    /**
     * Check if ticket needs first response.
     */
    public function needsFirstResponse()
    {
        return is_null($this->first_response_at) && $this->status === 'open';
    }

    /**
     * Get response time in hours.
     */
    public function getResponseTimeHours()
    {
        if (!$this->first_response_at) {
            return null;
        }

        return $this->created_at->diffInHours($this->first_response_at);
    }

    /**
     * Get resolution time in hours.
     */
    public function getResolutionTimeHours()
    {
        if (!$this->resolved_at) {
            return null;
        }

        return $this->created_at->diffInHours($this->resolved_at);
    }
}
