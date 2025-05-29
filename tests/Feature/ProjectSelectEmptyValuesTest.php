<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use App\Models\Client;
use App\Models\ProjectTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjectSelectEmptyValuesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'staff']);
        Role::create(['name' => 'customer']);
    }

    /** @test */
    public function admin_can_create_project_without_client()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)
            ->post(route('projects.store'), [
                'name' => 'Test Project',
                'description' => 'A test project',
                'status' => 'draft',
                'priority' => 'medium',
                'manager_id' => $admin->id,
                'client_id' => null, // No client selected
            ]);

        $response->assertRedirect();
        
        $project = Project::where('name', 'Test Project')->first();
        $this->assertNotNull($project);
        $this->assertNull($project->client_id);
    }

    /** @test */
    public function admin_can_create_project_without_template()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)
            ->post(route('projects.store'), [
                'name' => 'Test Project',
                'description' => 'A test project',
                'status' => 'draft',
                'priority' => 'medium',
                'manager_id' => $admin->id,
                'template_id' => null, // No template selected
            ]);

        $response->assertRedirect();
        
        $project = Project::where('name', 'Test Project')->first();
        $this->assertNotNull($project);
        // Template ID should be null since no template was selected
    }

    /** @test */
    public function admin_can_create_project_with_client()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
        $client = Client::factory()->create();

        $response = $this->actingAs($admin)
            ->post(route('projects.store'), [
                'name' => 'Test Project',
                'description' => 'A test project',
                'status' => 'draft',
                'priority' => 'medium',
                'manager_id' => $admin->id,
                'client_id' => $client->id,
            ]);

        $response->assertRedirect();
        
        $project = Project::where('name', 'Test Project')->first();
        $this->assertNotNull($project);
        $this->assertEquals($client->id, $project->client_id);
    }

    /** @test */
    public function admin_can_create_project_with_template()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
        $template = ProjectTemplate::factory()->create([
            'name' => 'Test Template',
            'description' => 'Template description',
            'category' => 'web',
        ]);

        $response = $this->actingAs($admin)
            ->post(route('projects.store'), [
                'name' => 'Test Project',
                'description' => 'A test project',
                'status' => 'draft',
                'priority' => 'medium',
                'manager_id' => $admin->id,
                'template_id' => $template->id,
            ]);

        $response->assertRedirect();
        
        $project = Project::where('name', 'Test Project')->first();
        $this->assertNotNull($project);
    }

    /** @test */
    public function admin_can_update_project_to_remove_client()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
        $client = Client::factory()->create();
        $project = Project::factory()->create([
            'manager_id' => $admin->id,
            'client_id' => $client->id,
        ]);

        $response = $this->actingAs($admin)
            ->put(route('projects.update', $project), [
                'name' => $project->name,
                'description' => $project->description,
                'status' => $project->status,
                'priority' => $project->priority,
                'manager_id' => $admin->id,
                'client_id' => null, // Remove client
            ]);

        $response->assertRedirect();
        
        $project->refresh();
        $this->assertNull($project->client_id);
    }

    /** @test */
    public function admin_can_update_project_to_add_client()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
        $client = Client::factory()->create();
        $project = Project::factory()->create([
            'manager_id' => $admin->id,
            'client_id' => null,
        ]);

        $response = $this->actingAs($admin)
            ->put(route('projects.update', $project), [
                'name' => $project->name,
                'description' => $project->description,
                'status' => $project->status,
                'priority' => $project->priority,
                'manager_id' => $admin->id,
                'client_id' => $client->id, // Add client
            ]);

        $response->assertRedirect();
        
        $project->refresh();
        $this->assertEquals($client->id, $project->client_id);
    }

    /** @test */
    public function project_create_page_loads_with_empty_values()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)
            ->get(route('projects.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('clients')
                ->has('users')
                ->has('templates')
                ->has('tags')
        );
    }

    /** @test */
    public function project_edit_page_loads_with_current_values()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
        $client = Client::factory()->create();
        $project = Project::factory()->create([
            'manager_id' => $admin->id,
            'client_id' => $client->id,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('projects.edit', $project));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('project')
                ->has('clients')
                ->has('users')
                ->has('tags')
                ->has('selectedTags')
                ->where('project.client_id', $client->id)
        );
    }

    /** @test */
    public function empty_string_client_id_is_converted_to_null()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)
            ->post(route('projects.store'), [
                'name' => 'Test Project',
                'description' => 'A test project',
                'status' => 'draft',
                'priority' => 'medium',
                'manager_id' => $admin->id,
                'client_id' => '', // Empty string should become null
            ]);

        $response->assertRedirect();
        
        $project = Project::where('name', 'Test Project')->first();
        $this->assertNotNull($project);
        $this->assertNull($project->client_id);
    }

    /** @test */
    public function empty_string_template_id_is_handled_correctly()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)
            ->post(route('projects.store'), [
                'name' => 'Test Project',
                'description' => 'A test project',
                'status' => 'draft',
                'priority' => 'medium',
                'manager_id' => $admin->id,
                'template_id' => '', // Empty string should be handled
            ]);

        $response->assertRedirect();
        
        $project = Project::where('name', 'Test Project')->first();
        $this->assertNotNull($project);
        // Project should be created successfully without template
    }
}
