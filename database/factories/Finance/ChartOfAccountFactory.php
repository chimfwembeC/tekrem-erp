<?php

namespace Database\Factories\Finance;

use App\Models\Finance\ChartOfAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\ChartOfAccount>
 */
class ChartOfAccountFactory extends Factory
{
    protected $model = ChartOfAccount::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['assets', 'liabilities', 'equity', 'income', 'expenses'];
        $types = ['header', 'detail'];
        $normalBalances = ['debit', 'credit'];

        $category = $this->faker->randomElement($categories);
        $type = $this->faker->randomElement($types);

        // Determine normal balance based on category
        $normalBalance = match ($category) {
            'assets', 'expenses' => 'debit',
            'liabilities', 'equity', 'income' => 'credit',
            default => $this->faker->randomElement($normalBalances),
        };

        return [
            'account_code' => $this->faker->unique()->numerify('####'),
            'name' => $this->faker->words(2, true),
            'description' => $this->faker->optional()->sentence(),
            'account_category' => $category,
            'account_subcategory' => $this->getSubcategory($category),
            'type' => $type,
            'normal_balance' => $normalBalance,
            'parent_id' => null,
            'level' => 0,
            'balance' => $this->faker->randomFloat(2, 0, 100000),
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'is_system_account' => $this->faker->boolean(10), // 10% chance of being system account
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Get appropriate subcategory based on category.
     */
    private function getSubcategory(string $category): string
    {
        return match ($category) {
            'assets' => $this->faker->randomElement([
                'current_assets',
                'fixed_assets',
                'intangible_assets',
                'other_assets'
            ]),
            'liabilities' => $this->faker->randomElement([
                'current_liabilities',
                'long_term_liabilities',
                'other_liabilities'
            ]),
            'equity' => $this->faker->randomElement([
                'owner_equity',
                'retained_earnings',
                'other_equity'
            ]),
            'income' => $this->faker->randomElement([
                'operating_income',
                'other_income'
            ]),
            'expenses' => $this->faker->randomElement([
                'operating_expenses',
                'cost_of_goods_sold',
                'other_expenses'
            ]),
            default => 'general',
        };
    }

    /**
     * Create an asset account.
     */
    public function asset(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_category' => 'assets',
            'account_subcategory' => 'current_assets',
            'normal_balance' => 'debit',
        ]);
    }

    /**
     * Create a liability account.
     */
    public function liability(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_category' => 'liabilities',
            'account_subcategory' => 'current_liabilities',
            'normal_balance' => 'credit',
        ]);
    }

    /**
     * Create an equity account.
     */
    public function equity(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_category' => 'equity',
            'account_subcategory' => 'owner_equity',
            'normal_balance' => 'credit',
        ]);
    }

    /**
     * Create an income account.
     */
    public function income(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_category' => 'income',
            'account_subcategory' => 'operating_income',
            'normal_balance' => 'credit',
        ]);
    }

    /**
     * Create an expense account.
     */
    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_category' => 'expenses',
            'account_subcategory' => 'operating_expenses',
            'normal_balance' => 'debit',
        ]);
    }

    /**
     * Create a header account.
     */
    public function header(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'header',
            'balance' => 0, // Header accounts typically don't have direct balances
        ]);
    }

    /**
     * Create a detail account.
     */
    public function detail(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'detail',
        ]);
    }

    /**
     * Create an active account.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Create an inactive account.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a system account.
     */
    public function system(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system_account' => true,
        ]);
    }

    /**
     * Create a child account with a specific parent.
     */
    public function child(ChartOfAccount $parent): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => $parent->id,
            'level' => $parent->level + 1,
            'account_category' => $parent->account_category,
            'normal_balance' => $parent->normal_balance,
        ]);
    }

    /**
     * Create an account with a specific balance.
     */
    public function withBalance(float $balance): static
    {
        return $this->state(fn (array $attributes) => [
            'balance' => $balance,
        ]);
    }

    /**
     * Create an account with zero balance.
     */
    public function zeroBalance(): static
    {
        return $this->state(fn (array $attributes) => [
            'balance' => 0,
        ]);
    }

    /**
     * Create a cash account.
     */
    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_code' => '1100',
            'name' => 'Cash',
            'account_category' => 'assets',
            'account_subcategory' => 'current_assets',
            'type' => 'detail',
            'normal_balance' => 'debit',
        ]);
    }

    /**
     * Create an accounts receivable account.
     */
    public function accountsReceivable(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_code' => '1200',
            'name' => 'Accounts Receivable',
            'account_category' => 'assets',
            'account_subcategory' => 'current_assets',
            'type' => 'detail',
            'normal_balance' => 'debit',
        ]);
    }

    /**
     * Create an accounts payable account.
     */
    public function accountsPayable(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_code' => '2100',
            'name' => 'Accounts Payable',
            'account_category' => 'liabilities',
            'account_subcategory' => 'current_liabilities',
            'type' => 'detail',
            'normal_balance' => 'credit',
        ]);
    }

    /**
     * Create a revenue account.
     */
    public function revenue(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_code' => '4100',
            'name' => 'Sales Revenue',
            'account_category' => 'income',
            'account_subcategory' => 'operating_income',
            'type' => 'detail',
            'normal_balance' => 'credit',
        ]);
    }
}
