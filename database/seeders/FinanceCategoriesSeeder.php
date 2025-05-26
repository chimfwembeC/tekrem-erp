<?php

namespace Database\Seeders;

use App\Models\Finance\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FinanceCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Income Categories
            [
                'name' => 'Sales Revenue',
                'type' => 'income',
                'description' => 'Revenue from product and service sales',
                'color' => '#10B981',
                'is_active' => true,
            ],
            [
                'name' => 'Consulting Revenue',
                'type' => 'income',
                'description' => 'Revenue from consulting services',
                'color' => '#3B82F6',
                'is_active' => true,
            ],
            [
                'name' => 'Investment Income',
                'type' => 'income',
                'description' => 'Income from investments and dividends',
                'color' => '#8B5CF6',
                'is_active' => true,
            ],
            [
                'name' => 'Other Income',
                'type' => 'income',
                'description' => 'Miscellaneous income sources',
                'color' => '#06B6D4',
                'is_active' => true,
            ],

            // Expense Categories
            [
                'name' => 'Office Expenses',
                'type' => 'expense',
                'description' => 'Office supplies, rent, utilities',
                'color' => '#EF4444',
                'is_active' => true,
            ],
            [
                'name' => 'Marketing & Advertising',
                'type' => 'expense',
                'description' => 'Marketing campaigns and advertising costs',
                'color' => '#F59E0B',
                'is_active' => true,
            ],
            [
                'name' => 'Travel & Transportation',
                'type' => 'expense',
                'description' => 'Business travel and transportation costs',
                'color' => '#84CC16',
                'is_active' => true,
            ],
            [
                'name' => 'Professional Services',
                'type' => 'expense',
                'description' => 'Legal, accounting, and consulting fees',
                'color' => '#6366F1',
                'is_active' => true,
            ],
            [
                'name' => 'Technology & Software',
                'type' => 'expense',
                'description' => 'Software licenses, hardware, IT services',
                'color' => '#EC4899',
                'is_active' => true,
            ],
            [
                'name' => 'Employee Expenses',
                'type' => 'expense',
                'description' => 'Salaries, benefits, training',
                'color' => '#14B8A6',
                'is_active' => true,
            ],
            [
                'name' => 'Utilities',
                'type' => 'expense',
                'description' => 'Electricity, water, internet, phone',
                'color' => '#F97316',
                'is_active' => true,
            ],
            [
                'name' => 'Insurance',
                'type' => 'expense',
                'description' => 'Business insurance premiums',
                'color' => '#64748B',
                'is_active' => true,
            ],

            // Both Income and Expense
            [
                'name' => 'General',
                'type' => 'both',
                'description' => 'General purpose category',
                'color' => '#6B7280',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
