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
        'account_code',
        'type',
        'account_category',
        'account_subcategory',
        'parent_account_id',
        'level',
        'normal_balance',
        'is_system_account',
        'allow_manual_entries',
        'account_settings',
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
        'is_system_account' => 'boolean',
        'allow_manual_entries' => 'boolean',
        'account_settings' => 'array',
        'level' => 'integer',
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
     * Get the parent account (Chart of Accounts hierarchy).
     */
    public function parentAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'parent_account_id');
    }

    /**
     * Get child accounts (Chart of Accounts hierarchy).
     */
    public function childAccounts(): HasMany
    {
        return $this->hasMany(Account::class, 'parent_account_id');
    }

    /**
     * Get all descendant accounts recursively.
     */
    public function descendants(): HasMany
    {
        return $this->childAccounts()->with('descendants');
    }

    /**
     * Get bank statements for this account.
     */
    public function bankStatements(): HasMany
    {
        return $this->hasMany(BankStatement::class);
    }

    /**
     * Get bank reconciliations for this account.
     */
    public function bankReconciliations(): HasMany
    {
        return $this->hasMany(BankReconciliation::class);
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
     * Scope a query to only include accounts of a specific category.
     */
    public function scopeOfCategory($query, $category)
    {
        return $query->where('account_category', $category);
    }

    /**
     * Scope a query to only include root accounts (no parent).
     */
    public function scopeRootAccounts($query)
    {
        return $query->whereNull('parent_account_id');
    }

    /**
     * Scope a query to only include accounts at a specific level.
     */
    public function scopeAtLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Scope a query to only include accounts that allow manual entries.
     */
    public function scopeAllowManualEntries($query)
    {
        return $query->where('allow_manual_entries', true);
    }

    /**
     * Scope a query to only include system accounts.
     */
    public function scopeSystemAccounts($query)
    {
        return $query->where('is_system_account', true);
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

    /**
     * Get the full account path (for hierarchical display).
     */
    public function getFullAccountPath(): string
    {
        $path = [$this->name];
        $parent = $this->parentAccount;

        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parentAccount;
        }

        return implode(' > ', $path);
    }

    /**
     * Get the account code with parent codes (e.g., 1000.1100.1110).
     */
    public function getFullAccountCode(): string
    {
        $codes = [$this->account_code];
        $parent = $this->parentAccount;

        while ($parent && $parent->account_code) {
            array_unshift($codes, $parent->account_code);
            $parent = $parent->parentAccount;
        }

        return implode('.', array_filter($codes));
    }

    /**
     * Check if this account is a parent of another account.
     */
    public function isParentOf(Account $account): bool
    {
        return $account->parent_account_id === $this->id;
    }

    /**
     * Check if this account is a child of another account.
     */
    public function isChildOf(Account $account): bool
    {
        return $this->parent_account_id === $account->id;
    }

    /**
     * Check if this account is an ancestor of another account.
     */
    public function isAncestorOf(Account $account): bool
    {
        $parent = $account->parentAccount;
        while ($parent) {
            if ($parent->id === $this->id) {
                return true;
            }
            $parent = $parent->parentAccount;
        }
        return false;
    }

    /**
     * Check if this account is a descendant of another account.
     */
    public function isDescendantOf(Account $account): bool
    {
        return $account->isAncestorOf($this);
    }

    /**
     * Get all accounts in the same category.
     */
    public function getSiblingAccounts()
    {
        return static::where('account_category', $this->account_category)
            ->where('parent_account_id', $this->parent_account_id)
            ->where('id', '!=', $this->id)
            ->get();
    }

    /**
     * Generate next available account code for a given parent.
     */
    public static function generateAccountCode(?int $parentId = null, string $category = null): string
    {
        $baseCode = '1000';

        if ($parentId) {
            $parent = static::find($parentId);
            if ($parent && $parent->account_code) {
                $lastChild = static::where('parent_account_id', $parentId)
                    ->whereNotNull('account_code')
                    ->orderBy('account_code', 'desc')
                    ->first();

                if ($lastChild) {
                    $lastCode = (int) substr($lastChild->account_code, -2);
                    $newCode = str_pad($lastCode + 10, 2, '0', STR_PAD_LEFT);
                    return substr($parent->account_code, 0, -2) . $newCode;
                } else {
                    return $parent->account_code . '10';
                }
            }
        }

        // Generate root level codes based on category
        $categoryPrefixes = [
            'assets' => '1',
            'liabilities' => '2',
            'equity' => '3',
            'income' => '4',
            'expenses' => '5',
        ];

        if ($category && isset($categoryPrefixes[$category])) {
            $prefix = $categoryPrefixes[$category];
            $lastAccount = static::where('account_code', 'like', $prefix . '%')
                ->whereNull('parent_account_id')
                ->orderBy('account_code', 'desc')
                ->first();

            if ($lastAccount) {
                $lastCode = (int) $lastAccount->account_code;
                return (string) ($lastCode + 1000);
            } else {
                return $prefix . '000';
            }
        }

        return $baseCode;
    }
}
