<?php

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Budget extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'amount',
        'spent_amount',
        'period_type',
        'start_date',
        'end_date',
        'status',
        'alert_threshold',
        'alert_enabled',
        'account_id',
        'category_id',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'spent_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'alert_threshold' => 'decimal:2',
        'alert_enabled' => 'boolean',
    ];

    /**
     * Get the account for the budget.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the category for the budget.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the user that created the budget.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include active budgets.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include current budgets.
     */
    public function scopeCurrent($query)
    {
        return $query->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    /**
     * Get the remaining amount.
     */
    public function getRemainingAmountAttribute()
    {
        return $this->amount - $this->spent_amount;
    }

    /**
     * Get the percentage spent.
     */
    public function getPercentageSpentAttribute()
    {
        if ($this->amount == 0) {
            return 0;
        }
        return ($this->spent_amount / $this->amount) * 100;
    }

    /**
     * Check if the budget is over the alert threshold.
     */
    public function getIsOverThresholdAttribute()
    {
        return $this->percentage_spent >= $this->alert_threshold;
    }

    /**
     * Check if the budget is exceeded.
     */
    public function getIsExceededAttribute()
    {
        return $this->spent_amount > $this->amount;
    }

    /**
     * Update spent amount based on expenses.
     */
    public function updateSpentAmount()
    {
        $this->spent_amount = Expense::where('category_id', $this->category_id)
            ->whereBetween('expense_date', [$this->start_date, $this->end_date])
            ->where('status', 'approved')
            ->sum('amount');
        $this->save();
    }
}
