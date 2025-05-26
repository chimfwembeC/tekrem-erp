<?php

namespace App\Models\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketEscalation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ticket_id',
        'escalated_by',
        'escalated_to',
        'escalation_level',
        'reason',
        'notes',
        'escalated_at',
        'resolved_at',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'escalation_level' => 'integer',
        'escalated_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    /**
     * Get the ticket that owns the escalation.
     */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Get the user who escalated the ticket.
     */
    public function escalatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'escalated_by');
    }

    /**
     * Get the user to whom the ticket was escalated.
     */
    public function escalatedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'escalated_to');
    }

    /**
     * Scope for active escalations.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for resolved escalations.
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }
}
