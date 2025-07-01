<?php

namespace Database\Factories\Finance;

use App\Models\Finance\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\Account>
 */
class AccountFactory extends Factory
{
    protected $model = Account::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $accountTypes = ['checking', 'savings', 'business', 'credit_card', 'investment', 'loan', 'other', 'header', 'detail'];
        $accountCategories = ['assets', 'liabilities', 'equity', 'income', 'expenses'];
        $currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
        $initialBalance = $this->faker->randomFloat(2, 0, 10000);

        return [
            'name' => $this->faker->words(2, true) . ' Account',
            'account_code' => $this->faker->numerify('####'),
            'type' => $this->faker->randomElement($accountTypes),
            'account_category' => $this->faker->randomElement($accountCategories),
            'account_subcategory' => $this->faker->optional()->word(),
            'parent_account_id' => null,
            'level' => 0,
            'normal_balance' => $this->faker->randomElement(['debit', 'credit']),
            'is_system_account' => false,
            'allow_manual_entries' => true,
            'account_settings' => null,
            'account_number' => $this->faker->numerify('##########'),
            'bank_name' => $this->faker->company . ' Bank',
            'initial_balance' => $initialBalance,
            'balance' => $initialBalance,
            'currency' => $this->faker->randomElement($currencies),
            'description' => $this->faker->optional()->sentence(),
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'user_id' => User::factory(),
        ];
    }

    /**
     * Indicate that the account is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the account is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a checking account.
     */
    public function checking(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'checking',
            'name' => 'Checking Account',
        ]);
    }

    /**
     * Create a savings account.
     */
    public function savings(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'savings',
            'name' => 'Savings Account',
        ]);
    }

    /**
     * Create a business account.
     */
    public function business(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'business',
            'name' => 'Business Account',
        ]);
    }

    /**
     * Create an account with a specific balance.
     */
    public function withBalance(float $balance): static
    {
        return $this->state(fn (array $attributes) => [
            'initial_balance' => $balance,
            'balance' => $balance,
        ]);
    }

    /**
     * Create an account with a specific currency.
     */
    public function withCurrency(string $currency): static
    {
        return $this->state(fn (array $attributes) => [
            'currency' => $currency,
        ]);
    }

    /**
     * Create an account for a specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Create a header account (for Chart of Accounts).
     */
    public function header(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'header',
            'allow_manual_entries' => false,
        ]);
    }

    /**
     * Create a detail account (for Chart of Accounts).
     */
    public function detail(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'detail',
            'allow_manual_entries' => true,
        ]);
    }

    /**
     * Create a system account.
     */
    public function systemAccount(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system_account' => true,
        ]);
    }

    /**
     * Create an account with a specific category.
     */
    public function category(string $category): static
    {
        return $this->state(fn (array $attributes) => [
            'account_category' => $category,
        ]);
    }

    /**
     * Create a child account with a parent.
     */
    public function childOf(Account $parent): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_account_id' => $parent->id,
            'level' => $parent->level + 1,
            'account_category' => $parent->account_category,
        ]);
    }
}
