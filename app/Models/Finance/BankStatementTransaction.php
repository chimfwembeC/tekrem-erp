<?php

namespace App\Models\Finance;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankStatementTransaction extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'bank_statement_id',
        'transaction_date',
        'transaction_type',
        'amount',
        'description',
        'reference_number',
        'check_number',
        'running_balance',
        'transaction_code',
        'raw_data',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
        'running_balance' => 'decimal:2',
        'raw_data' => 'array',
    ];

    /**
     * Get the bank statement that owns this transaction.
     */
    public function bankStatement(): BelongsTo
    {
        return $this->belongsTo(BankStatement::class);
    }

    /**
     * Get the reconciliation items for this transaction.
     */
    public function reconciliationItems(): HasMany
    {
        return $this->hasMany(BankReconciliationItem::class);
    }

    /**
     * Scope a query to only include transactions of a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('transaction_type', $type);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by amount range.
     */
    public function scopeAmountRange($query, $minAmount, $maxAmount)
    {
        return $query->whereBetween('amount', [$minAmount, $maxAmount]);
    }

    /**
     * Scope a query to search by description or reference.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('description', 'like', "%{$search}%")
              ->orWhere('reference_number', 'like', "%{$search}%")
              ->orWhere('check_number', 'like', "%{$search}%");
        });
    }

    /**
     * Scope a query to only include unmatched transactions.
     */
    public function scopeUnmatched($query)
    {
        return $query->whereDoesntHave('reconciliationItems', function ($q) {
            $q->where('match_type', 'matched');
        });
    }

    /**
     * Scope a query to only include matched transactions.
     */
    public function scopeMatched($query)
    {
        return $query->whereHas('reconciliationItems', function ($q) {
            $q->where('match_type', 'matched');
        });
    }

    /**
     * Check if this transaction has been matched in reconciliation.
     */
    public function isMatched(): bool
    {
        return $this->reconciliationItems()
            ->where('match_type', 'matched')
            ->exists();
    }

    /**
     * Get the matched internal transaction if any.
     */
    public function getMatchedTransaction()
    {
        $reconciliationItem = $this->reconciliationItems()
            ->where('match_type', 'matched')
            ->with('transaction')
            ->first();

        return $reconciliationItem ? $reconciliationItem->transaction : null;
    }

    /**
     * Get the formatted amount with transaction type indicator.
     */
    public function getFormattedAmountAttribute(): string
    {
        $sign = $this->transaction_type === 'debit' ? '-' : '+';
        return $sign . number_format($this->amount, 2);
    }

    /**
     * Get a clean description for matching purposes.
     */
    public function getCleanDescriptionAttribute(): string
    {
        // Remove common bank codes and clean up description for better matching
        $description = strtolower($this->description);
        $description = preg_replace('/\b(pos|atm|ach|wire|check|dep|wd|transfer)\b/', '', $description);
        $description = preg_replace('/[^a-z0-9\s]/', '', $description);
        $description = preg_replace('/\s+/', ' ', $description);
        return trim($description);
    }

    /**
     * Calculate similarity score with an internal transaction.
     */
    public function calculateSimilarityScore(Transaction $transaction): float
    {
        $score = 0;
        $maxScore = 100;

        // Amount match (40 points)
        if (abs($this->amount - abs($transaction->amount)) < 0.01) {
            $score += 40;
        } elseif (abs($this->amount - abs($transaction->amount)) < 1.00) {
            $score += 20;
        }

        // Date proximity (30 points)
        $daysDiff = abs($this->transaction_date->diffInDays($transaction->transaction_date));
        if ($daysDiff === 0) {
            $score += 30;
        } elseif ($daysDiff <= 1) {
            $score += 25;
        } elseif ($daysDiff <= 3) {
            $score += 15;
        } elseif ($daysDiff <= 7) {
            $score += 5;
        }

        // Description similarity (20 points)
        $cleanBankDesc = $this->clean_description;
        $cleanTransDesc = strtolower(preg_replace('/[^a-z0-9\s]/', '', $transaction->description));
        
        if (strlen($cleanBankDesc) > 0 && strlen($cleanTransDesc) > 0) {
            similar_text($cleanBankDesc, $cleanTransDesc, $percent);
            $score += ($percent / 100) * 20;
        }

        // Reference number match (10 points)
        if ($this->reference_number && $transaction->reference_number) {
            if ($this->reference_number === $transaction->reference_number) {
                $score += 10;
            }
        }

        return min($score, $maxScore);
    }
}
