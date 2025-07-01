<?php

namespace Database\Factories\Finance;

use App\Models\Finance\BankReconciliation;
use App\Models\Finance\BankReconciliationItem;
use App\Models\Finance\BankStatementTransaction;
use App\Models\Finance\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\BankReconciliationItem>
 */
class BankReconciliationItemFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = BankReconciliationItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'bank_reconciliation_id' => BankReconciliation::factory(),
            'bank_statement_transaction_id' => BankStatementTransaction::factory(),
            'transaction_id' => Transaction::factory(),
            'match_type' => $this->faker->randomElement(['matched', 'unmatched_bank', 'unmatched_book', 'manual_adjustment']),
            'match_method' => $this->faker->randomElement(['auto', 'manual', 'suggested']),
            'match_confidence' => $this->faker->randomFloat(2, 50, 100),
            'amount_difference' => $this->faker->randomFloat(2, 0, 10),
            'match_notes' => $this->faker->optional()->sentence(),
            'match_criteria' => $this->faker->optional()->randomElements(['date', 'amount', 'reference', 'description']),
            'is_cleared' => $this->faker->boolean(70), // 70% chance of being cleared
            'matched_at' => $this->faker->optional()->dateTimeBetween('-1 month', 'now'),
        ];
    }

    /**
     * Indicate that the item is cleared.
     */
    public function cleared(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_cleared' => true,
            'matched_at' => now(),
        ]);
    }

    /**
     * Indicate that the item is not cleared.
     */
    public function uncleared(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_cleared' => false,
            'matched_at' => null,
        ]);
    }

    /**
     * Set a specific confidence score.
     */
    public function withConfidence(float $score): static
    {
        return $this->state(fn (array $attributes) => [
            'match_confidence' => $score,
        ]);
    }

    /**
     * Set a specific amount difference.
     */
    public function withAmountDifference(float $difference): static
    {
        return $this->state(fn (array $attributes) => [
            'amount_difference' => $difference,
        ]);
    }

    /**
     * Set specific notes.
     */
    public function withNotes(string $notes): static
    {
        return $this->state(fn (array $attributes) => [
            'match_notes' => $notes,
        ]);
    }

    /**
     * For a specific bank reconciliation.
     */
    public function forReconciliation(BankReconciliation $reconciliation): static
    {
        return $this->state(fn (array $attributes) => [
            'bank_reconciliation_id' => $reconciliation->id,
        ]);
    }

    /**
     * For a specific bank statement transaction.
     */
    public function forBankTransaction(BankStatementTransaction $transaction): static
    {
        return $this->state(fn (array $attributes) => [
            'bank_statement_transaction_id' => $transaction->id,
        ]);
    }

    /**
     * For a specific book transaction.
     */
    public function forBookTransaction(Transaction $transaction): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_id' => $transaction->id,
        ]);
    }

    /**
     * High confidence match.
     */
    public function highConfidence(): static
    {
        return $this->state(fn (array $attributes) => [
            'match_confidence' => $this->faker->randomFloat(2, 90, 100),
        ]);
    }

    /**
     * Low confidence match.
     */
    public function lowConfidence(): static
    {
        return $this->state(fn (array $attributes) => [
            'match_confidence' => $this->faker->randomFloat(2, 10, 50),
        ]);
    }
}
