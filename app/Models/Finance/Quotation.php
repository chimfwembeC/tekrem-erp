<?php

namespace App\Models\Finance;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quotation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'quotation_number',
        'status',
        'issue_date',
        'expiry_date',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'currency',
        'notes',
        'terms',
        'lead_id',
        'user_id',
        'converted_to_invoice_id',
        'converted_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'converted_at' => 'datetime',
    ];

    /**
     * Get the user that owns the quotation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the lead associated with the quotation.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Get the items for the quotation.
     */
    public function items(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }

    /**
     * Get the invoice this quotation was converted to.
     */
    public function convertedToInvoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'converted_to_invoice_id');
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($quotation) {
            if (empty($quotation->quotation_number)) {
                $quotation->quotation_number = static::generateQuotationNumber();
            }
        });
    }

    /**
     * Generate a unique quotation number.
     */
    public static function generateQuotationNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        
        // Get the last quotation number for this month
        $lastQuotation = static::where('quotation_number', 'like', "QUO-{$year}{$month}-%")
            ->orderBy('quotation_number', 'desc')
            ->first();

        if ($lastQuotation) {
            $lastNumber = (int) substr($lastQuotation->quotation_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf('QUO-%s%s-%04d', $year, $month, $newNumber);
    }

    /**
     * Scope a query to only include quotations with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include expired quotations.
     */
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now())
            ->whereIn('status', ['sent', 'draft']);
    }

    /**
     * Scope a query to only include active quotations.
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['draft', 'sent'])
            ->where('expiry_date', '>=', now());
    }

    /**
     * Check if the quotation is expired.
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date < now() && in_array($this->status, ['draft', 'sent']);
    }

    /**
     * Check if the quotation can be converted to invoice.
     */
    public function getCanConvertToInvoiceAttribute(): bool
    {
        return $this->status === 'accepted' && !$this->converted_to_invoice_id;
    }

    /**
     * Check if the quotation is converted.
     */
    public function getIsConvertedAttribute(): bool
    {
        return !is_null($this->converted_to_invoice_id);
    }

    /**
     * Get the days until expiry.
     */
    public function getDaysUntilExpiryAttribute(): int
    {
        return max(0, now()->diffInDays($this->expiry_date, false));
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

    /**
     * Mark quotation as expired if past expiry date.
     */
    public function checkAndUpdateExpiry()
    {
        if ($this->is_expired && in_array($this->status, ['draft', 'sent'])) {
            $this->update(['status' => 'expired']);
        }
    }

    /**
     * Convert quotation to invoice.
     */
    public function convertToInvoice($clientId = null): Invoice
    {
        if (!$this->can_convert_to_invoice) {
            throw new \Exception('Quotation cannot be converted to invoice.');
        }

        // If no client ID provided, try to get from lead's converted client
        if (!$clientId && $this->lead->converted_to_client) {
            $clientId = $this->lead->converted_to_client_id;
        }

        if (!$clientId) {
            throw new \Exception('Lead must be converted to client before creating invoice.');
        }

        $invoice = Invoice::create([
            'status' => 'draft',
            'issue_date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'subtotal' => $this->subtotal,
            'tax_amount' => $this->tax_amount,
            'discount_amount' => $this->discount_amount,
            'total_amount' => $this->total_amount,
            'currency' => $this->currency,
            'notes' => $this->notes,
            'terms' => $this->terms,
            'billable_id' => $clientId,
            'billable_type' => 'App\Models\Client',
            'user_id' => $this->user_id,
        ]);

        // Copy quotation items to invoice items
        foreach ($this->items as $quotationItem) {
            $invoice->items()->create([
                'description' => $quotationItem->description,
                'quantity' => $quotationItem->quantity,
                'unit_price' => $quotationItem->unit_price,
                'total_price' => $quotationItem->total_price,
                'tax_rate' => $quotationItem->tax_rate,
                'discount_rate' => $quotationItem->discount_rate,
            ]);
        }

        // Update quotation with conversion info
        $this->update([
            'converted_to_invoice_id' => $invoice->id,
            'converted_at' => now(),
        ]);

        return $invoice;
    }
}
