<?php

namespace Database\Factories\Finance;

use App\Models\Finance\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Category::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['income', 'expense', 'asset', 'liability', 'equity'];
        $type = $this->faker->randomElement($types);
        
        $names = [
            'income' => ['Sales Revenue', 'Service Income', 'Interest Income', 'Rental Income'],
            'expense' => ['Office Supplies', 'Marketing', 'Travel', 'Utilities', 'Insurance'],
            'asset' => ['Cash', 'Accounts Receivable', 'Equipment', 'Inventory'],
            'liability' => ['Accounts Payable', 'Loans Payable', 'Accrued Expenses'],
            'equity' => ['Owner Equity', 'Retained Earnings', 'Capital Stock'],
        ];

        return [
            'name' => $this->faker->randomElement($names[$type]),
            'type' => $type,
            'description' => $this->faker->optional()->sentence(),
            'color' => $this->faker->hexColor(),
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
        ];
    }

    /**
     * Indicate that the category is for income.
     */
    public function income(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'income',
            'name' => $this->faker->randomElement(['Sales Revenue', 'Service Income', 'Interest Income', 'Rental Income']),
        ]);
    }

    /**
     * Indicate that the category is for expenses.
     */
    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'expense',
            'name' => $this->faker->randomElement(['Office Supplies', 'Marketing', 'Travel', 'Utilities', 'Insurance']),
        ]);
    }

    /**
     * Indicate that the category is for assets.
     */
    public function asset(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'asset',
            'name' => $this->faker->randomElement(['Cash', 'Accounts Receivable', 'Equipment', 'Inventory']),
        ]);
    }

    /**
     * Indicate that the category is for liabilities.
     */
    public function liability(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'liability',
            'name' => $this->faker->randomElement(['Accounts Payable', 'Loans Payable', 'Accrued Expenses']),
        ]);
    }

    /**
     * Indicate that the category is for equity.
     */
    public function equity(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'equity',
            'name' => $this->faker->randomElement(['Owner Equity', 'Retained Earnings', 'Capital Stock']),
        ]);
    }

    /**
     * Indicate that the category is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the category is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
