<?php

namespace Tests\Feature\AI;

use App\Models\AI\PromptTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class PromptTemplateControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->user->assignRole('admin');
    }

    public function test_it_can_display_templates_index()
    {
        $this->actingAs($this->user);

        $response = $this->get(route('ai.prompt-templates.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('AI/PromptTemplates/Index'));
    }

    public function test_it_can_filter_templates_by_category()
    {
        $this->actingAs($this->user);

        $crmTemplate = PromptTemplate::factory()->crm()->create(['user_id' => $this->user->id]);
        $financeTemplate = PromptTemplate::factory()->finance()->create(['user_id' => $this->user->id]);

        $response = $this->get(route('ai.prompt-templates.index', ['category' => 'crm']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('templates.data', 1)
                ->where('templates.data.0.id', $crmTemplate->id)
        );
    }

    public function test_it_can_filter_templates_by_visibility()
    {
        $this->actingAs($this->user);

        $publicTemplate = PromptTemplate::factory()->public()->create(['user_id' => $this->user->id]);
        $privateTemplate = PromptTemplate::factory()->private()->create(['user_id' => $this->user->id]);

        $response = $this->get(route('ai.prompt-templates.index', ['is_public' => true]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('templates.data', 1)
                ->where('templates.data.0.id', $publicTemplate->id)
        );
    }

    public function test_it_can_create_a_template()
    {
        $this->actingAs($this->user);

        $templateData = [
            'name' => 'Test Template',
            'category' => 'general',
            'description' => 'A test template for validation',
            'template' => 'Hello {{name}}, your role is {{role}}.',
            'variables' => ['name', 'role'],
            'example_data' => [
                'name' => 'John Doe',
                'role' => 'Developer'
            ],
            'is_public' => true,
            'tags' => ['test', 'validation'],
        ];

        $response = $this->post(route('ai.prompt-templates.store'), $templateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('ai_prompt_templates', [
            'name' => 'Test Template',
            'category' => 'general',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_it_validates_template_creation_data()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('ai.prompt-templates.store'), [
            'name' => '', // Required field
            'category' => 'invalid-category', // Invalid category
            'template' => '', // Required field
        ]);

        $response->assertSessionHasErrors(['name', 'category', 'template']);
    }

    public function test_it_can_update_a_template()
    {
        $this->actingAs($this->user);

        $template = PromptTemplate::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Original Template',
        ]);

        $updateData = [
            'name' => 'Updated Template',
            'category' => 'crm',
            'description' => 'Updated description',
            'template' => 'Updated template content {{variable}}',
            'variables' => ['variable'],
            'example_data' => ['variable' => 'test'],
            'is_public' => false,
            'tags' => ['updated'],
        ];

        $response = $this->put(route('ai.prompt-templates.update', $template), $updateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('ai_prompt_templates', [
            'id' => $template->id,
            'name' => 'Updated Template',
            'category' => 'crm',
        ]);
    }

    public function test_it_can_delete_a_template()
    {
        $this->actingAs($this->user);

        $template = PromptTemplate::factory()->create(['user_id' => $this->user->id]);

        $response = $this->delete(route('ai.prompt-templates.destroy', $template));

        $response->assertRedirect();
        $this->assertDatabaseMissing('ai_prompt_templates', ['id' => $template->id]);
    }

    public function test_it_can_duplicate_a_template()
    {
        $this->actingAs($this->user);

        $template = PromptTemplate::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Original Template',
        ]);

        $response = $this->post(route('ai.prompt-templates.duplicate', $template));

        $response->assertRedirect();
        $this->assertDatabaseHas('ai_prompt_templates', [
            'name' => 'Original Template (Copy)',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_it_can_render_template_with_variables()
    {
        $this->actingAs($this->user);

        $template = PromptTemplate::factory()->create([
            'user_id' => $this->user->id,
            'template' => 'Hello {{name}}, your role is {{role}} at {{company}}.',
            'variables' => ['name', 'role', 'company'],
        ]);

        $renderData = [
            'data' => [
                'name' => 'John Smith',
                'role' => 'Developer',
                'company' => 'Tech Corp'
            ]
        ];

        $response = $this->post(route('ai.prompt-templates.render', $template), $renderData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'rendered' => 'Hello John Smith, your role is Developer at Tech Corp.',
        ]);
    }

    public function test_it_validates_render_data()
    {
        $this->actingAs($this->user);

        $template = PromptTemplate::factory()->create([
            'user_id' => $this->user->id,
            'template' => 'Hello {{name}}',
            'variables' => ['name'],
        ]);

        $response = $this->post(route('ai.prompt-templates.render', $template), [
            'data' => [] // Missing required variable
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Missing required variables: name',
        ]);
    }

    public function test_it_can_rate_a_template()
    {
        $this->actingAs($this->user);

        $template = PromptTemplate::factory()->create(['user_id' => $this->user->id]);

        $ratingData = [
            'rating' => 5,
            'comment' => 'Excellent template!',
        ];

        $response = $this->post(route('ai.prompt-templates.rate', $template), $ratingData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    public function test_it_validates_rating_data()
    {
        $this->actingAs($this->user);

        $template = PromptTemplate::factory()->create(['user_id' => $this->user->id]);

        $response = $this->post(route('ai.prompt-templates.rate', $template), [
            'rating' => 6, // Invalid rating (should be 1-5)
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['rating']);
    }

    public function test_user_can_only_edit_own_templates()
    {
        $this->actingAs($this->user);

        $otherUser = User::factory()->create();
        $otherUser->assignRole('admin');

        $ownTemplate = PromptTemplate::factory()->create(['user_id' => $this->user->id]);
        $otherTemplate = PromptTemplate::factory()->create(['user_id' => $otherUser->id]);

        // Can edit own template
        $response = $this->get(route('ai.prompt-templates.edit', $ownTemplate));
        $response->assertStatus(200);

        // Cannot edit other user's template
        $response = $this->get(route('ai.prompt-templates.edit', $otherTemplate));
        $response->assertStatus(403);
    }

    public function test_it_can_search_templates()
    {
        $this->actingAs($this->user);

        $template1 = PromptTemplate::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Lead Qualification Template',
        ]);

        $template2 = PromptTemplate::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Finance Analysis Template',
        ]);

        $response = $this->get(route('ai.prompt-templates.index', ['search' => 'Lead']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('templates.data', 1)
                ->where('templates.data.0.id', $template1->id)
        );
    }

    public function test_it_can_filter_by_tags()
    {
        $this->actingAs($this->user);

        $template1 = PromptTemplate::factory()->create([
            'user_id' => $this->user->id,
            'tags' => ['crm', 'sales'],
        ]);

        $template2 = PromptTemplate::factory()->create([
            'user_id' => $this->user->id,
            'tags' => ['finance', 'accounting'],
        ]);

        $response = $this->get(route('ai.prompt-templates.index', ['tags' => ['crm']]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('templates.data', 1)
                ->where('templates.data.0.id', $template1->id)
        );
    }

    public function test_it_requires_authentication_for_template_routes()
    {
        $template = PromptTemplate::factory()->create(['user_id' => $this->user->id]);

        $response = $this->get(route('ai.prompt-templates.index'));
        $response->assertRedirect(route('login'));

        $response = $this->get(route('ai.prompt-templates.show', $template));
        $response->assertRedirect(route('login'));
    }

    public function test_it_requires_proper_role_for_template_routes()
    {
        $user = User::factory()->create();
        // Don't assign admin or staff role

        $this->actingAs($user);

        $response = $this->get(route('ai.prompt-templates.index'));
        $response->assertStatus(403);
    }

    public function test_it_extracts_variables_from_template()
    {
        $this->actingAs($this->user);

        $templateData = [
            'name' => 'Variable Test Template',
            'category' => 'general',
            'description' => 'Test variable extraction',
            'template' => 'Hello {{name}}, your {{role}} at {{company}} is {{position}}.',
            'is_public' => true,
        ];

        $response = $this->post(route('ai.prompt-templates.store'), $templateData);

        $response->assertRedirect();
        
        $template = PromptTemplate::where('name', 'Variable Test Template')->first();
        $this->assertNotNull($template);
        $this->assertEquals(['name', 'role', 'company', 'position'], $template->variables);
    }

    public function test_it_increments_usage_count_on_render()
    {
        $this->actingAs($this->user);

        $template = PromptTemplate::factory()->create([
            'user_id' => $this->user->id,
            'template' => 'Hello {{name}}',
            'variables' => ['name'],
            'usage_count' => 0,
        ]);

        $this->post(route('ai.prompt-templates.render', $template), [
            'data' => ['name' => 'John']
        ]);

        $template->refresh();
        $this->assertEquals(1, $template->usage_count);
    }
}
