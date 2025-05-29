<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjectTagSystemTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'staff']);
        Role::create(['name' => 'customer']);
    }

    /** @test */
    public function admin_can_create_project_with_existing_tags()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create existing tags
        $tag1 = Tag::factory()->create(['name' => 'Web Development', 'type' => 'project']);
        $tag2 = Tag::factory()->create(['name' => 'Frontend', 'type' => 'project']);

        $response = $this->actingAs($admin)
            ->post(route('projects.store'), [
                'name' => 'Test Project',
                'description' => 'A test project',
                'status' => 'draft',
                'priority' => 'medium',
                'manager_id' => $admin->id,
                'tags' => ['Web Development', 'Frontend'],
            ]);

        $response->assertRedirect();
        
        $project = Project::where('name', 'Test Project')->first();
        $this->assertNotNull($project);
        
        // Check that existing tags are associated
        $this->assertTrue($project->projectTags->contains('name', 'Web Development'));
        $this->assertTrue($project->projectTags->contains('name', 'Frontend'));
        $this->assertCount(2, $project->projectTags);
    }

    /** @test */
    public function admin_can_create_project_with_new_tags()
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
                'tags' => ['New Tag 1', 'New Tag 2'],
            ]);

        $response->assertRedirect();
        
        $project = Project::where('name', 'Test Project')->first();
        $this->assertNotNull($project);
        
        // Check that new tags were created and associated
        $this->assertTrue($project->projectTags->contains('name', 'New Tag 1'));
        $this->assertTrue($project->projectTags->contains('name', 'New Tag 2'));
        $this->assertCount(2, $project->projectTags);
        
        // Check that tags exist in database
        $this->assertDatabaseHas('tags', ['name' => 'New Tag 1', 'type' => 'project']);
        $this->assertDatabaseHas('tags', ['name' => 'New Tag 2', 'type' => 'project']);
    }

    /** @test */
    public function admin_can_create_project_with_mixed_existing_and_new_tags()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create existing tag
        $existingTag = Tag::factory()->create(['name' => 'Existing Tag', 'type' => 'project']);

        $response = $this->actingAs($admin)
            ->post(route('projects.store'), [
                'name' => 'Test Project',
                'description' => 'A test project',
                'status' => 'draft',
                'priority' => 'medium',
                'manager_id' => $admin->id,
                'tags' => ['Existing Tag', 'New Tag'],
            ]);

        $response->assertRedirect();
        
        $project = Project::where('name', 'Test Project')->first();
        $this->assertNotNull($project);
        
        // Check that both existing and new tags are associated
        $this->assertTrue($project->projectTags->contains('name', 'Existing Tag'));
        $this->assertTrue($project->projectTags->contains('name', 'New Tag'));
        $this->assertCount(2, $project->projectTags);
        
        // Check that new tag was created
        $this->assertDatabaseHas('tags', ['name' => 'New Tag', 'type' => 'project']);
    }

    /** @test */
    public function admin_can_update_project_tags()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create project with initial tags
        $project = Project::factory()->create(['manager_id' => $admin->id]);
        $initialTag = Tag::factory()->create(['name' => 'Initial Tag', 'type' => 'project']);
        $project->projectTags()->attach($initialTag->id);

        $response = $this->actingAs($admin)
            ->put(route('projects.update', $project), [
                'name' => $project->name,
                'description' => $project->description,
                'status' => $project->status,
                'priority' => $project->priority,
                'manager_id' => $admin->id,
                'tags' => ['Updated Tag', 'Another Tag'],
            ]);

        $response->assertRedirect();
        
        $project->refresh();
        
        // Check that tags were updated
        $this->assertFalse($project->projectTags->contains('name', 'Initial Tag'));
        $this->assertTrue($project->projectTags->contains('name', 'Updated Tag'));
        $this->assertTrue($project->projectTags->contains('name', 'Another Tag'));
        $this->assertCount(2, $project->projectTags);
        
        // Check that new tags were created
        $this->assertDatabaseHas('tags', ['name' => 'Updated Tag', 'type' => 'project']);
        $this->assertDatabaseHas('tags', ['name' => 'Another Tag', 'type' => 'project']);
    }

    /** @test */
    public function project_create_page_loads_available_tags()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create some project tags
        Tag::factory()->create(['name' => 'Web Development', 'type' => 'project', 'status' => 'active']);
        Tag::factory()->create(['name' => 'Mobile App', 'type' => 'project', 'status' => 'active']);
        Tag::factory()->create(['name' => 'Inactive Tag', 'type' => 'project', 'status' => 'inactive']);
        Tag::factory()->create(['name' => 'Different Type', 'type' => 'other', 'status' => 'active']);

        $response = $this->actingAs($admin)
            ->get(route('projects.create'));

        $response->assertStatus(200);
        
        // Check that only active project tags are loaded
        $response->assertInertia(fn ($page) => 
            $page->has('tags')
                ->where('tags', function ($tags) {
                    return collect($tags)->contains('name', 'Web Development') &&
                           collect($tags)->contains('name', 'Mobile App') &&
                           !collect($tags)->contains('name', 'Inactive Tag') &&
                           !collect($tags)->contains('name', 'Different Type');
                })
        );
    }

    /** @test */
    public function project_edit_page_loads_available_and_selected_tags()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create project with tags
        $project = Project::factory()->create(['manager_id' => $admin->id]);
        $selectedTag = Tag::factory()->create(['name' => 'Selected Tag', 'type' => 'project']);
        $availableTag = Tag::factory()->create(['name' => 'Available Tag', 'type' => 'project']);
        $project->projectTags()->attach($selectedTag->id);

        $response = $this->actingAs($admin)
            ->get(route('projects.edit', $project));

        $response->assertStatus(200);
        
        // Check that both available and selected tags are loaded
        $response->assertInertia(fn ($page) => 
            $page->has('tags')
                ->has('selectedTags')
                ->where('selectedTags', function ($selectedTags) {
                    return collect($selectedTags)->contains('name', 'Selected Tag');
                })
                ->where('tags', function ($tags) {
                    return collect($tags)->contains('name', 'Available Tag');
                })
        );
    }

    /** @test */
    public function duplicate_tag_names_are_handled_correctly()
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
                'tags' => ['Duplicate Tag', 'Duplicate Tag', 'Unique Tag'],
            ]);

        $response->assertRedirect();
        
        $project = Project::where('name', 'Test Project')->first();
        $this->assertNotNull($project);
        
        // Check that duplicate tags are handled (should only have 2 unique tags)
        $this->assertTrue($project->projectTags->contains('name', 'Duplicate Tag'));
        $this->assertTrue($project->projectTags->contains('name', 'Unique Tag'));
        $this->assertCount(2, $project->projectTags);
        
        // Check that only one instance of duplicate tag exists in database
        $this->assertEquals(1, Tag::where('name', 'Duplicate Tag')->count());
    }

    /** @test */
    public function empty_and_whitespace_tags_are_filtered_out()
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
                'tags' => ['Valid Tag', '', '   ', 'Another Valid Tag'],
            ]);

        $response->assertRedirect();
        
        $project = Project::where('name', 'Test Project')->first();
        $this->assertNotNull($project);
        
        // Check that only valid tags are associated
        $this->assertTrue($project->projectTags->contains('name', 'Valid Tag'));
        $this->assertTrue($project->projectTags->contains('name', 'Another Valid Tag'));
        $this->assertCount(2, $project->projectTags);
        
        // Check that empty tags were not created
        $this->assertDatabaseMissing('tags', ['name' => '']);
        $this->assertDatabaseMissing('tags', ['name' => '   ']);
    }

    /** @test */
    public function tag_names_are_trimmed_before_processing()
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
                'tags' => ['  Trimmed Tag  ', 'Normal Tag'],
            ]);

        $response->assertRedirect();
        
        $project = Project::where('name', 'Test Project')->first();
        $this->assertNotNull($project);
        
        // Check that tag was trimmed and saved correctly
        $this->assertTrue($project->projectTags->contains('name', 'Trimmed Tag'));
        $this->assertFalse($project->projectTags->contains('name', '  Trimmed Tag  '));
        
        // Check that trimmed tag exists in database
        $this->assertDatabaseHas('tags', ['name' => 'Trimmed Tag', 'type' => 'project']);
        $this->assertDatabaseMissing('tags', ['name' => '  Trimmed Tag  ']);
    }
}
