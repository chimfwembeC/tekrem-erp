<?php

namespace Tests\Feature\AI;

use App\Models\AI\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ServiceControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a user with admin role for testing
        $this->user = User::factory()->create();
        $this->user->assignRole('admin');
    }

    /** @test */
    public function it_can_display_services_index()
    {
        $this->actingAs($this->user);

        $response = $this->get(route('ai.services.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('AI/Services/Index'));
    }

    /** @test */
    public function it_can_create_a_service()
    {
        $this->actingAs($this->user);

        $serviceData = [
            'name' => 'Test AI Service',
            'provider' => 'mistral',
            'api_key' => 'test-api-key',
            'api_url' => 'https://api.mistral.ai/v1',
            'description' => 'Test AI service description',
            'is_enabled' => true,
            'is_default' => false,
            'priority' => 1,
            'supported_features' => ['chat', 'completion'],
            'cost_per_token' => 0.0001,
            'rate_limit_per_minute' => 60,
            'max_tokens_per_request' => 4000,
            'configuration' => ['timeout' => 30],
        ];

        $response = $this->post(route('ai.services.store'), $serviceData);

        $response->assertRedirect();
        $this->assertDatabaseHas('ai_services', [
            'name' => 'Test AI Service',
            'provider' => 'mistral',
            'slug' => 'test-ai-service',
        ]);
    }

    /** @test */
    public function it_can_update_a_service()
    {
        $this->actingAs($this->user);

        $service = Service::factory()->create([
            'name' => 'Original Service',
            'provider' => 'mistral',
        ]);

        $updateData = [
            'name' => 'Updated Service',
            'provider' => 'openai',
            'api_key' => 'updated-api-key',
            'description' => 'Updated description',
            'is_enabled' => true,
            'is_default' => false,
            'priority' => 2,
            'supported_features' => ['chat'],
            'configuration' => [],
        ];

        $response = $this->put(route('ai.services.update', $service), $updateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('ai_services', [
            'id' => $service->id,
            'name' => 'Updated Service',
            'provider' => 'openai',
        ]);
    }

    /** @test */
    public function it_can_delete_a_service()
    {
        $this->actingAs($this->user);

        $service = Service::factory()->create();

        $response = $this->delete(route('ai.services.destroy', $service));

        $response->assertRedirect();
        $this->assertDatabaseMissing('ai_services', ['id' => $service->id]);
    }

    /** @test */
    public function it_can_set_service_as_default()
    {
        $this->actingAs($this->user);

        $service = Service::factory()->create(['is_enabled' => true]);

        $response = $this->post(route('ai.services.set-default', $service));

        $response->assertJson(['success' => true]);
        $this->assertTrue($service->fresh()->is_default);
    }

    /** @test */
    public function it_can_toggle_service_status()
    {
        $this->actingAs($this->user);

        $service = Service::factory()->create(['is_enabled' => true]);

        $response = $this->post(route('ai.services.toggle-status', $service));

        $response->assertJson(['success' => true]);
        $this->assertFalse($service->fresh()->is_enabled);
    }

    /** @test */
    public function it_requires_authentication_for_service_routes()
    {
        $response = $this->get(route('ai.services.index'));
        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function it_requires_proper_role_for_service_routes()
    {
        $user = User::factory()->create();
        // Don't assign admin or staff role

        $this->actingAs($user);

        $response = $this->get(route('ai.services.index'));
        $response->assertStatus(403);
    }

    /** @test */
    public function it_validates_service_creation_data()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('ai.services.store'), [
            'name' => '', // Required field
            'provider' => 'invalid-provider', // Invalid provider
        ]);

        $response->assertSessionHasErrors(['name', 'provider']);
    }

    /** @test */
    public function it_generates_unique_slugs()
    {
        $this->actingAs($this->user);

        // Create first service
        Service::factory()->create(['name' => 'Test Service', 'slug' => 'test-service']);

        // Create second service with same name
        $serviceData = [
            'name' => 'Test Service',
            'provider' => 'mistral',
            'is_enabled' => true,
            'is_default' => false,
            'priority' => 1,
            'configuration' => [],
        ];

        $response = $this->post(route('ai.services.store'), $serviceData);

        $response->assertRedirect();
        $this->assertDatabaseHas('ai_services', [
            'name' => 'Test Service',
            'slug' => 'test-service-1',
        ]);
    }
}
