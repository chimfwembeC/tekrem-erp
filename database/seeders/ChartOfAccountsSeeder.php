<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Finance\Account;
use App\Models\User;

class ChartOfAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first admin user for seeding
        $adminUser = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->first();

        if (!$adminUser) {
            $this->command->warn('No admin user found. Skipping Chart of Accounts seeding.');
            return;
        }

        $this->command->info('Seeding Chart of Accounts...');

        // Define the standard Chart of Accounts structure
        $chartOfAccounts = [
            // ASSETS
            [
                'name' => 'Assets',
                'account_code' => '1000',
                'type' => 'asset',
                'account_category' => 'assets',
                'account_subcategory' => 'header',
                'normal_balance' => 'debit',
                'is_system_account' => true,
                'allow_manual_entries' => false,
                'level' => 0,
                'children' => [
                    [
                        'name' => 'Current Assets',
                        'account_code' => '1100',
                        'type' => 'asset',
                        'account_category' => 'assets',
                        'account_subcategory' => 'current_assets',
                        'normal_balance' => 'debit',
                        'is_system_account' => true,
                        'allow_manual_entries' => false,
                        'level' => 1,
                        'children' => [
                            [
                                'name' => 'Cash and Cash Equivalents',
                                'account_code' => '1110',
                                'type' => 'cash',
                                'account_category' => 'assets',
                                'account_subcategory' => 'current_assets',
                                'normal_balance' => 'debit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                            [
                                'name' => 'Accounts Receivable',
                                'account_code' => '1120',
                                'type' => 'asset',
                                'account_category' => 'assets',
                                'account_subcategory' => 'current_assets',
                                'normal_balance' => 'debit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                            [
                                'name' => 'Inventory',
                                'account_code' => '1130',
                                'type' => 'asset',
                                'account_category' => 'assets',
                                'account_subcategory' => 'current_assets',
                                'normal_balance' => 'debit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                            [
                                'name' => 'Prepaid Expenses',
                                'account_code' => '1140',
                                'type' => 'asset',
                                'account_category' => 'assets',
                                'account_subcategory' => 'current_assets',
                                'normal_balance' => 'debit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                        ]
                    ],
                    [
                        'name' => 'Fixed Assets',
                        'account_code' => '1200',
                        'type' => 'asset',
                        'account_category' => 'assets',
                        'account_subcategory' => 'fixed_assets',
                        'normal_balance' => 'debit',
                        'is_system_account' => true,
                        'allow_manual_entries' => false,
                        'level' => 1,
                        'children' => [
                            [
                                'name' => 'Property, Plant & Equipment',
                                'account_code' => '1210',
                                'type' => 'asset',
                                'account_category' => 'assets',
                                'account_subcategory' => 'fixed_assets',
                                'normal_balance' => 'debit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                            [
                                'name' => 'Accumulated Depreciation',
                                'account_code' => '1220',
                                'type' => 'asset',
                                'account_category' => 'assets',
                                'account_subcategory' => 'fixed_assets',
                                'normal_balance' => 'credit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                        ]
                    ],
                ]
            ],
            // LIABILITIES
            [
                'name' => 'Liabilities',
                'account_code' => '2000',
                'type' => 'liability',
                'account_category' => 'liabilities',
                'account_subcategory' => 'header',
                'normal_balance' => 'credit',
                'is_system_account' => true,
                'allow_manual_entries' => false,
                'level' => 0,
                'children' => [
                    [
                        'name' => 'Current Liabilities',
                        'account_code' => '2100',
                        'type' => 'liability',
                        'account_category' => 'liabilities',
                        'account_subcategory' => 'current_liabilities',
                        'normal_balance' => 'credit',
                        'is_system_account' => true,
                        'allow_manual_entries' => false,
                        'level' => 1,
                        'children' => [
                            [
                                'name' => 'Accounts Payable',
                                'account_code' => '2110',
                                'type' => 'liability',
                                'account_category' => 'liabilities',
                                'account_subcategory' => 'current_liabilities',
                                'normal_balance' => 'credit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                            [
                                'name' => 'Accrued Expenses',
                                'account_code' => '2120',
                                'type' => 'liability',
                                'account_category' => 'liabilities',
                                'account_subcategory' => 'current_liabilities',
                                'normal_balance' => 'credit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                        ]
                    ],
                    [
                        'name' => 'Long-term Liabilities',
                        'account_code' => '2200',
                        'type' => 'liability',
                        'account_category' => 'liabilities',
                        'account_subcategory' => 'long_term_liabilities',
                        'normal_balance' => 'credit',
                        'is_system_account' => true,
                        'allow_manual_entries' => false,
                        'level' => 1,
                        'children' => [
                            [
                                'name' => 'Long-term Debt',
                                'account_code' => '2210',
                                'type' => 'liability',
                                'account_category' => 'liabilities',
                                'account_subcategory' => 'long_term_liabilities',
                                'normal_balance' => 'credit',
                                'is_system_account' => true,
                                'allow_manual_entries' => true,
                                'level' => 2,
                            ],
                        ]
                    ],
                ]
            ],
        ];

        // Create accounts recursively
        $this->createAccountsRecursively($chartOfAccounts, $adminUser->id);

        $this->command->info('Chart of Accounts seeded successfully!');
    }

    /**
     * Create accounts recursively with parent-child relationships
     */
    private function createAccountsRecursively(array $accounts, int $userId, ?int $parentId = null): void
    {
        foreach ($accounts as $accountData) {
            $children = $accountData['children'] ?? [];
            unset($accountData['children']);

            $account = Account::create([
                ...$accountData,
                'parent_account_id' => $parentId,
                'user_id' => $userId,
                'currency' => 'USD',
                'is_active' => true,
                'description' => "System generated {$accountData['name']} account",
            ]);

            if (!empty($children)) {
                $this->createAccountsRecursively($children, $userId, $account->id);
            }
        }
    }
}
