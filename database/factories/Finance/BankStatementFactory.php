<?php

namespace Database\Factories\Finance;

use App\Models\Finance\Account;
use App\Models\Finance\BankStatement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\BankStatement>
 */
class BankStatementFactory extends Factory
{
    protected $model = BankStatement::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $openingBalance = $this->faker->randomFloat(2, 1000, 100000);
        $closingBalance = $openingBalance + $this->faker->randomFloat(2, -10000, 20000);
        
        return [
            'account_id' => Account::factory(),
            'statement_number' => 'STMT-' . $this->faker->unique()->numerify('######'),
            'statement_date' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'period_start' => $this->faker->dateTimeBetween('-4 months', '-3 months'),
            'period_end' => $this->faker->dateTimeBetween('-3 months', '-1 month'),
            'opening_balance' => $openingBalance,
            'closing_balance' => $closingBalance,
            'total_debits' => $this->faker->randomFloat(2, 0, 50000),
            'total_credits' => $this->faker->randomFloat(2, 0, 50000),
            'transaction_count' => $this->faker->numberBetween(10, 100),
            'status' => $this->faker->randomElement(['pending', 'processing', 'completed', 'error']),
            'file_path' => $this->faker->optional()->filePath(),
            'file_name' => $this->faker->optional()->word() . '.csv',
            'imported_at' => $this->faker->optional()->dateTimeBetween('-1 month', 'now'),
            'notes' => $this->faker->optional()->paragraph(),
            'user_id' => User::factory(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the statement is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'imported_at' => null,
        ]);
    }

    /**
     * Indicate that the statement is processing.
     */
    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'processing',
            'imported_at' => null,
        ]);
    }

    /**
     * Indicate that the statement is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'imported_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the statement has an error.
     */
    public function error(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'error',
            'imported_at' => null,
            'notes' => 'Error processing statement: ' . $this->faker->sentence(),
        ]);
    }

    /**
     * Create a statement for a specific account.
     */
    public function forAccount(Account $account): static
    {
        return $this->state(fn (array $attributes) => [
            'account_id' => $account->id,
        ]);
    }

    /**
     * Create a statement for a specific period.
     */
    public function forPeriod(string $startDate, string $endDate): static
    {
        return $this->state(fn (array $attributes) => [
            'period_start' => $startDate,
            'period_end' => $endDate,
            'statement_date' => $endDate,
        ]);
    }

    /**
     * Create a statement with specific balances.
     */
    public function withBalances(float $opening, float $closing): static
    {
        return $this->state(fn (array $attributes) => [
            'opening_balance' => $opening,
            'closing_balance' => $closing,
        ]);
    }

    /**
     * Create a statement with specific transaction totals.
     */
    public function withTotals(float $debits, float $credits, int $count): static
    {
        return $this->state(fn (array $attributes) => [
            'total_debits' => $debits,
            'total_credits' => $credits,
            'transaction_count' => $count,
        ]);
    }

    /**
     * Create a statement with file information.
     */
    public function withFile(string $fileName, string $filePath = null): static
    {
        return $this->state(fn (array $attributes) => [
            'file_name' => $fileName,
            'file_path' => $filePath ?? 'statements/' . $fileName,
        ]);
    }

    /**
     * Create a statement with notes.
     */
    public function withNotes(string $notes): static
    {
        return $this->state(fn (array $attributes) => [
            'notes' => $notes,
        ]);
    }

    /**
     * Create a monthly statement.
     */
    public function monthly(): static
    {
        $startDate = $this->faker->dateTimeBetween('-2 months', '-1 month');
        $endDate = (clone $startDate)->modify('+1 month');
        
        return $this->state(fn (array $attributes) => [
            'period_start' => $startDate,
            'period_end' => $endDate,
            'statement_date' => $endDate,
        ]);
    }

    /**
     * Create a recent statement.
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'statement_date' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'period_start' => $this->faker->dateTimeBetween('-1 month', '-1 week'),
            'period_end' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Create a large statement with many transactions.
     */
    public function large(): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_count' => $this->faker->numberBetween(500, 2000),
            'total_debits' => $this->faker->randomFloat(2, 50000, 500000),
            'total_credits' => $this->faker->randomFloat(2, 50000, 500000),
        ]);
    }

    /**
     * Create a small statement with few transactions.
     */
    public function small(): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_count' => $this->faker->numberBetween(1, 20),
            'total_debits' => $this->faker->randomFloat(2, 100, 5000),
            'total_credits' => $this->faker->randomFloat(2, 100, 5000),
        ]);
    }
}
