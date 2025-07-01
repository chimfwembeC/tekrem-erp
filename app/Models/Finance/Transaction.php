<?php

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type',
        'amount',
        'description',
        'transaction_date',
        'reference_number',
        'status',
        'account_id',
        'category_id',
        'transfer_to_account_id',
        'invoice_id',
        'expense_id',
        'user_id',
        'metadata',
        'is_reconciled',
        'reconciliation_id',
        'reconciled_date',
        'reconciled_by',
        'reconciliation_notes',
        'debit_account_code',
        'credit_account_code',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
        'metadata' => 'array',
        'is_reconciled' => 'boolean',
        'reconciled_date' => 'date',
    ];

    /**
     * Get the account that owns the transaction.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the category for the transaction.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the transfer destination account.
     */
    public function transferToAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'transfer_to_account_id');
    }

    /**
     * Get the invoice associated with the transaction.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the expense associated with the transaction.
     */
    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }

    /**
     * Get the user that created the transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the bank reconciliation for this transaction.
     */
    public function reconciliation(): BelongsTo
    {
        return $this->belongsTo(BankReconciliation::class, 'reconciliation_id');
    }

    /**
     * Get the user who reconciled this transaction.
     */
    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by');
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
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include completed transactions.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include reconciled transactions.
     */
    public function scopeReconciled($query)
    {
        return $query->where('is_reconciled', true);
    }

    /**
     * Scope a query to only include unreconciled transactions.
     */
    public function scopeUnreconciled($query)
    {
        return $query->where('is_reconciled', false);
    }

    /**
     * Scope a query to filter by reconciliation status.
     */
    public function scopeReconciliationStatus($query, $isReconciled)
    {
        return $query->where('is_reconciled', $isReconciled);
    }

    /**
     * Get the formatted amount with currency.
     */
    public function getFormattedAmountAttribute()
    {
        $currency = $this->account->currency ?? 'USD';
        return number_format($this->amount, 2) . ' ' . $currency;
    }

    /**
     * Mark this transaction as reconciled.
     */
    public function markAsReconciled(int $reconciliationId, ?string $notes = null): void
    {
        $this->update([
            'is_reconciled' => true,
            'reconciliation_id' => $reconciliationId,
            'reconciled_date' => now(),
            'reconciled_by' => auth()->id(),
            'reconciliation_notes' => $notes,
        ]);
    }

    /**
     * Mark this transaction as unreconciled.
     */
    public function markAsUnreconciled(): void
    {
        $this->update([
            'is_reconciled' => false,
            'reconciliation_id' => null,
            'reconciled_date' => null,
            'reconciled_by' => null,
            'reconciliation_notes' => null,
        ]);
    }

    /**
     * Check if this transaction is available for reconciliation.
     */
    public function isAvailableForReconciliation(): bool
    {
        return !$this->is_reconciled && $this->status === 'completed';
    }

    /**
     * Get transactions that are candidates for matching with a bank statement transaction.
     */
    public static function getCandidatesForMatching(
        int $accountId,
        float $amount,
        $transactionDate,
        int $daysTolerance = 7
    ) {
        $startDate = $transactionDate->copy()->subDays($daysTolerance);
        $endDate = $transactionDate->copy()->addDays($daysTolerance);

        return static::where('account_id', $accountId)
            ->where('is_reconciled', false)
            ->where('status', 'completed')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->where(function ($query) use ($amount) {
                // Look for exact amount match or close matches
                $query->where('amount', abs($amount))
                      ->orWhereBetween('amount', [abs($amount) - 1, abs($amount) + 1]);
            })
            ->orderByRaw('ABS(DATEDIFF(transaction_date, ?)) ASC', [$transactionDate])
            ->get();
    }
}
