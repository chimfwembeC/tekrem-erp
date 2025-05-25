<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CrmTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'staff']);
        Role::create(['name' => 'customer']);

        // Create admin user
        $admin = User::factory()->create([
            'email' => 'admin@example.com',
        ]);
        $admin->assignRole('admin');

        // Create staff user
        $staff = User::factory()->create([
            'email' => 'staff@example.com',
        ]);
        $staff->assignRole('staff');
    }

    /**
     * Test that admin can access CRM dashboard.
     */
    public function test_admin_can_access_crm_dashboard(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();

        $response = $this->actingAs($admin)->get(route('crm.dashboard'));

        $response->assertStatus(200);
    }

    /**
     * Test that staff can access CRM dashboard.
     */
    public function test_staff_can_access_crm_dashboard(): void
    {
        $staff = User::where('email', 'staff@example.com')->first();

        $response = $this->actingAs($staff)->get(route('crm.dashboard'));

        $response->assertStatus(200);
    }

    /**
     * Test that admin can create a client.
     */
    public function test_admin_can_create_client(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();

        $clientData = [
            'name' => 'Test Client',
            'email' => 'client@example.com',
            'phone' => '555-123-4567',
            'company' => 'Test Company',
            'status' => 'active',
        ];

        $response = $this->actingAs($admin)->post(route('crm.clients.store'), $clientData);

        $response->assertRedirect(route('crm.clients.show', 1));
        $this->assertDatabaseHas('clients', [
            'name' => 'Test Client',
            'email' => 'client@example.com',
        ]);
    }

    /**
     * Test that admin can create a lead.
     */
    public function test_admin_can_create_lead(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();

        $leadData = [
            'name' => 'Test Lead',
            'email' => 'lead@example.com',
            'phone' => '555-987-6543',
            'company' => 'Lead Company',
            'source' => 'Website',
            'status' => 'new',
        ];

        $response = $this->actingAs($admin)->post(route('crm.leads.store'), $leadData);

        $response->assertRedirect(route('crm.leads.show', 1));
        $this->assertDatabaseHas('leads', [
            'name' => 'Test Lead',
            'email' => 'lead@example.com',
        ]);
    }

    /**
     * Test that admin can convert a lead to a client.
     */
    public function test_admin_can_convert_lead_to_client(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();

        // Create a qualified lead
        $lead = Lead::create([
            'name' => 'Convert Lead',
            'email' => 'convert@example.com',
            'phone' => '555-111-2222',
            'company' => 'Convert Company',
            'source' => 'Referral',
            'status' => 'qualified',
            'user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->post(route('crm.leads.convert', $lead->id));

        $response->assertRedirect(route('crm.clients.show', 1));

        // Check that lead is marked as converted
        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'converted_to_client' => true,
        ]);

        // Check that client was created
        $this->assertDatabaseHas('clients', [
            'name' => 'Convert Lead',
            'email' => 'convert@example.com',
            'converted_from_lead_id' => $lead->id,
        ]);
    }
}
