<?php

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankStatement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'account_id',
        'statement_number',
        'statement_date',
        'period_start',
        'period_end',
        'opening_balance',
        'closing_balance',
        'import_method',
        'file_path',
        'file_name',
        'status',
        'import_metadata',
        'imported_by',
        'imported_at',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'statement_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'opening_balance' => 'decimal:2',
        'closing_balance' => 'decimal:2',
        'import_metadata' => 'array',
        'imported_at' => 'datetime',
    ];

    /**
     * Get the account that owns this bank statement.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the user who imported this statement.
     */
    public function importedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }

    /**
     * Get the user that owns this statement.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the bank statement transactions.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(BankStatementTransaction::class);
    }

    /**
     * Get the bank reconciliations for this statement.
     */
    public function reconciliations(): HasMany
    {
        return $this->hasMany(BankReconciliation::class);
    }

    /**
     * Scope a query to only include statements with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include statements for a specific account.
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
        return $query->whereBetween('statement_date', [$startDate, $endDate]);
    }

    /**
     * Get the total number of transactions in this statement.
     */
    public function getTransactionCountAttribute(): int
    {
        return $this->transactions()->count();
    }

    /**
     * Get the total debit amount for this statement.
     */
    public function getTotalDebitAmountAttribute(): float
    {
        return $this->transactions()
            ->where('transaction_type', 'debit')
            ->sum('amount');
    }

    /**
     * Get the total credit amount for this statement.
     */
    public function getTotalCreditAmountAttribute(): float
    {
        return $this->transactions()
            ->where('transaction_type', 'credit')
            ->sum('amount');
    }

    /**
     * Calculate the net change for this statement period.
     */
    public function getNetChangeAttribute(): float
    {
        return $this->closing_balance - $this->opening_balance;
    }

    /**
     * Check if this statement has been reconciled.
     */
    public function isReconciled(): bool
    {
        return $this->reconciliations()
            ->where('status', 'completed')
            ->exists();
    }

    /**
     * Get the latest reconciliation for this statement.
     */
    public function getLatestReconciliation()
    {
        return $this->reconciliations()
            ->orderBy('created_at', 'desc')
            ->first();
    }

    /**
     * Mark the statement as processed.
     */
    public function markAsProcessed(): void
    {
        $this->update(['status' => 'completed']);
    }

    /**
     * Mark the statement as failed.
     */
    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }

    /**
     * Generate a unique statement number.
     */
    public static function generateStatementNumber(int $accountId): string
    {
        $account = Account::find($accountId);
        $prefix = $account ? strtoupper(substr($account->name, 0, 3)) : 'STM';
        $date = now()->format('Ymd');
        
        $lastStatement = static::where('account_id', $accountId)
            ->whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastStatement ? 
            (int) substr($lastStatement->statement_number, -3) + 1 : 1;
        
        return $prefix . '-' . $date . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }
}
