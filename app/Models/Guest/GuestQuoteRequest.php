<?php

namespace App\Models\Guest;

use App\Models\User;
use App\Models\Finance\Quotation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class GuestQuoteRequest extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'reference_number',
        'name',
        'email',
        'phone',
        'company',
        'position',
        'service_type',
        'project_description',
        'budget_range',
        'timeline',
        'requirements',
        'features',
        'priority',
        'status',
        'quoted_amount',
        'quoted_currency',
        'quote_notes',
        'quoted_at',
        'quote_expires_at',
        'assigned_to',
        'quotation_id',
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
        'requirements' => 'array',
        'features' => 'array',
        'quoted_amount' => 'decimal:2',
        'quoted_at' => 'datetime',
        'quote_expires_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($request) {
            if (empty($request->reference_number)) {
                $request->reference_number = 'QR-' . strtoupper(Str::random(8));
            }
            
            if (empty($request->ip_address)) {
                $request->ip_address = request()->ip();
            }
            
            if (empty($request->user_agent)) {
                $request->user_agent = request()->userAgent();
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
     * Get the related quotation.
     */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    /**
     * Scope a query to only include requests of a specific service type.
     */
    public function scopeOfServiceType($query, $serviceType)
    {
        return $query->where('service_type', $serviceType);
    }

    /**
     * Scope a query to only include requests with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include unassigned requests.
     */
    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    /**
     * Scope a query to only include quoted requests.
     */
    public function scopeQuoted($query)
    {
        return $query->whereNotNull('quoted_at');
    }

    /**
     * Scope a query to only include unquoted requests.
     */
    public function scopeUnquoted($query)
    {
        return $query->whereNull('quoted_at');
    }

    /**
     * Assign request to a user.
     */
    public function assignTo(User $user)
    {
        $this->update([
            'assigned_to' => $user->id,
            'status' => 'reviewing'
        ]);
    }

    /**
     * Mark as quoted.
     */
    public function markAsQuoted($amount, $currency = 'USD', $notes = null, $expiresInDays = 30)
    {
        $this->update([
            'quoted_amount' => $amount,
            'quoted_currency' => $currency,
            'quote_notes' => $notes,
            'quoted_at' => now(),
            'quote_expires_at' => now()->addDays($expiresInDays),
            'status' => 'quoted'
        ]);
    }

    /**
     * Check if quote is expired.
     */
    public function isQuoteExpired()
    {
        return $this->quote_expires_at && $this->quote_expires_at->isPast();
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
            'new' => 'blue',
            'reviewing' => 'yellow',
            'quoted' => 'purple',
            'accepted' => 'green',
            'rejected' => 'red',
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
     * Get formatted budget range.
     */
    public function getFormattedBudgetRangeAttribute()
    {
        return match($this->budget_range) {
            'under_5k' => 'Under $5,000',
            '5k_10k' => '$5,000 - $10,000',
            '10k_25k' => '$10,000 - $25,000',
            '25k_50k' => '$25,000 - $50,000',
            '50k_plus' => '$50,000+',
            default => 'Not specified'
        };
    }

    /**
     * Get formatted timeline.
     */
    public function getFormattedTimelineAttribute()
    {
        return match($this->timeline) {
            'asap' => 'ASAP',
            '1_month' => '1 Month',
            '3_months' => '3 Months',
            '6_months' => '6 Months',
            'flexible' => 'Flexible',
            default => 'Not specified'
        };
    }
}
