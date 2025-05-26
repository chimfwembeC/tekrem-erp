<?php

namespace App\Models\Finance;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'quotation_id',
        'description',
        'quantity',
        'unit_price',
        'total_price',
        'tax_rate',
        'discount_rate',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'discount_rate' => 'decimal:2',
    ];

    /**
     * Get the quotation that owns the item.
     */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    /**
     * Calculate the total price based on quantity and unit price.
     */
    public function calculateTotalPrice()
    {
        $subtotal = $this->quantity * $this->unit_price;
        $discount = $subtotal * ($this->discount_rate / 100);
        $this->total_price = $subtotal - $discount;
        $this->save();
    }

    /**
     * Get the tax amount for this item.
     */
    public function getTaxAmountAttribute()
    {
        return $this->total_price * ($this->tax_rate / 100);
    }

    /**
     * Get the discount amount for this item.
     */
    public function getDiscountAmountAttribute()
    {
        $subtotal = $this->quantity * $this->unit_price;
        return $subtotal * ($this->discount_rate / 100);
    }

    /**
     * Get the subtotal before discount.
     */
    public function getSubtotalAttribute()
    {
        return $this->quantity * $this->unit_price;
    }
}
