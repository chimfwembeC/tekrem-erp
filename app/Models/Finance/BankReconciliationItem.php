<?php

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankReconciliationItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'bank_reconciliation_id',
        'bank_statement_transaction_id',
        'transaction_id',
        'match_type',
        'match_method',
        'match_confidence',
        'amount_difference',
        'match_notes',
        'match_criteria',
        'is_cleared',
        'matched_by',
        'matched_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'match_confidence' => 'decimal:2',
        'amount_difference' => 'decimal:2',
        'match_criteria' => 'array',
        'is_cleared' => 'boolean',
        'matched_at' => 'datetime',
    ];

    /**
     * Get the bank reconciliation that owns this item.
     */
    public function bankReconciliation(): BelongsTo
    {
        return $this->belongsTo(BankReconciliation::class);
    }

    /**
     * Get the bank statement transaction.
     */
    public function bankStatementTransaction(): BelongsTo
    {
        return $this->belongsTo(BankStatementTransaction::class);
    }

    /**
     * Get the internal transaction.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get the user who matched this item.
     */
    public function matchedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'matched_by');
    }

    /**
     * Scope a query to filter by match type.
     */
    public function scopeOfMatchType($query, $matchType)
    {
        return $query->where('match_type', $matchType);
    }

    /**
     * Scope a query to only include cleared items.
     */
    public function scopeCleared($query)
    {
        return $query->where('is_cleared', true);
    }

    /**
     * Scope a query to only include uncleared items.
     */
    public function scopeUncleared($query)
    {
        return $query->where('is_cleared', false);
    }

    /**
     * Scope a query to filter by match method.
     */
    public function scopeByMatchMethod($query, $method)
    {
        return $query->where('match_method', $method);
    }

    /**
     * Scope a query to filter by confidence threshold.
     */
    public function scopeWithConfidenceAbove($query, $threshold)
    {
        return $query->where('match_confidence', '>=', $threshold);
    }

    /**
     * Check if this is a matched item.
     */
    public function isMatched(): bool
    {
        return $this->match_type === 'matched';
    }

    /**
     * Check if this is an unmatched bank transaction.
     */
    public function isUnmatchedBank(): bool
    {
        return $this->match_type === 'unmatched_bank';
    }

    /**
     * Check if this is an unmatched book transaction.
     */
    public function isUnmatchedBook(): bool
    {
        return $this->match_type === 'unmatched_book';
    }

    /**
     * Check if this is a manual adjustment.
     */
    public function isManualAdjustment(): bool
    {
        return $this->match_type === 'manual_adjustment';
    }

    /**
     * Check if this was automatically matched.
     */
    public function isAutoMatched(): bool
    {
        return $this->match_method === 'auto';
    }

    /**
     * Check if this was manually matched.
     */
    public function isManuallyMatched(): bool
    {
        return $this->match_method === 'manual';
    }

    /**
     * Check if this was suggested by the system.
     */
    public function isSuggested(): bool
    {
        return $this->match_method === 'suggested';
    }

    /**
     * Mark this item as cleared.
     */
    public function markAsCleared(): void
    {
        $this->update(['is_cleared' => true]);
    }

    /**
     * Mark this item as uncleared.
     */
    public function markAsUncleared(): void
    {
        $this->update(['is_cleared' => false]);
    }

    /**
     * Get the amount for this reconciliation item.
     */
    public function getAmountAttribute(): float
    {
        if ($this->bankStatementTransaction) {
            return $this->bankStatementTransaction->amount;
        }
        
        if ($this->transaction) {
            return $this->transaction->amount;
        }
        
        return 0;
    }

    /**
     * Get the transaction date for this reconciliation item.
     */
    public function getTransactionDateAttribute()
    {
        if ($this->bankStatementTransaction) {
            return $this->bankStatementTransaction->transaction_date;
        }
        
        if ($this->transaction) {
            return $this->transaction->transaction_date;
        }
        
        return null;
    }

    /**
     * Get the description for this reconciliation item.
     */
    public function getDescriptionAttribute(): string
    {
        if ($this->bankStatementTransaction) {
            return $this->bankStatementTransaction->description;
        }
        
        if ($this->transaction) {
            return $this->transaction->description;
        }
        
        return '';
    }

    /**
     * Get the reference number for this reconciliation item.
     */
    public function getReferenceNumberAttribute(): ?string
    {
        if ($this->bankStatementTransaction) {
            return $this->bankStatementTransaction->reference_number;
        }
        
        if ($this->transaction) {
            return $this->transaction->reference_number;
        }
        
        return null;
    }

    /**
     * Get a formatted confidence score.
     */
    public function getFormattedConfidenceAttribute(): string
    {
        if ($this->match_confidence === null) {
            return 'N/A';
        }
        
        return number_format($this->match_confidence, 1) . '%';
    }

    /**
     * Get confidence level description.
     */
    public function getConfidenceLevelAttribute(): string
    {
        if ($this->match_confidence === null) {
            return 'unknown';
        }
        
        if ($this->match_confidence >= 90) {
            return 'high';
        } elseif ($this->match_confidence >= 70) {
            return 'medium';
        } elseif ($this->match_confidence >= 50) {
            return 'low';
        } else {
            return 'very_low';
        }
    }

    /**
     * Create a match between bank statement transaction and internal transaction.
     */
    public static function createMatch(
        int $reconciliationId,
        int $bankStatementTransactionId,
        int $transactionId,
        string $method = 'manual',
        ?float $confidence = null,
        ?array $criteria = null,
        ?string $notes = null
    ): self {
        return static::create([
            'bank_reconciliation_id' => $reconciliationId,
            'bank_statement_transaction_id' => $bankStatementTransactionId,
            'transaction_id' => $transactionId,
            'match_type' => 'matched',
            'match_method' => $method,
            'match_confidence' => $confidence,
            'match_criteria' => $criteria,
            'match_notes' => $notes,
            'matched_by' => auth()->id(),
            'matched_at' => now(),
        ]);
    }
}
