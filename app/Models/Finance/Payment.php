<?php

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Payment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'payment_number',
        'amount',
        'payment_date',
        'payment_method',
        'status',
        'reference_number',
        'notes',
        'invoice_id',
        'account_id',
        'payable_id',
        'payable_type',
        'user_id',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'metadata' => 'array',
    ];

    /**
     * Get the payable entity (client or lead).
     */
    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the invoice associated with the payment.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the account for the payment.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the user that created the payment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include payments with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }

    /**
     * Generate a unique payment number.
     */
    public static function generatePaymentNumber()
    {
        $year = date('Y');
        $month = date('m');
        $lastPayment = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastPayment ? (int) substr($lastPayment->payment_number, -4) + 1 : 1;

        return 'PAY-' . $year . $month . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
