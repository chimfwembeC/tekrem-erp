<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SLA extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'response_time_hours',
        'resolution_time_hours',
        'escalation_time_hours',
        'business_hours_only',
        'is_active',
        'is_default',
        'priority_levels',
        'conditions',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'response_time_hours' => 'integer',
        'resolution_time_hours' => 'integer',
        'escalation_time_hours' => 'integer',
        'business_hours_only' => 'boolean',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'priority_levels' => 'array',
        'conditions' => 'array',
    ];

    /**
     * Get the tickets for the SLA policy.
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'sla_policy_id');
    }

    /**
     * Get the categories using this SLA policy.
     */
    public function categories(): HasMany
    {
        return $this->hasMany(TicketCategory::class, 'default_sla_policy_id');
    }

    /**
     * Scope for active SLA policies.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for default SLA policy.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Calculate due date based on SLA policy.
     */
    public function calculateDueDate(\Carbon\Carbon $startTime, string $type = 'resolution'): \Carbon\Carbon
    {
        $hours = $type === 'response' ? $this->response_time_hours : $this->resolution_time_hours;
        
        if (!$this->business_hours_only) {
            return $startTime->copy()->addHours($hours);
        }

        // Business hours calculation (9 AM to 5 PM, Monday to Friday)
        $dueDate = $startTime->copy();
        $remainingHours = $hours;

        while ($remainingHours > 0) {
            // Skip weekends
            if ($dueDate->isWeekend()) {
                $dueDate->addDay()->setTime(9, 0);
                continue;
            }

            // Set to business hours if outside
            if ($dueDate->hour < 9) {
                $dueDate->setTime(9, 0);
            } elseif ($dueDate->hour >= 17) {
                $dueDate->addDay()->setTime(9, 0);
                continue;
            }

            // Calculate hours until end of business day
            $hoursUntilEndOfDay = 17 - $dueDate->hour;
            
            if ($remainingHours <= $hoursUntilEndOfDay) {
                $dueDate->addHours($remainingHours);
                $remainingHours = 0;
            } else {
                $remainingHours -= $hoursUntilEndOfDay;
                $dueDate->addDay()->setTime(9, 0);
            }
        }

        return $dueDate;
    }

    /**
     * Check if SLA is breached for a ticket.
     */
    public function isBreached(Ticket $ticket, string $type = 'resolution'): bool
    {
        $dueDate = $this->calculateDueDate($ticket->created_at, $type);
        
        if ($type === 'response') {
            return !$ticket->first_response_at && now()->isAfter($dueDate);
        }

        return !$ticket->resolved_at && now()->isAfter($dueDate);
    }

    /**
     * Get SLA compliance percentage.
     */
    public function getCompliancePercentage(\Carbon\Carbon $startDate, \Carbon\Carbon $endDate): float
    {
        $totalTickets = $this->tickets()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        if ($totalTickets === 0) {
            return 100;
        }

        $compliantTickets = $this->tickets()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where(function ($query) {
                $query->whereNotNull('resolved_at')
                    ->orWhere('status', 'closed');
            })
            ->get()
            ->filter(function ($ticket) {
                return !$this->isBreached($ticket, 'resolution');
            })
            ->count();

        return round(($compliantTickets / $totalTickets) * 100, 2);
    }
}
