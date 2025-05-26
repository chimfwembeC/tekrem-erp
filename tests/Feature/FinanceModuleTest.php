<?php

namespace Tests\Feature;

use App\Models\Finance\Account;
use App\Models\Finance\Budget;
use App\Models\Finance\Category;
use App\Models\Finance\Expense;
use App\Models\Finance\Invoice;
use App\Models\Finance\Payment;
use App\Models\Finance\Quotation;
use App\Models\Finance\Transaction;
use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinanceModuleTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $admin;
    protected User $staff;
    protected Account $account;
    protected Category $category;
    protected Client $client;
    protected Lead $lead;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'staff']);
        Role::create(['name' => 'customer']);

        // Create admin user
        $this->admin = User::factory()->create([
            'email' => 'admin@example.com',
        ]);
        $this->admin->assignRole('admin');

        // Create staff user
        $this->staff = User::factory()->create([
            'email' => 'staff@example.com',
        ]);
        $this->staff->assignRole('staff');

        // Create test account
        $this->account = Account::create([
            'name' => 'Test Account',
            'type' => 'checking',
            'account_number' => '123456789',
            'bank_name' => 'Test Bank',
            'initial_balance' => 1000.00,
            'balance' => 1000.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->admin->id,
        ]);

        // Create test category
        $this->category = Category::create([
            'name' => 'Test Category',
            'type' => 'both',
            'color' => '#3B82F6',
            'is_active' => true,
        ]);

        // Create test client
        $this->client = Client::create([
            'name' => 'Test Client',
            'email' => 'client@example.com',
            'phone' => '555-123-4567',
            'company' => 'Test Company',
            'status' => 'active',
            'user_id' => $this->admin->id,
        ]);

        // Create test lead
        $this->lead = Lead::create([
            'name' => 'Test Lead',
            'email' => 'lead@example.com',
            'phone' => '555-987-6543',
            'company' => 'Lead Company',
            'source' => 'Website',
            'status' => 'new',
            'user_id' => $this->admin->id,
        ]);
    }

    /** @test */
    public function admin_can_access_finance_dashboard()
    {
        $response = $this->actingAs($this->admin)->get(route('finance.dashboard'));
        $response->assertStatus(200);
    }

    /** @test */
    public function staff_can_access_finance_dashboard()
    {
        $response = $this->actingAs($this->staff)->get(route('finance.dashboard'));
        $response->assertStatus(200);
    }

    /** @test */
    public function admin_can_create_account()
    {
        $accountData = [
            'name' => 'New Test Account',
            'type' => 'savings',
            'account_number' => '987654321',
            'bank_name' => 'New Bank',
            'initial_balance' => 500.00,
            'currency' => 'USD',
            'description' => 'Test savings account',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('finance.accounts.store'), $accountData);

        $response->assertRedirect();
        $this->assertDatabaseHas('accounts', [
            'name' => 'New Test Account',
            'type' => 'savings',
            'user_id' => $this->admin->id,
        ]);
    }

    /** @test */
    public function admin_can_create_transaction()
    {
        $transactionData = [
            'type' => 'income',
            'amount' => 250.00,
            'description' => 'Test income transaction',
            'transaction_date' => now()->format('Y-m-d'),
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'status' => 'completed',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('finance.transactions.store'), $transactionData);

        $response->assertRedirect();
        $this->assertDatabaseHas('transactions', [
            'type' => 'income',
            'amount' => 250.00,
            'user_id' => $this->admin->id,
        ]);
    }

    /** @test */
    public function admin_can_create_invoice()
    {
        $invoiceData = [
            'billable_type' => 'client',
            'billable_id' => $this->client->id,
            'issue_date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'currency' => 'USD',
            'status' => 'draft',
            'notes' => 'Test invoice notes',
            'terms' => 'Net 30',
            'tax_rate' => 10.0,
            'discount_amount' => 0.0,
            'items' => [
                [
                    'description' => 'Test Service',
                    'quantity' => 2,
                    'unit_price' => 100.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('finance.invoices.store'), $invoiceData);

        $response->assertRedirect();
        $this->assertDatabaseHas('invoices', [
            'billable_type' => 'App\\Models\\Client',
            'billable_id' => $this->client->id,
            'user_id' => $this->admin->id,
        ]);
    }

    /** @test */
    public function admin_can_create_quotation()
    {
        $quotationData = [
            'lead_id' => $this->lead->id,
            'issue_date' => now()->format('Y-m-d'),
            'expiry_date' => now()->addDays(30)->format('Y-m-d'),
            'currency' => 'USD',
            'status' => 'draft',
            'notes' => 'Test quotation notes',
            'terms' => 'Valid for 30 days',
            'tax_rate' => 10.0,
            'discount_amount' => 0.0,
            'items' => [
                [
                    'description' => 'Test Product',
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('finance.quotations.store'), $quotationData);

        $response->assertRedirect();
        $this->assertDatabaseHas('quotations', [
            'lead_id' => $this->lead->id,
            'user_id' => $this->admin->id,
        ]);
    }

    /** @test */
    public function admin_can_create_payment()
    {
        // First create an invoice
        $invoice = Invoice::create([
            'invoice_number' => 'INV-001',
            'status' => 'sent',
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'subtotal' => 200.00,
            'tax_amount' => 20.00,
            'discount_amount' => 0.00,
            'total_amount' => 220.00,
            'paid_amount' => 0.00,
            'currency' => 'USD',
            'billable_type' => 'App\\Models\\Client',
            'billable_id' => $this->client->id,
            'user_id' => $this->admin->id,
        ]);

        $paymentData = [
            'invoice_id' => $invoice->id,
            'account_id' => $this->account->id,
            'amount' => 220.00,
            'payment_date' => now()->format('Y-m-d'),
            'payment_method' => 'bank_transfer',
            'reference_number' => 'REF-001',
            'status' => 'completed',
            'notes' => 'Full payment received',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('finance.payments.store'), $paymentData);

        $response->assertRedirect();
        $this->assertDatabaseHas('payments', [
            'invoice_id' => $invoice->id,
            'amount' => 220.00,
            'user_id' => $this->admin->id,
        ]);
    }

    /** @test */
    public function admin_can_create_budget()
    {
        $budgetData = [
            'name' => 'Test Budget',
            'amount' => 1000.00,
            'period' => 'monthly',
            'start_date' => now()->format('Y-m-d'),
            'end_date' => now()->addMonth()->format('Y-m-d'),
            'category_id' => $this->category->id,
            'description' => 'Test budget description',
            'alert_threshold' => 80,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('finance.budgets.store'), $budgetData);

        $response->assertRedirect();
        $this->assertDatabaseHas('budgets', [
            'name' => 'Test Budget',
            'amount' => 1000.00,
            'user_id' => $this->admin->id,
        ]);
    }

    /** @test */
    public function admin_can_create_expense()
    {
        $expenseData = [
            'title' => 'Test Expense',
            'description' => 'Test expense description',
            'amount' => 150.00,
            'expense_date' => now()->format('Y-m-d'),
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'status' => 'approved',
            'vendor' => 'Test Vendor',
            'receipt_number' => 'REC-001',
            'is_billable' => false,
            'is_reimbursable' => false,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('finance.expenses.store'), $expenseData);

        $response->assertRedirect();
        $this->assertDatabaseHas('expenses', [
            'title' => 'Test Expense',
            'amount' => 150.00,
            'user_id' => $this->admin->id,
        ]);
    }

    /** @test */
    public function admin_can_create_category()
    {
        $categoryData = [
            'name' => 'New Test Category',
            'type' => 'expense',
            'description' => 'Test category description',
            'color' => '#EF4444',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('finance.categories.store'), $categoryData);

        $response->assertRedirect();
        $this->assertDatabaseHas('categories', [
            'name' => 'New Test Category',
            'type' => 'expense',
        ]);
    }
}
