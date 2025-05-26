<?php

namespace Tests\Unit\Finance;

use App\Models\Finance\Invoice;
use App\Models\Finance\InvoiceItem;
use App\Models\Finance\Payment;
use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceModelTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Client $client;
    protected Lead $lead;
    protected Invoice $invoice;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        
        $this->client = Client::create([
            'name' => 'Test Client',
            'email' => 'client@example.com',
            'phone' => '555-123-4567',
            'company' => 'Test Company',
            'status' => 'active',
            'user_id' => $this->user->id,
        ]);

        $this->lead = Lead::create([
            'name' => 'Test Lead',
            'email' => 'lead@example.com',
            'phone' => '555-987-6543',
            'company' => 'Lead Company',
            'source' => 'Website',
            'status' => 'new',
            'user_id' => $this->user->id,
        ]);

        $this->invoice = Invoice::create([
            'invoice_number' => 'INV-001',
            'status' => 'draft',
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'subtotal' => 100.00,
            'tax_amount' => 10.00,
            'discount_amount' => 5.00,
            'total_amount' => 105.00,
            'paid_amount' => 0.00,
            'currency' => 'USD',
            'billable_type' => 'App\\Models\\Client',
            'billable_id' => $this->client->id,
            'user_id' => $this->user->id,
        ]);
    }

    /** @test */
    public function it_belongs_to_a_user()
    {
        $this->assertInstanceOf(User::class, $this->invoice->user);
        $this->assertEquals($this->user->id, $this->invoice->user->id);
    }

    /** @test */
    public function it_has_polymorphic_billable_relationship()
    {
        // Test with client
        $this->assertInstanceOf(Client::class, $this->invoice->billable);
        $this->assertEquals($this->client->id, $this->invoice->billable->id);

        // Test with lead
        $leadInvoice = Invoice::create([
            'invoice_number' => 'INV-002',
            'status' => 'draft',
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'subtotal' => 200.00,
            'tax_amount' => 20.00,
            'total_amount' => 220.00,
            'paid_amount' => 0.00,
            'currency' => 'USD',
            'billable_type' => 'App\\Models\\Lead',
            'billable_id' => $this->lead->id,
            'user_id' => $this->user->id,
        ]);

        $this->assertInstanceOf(Lead::class, $leadInvoice->billable);
        $this->assertEquals($this->lead->id, $leadInvoice->billable->id);
    }

    /** @test */
    public function it_has_many_invoice_items()
    {
        $item = InvoiceItem::create([
            'invoice_id' => $this->invoice->id,
            'description' => 'Test Item',
            'quantity' => 2,
            'unit_price' => 50.00,
            'total' => 100.00,
        ]);

        $this->assertTrue($this->invoice->items->contains($item));
        $this->assertInstanceOf(InvoiceItem::class, $this->invoice->items->first());
    }

    /** @test */
    public function it_has_many_payments()
    {
        $payment = Payment::create([
            'payment_number' => 'PAY-001',
            'amount' => 50.00,
            'payment_date' => now(),
            'payment_method' => 'bank_transfer',
            'status' => 'completed',
            'invoice_id' => $this->invoice->id,
            'payable_type' => 'App\\Models\\Client',
            'payable_id' => $this->client->id,
            'user_id' => $this->user->id,
        ]);

        $this->assertTrue($this->invoice->payments->contains($payment));
        $this->assertInstanceOf(Payment::class, $this->invoice->payments->first());
    }

    /** @test */
    public function it_can_scope_by_status()
    {
        $sentInvoice = Invoice::create([
            'invoice_number' => 'INV-002',
            'status' => 'sent',
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'subtotal' => 200.00,
            'tax_amount' => 20.00,
            'total_amount' => 220.00,
            'paid_amount' => 0.00,
            'currency' => 'USD',
            'billable_type' => 'App\\Models\\Client',
            'billable_id' => $this->client->id,
            'user_id' => $this->user->id,
        ]);

        $draftInvoices = Invoice::draft()->get();
        $sentInvoices = Invoice::sent()->get();

        $this->assertTrue($draftInvoices->contains($this->invoice));
        $this->assertFalse($draftInvoices->contains($sentInvoice));
        $this->assertTrue($sentInvoices->contains($sentInvoice));
        $this->assertFalse($sentInvoices->contains($this->invoice));
    }

    /** @test */
    public function it_can_scope_overdue_invoices()
    {
        $overdueInvoice = Invoice::create([
            'invoice_number' => 'INV-OVERDUE',
            'status' => 'sent',
            'issue_date' => now()->subDays(40),
            'due_date' => now()->subDays(10),
            'subtotal' => 300.00,
            'tax_amount' => 30.00,
            'total_amount' => 330.00,
            'paid_amount' => 0.00,
            'currency' => 'USD',
            'billable_type' => 'App\\Models\\Client',
            'billable_id' => $this->client->id,
            'user_id' => $this->user->id,
        ]);

        $overdueInvoices = Invoice::overdue()->get();

        $this->assertTrue($overdueInvoices->contains($overdueInvoice));
        $this->assertFalse($overdueInvoices->contains($this->invoice));
    }

    /** @test */
    public function it_can_scope_unpaid_invoices()
    {
        $paidInvoice = Invoice::create([
            'invoice_number' => 'INV-PAID',
            'status' => 'paid',
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'subtotal' => 400.00,
            'tax_amount' => 40.00,
            'total_amount' => 440.00,
            'paid_amount' => 440.00,
            'currency' => 'USD',
            'billable_type' => 'App\\Models\\Client',
            'billable_id' => $this->client->id,
            'user_id' => $this->user->id,
        ]);

        $unpaidInvoices = Invoice::unpaid()->get();

        $this->assertTrue($unpaidInvoices->contains($this->invoice));
        $this->assertFalse($unpaidInvoices->contains($paidInvoice));
    }

    /** @test */
    public function it_calculates_remaining_amount()
    {
        $this->assertEquals(105.00, $this->invoice->getRemainingAmountAttribute());

        // Add a payment
        $this->invoice->update(['paid_amount' => 50.00]);
        $this->assertEquals(55.00, $this->invoice->fresh()->getRemainingAmountAttribute());
    }

    /** @test */
    public function it_checks_if_fully_paid()
    {
        $this->assertFalse($this->invoice->getIsFullyPaidAttribute());

        $this->invoice->update(['paid_amount' => 105.00]);
        $this->assertTrue($this->invoice->fresh()->getIsFullyPaidAttribute());
    }

    /** @test */
    public function it_checks_if_overdue()
    {
        $this->assertFalse($this->invoice->getIsOverdueAttribute());

        $this->invoice->update([
            'due_date' => now()->subDays(1),
            'status' => 'sent'
        ]);
        $this->assertTrue($this->invoice->fresh()->getIsOverdueAttribute());
    }

    /** @test */
    public function it_calculates_days_until_due()
    {
        $this->assertEquals(30, $this->invoice->getDaysUntilDueAttribute());

        $this->invoice->update(['due_date' => now()->addDays(15)]);
        $this->assertEquals(15, $this->invoice->fresh()->getDaysUntilDueAttribute());

        $this->invoice->update(['due_date' => now()->subDays(5)]);
        $this->assertEquals(-5, $this->invoice->fresh()->getDaysUntilDueAttribute());
    }

    /** @test */
    public function it_casts_dates_correctly()
    {
        $this->assertInstanceOf(\Carbon\Carbon::class, $this->invoice->issue_date);
        $this->assertInstanceOf(\Carbon\Carbon::class, $this->invoice->due_date);
    }

    /** @test */
    public function it_casts_amounts_to_decimal()
    {
        $this->assertIsFloat($this->invoice->subtotal);
        $this->assertIsFloat($this->invoice->tax_amount);
        $this->assertIsFloat($this->invoice->discount_amount);
        $this->assertIsFloat($this->invoice->total_amount);
        $this->assertIsFloat($this->invoice->paid_amount);
    }

    /** @test */
    public function it_has_fillable_attributes()
    {
        $fillable = [
            'invoice_number',
            'status',
            'issue_date',
            'due_date',
            'subtotal',
            'tax_amount',
            'discount_amount',
            'total_amount',
            'paid_amount',
            'currency',
            'notes',
            'terms',
            'billable_id',
            'billable_type',
            'user_id',
        ];

        $this->assertEquals($fillable, $this->invoice->getFillable());
    }

    /** @test */
    public function it_generates_unique_invoice_number()
    {
        $newInvoice = Invoice::create([
            'status' => 'draft',
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'subtotal' => 100.00,
            'tax_amount' => 10.00,
            'total_amount' => 110.00,
            'paid_amount' => 0.00,
            'currency' => 'USD',
            'billable_type' => 'App\\Models\\Client',
            'billable_id' => $this->client->id,
            'user_id' => $this->user->id,
        ]);

        $this->assertNotNull($newInvoice->invoice_number);
        $this->assertNotEquals($this->invoice->invoice_number, $newInvoice->invoice_number);
    }
}
