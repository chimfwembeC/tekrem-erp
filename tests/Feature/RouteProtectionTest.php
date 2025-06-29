<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RouteProtectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create permissions
        Permission::create(['name' => 'view crm']);
        Permission::create(['name' => 'view finance']);
        Permission::create(['name' => 'view projects']);
        Permission::create(['name' => 'view hr']);
        Permission::create(['name' => 'view support']);
        Permission::create(['name' => 'view cms']);
        Permission::create(['name' => 'view ai']);
        
        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $staffRole = Role::create(['name' => 'staff']);
        $customerRole = Role::create(['name' => 'customer']);
        
        // Assign all permissions to admin
        $adminRole->givePermissionTo(Permission::all());
        
        // Assign module permissions to staff
        $staffRole->givePermissionTo([
            'view crm', 'view finance', 'view projects', 
            'view hr', 'view support', 'view cms', 'view ai'
        ]);
    }

    public function test_crm_routes_require_permission()
    {
        // Create users
        $adminUser = User::factory()->create();
        $adminUser->assignRole('admin');
        
        $customerUser = User::factory()->create();
        $customerUser->assignRole('customer');
        
        // Admin should have access
        $this->actingAs($adminUser)
            ->get(route('crm.dashboard'))
            ->assertStatus(200);
            
        // Customer without permission should be denied
        $this->actingAs($customerUser)
            ->get(route('crm.dashboard'))
            ->assertStatus(403);
    }

    public function test_finance_routes_require_permission()
    {
        $adminUser = User::factory()->create();
        $adminUser->assignRole('admin');
        
        $customerUser = User::factory()->create();
        $customerUser->assignRole('customer');
        
        // Admin should have access
        $this->actingAs($adminUser)
            ->get(route('finance.dashboard'))
            ->assertStatus(200);
            
        // Customer without permission should be denied
        $this->actingAs($customerUser)
            ->get(route('finance.dashboard'))
            ->assertStatus(403);
    }

    public function test_support_routes_require_permission()
    {
        $adminUser = User::factory()->create();
        $adminUser->assignRole('admin');
        
        $customerUser = User::factory()->create();
        $customerUser->assignRole('customer');
        
        // Admin should have access
        $this->actingAs($adminUser)
            ->get(route('support.dashboard'))
            ->assertStatus(200);
            
        // Customer without permission should be denied
        $this->actingAs($customerUser)
            ->get(route('support.dashboard'))
            ->assertStatus(403);
    }

    public function test_cms_routes_require_permission()
    {
        $adminUser = User::factory()->create();
        $adminUser->assignRole('admin');
        
        $customerUser = User::factory()->create();
        $customerUser->assignRole('customer');
        
        // Admin should have access
        $this->actingAs($adminUser)
            ->get(route('cms.dashboard'))
            ->assertStatus(200);
            
        // Customer without permission should be denied
        $this->actingAs($customerUser)
            ->get(route('cms.dashboard'))
            ->assertStatus(403);
    }

    public function test_hr_routes_require_permission()
    {
        $adminUser = User::factory()->create();
        $adminUser->assignRole('admin');
        
        $customerUser = User::factory()->create();
        $customerUser->assignRole('customer');
        
        // Admin should have access
        $this->actingAs($adminUser)
            ->get(route('hr.dashboard'))
            ->assertStatus(200);
            
        // Customer without permission should be denied
        $this->actingAs($customerUser)
            ->get(route('hr.dashboard'))
            ->assertStatus(403);
    }

    public function test_projects_routes_require_permission()
    {
        $adminUser = User::factory()->create();
        $adminUser->assignRole('admin');
        
        $customerUser = User::factory()->create();
        $customerUser->assignRole('customer');
        
        // Admin should have access
        $this->actingAs($adminUser)
            ->get(route('projects.dashboard'))
            ->assertStatus(200);
            
        // Customer without permission should be denied
        $this->actingAs($customerUser)
            ->get(route('projects.dashboard'))
            ->assertStatus(403);
    }

    public function test_ai_routes_require_permission()
    {
        $adminUser = User::factory()->create();
        $adminUser->assignRole('admin');
        
        $customerUser = User::factory()->create();
        $customerUser->assignRole('customer');
        
        // Admin should have access
        $this->actingAs($adminUser)
            ->get(route('ai.dashboard'))
            ->assertStatus(200);
            
        // Customer without permission should be denied
        $this->actingAs($customerUser)
            ->get(route('ai.dashboard'))
            ->assertStatus(403);
    }

    public function test_staff_user_has_module_access()
    {
        $staffUser = User::factory()->create();
        $staffUser->assignRole('staff');
        
        // Staff should have access to all main modules
        $this->actingAs($staffUser)
            ->get(route('crm.dashboard'))
            ->assertStatus(200);
            
        $this->actingAs($staffUser)
            ->get(route('finance.dashboard'))
            ->assertStatus(200);
            
        $this->actingAs($staffUser)
            ->get(route('projects.dashboard'))
            ->assertStatus(200);
            
        $this->actingAs($staffUser)
            ->get(route('hr.dashboard'))
            ->assertStatus(200);
            
        $this->actingAs($staffUser)
            ->get(route('support.dashboard'))
            ->assertStatus(200);
            
        $this->actingAs($staffUser)
            ->get(route('cms.dashboard'))
            ->assertStatus(200);
            
        $this->actingAs($staffUser)
            ->get(route('ai.dashboard'))
            ->assertStatus(200);
    }
}
