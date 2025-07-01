<?php

namespace Tests\Feature\Finance;

use App\Models\Finance\Account;
use App\Models\Finance\BankReconciliation;
use App\Models\Finance\BankStatement;
use App\Models\Finance\ChartOfAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ReportsTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create permissions
        Permission::create(['name' => 'view finance']);
        Permission::create(['name' => 'create finance']);
        Permission::create(['name' => 'edit finance']);
        Permission::create(['name' => 'delete finance']);

        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'manager']);
        Role::create(['name' => 'staff']);

        // Create admin user
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');

        // Create regular user with finance permissions
        $this->user = User::factory()->create();
        $this->user->assignRole('staff');
        $this->user->givePermissionTo(['view finance', 'create finance', 'edit finance', 'delete finance']);
    }

    /** @test */
    public function it_can_generate_chart_of_accounts_report()
    {
        $this->actingAs($this->user);

        // Create test accounts
        $assets = ChartOfAccount::factory()->create([
            'account_code' => '1000',
            'name' => 'Assets',
            'account_category' => 'assets',
            'type' => 'header',
            'balance' => 50000.00,
            'is_active' => true,
        ]);

        $cash = ChartOfAccount::factory()->create([
            'account_code' => '1100',
            'name' => 'Cash',
            'account_category' => 'assets',
            'type' => 'detail',
            'parent_id' => $assets->id,
            'balance' => 25000.00,
            'is_active' => true,
        ]);

        $liabilities = ChartOfAccount::factory()->create([
            'account_code' => '2000',
            'name' => 'Liabilities',
            'account_category' => 'liabilities',
            'type' => 'header',
            'balance' => 20000.00,
            'is_active' => true,
        ]);

        $response = $this->get(route('finance.reports.chart-of-accounts'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Finance/Reports/ChartOfAccounts')
                ->has('reportData')
                ->where('reportData.title', 'Chart of Accounts Report')
                ->has('reportData.accounts', 3)
                ->has('reportData.summary')
                ->where('reportData.summary.total_accounts', 3)
                ->where('reportData.summary.active_accounts', 3)
            );
    }

    /** @test */
    public function it_can_filter_chart_of_accounts_report_by_category()
    {
        $this->actingAs($this->user);

        ChartOfAccount::factory()->create([
            'account_category' => 'assets',
            'is_active' => true,
        ]);

        ChartOfAccount::factory()->create([
            'account_category' => 'liabilities',
            'is_active' => true,
        ]);

        $response = $this->get(route('finance.reports.chart-of-accounts', ['category' => 'assets']));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Finance/Reports/ChartOfAccounts')
                ->has('reportData.accounts', 1)
                ->where('reportData.accounts.0.account_category', 'assets')
            );
    }

    /** @test */
    public function it_can_include_inactive_accounts_in_chart_of_accounts_report()
    {
        $this->actingAs($this->user);

        ChartOfAccount::factory()->create(['is_active' => true]);
        ChartOfAccount::factory()->create(['is_active' => false]);

        // Without inactive accounts
        $response = $this->get(route('finance.reports.chart-of-accounts'));
        $response->assertInertia(fn (Assert $page) => $page
            ->has('reportData.accounts', 1)
        );

        // With inactive accounts
        $response = $this->get(route('finance.reports.chart-of-accounts', ['include_inactive' => true]));
        $response->assertInertia(fn (Assert $page) => $page
            ->has('reportData.accounts', 2)
        );
    }

    /** @test */
    public function it_can_generate_trial_balance_report()
    {
        $this->actingAs($this->user);

        // Create accounts with balances
        ChartOfAccount::factory()->create([
            'account_code' => '1100',
            'name' => 'Cash',
            'normal_balance' => 'debit',
            'balance' => 10000.00,
            'is_active' => true,
        ]);

        ChartOfAccount::factory()->create([
            'account_code' => '2100',
            'name' => 'Accounts Payable',
            'normal_balance' => 'credit',
            'balance' => 5000.00,
            'is_active' => true,
        ]);

        ChartOfAccount::factory()->create([
            'account_code' => '3100',
            'name' => 'Owner Equity',
            'normal_balance' => 'credit',
            'balance' => 5000.00,
            'is_active' => true,
        ]);

        $response = $this->get(route('finance.reports.trial-balance'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Finance/Reports/TrialBalance')
                ->has('reportData')
                ->where('reportData.title', 'Trial Balance Report')
                ->has('reportData.accounts', 3)
                ->has('reportData.totals')
                ->where('reportData.totals.total_debits', 10000.00)
                ->where('reportData.totals.total_credits', 10000.00)
                ->where('reportData.totals.is_balanced', true)
            );
    }

    /** @test */
    public function it_detects_unbalanced_trial_balance()
    {
        $this->actingAs($this->user);

        // Create unbalanced accounts
        ChartOfAccount::factory()->create([
            'normal_balance' => 'debit',
            'balance' => 10000.00,
            'is_active' => true,
        ]);

        ChartOfAccount::factory()->create([
            'normal_balance' => 'credit',
            'balance' => 8000.00, // Unbalanced
            'is_active' => true,
        ]);

        $response = $this->get(route('finance.reports.trial-balance'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->where('reportData.totals.is_balanced', false)
                ->where('reportData.totals.difference', 2000.00)
            );
    }

    /** @test */
    public function it_can_exclude_zero_balances_from_trial_balance()
    {
        $this->actingAs($this->user);

        ChartOfAccount::factory()->create([
            'balance' => 1000.00,
            'is_active' => true,
        ]);

        ChartOfAccount::factory()->create([
            'balance' => 0.00, // Zero balance
            'is_active' => true,
        ]);

        // Without zero balances (default)
        $response = $this->get(route('finance.reports.trial-balance'));
        $response->assertInertia(fn (Assert $page) => $page
            ->has('reportData.accounts', 1)
        );

        // With zero balances
        $response = $this->get(route('finance.reports.trial-balance', ['include_zero_balances' => true]));
        $response->assertInertia(fn (Assert $page) => $page
            ->has('reportData.accounts', 2)
        );
    }

    /** @test */
    public function it_can_generate_reconciliation_summary_report()
    {
        $this->actingAs($this->user);

        $account = Account::factory()->create([
            'name' => 'Test Bank Account',
            'type' => 'checking',
        ]);

        $bankStatement = BankStatement::factory()->create([
            'account_id' => $account->id,
        ]);

        // Create test reconciliations
        $completedReconciliation = BankReconciliation::factory()->create([
            'account_id' => $account->id,
            'bank_statement_id' => $bankStatement->id,
            'reconciliation_number' => 'REC-001',
            'status' => 'completed',
            'reconciliation_date' => now()->subDays(5),
            'statement_opening_balance' => 10000.00,
            'statement_closing_balance' => 12000.00,
            'book_opening_balance' => 10000.00,
            'book_closing_balance' => 12000.00,
            'difference' => 0.00,
            'matched_transactions_count' => 10,
            'unmatched_bank_transactions_count' => 0,
            'unmatched_book_transactions_count' => 0,
        ]);

        $inProgressReconciliation = BankReconciliation::factory()->create([
            'account_id' => $account->id,
            'bank_statement_id' => $bankStatement->id,
            'reconciliation_number' => 'REC-002',
            'status' => 'in_progress',
            'reconciliation_date' => now()->subDays(2),
            'statement_opening_balance' => 12000.00,
            'statement_closing_balance' => 13500.00,
            'book_opening_balance' => 12000.00,
            'book_closing_balance' => 13000.00,
            'difference' => 500.00,
            'matched_transactions_count' => 8,
            'unmatched_bank_transactions_count' => 2,
            'unmatched_book_transactions_count' => 1,
        ]);

        $response = $this->get(route('finance.reports.reconciliation-summary'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Finance/Reports/ReconciliationSummary')
                ->has('reportData')
                ->where('reportData.title', 'Bank Reconciliation Summary Report')
                ->has('reportData.reconciliations', 2)
                ->has('reportData.summary')
                ->where('reportData.summary.total_reconciliations', 2)
                ->where('reportData.summary.total_matched_transactions', 18)
                ->where('reportData.summary.total_unmatched_bank', 2)
                ->where('reportData.summary.total_unmatched_book', 1)
            );
    }

    /** @test */
    public function it_can_filter_reconciliation_summary_by_status()
    {
        $this->actingAs($this->user);

        $account = Account::factory()->create();
        $bankStatement = BankStatement::factory()->create(['account_id' => $account->id]);

        BankReconciliation::factory()->create([
            'account_id' => $account->id,
            'bank_statement_id' => $bankStatement->id,
            'status' => 'completed',
        ]);

        BankReconciliation::factory()->create([
            'account_id' => $account->id,
            'bank_statement_id' => $bankStatement->id,
            'status' => 'in_progress',
        ]);

        $response = $this->get(route('finance.reports.reconciliation-summary', ['status' => 'completed']));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->has('reportData.reconciliations', 1)
                ->where('reportData.reconciliations.0.status', 'completed')
            );
    }

    /** @test */
    public function it_can_filter_reconciliation_summary_by_date_range()
    {
        $this->actingAs($this->user);

        $account = Account::factory()->create();
        $bankStatement = BankStatement::factory()->create(['account_id' => $account->id]);

        BankReconciliation::factory()->create([
            'account_id' => $account->id,
            'bank_statement_id' => $bankStatement->id,
            'reconciliation_date' => '2024-01-15',
        ]);

        BankReconciliation::factory()->create([
            'account_id' => $account->id,
            'bank_statement_id' => $bankStatement->id,
            'reconciliation_date' => '2024-02-15',
        ]);

        $response = $this->get(route('finance.reports.reconciliation-summary', [
            'date_from' => '2024-01-01',
            'date_to' => '2024-01-31',
        ]));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->has('reportData.reconciliations', 1)
                ->where('reportData.reconciliations.0.reconciliation_date', '2024-01-15')
            );
    }

    /** @test */
    public function it_can_filter_reconciliation_summary_by_account()
    {
        $this->actingAs($this->user);

        $account1 = Account::factory()->create(['name' => 'Account 1']);
        $account2 = Account::factory()->create(['name' => 'Account 2']);

        $bankStatement1 = BankStatement::factory()->create(['account_id' => $account1->id]);
        $bankStatement2 = BankStatement::factory()->create(['account_id' => $account2->id]);

        BankReconciliation::factory()->create([
            'account_id' => $account1->id,
            'bank_statement_id' => $bankStatement1->id,
        ]);

        BankReconciliation::factory()->create([
            'account_id' => $account2->id,
            'bank_statement_id' => $bankStatement2->id,
        ]);

        $response = $this->get(route('finance.reports.reconciliation-summary', ['account_id' => $account1->id]));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->has('reportData.reconciliations', 1)
                ->where('reportData.reconciliations.0.account_name', 'Account 1')
            );
    }

    /** @test */
    public function it_requires_finance_permissions_for_reports()
    {
        $userWithoutPermissions = User::factory()->create();

        $this->actingAs($userWithoutPermissions);

        $response = $this->get(route('finance.reports.chart-of-accounts'));
        $response->assertStatus(403);

        $response = $this->get(route('finance.reports.trial-balance'));
        $response->assertStatus(403);

        $response = $this->get(route('finance.reports.reconciliation-summary'));
        $response->assertStatus(403);
    }

    /** @test */
    public function it_validates_report_parameters()
    {
        $this->actingAs($this->user);

        // Test invalid date format
        $response = $this->get(route('finance.reports.trial-balance', ['as_of_date' => 'invalid-date']));
        $response->assertStatus(302); // Redirect due to validation error

        // Test invalid date range
        $response = $this->get(route('finance.reports.reconciliation-summary', [
            'date_from' => '2024-02-01',
            'date_to' => '2024-01-01', // End before start
        ]));
        $response->assertStatus(302); // Redirect due to validation error
    }
}
