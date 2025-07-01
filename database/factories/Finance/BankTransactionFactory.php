<?php

namespace Database\Factories\Finance;

use App\Models\Finance\BankStatement;
use App\Models\Finance\BankTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\BankTransaction>
 */
class BankTransactionFactory extends Factory
{
    protected $model = BankTransaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $transactionTypes = ['debit', 'credit'];
        $type = $this->faker->randomElement($transactionTypes);
        
        return [
            'bank_statement_id' => BankStatement::factory(),
            'transaction_date' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'description' => $this->faker->sentence(4),
            'reference_number' => $this->faker->optional()->numerify('REF-######'),
            'amount' => $this->faker->randomFloat(2, 10, 10000),
            'type' => $type,
            'balance_after' => $this->faker->randomFloat(2, 1000, 100000),
            'category' => $this->faker->optional()->randomElement([
                'deposit',
                'withdrawal',
                'transfer',
                'fee',
                'interest',
                'check',
                'ach',
                'wire',
                'card_payment',
                'other'
            ]),
            'payee_payer' => $this->faker->optional()->company(),
            'memo' => $this->faker->optional()->sentence(),
            'is_matched' => $this->faker->boolean(30), // 30% chance of being matched
            'matched_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the transaction is a debit.
     */
    public function debit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'debit',
        ]);
    }

    /**
     * Indicate that the transaction is a credit.
     */
    public function credit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'credit',
        ]);
    }

    /**
     * Indicate that the transaction is matched.
     */
    public function matched(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_matched' => true,
            'matched_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the transaction is unmatched.
     */
    public function unmatched(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_matched' => false,
            'matched_at' => null,
        ]);
    }

    /**
     * Create a transaction for a specific bank statement.
     */
    public function forBankStatement(BankStatement $bankStatement): static
    {
        return $this->state(fn (array $attributes) => [
            'bank_statement_id' => $bankStatement->id,
        ]);
    }

    /**
     * Create a transaction with a specific amount.
     */
    public function withAmount(float $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $amount,
        ]);
    }

    /**
     * Create a transaction with a specific description.
     */
    public function withDescription(string $description): static
    {
        return $this->state(fn (array $attributes) => [
            'description' => $description,
        ]);
    }

    /**
     * Create a transaction on a specific date.
     */
    public function onDate(string $date): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_date' => $date,
        ]);
    }

    /**
     * Create a transaction with a specific category.
     */
    public function withCategory(string $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => $category,
        ]);
    }

    /**
     * Create a transaction with a specific payee/payer.
     */
    public function withPayeePayer(string $payeePayer): static
    {
        return $this->state(fn (array $attributes) => [
            'payee_payer' => $payeePayer,
        ]);
    }

    /**
     * Create a transaction with a reference number.
     */
    public function withReference(string $reference): static
    {
        return $this->state(fn (array $attributes) => [
            'reference_number' => $reference,
        ]);
    }

    /**
     * Create a transaction with a memo.
     */
    public function withMemo(string $memo): static
    {
        return $this->state(fn (array $attributes) => [
            'memo' => $memo,
        ]);
    }

    /**
     * Create a deposit transaction.
     */
    public function deposit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'credit',
            'category' => 'deposit',
            'amount' => $this->faker->randomFloat(2, 100, 50000),
        ]);
    }

    /**
     * Create a withdrawal transaction.
     */
    public function withdrawal(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'debit',
            'category' => 'withdrawal',
            'amount' => $this->faker->randomFloat(2, 50, 5000),
        ]);
    }

    /**
     * Create a check transaction.
     */
    public function check(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'debit',
            'category' => 'check',
            'reference_number' => 'CHK-' . $this->faker->numerify('####'),
            'amount' => $this->faker->randomFloat(2, 25, 2500),
        ]);
    }

    /**
     * Create an ACH transaction.
     */
    public function ach(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'ach',
            'reference_number' => 'ACH-' . $this->faker->numerify('##########'),
            'amount' => $this->faker->randomFloat(2, 100, 10000),
        ]);
    }

    /**
     * Create a wire transfer transaction.
     */
    public function wire(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'wire',
            'reference_number' => 'WIRE-' . $this->faker->numerify('##########'),
            'amount' => $this->faker->randomFloat(2, 1000, 100000),
        ]);
    }

    /**
     * Create a fee transaction.
     */
    public function fee(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'debit',
            'category' => 'fee',
            'description' => $this->faker->randomElement([
                'Monthly maintenance fee',
                'Overdraft fee',
                'Wire transfer fee',
                'ATM fee',
                'Foreign transaction fee'
            ]),
            'amount' => $this->faker->randomFloat(2, 5, 50),
        ]);
    }

    /**
     * Create an interest transaction.
     */
    public function interest(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'credit',
            'category' => 'interest',
            'description' => 'Interest earned',
            'amount' => $this->faker->randomFloat(2, 1, 100),
        ]);
    }

    /**
     * Create a large transaction.
     */
    public function large(): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $this->faker->randomFloat(2, 10000, 100000),
        ]);
    }

    /**
     * Create a small transaction.
     */
    public function small(): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $this->faker->randomFloat(2, 1, 100),
        ]);
    }
}
