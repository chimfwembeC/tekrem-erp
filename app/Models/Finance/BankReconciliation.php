<?php

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankReconciliation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'account_id',
        'bank_statement_id',
        'reconciliation_number',
        'reconciliation_date',
        'period_start',
        'period_end',
        'statement_opening_balance',
        'statement_closing_balance',
        'book_opening_balance',
        'book_closing_balance',
        'difference',
        'status',
        'matched_transactions_count',
        'unmatched_bank_transactions_count',
        'unmatched_book_transactions_count',
        'matched_amount',
        'unmatched_bank_amount',
        'unmatched_book_amount',
        'notes',
        'reconciliation_summary',
        'reconciled_by',
        'reconciled_at',
        'reviewed_by',
        'reviewed_at',
        'approved_by',
        'approved_at',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'reconciliation_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'statement_opening_balance' => 'decimal:2',
        'statement_closing_balance' => 'decimal:2',
        'book_opening_balance' => 'decimal:2',
        'book_closing_balance' => 'decimal:2',
        'difference' => 'decimal:2',
        'matched_amount' => 'decimal:2',
        'unmatched_bank_amount' => 'decimal:2',
        'unmatched_book_amount' => 'decimal:2',
        'reconciliation_summary' => 'array',
        'reconciled_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the account for this reconciliation.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the bank statement for this reconciliation.
     */
    public function bankStatement(): BelongsTo
    {
        return $this->belongsTo(BankStatement::class);
    }

    /**
     * Get the user who performed the reconciliation.
     */
    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }

    /**
     * Get the user who reviewed the reconciliation.
     */
    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the user who approved the reconciliation.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user that owns this reconciliation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reconciliation items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(BankReconciliationItem::class);
    }

    /**
     * Get matched reconciliation items.
     */
    public function matchedItems(): HasMany
    {
        return $this->hasMany(BankReconciliationItem::class)
            ->where('match_type', 'matched');
    }

    /**
     * Get unmatched bank transaction items.
     */
    public function unmatchedBankItems(): HasMany
    {
        return $this->hasMany(BankReconciliationItem::class)
            ->where('match_type', 'unmatched_bank');
    }

    /**
     * Get unmatched book transaction items.
     */
    public function unmatchedBookItems(): HasMany
    {
        return $this->hasMany(BankReconciliationItem::class)
            ->where('match_type', 'unmatched_book');
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter by account.
     */
    public function scopeForAccount($query, $accountId)
    {
        return $query->where('account_id', $accountId);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('reconciliation_date', [$startDate, $endDate]);
    }

    /**
     * Calculate reconciliation progress percentage.
     */
    public function getProgressPercentageAttribute(): float
    {
        $totalItems = $this->items()->count();
        if ($totalItems === 0) {
            return 0;
        }

        $clearedItems = $this->items()->where('is_cleared', true)->count();
        return round(($clearedItems / $totalItems) * 100, 2);
    }

    /**
     * Check if reconciliation is balanced.
     */
    public function isBalanced(): bool
    {
        return abs($this->difference) < 0.01;
    }

    /**
     * Check if reconciliation is complete.
     */
    public function isComplete(): bool
    {
        return $this->status === 'completed' && $this->isBalanced();
    }

    /**
     * Mark reconciliation as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'reconciled_at' => now(),
            'reconciled_by' => auth()->id(),
        ]);
    }

    /**
     * Mark reconciliation as reviewed.
     */
    public function markAsReviewed(int $reviewerId): void
    {
        $this->update([
            'status' => 'reviewed',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Mark reconciliation as approved.
     */
    public function markAsApproved(int $approverId): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approverId,
            'approved_at' => now(),
        ]);
    }

    /**
     * Update reconciliation statistics.
     */
    public function updateStatistics(): void
    {
        $matchedItems = $this->matchedItems;
        $unmatchedBankItems = $this->unmatchedBankItems;
        $unmatchedBookItems = $this->unmatchedBookItems;

        $this->update([
            'matched_transactions_count' => $matchedItems->count(),
            'unmatched_bank_transactions_count' => $unmatchedBankItems->count(),
            'unmatched_book_transactions_count' => $unmatchedBookItems->count(),
            'matched_amount' => $matchedItems->sum(function ($item) {
                return $item->bankStatementTransaction ? $item->bankStatementTransaction->amount : 0;
            }),
            'unmatched_bank_amount' => $unmatchedBankItems->sum(function ($item) {
                return $item->bankStatementTransaction ? $item->bankStatementTransaction->amount : 0;
            }),
            'unmatched_book_amount' => $unmatchedBookItems->sum(function ($item) {
                return $item->transaction ? $item->transaction->amount : 0;
            }),
        ]);

        // Recalculate difference
        $this->calculateDifference();
    }

    /**
     * Calculate the reconciliation difference.
     */
    public function calculateDifference(): void
    {
        $adjustedBookBalance = $this->book_closing_balance + 
            $this->unmatched_bank_amount - $this->unmatched_book_amount;
        
        $difference = $this->statement_closing_balance - $adjustedBookBalance;
        
        $this->update(['difference' => $difference]);
    }

    /**
     * Generate a unique reconciliation number.
     */
    public static function generateReconciliationNumber(int $accountId): string
    {
        $account = Account::find($accountId);
        $prefix = $account ? strtoupper(substr($account->name, 0, 3)) : 'REC';
        $date = now()->format('Ymd');
        
        $lastReconciliation = static::where('account_id', $accountId)
            ->whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastReconciliation ? 
            (int) substr($lastReconciliation->reconciliation_number, -3) + 1 : 1;
        
        return $prefix . '-REC-' . $date . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }
}
