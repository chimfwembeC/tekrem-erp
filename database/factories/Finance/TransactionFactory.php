<?php

namespace Database\Factories\Finance;

use App\Models\Finance\Account;
use App\Models\Finance\Category;
use App\Models\Finance\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\Transaction>
 */
class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['income', 'expense', 'transfer'];
        $statuses = ['pending', 'completed', 'cancelled'];
        $type = $this->faker->randomElement($types);

        return [
            'type' => $type,
            'amount' => $this->faker->randomFloat(2, 1, 1000),
            'description' => $this->faker->sentence(),
            'transaction_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'reference_number' => $this->faker->optional()->numerify('REF-########'),
            'status' => $this->faker->randomElement($statuses),
            'account_id' => Account::factory(),
            'category_id' => Category::factory(),
            'user_id' => User::factory(),
            'metadata' => $this->faker->optional()->randomElements([
                'source' => 'manual',
                'imported' => false,
                'tags' => ['business', 'personal'],
            ]),
        ];
    }

    /**
     * Create an income transaction.
     */
    public function income(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'income',
            'description' => 'Income: ' . $this->faker->words(3, true),
        ]);
    }

    /**
     * Create an expense transaction.
     */
    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'expense',
            'description' => 'Expense: ' . $this->faker->words(3, true),
        ]);
    }

    /**
     * Create a transfer transaction.
     */
    public function transfer(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'transfer',
            'description' => 'Transfer: ' . $this->faker->words(3, true),
            'transfer_to_account_id' => Account::factory(),
        ]);
    }

    /**
     * Create a completed transaction.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    /**
     * Create a pending transaction.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * Create a cancelled transaction.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
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
     * Create a transaction for a specific account.
     */
    public function forAccount(Account $account): static
    {
        return $this->state(fn (array $attributes) => [
            'account_id' => $account->id,
        ]);
    }

    /**
     * Create a transaction for a specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Create a transaction with a specific category.
     */
    public function withCategory(Category $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category_id' => $category->id,
        ]);
    }

    /**
     * Create a transaction on a specific date.
     */
    public function onDate(\DateTime $date): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_date' => $date,
        ]);
    }

    /**
     * Create a recent transaction (within last 30 days).
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Create a transaction with metadata.
     */
    public function withMetadata(array $metadata): static
    {
        return $this->state(fn (array $attributes) => [
            'metadata' => $metadata,
        ]);
    }
}
