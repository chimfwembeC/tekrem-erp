<?php

namespace Tests\Unit\Finance;

use App\Models\Finance\Account;
use App\Models\Finance\Category;
use App\Models\Finance\Expense;
use App\Models\Finance\Invoice;
use App\Models\Finance\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionModelTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Account $account;
    protected Category $category;
    protected Transaction $transaction;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        
        $this->account = Account::create([
            'name' => 'Test Account',
            'type' => 'checking',
            'initial_balance' => 1000.00,
            'balance' => 1000.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->user->id,
        ]);

        $this->category = Category::create([
            'name' => 'Test Category',
            'type' => 'both',
            'color' => '#3B82F6',
            'is_active' => true,
        ]);

        $this->transaction = Transaction::create([
            'type' => 'income',
            'amount' => 100.00,
            'description' => 'Test transaction',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
        ]);
    }

    /** @test */
    public function it_belongs_to_a_user()
    {
        $this->assertInstanceOf(User::class, $this->transaction->user);
        $this->assertEquals($this->user->id, $this->transaction->user->id);
    }

    /** @test */
    public function it_belongs_to_an_account()
    {
        $this->assertInstanceOf(Account::class, $this->transaction->account);
        $this->assertEquals($this->account->id, $this->transaction->account->id);
    }

    /** @test */
    public function it_belongs_to_a_category()
    {
        $this->assertInstanceOf(Category::class, $this->transaction->category);
        $this->assertEquals($this->category->id, $this->transaction->category->id);
    }

    /** @test */
    public function it_can_belong_to_a_transfer_account()
    {
        $transferAccount = Account::create([
            'name' => 'Transfer Account',
            'type' => 'savings',
            'initial_balance' => 500.00,
            'balance' => 500.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->user->id,
        ]);

        $transferTransaction = Transaction::create([
            'type' => 'transfer',
            'amount' => 50.00,
            'description' => 'Transfer transaction',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'transfer_to_account_id' => $transferAccount->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
        ]);

        $this->assertInstanceOf(Account::class, $transferTransaction->transferToAccount);
        $this->assertEquals($transferAccount->id, $transferTransaction->transferToAccount->id);
    }

    /** @test */
    public function it_can_belong_to_an_invoice()
    {
        $invoice = Invoice::create([
            'invoice_number' => 'INV-001',
            'status' => 'sent',
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'subtotal' => 100.00,
            'tax_amount' => 10.00,
            'total_amount' => 110.00,
            'paid_amount' => 0.00,
            'currency' => 'USD',
            'billable_type' => 'App\\Models\\Client',
            'billable_id' => 1,
            'user_id' => $this->user->id,
        ]);

        $invoiceTransaction = Transaction::create([
            'type' => 'income',
            'amount' => 110.00,
            'description' => 'Invoice payment',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'invoice_id' => $invoice->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
        ]);

        $this->assertInstanceOf(Invoice::class, $invoiceTransaction->invoice);
        $this->assertEquals($invoice->id, $invoiceTransaction->invoice->id);
    }

    /** @test */
    public function it_can_belong_to_an_expense()
    {
        $expense = Expense::create([
            'amount' => 50.00,
            'description' => 'Test expense',
            'expense_date' => now(),
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'status' => 'approved',
            'user_id' => $this->user->id,
        ]);

        $expenseTransaction = Transaction::create([
            'type' => 'expense',
            'amount' => 50.00,
            'description' => 'Expense transaction',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'expense_id' => $expense->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
        ]);

        $this->assertInstanceOf(Expense::class, $expenseTransaction->expense);
        $this->assertEquals($expense->id, $expenseTransaction->expense->id);
    }

    /** @test */
    public function it_can_scope_by_type()
    {
        $expenseTransaction = Transaction::create([
            'type' => 'expense',
            'amount' => 50.00,
            'description' => 'Expense transaction',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
        ]);

        $incomeTransactions = Transaction::ofType('income')->get();
        $expenseTransactions = Transaction::ofType('expense')->get();

        $this->assertTrue($incomeTransactions->contains($this->transaction));
        $this->assertFalse($incomeTransactions->contains($expenseTransaction));
        $this->assertTrue($expenseTransactions->contains($expenseTransaction));
        $this->assertFalse($expenseTransactions->contains($this->transaction));
    }

    /** @test */
    public function it_can_scope_by_status()
    {
        $pendingTransaction = Transaction::create([
            'type' => 'income',
            'amount' => 75.00,
            'description' => 'Pending transaction',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'status' => 'pending',
            'user_id' => $this->user->id,
        ]);

        $completedTransactions = Transaction::completed()->get();
        $pendingTransactions = Transaction::pending()->get();

        $this->assertTrue($completedTransactions->contains($this->transaction));
        $this->assertFalse($completedTransactions->contains($pendingTransaction));
        $this->assertTrue($pendingTransactions->contains($pendingTransaction));
        $this->assertFalse($pendingTransactions->contains($this->transaction));
    }

    /** @test */
    public function it_can_scope_by_date_range()
    {
        $oldTransaction = Transaction::create([
            'type' => 'income',
            'amount' => 25.00,
            'description' => 'Old transaction',
            'transaction_date' => now()->subDays(10),
            'account_id' => $this->account->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
        ]);

        $recentTransactions = Transaction::dateRange(now()->subDays(5), now())->get();

        $this->assertTrue($recentTransactions->contains($this->transaction));
        $this->assertFalse($recentTransactions->contains($oldTransaction));
    }

    /** @test */
    public function it_casts_amount_to_decimal()
    {
        $this->assertIsFloat($this->transaction->amount);
    }

    /** @test */
    public function it_casts_transaction_date_to_date()
    {
        $this->assertInstanceOf(\Carbon\Carbon::class, $this->transaction->transaction_date);
    }

    /** @test */
    public function it_casts_metadata_to_array()
    {
        $transactionWithMetadata = Transaction::create([
            'type' => 'income',
            'amount' => 100.00,
            'description' => 'Transaction with metadata',
            'transaction_date' => now(),
            'account_id' => $this->account->id,
            'status' => 'completed',
            'user_id' => $this->user->id,
            'metadata' => ['key' => 'value', 'test' => true],
        ]);

        $this->assertIsArray($transactionWithMetadata->metadata);
        $this->assertEquals(['key' => 'value', 'test' => true], $transactionWithMetadata->metadata);
    }

    /** @test */
    public function it_has_fillable_attributes()
    {
        $fillable = [
            'type',
            'amount',
            'description',
            'transaction_date',
            'reference_number',
            'status',
            'account_id',
            'category_id',
            'transfer_to_account_id',
            'invoice_id',
            'expense_id',
            'user_id',
            'metadata',
        ];

        $this->assertEquals($fillable, $this->transaction->getFillable());
    }
}
