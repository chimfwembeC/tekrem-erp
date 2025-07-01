<?php

namespace Database\Factories\Finance;

use App\Models\Finance\BankStatement;
use App\Models\Finance\BankStatementTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\BankStatementTransaction>
 */
class BankStatementTransactionFactory extends Factory
{
    protected $model = BankStatementTransaction::class;

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
            'transaction_type' => $type,
            'amount' => $type === 'debit' 
                ? $this->faker->randomFloat(2, -5000, -0.01)
                : $this->faker->randomFloat(2, 0.01, 5000),
            'description' => $this->faker->sentence(4),
            'reference_number' => $this->faker->optional()->numerify('REF-######'),
            'check_number' => $this->faker->optional()->numerify('CHK-####'),
            'running_balance' => $this->faker->randomFloat(2, 0, 50000),
            'transaction_code' => $this->faker->optional()->randomElement(['DEP', 'WTH', 'CHK', 'FEE', 'INT']),
            'raw_data' => $this->faker->optional()->randomElements([
                'original_description' => $this->faker->sentence(),
                'bank_code' => $this->faker->numerify('###'),
                'category' => $this->faker->word(),
            ]),
        ];
    }

    /**
     * Create a debit transaction.
     */
    public function debit(): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_type' => 'debit',
            'amount' => $this->faker->randomFloat(2, -5000, -0.01),
        ]);
    }

    /**
     * Create a credit transaction.
     */
    public function credit(): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_type' => 'credit',
            'amount' => $this->faker->randomFloat(2, 0.01, 5000),
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
            'transaction_type' => $amount >= 0 ? 'credit' : 'debit',
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
     * Create a transaction with a specific reference number.
     */
    public function withReference(string $reference): static
    {
        return $this->state(fn (array $attributes) => [
            'reference_number' => $reference,
        ]);
    }

    /**
     * Create a transaction with a check number.
     */
    public function withCheckNumber(string $checkNumber): static
    {
        return $this->state(fn (array $attributes) => [
            'check_number' => $checkNumber,
        ]);
    }

    /**
     * Create a transaction on a specific date.
     */
    public function onDate($date): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_date' => $date,
        ]);
    }

    /**
     * Create a transaction with specific raw data.
     */
    public function withRawData(array $rawData): static
    {
        return $this->state(fn (array $attributes) => [
            'raw_data' => $rawData,
        ]);
    }
}
