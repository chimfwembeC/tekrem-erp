<?php

namespace Tests\Feature\AI;

use App\Models\AI\Service;
use App\Models\AI\AIModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ModelControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Service $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->user->assignRole('admin');
        
        $this->service = Service::factory()->enabled()->create();
    }

    /** @test */
    public function it_can_display_models_index()
    {
        $this->actingAs($this->user);

        $response = $this->get(route('ai.models.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('AI/Models/Index'));
    }

    /** @test */
    public function it_can_filter_models_by_service()
    {
        $this->actingAs($this->user);

        $model1 = AIModel::factory()->create(['ai_service_id' => $this->service->id]);
        $otherService = Service::factory()->create();
        $model2 = AIModel::factory()->create(['ai_service_id' => $otherService->id]);

        $response = $this->get(route('ai.models.index', ['service_id' => $this->service->id]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('models.data', 1)
                ->where('models.data.0.id', $model1->id)
        );
    }

    /** @test */
    public function it_can_filter_models_by_type()
    {
        $this->actingAs($this->user);

        $chatModel = AIModel::factory()->chat()->create(['ai_service_id' => $this->service->id]);
        $embeddingModel = AIModel::factory()->embedding()->create(['ai_service_id' => $this->service->id]);

        $response = $this->get(route('ai.models.index', ['type' => 'chat']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('models.data', 1)
                ->where('models.data.0.id', $chatModel->id)
        );
    }

    /** @test */
    public function it_can_create_a_model()
    {
        $this->actingAs($this->user);

        $modelData = [
            'ai_service_id' => $this->service->id,
            'name' => 'Test Model',
            'model_identifier' => 'test-model-v1',
            'type' => 'chat',
            'description' => 'Test model description',
            'is_enabled' => true,
            'is_default' => false,
            'capabilities' => ['chat', 'completion'],
            'max_tokens' => 4000,
            'temperature' => 0.7,
            'top_p' => 1.0,
            'cost_per_input_token' => 0.00002,
            'cost_per_output_token' => 0.00006,
            'configuration' => ['timeout' => 30],
        ];

        $response = $this->post(route('ai.models.store'), $modelData);

        $response->assertRedirect();
        $this->assertDatabaseHas('ai_models', [
            'name' => 'Test Model',
            'model_identifier' => 'test-model-v1',
            'type' => 'chat',
        ]);
    }

    /** @test */
    public function it_validates_model_creation_data()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('ai.models.store'), [
            'name' => '', // Required field
            'type' => 'invalid-type', // Invalid type
        ]);

        $response->assertSessionHasErrors(['name', 'type', 'ai_service_id', 'model_identifier']);
    }

    /** @test */
    public function it_can_update_a_model()
    {
        $this->actingAs($this->user);

        $model = AIModel::factory()->create([
            'ai_service_id' => $this->service->id,
            'name' => 'Original Model',
        ]);

        $updateData = [
            'ai_service_id' => $this->service->id,
            'name' => 'Updated Model',
            'model_identifier' => 'updated-model-v1',
            'type' => 'completion',
            'description' => 'Updated description',
            'is_enabled' => true,
            'is_default' => false,
            'capabilities' => ['completion'],
            'max_tokens' => 2000,
            'temperature' => 0.5,
            'configuration' => [],
        ];

        $response = $this->put(route('ai.models.update', $model), $updateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('ai_models', [
            'id' => $model->id,
            'name' => 'Updated Model',
            'type' => 'completion',
        ]);
    }

    /** @test */
    public function it_can_delete_a_model()
    {
        $this->actingAs($this->user);

        $model = AIModel::factory()->create(['ai_service_id' => $this->service->id]);

        $response = $this->delete(route('ai.models.destroy', $model));

        $response->assertRedirect();
        $this->assertDatabaseMissing('ai_models', ['id' => $model->id]);
    }

    /** @test */
    public function it_cannot_delete_model_with_conversations()
    {
        $this->actingAs($this->user);

        $model = AIModel::factory()->create(['ai_service_id' => $this->service->id]);
        $model->conversations()->create([
            'user_id' => $this->user->id,
            'title' => 'Test Conversation',
            'messages' => [],
        ]);

        $response = $this->delete(route('ai.models.destroy', $model));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('ai_models', ['id' => $model->id]);
    }

    /** @test */
    public function it_can_set_model_as_default()
    {
        $this->actingAs($this->user);

        $model = AIModel::factory()->enabled()->create([
            'ai_service_id' => $this->service->id,
            'type' => 'chat',
        ]);

        $response = $this->post(route('ai.models.set-default', $model));

        $response->assertJson(['success' => true]);
        $this->assertTrue($model->fresh()->is_default);
    }

    /** @test */
    public function it_cannot_set_disabled_model_as_default()
    {
        $this->actingAs($this->user);

        $model = AIModel::factory()->disabled()->create([
            'ai_service_id' => $this->service->id,
        ]);

        $response = $this->post(route('ai.models.set-default', $model));

        $response->assertStatus(400);
        $response->assertJson(['success' => false]);
    }

    /** @test */
    public function it_can_toggle_model_status()
    {
        $this->actingAs($this->user);

        $model = AIModel::factory()->enabled()->create([
            'ai_service_id' => $this->service->id,
        ]);

        $response = $this->post(route('ai.models.toggle-status', $model));

        $response->assertJson(['success' => true]);
        $this->assertFalse($model->fresh()->is_enabled);
    }

    /** @test */
    public function it_sets_alternative_default_when_disabling_default_model()
    {
        $this->actingAs($this->user);

        $defaultModel = AIModel::factory()->default()->create([
            'ai_service_id' => $this->service->id,
            'type' => 'chat',
        ]);

        $alternativeModel = AIModel::factory()->enabled()->create([
            'ai_service_id' => $this->service->id,
            'type' => 'chat',
        ]);

        $response = $this->post(route('ai.models.toggle-status', $defaultModel));

        $response->assertJson(['success' => true]);
        $this->assertFalse($defaultModel->fresh()->is_enabled);
        $this->assertTrue($alternativeModel->fresh()->is_default);
    }

    /** @test */
    public function it_generates_unique_slugs()
    {
        $this->actingAs($this->user);

        // Create first model
        AIModel::factory()->create([
            'ai_service_id' => $this->service->id,
            'name' => 'Test Model',
            'slug' => 'test-model'
        ]);

        // Create second model with same name
        $modelData = [
            'ai_service_id' => $this->service->id,
            'name' => 'Test Model',
            'model_identifier' => 'test-model-v2',
            'type' => 'chat',
            'is_enabled' => true,
            'is_default' => false,
            'capabilities' => ['chat'],
            'configuration' => [],
        ];

        $response = $this->post(route('ai.models.store'), $modelData);

        $response->assertRedirect();
        $this->assertDatabaseHas('ai_models', [
            'name' => 'Test Model',
            'slug' => 'test-model-1',
        ]);
    }

    /** @test */
    public function it_requires_authentication_for_model_routes()
    {
        $response = $this->get(route('ai.models.index'));
        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function it_requires_proper_role_for_model_routes()
    {
        $user = User::factory()->create();
        // Don't assign admin or staff role

        $this->actingAs($user);

        $response = $this->get(route('ai.models.index'));
        $response->assertStatus(403);
    }

    /** @test */
    public function it_can_show_model_details()
    {
        $this->actingAs($this->user);

        $model = AIModel::factory()->create(['ai_service_id' => $this->service->id]);

        $response = $this->get(route('ai.models.show', $model));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('AI/Models/Show')
                ->where('model.id', $model->id)
        );
    }

    /** @test */
    public function it_validates_model_type()
    {
        $this->actingAs($this->user);

        $modelData = [
            'ai_service_id' => $this->service->id,
            'name' => 'Test Model',
            'model_identifier' => 'test-model',
            'type' => 'invalid-type', // Invalid type
            'is_enabled' => true,
            'configuration' => [],
        ];

        $response = $this->post(route('ai.models.store'), $modelData);

        $response->assertSessionHasErrors(['type']);
    }

    /** @test */
    public function it_validates_numeric_fields()
    {
        $this->actingAs($this->user);

        $modelData = [
            'ai_service_id' => $this->service->id,
            'name' => 'Test Model',
            'model_identifier' => 'test-model',
            'type' => 'chat',
            'max_tokens' => 'invalid', // Should be integer
            'temperature' => 'invalid', // Should be numeric
            'top_p' => 5, // Should be between 0 and 1
            'configuration' => [],
        ];

        $response = $this->post(route('ai.models.store'), $modelData);

        $response->assertSessionHasErrors(['max_tokens', 'temperature', 'top_p']);
    }
}
