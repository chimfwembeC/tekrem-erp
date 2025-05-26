<?php

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Invoice extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'invoice_number',
        'status',
        'issue_date',
        'due_date',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'paid_amount',
        'currency',
        'notes',
        'terms',
        'billable_id',
        'billable_type',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    /**
     * Get the billable entity (client or lead).
     */
    public function billable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user that created the invoice.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the invoice items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Get the payments for this invoice.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the transactions for this invoice.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Scope a query to only include invoices with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include overdue invoices.
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
            ->whereIn('status', ['sent', 'partial']);
    }

    /**
     * Get the remaining balance.
     */
    public function getRemainingBalanceAttribute()
    {
        return $this->total_amount - $this->paid_amount;
    }

    /**
     * Check if the invoice is fully paid.
     */
    public function getIsFullyPaidAttribute()
    {
        return $this->paid_amount >= $this->total_amount;
    }

    /**
     * Check if the invoice is overdue.
     */
    public function getIsOverdueAttribute()
    {
        return $this->due_date < now() && !$this->is_fully_paid;
    }

    /**
     * Generate a unique invoice number.
     */
    public static function generateInvoiceNumber()
    {
        $year = date('Y');
        $month = date('m');
        $lastInvoice = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastInvoice ? (int) substr($lastInvoice->invoice_number, -4) + 1 : 1;

        return 'INV-' . $year . $month . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Calculate totals based on items.
     */
    public function calculateTotals()
    {
        $this->subtotal = $this->items->sum('total_price');
        $this->tax_amount = $this->items->sum(function ($item) {
            return $item->total_price * ($item->tax_rate / 100);
        });
        $this->total_amount = $this->subtotal + $this->tax_amount - $this->discount_amount;
        $this->save();
    }
}
