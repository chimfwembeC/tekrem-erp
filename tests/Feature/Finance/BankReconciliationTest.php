<?php

namespace Tests\Feature\Finance;

use App\Models\Finance\Account;
use App\Models\Finance\BankReconciliation;
use App\Models\Finance\BankReconciliationItem;
use App\Models\Finance\BankStatement;
use App\Models\Finance\BankStatementTransaction;
use App\Models\Finance\Transaction;
use App\Models\User;
use App\Services\Finance\BankReconciliationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BankReconciliationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected User $adminUser;
    protected Account $bankAccount;
    protected BankStatement $bankStatement;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        // Create admin user
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');

        // Create regular user with staff role (which has finance permissions)
        $this->user = User::factory()->create();
        $this->user->assignRole('staff');

        // Create test bank account
        $this->bankAccount = Account::factory()->create([
            'name' => 'Test Bank Account',
            'type' => 'checking',
            'balance' => 10000.00,
            'is_active' => true,
        ]);

        // Create test bank statement
        $this->bankStatement = BankStatement::factory()->create([
            'account_id' => $this->bankAccount->id,
            'statement_number' => 'STMT-001',
            'statement_date' => now()->subDays(1),
            'opening_balance' => 10000.00,
            'closing_balance' => 12000.00,
            'status' => 'completed',
        ]);
    }

    /** @test */
    public function it_can_display_bank_reconciliation_index()
    {
        $this->actingAs($this->user);

        $reconciliation = BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'bank_statement_id' => $this->bankStatement->id,
            'reconciliation_number' => 'REC-001',
            'status' => 'in_progress',
        ]);

        $response = $this->get(route('finance.bank-reconciliation.index'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Finance/BankReconciliation/Index')
                ->has('reconciliations.data', 1)
                ->where('reconciliations.data.0.reconciliation_number', 'REC-001')
            );
    }

    /** @test */
    public function it_can_create_a_new_bank_reconciliation()
    {
        $this->actingAs($this->user);

        $reconciliationData = [
            'account_id' => $this->bankAccount->id,
            'bank_statement_id' => $this->bankStatement->id,
            'reconciliation_date' => now()->toDateString(),
            'period_start' => now()->subMonth()->toDateString(),
            'period_end' => now()->toDateString(),
            'statement_opening_balance' => 10000.00,
            'statement_closing_balance' => 12000.00,
            'book_opening_balance' => 10000.00,
            'book_closing_balance' => 11500.00,
            'notes' => 'Monthly reconciliation',
        ];

        $response = $this->post(route('finance.bank-reconciliation.store'), $reconciliationData);

        $response->assertRedirect(route('finance.bank-reconciliation.index'));

        $this->assertDatabaseHas('bank_reconciliations', [
            'account_id' => $this->bankAccount->id,
            'bank_statement_id' => $this->bankStatement->id,
            'statement_opening_balance' => 10000.00,
            'statement_closing_balance' => 12000.00,
            'status' => 'in_progress',
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_reconciliation()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('finance.bank-reconciliation.store'), []);

        $response->assertSessionHasErrors([
            'account_id',
            'bank_statement_id',
            'reconciliation_date',
            'period_start',
            'period_end',
            'statement_opening_balance',
            'statement_closing_balance',
            'book_opening_balance',
            'book_closing_balance',
        ]);
    }

    /** @test */
    public function it_can_auto_match_transactions()
    {
        $this->actingAs($this->user);

        $reconciliation = BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'bank_statement_id' => $this->bankStatement->id,
            'status' => 'in_progress',
        ]);

        // Create matching bank and book transactions
        $bankTransaction = BankStatementTransaction::factory()->create([
            'bank_statement_id' => $this->bankStatement->id,
            'amount' => 500.00,
            'description' => 'Payment to Vendor ABC',
            'transaction_date' => now()->subDays(2),
        ]);

        $bookTransaction = Transaction::factory()->create([
            'account_id' => $this->bankAccount->id,
            'amount' => 500.00,
            'description' => 'Payment to Vendor ABC',
            'transaction_date' => now()->subDays(2),
            'is_reconciled' => false,
        ]);

        $response = $this->post(route('finance.bank-reconciliation.auto-match', $reconciliation));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify transactions are matched
        $bankTransaction->refresh();
        $bookTransaction->refresh();

        $this->assertTrue($bookTransaction->is_reconciled);
    }

    /** @test */
    public function it_can_manually_match_transactions()
    {
        $this->actingAs($this->user);

        $reconciliation = BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'bank_statement_id' => $this->bankStatement->id,
            'status' => 'in_progress',
        ]);

        $bankTransaction = BankStatementTransaction::factory()->create([
            'bank_statement_id' => $this->bankStatement->id,
            'amount' => 750.00,
            'description' => 'Customer Payment',
        ]);

        $bookTransaction = Transaction::factory()->create([
            'account_id' => $this->bankAccount->id,
            'amount' => 750.00,
            'description' => 'Customer Payment',
            'is_reconciled' => false,
        ]);

        $matchData = [
            'bank_statement_transaction_id' => $bankTransaction->id,
            'transaction_id' => $bookTransaction->id,
            'notes' => 'Manual match - customer payment',
        ];

        $response = $this->post(route('finance.bank-reconciliation.manual-match', $reconciliation), $matchData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify match record is created
        $this->assertDatabaseHas('bank_reconciliation_items', [
            'bank_reconciliation_id' => $reconciliation->id,
            'bank_statement_transaction_id' => $bankTransaction->id,
            'transaction_id' => $bookTransaction->id,
            'match_method' => 'manual',
        ]);
    }

    /** @test */
    public function it_can_complete_balanced_reconciliation()
    {
        $this->actingAs($this->user);

        $reconciliation = BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'bank_statement_id' => $this->bankStatement->id,
            'statement_opening_balance' => 10000.00,
            'statement_closing_balance' => 12000.00,
            'book_opening_balance' => 10000.00,
            'book_closing_balance' => 12000.00, // Balanced
            'status' => 'in_progress',
        ]);

        $response = $this->post(route('finance.bank-reconciliation.complete', $reconciliation));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $reconciliation->refresh();
        $this->assertEquals('completed', $reconciliation->status);
        $this->assertNotNull($reconciliation->reconciled_at);
        $this->assertEquals($this->user->id, $reconciliation->reconciled_by);
    }

    /** @test */
    public function it_cannot_complete_unbalanced_reconciliation()
    {
        $this->actingAs($this->user);

        $reconciliation = BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'bank_statement_id' => $this->bankStatement->id,
            'statement_opening_balance' => 10000.00,
            'statement_closing_balance' => 12000.00,
            'book_opening_balance' => 10000.00,
            'book_closing_balance' => 11500.00, // Unbalanced
            'status' => 'in_progress',
        ]);

        $response = $this->post(route('finance.bank-reconciliation.complete', $reconciliation));

        $response->assertRedirect();
        $response->assertSessionHasErrors();

        $reconciliation->refresh();
        $this->assertEquals('in_progress', $reconciliation->status);
    }

    /** @test */
    public function it_can_approve_completed_reconciliation()
    {
        $this->actingAs($this->adminUser);

        $reconciliation = BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'bank_statement_id' => $this->bankStatement->id,
            'status' => 'completed',
            'reconciled_by' => $this->user->id,
            'reconciled_at' => now(),
        ]);

        // First review the reconciliation
        $this->post(route('finance.bank-reconciliation.review', $reconciliation));

        $response = $this->post(route('finance.bank-reconciliation.approve', $reconciliation));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $reconciliation->refresh();
        $this->assertEquals('approved', $reconciliation->status);
        $this->assertNotNull($reconciliation->approved_at);
        $this->assertEquals($this->adminUser->id, $reconciliation->approved_by);
    }

    /** @test */
    public function it_can_display_reconciliation_workspace()
    {
        $this->actingAs($this->user);

        $reconciliation = BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'bank_statement_id' => $this->bankStatement->id,
            'status' => 'in_progress',
        ]);

        // Create unmatched transactions
        BankStatementTransaction::factory()->create([
            'bank_statement_id' => $this->bankStatement->id,
            'amount' => 500.00,
        ]);

        Transaction::factory()->create([
            'account_id' => $this->bankAccount->id,
            'amount' => 500.00,
            'is_reconciled' => false,
        ]);

        $response = $this->get(route('finance.bank-reconciliation.workspace', $reconciliation));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Finance/BankReconciliation/Workspace')
                ->has('reconciliation')
                ->has('unmatchedBankTransactions')
                ->has('unmatchedBookTransactions')
            );
    }

    /** @test */
    public function it_calculates_progress_percentage_correctly()
    {
        $reconciliation = BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'bank_statement_id' => $this->bankStatement->id,
        ]);

        // Create 10 reconciliation items, 5 cleared
        BankReconciliationItem::factory()->count(5)->create([
            'bank_reconciliation_id' => $reconciliation->id,
            'is_cleared' => true,
        ]);

        BankReconciliationItem::factory()->count(5)->create([
            'bank_reconciliation_id' => $reconciliation->id,
            'is_cleared' => false,
        ]);

        $this->assertEquals(50, $reconciliation->progress_percentage);
    }

    /** @test */
    public function it_can_filter_reconciliations_by_status()
    {
        $this->actingAs($this->user);

        BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'status' => 'in_progress',
        ]);

        BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'status' => 'completed',
        ]);

        $response = $this->get(route('finance.bank-reconciliation.index', ['status' => 'completed']));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->has('reconciliations.data', 1)
                ->where('reconciliations.data.0.status', 'completed')
            );
    }

    /** @test */
    public function it_requires_finance_permissions()
    {
        $userWithoutPermissions = User::factory()->create();

        $this->actingAs($userWithoutPermissions);

        $response = $this->get(route('finance.bank-reconciliation.index'));
        $response->assertStatus(403);

        $response = $this->post(route('finance.bank-reconciliation.store'), []);
        $response->assertStatus(403);
    }

    /** @test */
    public function it_can_search_reconciliations()
    {
        $this->actingAs($this->user);

        BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'reconciliation_number' => 'REC-001',
        ]);

        BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'reconciliation_number' => 'REC-002',
        ]);

        $response = $this->get(route('finance.bank-reconciliation.index', ['search' => 'REC-001']));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->has('reconciliations.data', 1)
                ->where('reconciliations.data.0.reconciliation_number', 'REC-001')
            );
    }
}
