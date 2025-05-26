<?php

namespace App\Models\Support;

use App\Models\User;
use App\Models\Client;
use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Ticket extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ticket_number',
        'title',
        'description',
        'status',
        'priority',
        'category_id',
        'assigned_to',
        'created_by',
        'requester_type',
        'requester_id',
        'due_date',
        'resolved_at',
        'closed_at',
        'satisfaction_rating',
        'satisfaction_feedback',
        'tags',
        'metadata',
        'sla_policy_id',
        'escalation_level',
        'escalated_at',
        'first_response_at',
        'resolution_time_minutes',
        'response_time_minutes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'due_date' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'escalated_at' => 'datetime',
        'first_response_at' => 'datetime',
        'tags' => 'array',
        'metadata' => 'array',
        'satisfaction_rating' => 'integer',
        'escalation_level' => 'integer',
        'resolution_time_minutes' => 'integer',
        'response_time_minutes' => 'integer',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = static::generateTicketNumber();
            }
        });
    }

    /**
     * Generate a unique ticket number.
     */
    public static function generateTicketNumber(): string
    {
        $prefix = 'TKT';
        $year = date('Y');
        $month = date('m');
        
        $lastTicket = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastTicket ? (int) substr($lastTicket->ticket_number, -4) + 1 : 1;
        
        return $prefix . $year . $month . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get the category that owns the ticket.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(TicketCategory::class, 'category_id');
    }

    /**
     * Get the user assigned to the ticket.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who created the ticket.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the requester (polymorphic relationship).
     */
    public function requester(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the SLA policy for the ticket.
     */
    public function slaPolicy(): BelongsTo
    {
        return $this->belongsTo(SLA::class, 'sla_policy_id');
    }

    /**
     * Get the comments for the ticket.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class);
    }

    /**
     * Get the escalations for the ticket.
     */
    public function escalations(): HasMany
    {
        return $this->hasMany(TicketEscalation::class);
    }

    /**
     * Scope for filtering by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by priority.
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope for filtering by assigned user.
     */
    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope for overdue tickets.
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
            ->whereNotIn('status', ['resolved', 'closed']);
    }

    /**
     * Check if ticket is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->due_date && 
               $this->due_date->isPast() && 
               !in_array($this->status, ['resolved', 'closed']);
    }

    /**
     * Check if ticket needs escalation.
     */
    public function needsEscalation(): bool
    {
        if (!$this->slaPolicy) {
            return false;
        }

        $responseTime = $this->slaPolicy->response_time_hours;
        $resolutionTime = $this->slaPolicy->resolution_time_hours;

        // Check response time
        if (!$this->first_response_at && $this->created_at->addHours($responseTime)->isPast()) {
            return true;
        }

        // Check resolution time
        if (!$this->resolved_at && $this->created_at->addHours($resolutionTime)->isPast()) {
            return true;
        }

        return false;
    }

    /**
     * Get priority color for UI.
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'low' => 'green',
            'medium' => 'yellow',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get status color for UI.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'open' => 'blue',
            'in_progress' => 'yellow',
            'pending' => 'orange',
            'resolved' => 'green',
            'closed' => 'gray',
            default => 'gray'
        };
    }
}
