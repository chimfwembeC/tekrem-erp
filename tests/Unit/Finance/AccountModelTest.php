<?php

namespace Tests\Unit\Finance;

use App\Models\Finance\Account;
use App\Models\Finance\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountModelTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Account $account;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->account = Account::create([
            'name' => 'Test Account',
            'type' => 'checking',
            'account_number' => '123456789',
            'bank_name' => 'Test Bank',
            'initial_balance' => 1000.00,
            'balance' => 1000.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->user->id,
        ]);
    }

    /** @test */
    public function it_belongs_to_a_user()
    {
        $this->assertInstanceOf(User::class, $this->account->user);
        $this->assertEquals($this->user->id, $this->account->user->id);
    }

    /** @test */
    public function it_has_many_transactions()
    {
        $transaction = Transaction::create([
            'type' => 'income',
            'amount' => 100.00,
            'description' => 'Test transaction',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
        ]);

        $this->assertTrue($this->account->transactions->contains($transaction));
    }

    /** @test */
    public function it_can_scope_active_accounts()
    {
        $inactiveAccount = Account::create([
            'name' => 'Inactive Account',
            'type' => 'savings',
            'initial_balance' => 500.00,
            'balance' => 500.00,
            'currency' => 'USD',
            'is_active' => false,
            'user_id' => $this->user->id,
        ]);

        $activeAccounts = Account::active()->get();

        $this->assertTrue($activeAccounts->contains($this->account));
        $this->assertFalse($activeAccounts->contains($inactiveAccount));
    }

    /** @test */
    public function it_can_scope_by_type()
    {
        $savingsAccount = Account::create([
            'name' => 'Savings Account',
            'type' => 'savings',
            'initial_balance' => 500.00,
            'balance' => 500.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->user->id,
        ]);

        $checkingAccounts = Account::ofType('checking')->get();
        $savingsAccounts = Account::ofType('savings')->get();

        $this->assertTrue($checkingAccounts->contains($this->account));
        $this->assertFalse($checkingAccounts->contains($savingsAccount));
        $this->assertTrue($savingsAccounts->contains($savingsAccount));
        $this->assertFalse($savingsAccounts->contains($this->account));
    }

    /** @test */
    public function it_updates_balance_correctly()
    {
        // Create income transaction
        Transaction::create([
            'type' => 'income',
            'amount' => 200.00,
            'description' => 'Income transaction',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
        ]);

        // Create expense transaction
        Transaction::create([
            'type' => 'expense',
            'amount' => 50.00,
            'description' => 'Expense transaction',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
        ]);

        $this->account->updateBalance();

        // Initial balance (1000) + income (200) - expense (50) = 1150
        $this->assertEquals(1150.00, $this->account->fresh()->balance);
    }

    /** @test */
    public function it_calculates_balance_with_transfers()
    {
        $targetAccount = Account::create([
            'name' => 'Target Account',
            'type' => 'savings',
            'initial_balance' => 500.00,
            'balance' => 500.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->user->id,
        ]);

        // Transfer from this account to target account
        Transaction::create([
            'type' => 'transfer',
            'amount' => 100.00,
            'description' => 'Transfer out',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'transfer_to_account_id' => $targetAccount->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
        ]);

        // Transfer from target account to this account
        Transaction::create([
            'type' => 'transfer',
            'amount' => 50.00,
            'description' => 'Transfer in',
            'transaction_date' => now(),
            'account_id' => $targetAccount->id,
            'transfer_to_account_id' => $this->account->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
        ]);

        $this->account->updateBalance();

        // Initial balance (1000) - transfer out (100) + transfer in (50) = 950
        $this->assertEquals(950.00, $this->account->fresh()->balance);
    }

    /** @test */
    public function it_only_includes_completed_transactions_in_balance()
    {
        // Create pending transaction (should not affect balance)
        Transaction::create([
            'type' => 'income',
            'amount' => 200.00,
            'description' => 'Pending transaction',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'status' => 'pending',
            'user_id' => $this->user->id,
        ]);

        // Create completed transaction
        Transaction::create([
            'type' => 'income',
            'amount' => 100.00,
            'description' => 'Completed transaction',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
        ]);

        $this->account->updateBalance();

        // Initial balance (1000) + completed income (100) = 1100
        // Pending transaction should not affect balance
        $this->assertEquals(1100.00, $this->account->fresh()->balance);
    }

    /** @test */
    public function it_casts_balance_to_decimal()
    {
        $this->assertIsFloat($this->account->balance);
        $this->assertIsFloat($this->account->initial_balance);
    }

    /** @test */
    public function it_casts_is_active_to_boolean()
    {
        $this->assertIsBool($this->account->is_active);
    }

    /** @test */
    public function it_has_fillable_attributes()
    {
        $fillable = [
            'name',
            'type',
            'account_number',
            'bank_name',
            'balance',
            'initial_balance',
            'currency',
            'description',
            'is_active',
            'user_id',
        ];

        $this->assertEquals($fillable, $this->account->getFillable());
    }
}
