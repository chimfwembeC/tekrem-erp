<?php

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'account_number',
        'bank_name',
        'balance',
        'initial_balance',
        'currency',
        'description',
        'is_active',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'balance' => 'decimal:2',
        'initial_balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transactions for this account.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the payments for this account.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the expenses for this account.
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * Get transfers from this account.
     */
    public function transfersFrom(): HasMany
    {
        return $this->hasMany(Transaction::class, 'account_id')
            ->where('type', 'transfer');
    }

    /**
     * Get transfers to this account.
     */
    public function transfersTo(): HasMany
    {
        return $this->hasMany(Transaction::class, 'transfer_to_account_id')
            ->where('type', 'transfer');
    }

    /**
     * Scope a query to only include active accounts.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include accounts of a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Update account balance.
     */
    public function updateBalance()
    {
        $income = $this->transactions()
            ->where('type', 'income')
            ->where('status', 'completed')
            ->sum('amount');

        $expenses = $this->transactions()
            ->where('type', 'expense')
            ->where('status', 'completed')
            ->sum('amount');

        $transfersOut = $this->transfersFrom()
            ->where('status', 'completed')
            ->sum('amount');

        $transfersIn = $this->transfersTo()
            ->where('status', 'completed')
            ->sum('amount');

        $this->balance = $this->initial_balance + $income - $expenses - $transfersOut + $transfersIn;
        $this->save();
    }
}
