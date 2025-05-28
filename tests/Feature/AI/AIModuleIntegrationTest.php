<?php

namespace Tests\Feature\AI;

use App\Models\AI\Service;
use App\Models\AI\AIModel;
use App\Models\AI\Conversation;
use App\Models\AI\PromptTemplate;
use App\Models\AI\UsageLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AIModuleIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create admin user
        $this->adminUser = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
        ]);
        $this->adminUser->assignRole('admin');
    }

    public function test_ai_module_database_structure_is_correct()
    {
        // Test that all AI tables exist and have correct structure
        $this->assertTrue(\Schema::hasTable('ai_services'));
        $this->assertTrue(\Schema::hasTable('ai_models'));
        $this->assertTrue(\Schema::hasTable('ai_conversations'));
        $this->assertTrue(\Schema::hasTable('ai_prompt_templates'));
        $this->assertTrue(\Schema::hasTable('ai_usage_logs'));

        // Test key columns exist
        $this->assertTrue(\Schema::hasColumn('ai_services', 'provider'));
        $this->assertTrue(\Schema::hasColumn('ai_models', 'ai_service_id'));
        $this->assertTrue(\Schema::hasColumn('ai_conversations', 'messages'));
        $this->assertTrue(\Schema::hasColumn('ai_prompt_templates', 'template'));
        $this->assertTrue(\Schema::hasColumn('ai_usage_logs', 'total_tokens'));
    }

    public function test_ai_service_creation_and_relationships()
    {
        $service = Service::create([
            'name' => 'Test AI Service',
            'slug' => 'test-ai-service',
            'provider' => 'mistral',
            'is_enabled' => true,
            'is_default' => true,
            'priority' => 1,
            'supported_features' => ['chat', 'completion'],
        ]);

        $this->assertDatabaseHas('ai_services', [
            'name' => 'Test AI Service',
            'provider' => 'mistral',
        ]);

        // Test model relationship
        $model = AIModel::create([
            'ai_service_id' => $service->id,
            'name' => 'Test Model',
            'slug' => 'test-model',
            'model_identifier' => 'test-model-v1',
            'type' => 'chat',
            'is_enabled' => true,
        ]);

        $this->assertEquals($service->id, $model->service->id);
        $this->assertEquals(1, $service->models()->count());
    }

    public function test_ai_conversation_management()
    {
        $service = Service::factory()->create();
        $model = AIModel::factory()->create(['ai_service_id' => $service->id]);

        $conversation = Conversation::create([
            'user_id' => $this->adminUser->id,
            'ai_model_id' => $model->id,
            'title' => 'Test Conversation',
            'messages' => [],
            'total_tokens' => 0,
            'total_cost' => 0,
            'message_count' => 0,
        ]);

        // Test adding messages
        $conversation->addMessage('user', 'Hello, can you help me?');
        $conversation->addMessage('assistant', 'Of course! How can I assist you?');

        $this->assertEquals(2, $conversation->fresh()->message_count);
        $this->assertNotNull($conversation->fresh()->last_message_at);
    }

    public function test_prompt_template_rendering()
    {
        $template = PromptTemplate::create([
            'user_id' => $this->adminUser->id,
            'name' => 'Test Template',
            'slug' => 'test-template',
            'category' => 'general',
            'template' => 'Hello {{name}}, your role is {{role}} at {{company}}.',
            'variables' => ['name', 'role', 'company'],
            'is_public' => true,
        ]);

        $data = [
            'name' => 'John',
            'role' => 'Developer',
            'company' => 'Tech Corp'
        ];

        $rendered = $template->render($data);
        $expected = 'Hello John, your role is Developer at Tech Corp.';

        $this->assertEquals($expected, $rendered);
    }

    public function test_usage_log_statistics()
    {
        $service = Service::factory()->create();
        $model = AIModel::factory()->create(['ai_service_id' => $service->id]);

        // Create usage logs
        UsageLog::factory()->count(5)->create([
            'user_id' => $this->adminUser->id,
            'ai_model_id' => $model->id,
            'status' => 'success',
            'total_tokens' => 100,
            'cost' => 0.01,
        ]);

        UsageLog::factory()->count(2)->create([
            'user_id' => $this->adminUser->id,
            'ai_model_id' => $model->id,
            'status' => 'error',
            'total_tokens' => 0,
            'cost' => 0,
        ]);

        $stats = UsageLog::getUsageStats('30 days');

        $this->assertEquals(7, $stats['total_requests']);
        $this->assertEquals(5, $stats['successful_requests']);
        $this->assertEquals(2, $stats['failed_requests']);
        $this->assertEquals(500, $stats['total_tokens']);
        $this->assertEquals(0.05, $stats['total_cost']);
    }

    public function test_ai_dashboard_route_accessibility()
    {
        $this->actingAs($this->adminUser);

        $response = $this->get(route('ai.dashboard'));
        $response->assertStatus(200);
    }

    public function test_ai_services_crud_operations()
    {
        $this->actingAs($this->adminUser);

        // Test index
        $response = $this->get(route('ai.services.index'));
        $response->assertStatus(200);

        // Test create
        $response = $this->get(route('ai.services.create'));
        $response->assertStatus(200);

        // Test store
        $serviceData = [
            'name' => 'Integration Test Service',
            'provider' => 'mistral',
            'is_enabled' => true,
            'is_default' => false,
            'priority' => 1,
            'supported_features' => ['chat'],
            'configuration' => [],
        ];

        $response = $this->post(route('ai.services.store'), $serviceData);
        $response->assertRedirect();

        $service = Service::where('name', 'Integration Test Service')->first();
        $this->assertNotNull($service);

        // Test show
        $response = $this->get(route('ai.services.show', $service));
        $response->assertStatus(200);

        // Test edit
        $response = $this->get(route('ai.services.edit', $service));
        $response->assertStatus(200);

        // Test update
        $updateData = array_merge($serviceData, ['name' => 'Updated Service Name']);
        $response = $this->put(route('ai.services.update', $service), $updateData);
        $response->assertRedirect();

        $this->assertDatabaseHas('ai_services', [
            'id' => $service->id,
            'name' => 'Updated Service Name',
        ]);
    }

    public function test_ai_models_crud_operations()
    {
        $this->actingAs($this->adminUser);

        $service = Service::factory()->create();

        // Test index
        $response = $this->get(route('ai.models.index'));
        $response->assertStatus(200);

        // Test create
        $response = $this->get(route('ai.models.create'));
        $response->assertStatus(200);

        // Test store
        $modelData = [
            'ai_service_id' => $service->id,
            'name' => 'Integration Test Model',
            'model_identifier' => 'test-model-v1',
            'type' => 'chat',
            'is_enabled' => true,
            'is_default' => false,
            'capabilities' => ['chat'],
            'max_tokens' => 4000,
            'temperature' => 0.7,
            'configuration' => [],
        ];

        $response = $this->post(route('ai.models.store'), $modelData);
        $response->assertRedirect();

        $model = AIModel::where('name', 'Integration Test Model')->first();
        $this->assertNotNull($model);

        // Test show
        $response = $this->get(route('ai.models.show', $model));
        $response->assertStatus(200);
    }

    public function test_ai_module_permissions()
    {
        // Test unauthenticated access
        $response = $this->get(route('ai.dashboard'));
        $response->assertRedirect(route('login'));

        // Test user without proper role
        $regularUser = User::factory()->create();
        $this->actingAs($regularUser);

        $response = $this->get(route('ai.dashboard'));
        $response->assertStatus(403);

        // Test admin access
        $this->actingAs($this->adminUser);
        $response = $this->get(route('ai.dashboard'));
        $response->assertStatus(200);
    }

    public function test_ai_service_default_functionality()
    {
        $service1 = Service::factory()->create(['is_default' => true]);
        $service2 = Service::factory()->create(['is_default' => false]);

        // Test that only one service can be default
        $service2->setAsDefault();

        $this->assertFalse($service1->fresh()->is_default);
        $this->assertTrue($service2->fresh()->is_default);
    }

    public function test_ai_model_default_functionality()
    {
        $service = Service::factory()->create();
        $model1 = AIModel::factory()->create([
            'ai_service_id' => $service->id,
            'type' => 'chat',
            'is_default' => true,
        ]);
        $model2 = AIModel::factory()->create([
            'ai_service_id' => $service->id,
            'type' => 'chat',
            'is_default' => false,
        ]);

        // Test that only one model per type can be default
        $model2->setAsDefault();

        $this->assertFalse($model1->fresh()->is_default);
        $this->assertTrue($model2->fresh()->is_default);
    }

    public function test_ai_conversation_archiving()
    {
        $service = Service::factory()->create();
        $model = AIModel::factory()->create(['ai_service_id' => $service->id]);
        $conversation = Conversation::factory()->create([
            'user_id' => $this->adminUser->id,
            'ai_model_id' => $model->id,
        ]);

        $this->assertFalse($conversation->is_archived);

        $conversation->archive();
        $this->assertTrue($conversation->fresh()->is_archived);

        $conversation->unarchive();
        $this->assertFalse($conversation->fresh()->is_archived);
    }

    public function test_prompt_template_variable_extraction()
    {
        $template = new PromptTemplate([
            'template' => 'Hello {{name}}, your {{role}} at {{company}} is important. Contact {{email}} for more info.'
        ]);

        $variables = $template->extractVariables();
        $expected = ['name', 'role', 'company', 'email'];

        $this->assertEquals($expected, $variables);
    }

    public function test_ai_module_seeded_data_exists()
    {
        // Check if seeded data exists
        $this->assertTrue(Service::where('provider', 'mistral')->exists());
        $this->assertTrue(AIModel::where('name', 'like', '%Mistral%')->exists());
        $this->assertTrue(PromptTemplate::where('is_system', true)->exists());
    }
}
