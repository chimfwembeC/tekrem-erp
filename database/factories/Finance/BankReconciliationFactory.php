<?php

namespace Database\Factories\Finance;

use App\Models\Finance\Account;
use App\Models\Finance\BankReconciliation;
use App\Models\Finance\BankStatement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\BankReconciliation>
 */
class BankReconciliationFactory extends Factory
{
    protected $model = BankReconciliation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $openingBalance = $this->faker->randomFloat(2, 1000, 50000);
        $closingBalance = $openingBalance + $this->faker->randomFloat(2, -5000, 10000);
        
        return [
            'account_id' => Account::factory(),
            'bank_statement_id' => BankStatement::factory(),
            'reconciliation_number' => 'REC-' . $this->faker->unique()->numerify('######'),
            'reconciliation_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'period_start' => $this->faker->dateTimeBetween('-2 months', '-1 month'),
            'period_end' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'statement_opening_balance' => $openingBalance,
            'statement_closing_balance' => $closingBalance,
            'book_opening_balance' => $openingBalance + $this->faker->randomFloat(2, -100, 100),
            'book_closing_balance' => $closingBalance + $this->faker->randomFloat(2, -100, 100),
            'status' => $this->faker->randomElement(['pending', 'in_progress', 'completed', 'approved']),
            'matched_transactions_count' => $this->faker->numberBetween(0, 50),
            'unmatched_bank_transactions_count' => $this->faker->numberBetween(0, 10),
            'unmatched_book_transactions_count' => $this->faker->numberBetween(0, 10),
            'notes' => $this->faker->optional()->paragraph(),
            'reconciled_by' => null,
            'reconciled_at' => null,
            'approved_by' => null,
            'approved_at' => null,
            'user_id' => User::factory(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the reconciliation is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'reconciled_by' => null,
            'reconciled_at' => null,
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    /**
     * Indicate that the reconciliation is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'reconciled_by' => null,
            'reconciled_at' => null,
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    /**
     * Indicate that the reconciliation is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'reconciled_by' => User::factory(),
            'reconciled_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    /**
     * Indicate that the reconciliation is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'reconciled_by' => User::factory(),
            'reconciled_at' => $this->faker->dateTimeBetween('-1 week', '-1 day'),
            'approved_by' => User::factory(),
            'approved_at' => $this->faker->dateTimeBetween('-1 day', 'now'),
        ]);
    }

    /**
     * Indicate that the reconciliation is balanced.
     */
    public function balanced(): static
    {
        $openingBalance = $this->faker->randomFloat(2, 1000, 50000);
        $closingBalance = $openingBalance + $this->faker->randomFloat(2, -5000, 10000);
        
        return $this->state(fn (array $attributes) => [
            'statement_opening_balance' => $openingBalance,
            'statement_closing_balance' => $closingBalance,
            'book_opening_balance' => $openingBalance,
            'book_closing_balance' => $closingBalance,
        ]);
    }

    /**
     * Indicate that the reconciliation is unbalanced.
     */
    public function unbalanced(): static
    {
        $openingBalance = $this->faker->randomFloat(2, 1000, 50000);
        $closingBalance = $openingBalance + $this->faker->randomFloat(2, -5000, 10000);
        $difference = $this->faker->randomFloat(2, 50, 500);
        
        return $this->state(fn (array $attributes) => [
            'statement_opening_balance' => $openingBalance,
            'statement_closing_balance' => $closingBalance,
            'book_opening_balance' => $openingBalance,
            'book_closing_balance' => $closingBalance + $difference,
        ]);
    }

    /**
     * Create a reconciliation for a specific account.
     */
    public function forAccount(Account $account): static
    {
        return $this->state(fn (array $attributes) => [
            'account_id' => $account->id,
        ]);
    }

    /**
     * Create a reconciliation for a specific bank statement.
     */
    public function forBankStatement(BankStatement $bankStatement): static
    {
        return $this->state(fn (array $attributes) => [
            'bank_statement_id' => $bankStatement->id,
            'account_id' => $bankStatement->account_id,
        ]);
    }

    /**
     * Create a reconciliation with specific transaction counts.
     */
    public function withTransactionCounts(int $matched, int $unmatchedBank, int $unmatchedBook): static
    {
        return $this->state(fn (array $attributes) => [
            'matched_transactions_count' => $matched,
            'unmatched_bank_transactions_count' => $unmatchedBank,
            'unmatched_book_transactions_count' => $unmatchedBook,
        ]);
    }

    /**
     * Create a reconciliation with specific balances.
     */
    public function withBalances(
        float $statementOpening,
        float $statementClosing,
        float $bookOpening,
        float $bookClosing
    ): static {
        return $this->state(fn (array $attributes) => [
            'statement_opening_balance' => $statementOpening,
            'statement_closing_balance' => $statementClosing,
            'book_opening_balance' => $bookOpening,
            'book_closing_balance' => $bookClosing,
        ]);
    }

    /**
     * Create a reconciliation for a specific date range.
     */
    public function forPeriod(string $startDate, string $endDate): static
    {
        return $this->state(fn (array $attributes) => [
            'period_start' => $startDate,
            'period_end' => $endDate,
            'reconciliation_date' => $endDate,
        ]);
    }

    /**
     * Create a reconciliation with notes.
     */
    public function withNotes(string $notes): static
    {
        return $this->state(fn (array $attributes) => [
            'notes' => $notes,
        ]);
    }

    /**
     * Create a reconciliation reconciled by a specific user.
     */
    public function reconciledBy(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'reconciled_by' => $user->id,
            'reconciled_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'status' => 'completed',
        ]);
    }

    /**
     * Create a reconciliation approved by a specific user.
     */
    public function approvedBy(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'approved_by' => $user->id,
            'approved_at' => $this->faker->dateTimeBetween('-1 day', 'now'),
            'status' => 'approved',
        ]);
    }
}
