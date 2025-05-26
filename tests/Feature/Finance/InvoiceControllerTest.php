<?php

namespace Tests\Feature\Finance;

use App\Models\Finance\Invoice;
use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class InvoiceControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $staff;
    protected Client $client;
    protected Lead $lead;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'staff']);
        Role::create(['name' => 'customer']);

        // Create users
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->staff = User::factory()->create();
        $this->staff->assignRole('staff');

        // Create client and lead
        $this->client = Client::create([
            'name' => 'Test Client',
            'email' => 'client@example.com',
            'phone' => '555-123-4567',
            'company' => 'Test Company',
            'status' => 'active',
            'user_id' => $this->admin->id,
        ]);

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
    public function admin_can_view_invoices_index()
    {
        $response = $this->actingAs($this->admin)->get(route('finance.invoices.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Finance/Invoices/Index'));
    }

    /** @test */
    public function staff_can_view_invoices_index()
    {
        $response = $this->actingAs($this->staff)->get(route('finance.invoices.index'));
        $response->assertStatus(200);
    }

    /** @test */
    public function admin_can_view_create_invoice_form()
    {
        $response = $this->actingAs($this->admin)->get(route('finance.invoices.create'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Finance/Invoices/Create'));
    }

    /** @test */
    public function admin_can_create_invoice_for_client()
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
                [
                    'description' => 'Another Service',
                    'quantity' => 1,
                    'unit_price' => 50.00,
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
            'status' => 'draft',
            'currency' => 'USD',
        ]);

        // Check invoice items were created
        $invoice = Invoice::where('billable_id', $this->client->id)->first();
        $this->assertCount(2, $invoice->items);
    }

    /** @test */
    public function admin_can_create_invoice_for_lead()
    {
        $invoiceData = [
            'billable_type' => 'lead',
            'billable_id' => $this->lead->id,
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
                    'description' => 'Test Product',
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('finance.invoices.store'), $invoiceData);

        $response->assertRedirect();
        $this->assertDatabaseHas('invoices', [
            'billable_type' => 'App\\Models\\Lead',
            'billable_id' => $this->lead->id,
            'user_id' => $this->admin->id,
        ]);
    }

    /** @test */
    public function invoice_creation_requires_valid_data()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('finance.invoices.store'), []);

        $response->assertSessionHasErrors([
            'billable_type',
            'billable_id',
            'issue_date',
            'due_date',
            'currency',
            'status',
            'items',
        ]);
    }

    /** @test */
    public function invoice_creation_validates_billable_type()
    {
        $invoiceData = [
            'billable_type' => 'invalid_type',
            'billable_id' => $this->client->id,
            'issue_date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'currency' => 'USD',
            'status' => 'draft',
            'items' => [
                [
                    'description' => 'Test Service',
                    'quantity' => 1,
                    'unit_price' => 100.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('finance.invoices.store'), $invoiceData);

        $response->assertSessionHasErrors(['billable_type']);
    }

    /** @test */
    public function admin_can_view_invoice_details()
    {
        $invoice = Invoice::create([
            'invoice_number' => 'INV-001',
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
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('finance.invoices.show', $invoice));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Finance/Invoices/Show')
                ->has('invoice')
                ->where('invoice.id', $invoice->id)
        );
    }

    /** @test */
    public function user_cannot_view_other_users_invoices()
    {
        $otherUser = User::factory()->create();
        $otherUser->assignRole('admin');

        $invoice = Invoice::create([
            'invoice_number' => 'INV-001',
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
            'user_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('finance.invoices.show', $invoice));

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_edit_invoice()
    {
        $invoice = Invoice::create([
            'invoice_number' => 'INV-001',
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
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('finance.invoices.edit', $invoice));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Finance/Invoices/Edit')
                ->has('invoice')
                ->where('invoice.id', $invoice->id)
        );
    }

    /** @test */
    public function admin_can_update_invoice()
    {
        $invoice = Invoice::create([
            'invoice_number' => 'INV-001',
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
            'user_id' => $this->admin->id,
        ]);

        $updateData = [
            'billable_type' => 'lead',
            'billable_id' => $this->lead->id,
            'issue_date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(45)->format('Y-m-d'),
            'currency' => 'EUR',
            'status' => 'sent',
            'notes' => 'Updated notes',
            'terms' => 'Updated terms',
            'tax_rate' => 15.0,
            'discount_amount' => 10.0,
            'items' => [
                [
                    'description' => 'Updated Service',
                    'quantity' => 3,
                    'unit_price' => 150.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('finance.invoices.update', $invoice), $updateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'billable_type' => 'App\\Models\\Lead',
            'billable_id' => $this->lead->id,
            'currency' => 'EUR',
            'status' => 'sent',
        ]);
    }

    /** @test */
    public function admin_can_delete_invoice()
    {
        $invoice = Invoice::create([
            'invoice_number' => 'INV-001',
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
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('finance.invoices.destroy', $invoice));

        $response->assertRedirect();
        $this->assertDatabaseMissing('invoices', ['id' => $invoice->id]);
    }

    /** @test */
    public function invoices_index_can_be_searched()
    {
        $invoice1 = Invoice::create([
            'invoice_number' => 'INV-001',
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
            'user_id' => $this->admin->id,
        ]);

        $invoice2 = Invoice::create([
            'invoice_number' => 'INV-002',
            'status' => 'sent',
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'subtotal' => 200.00,
            'tax_amount' => 20.00,
            'total_amount' => 220.00,
            'paid_amount' => 0.00,
            'currency' => 'USD',
            'billable_type' => 'App\\Models\\Lead',
            'billable_id' => $this->lead->id,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('finance.invoices.index', ['search' => 'INV-001']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('invoices.data', 1)
                ->where('invoices.data.0.invoice_number', 'INV-001')
        );
    }
}
