<?php

namespace Tests\Unit\AI;

use App\Models\AI\Service;
use App\Models\AI\AIModel;
use App\Models\AI\Conversation;
use App\Models\AI\UsageLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_has_many_models()
    {
        $service = Service::factory()->create();
        $model1 = AIModel::factory()->create(['ai_service_id' => $service->id]);
        $model2 = AIModel::factory()->create(['ai_service_id' => $service->id]);

        $this->assertEquals(2, $service->models()->count());
        $this->assertTrue($service->models->contains($model1));
        $this->assertTrue($service->models->contains($model2));
    }

    public function test_it_has_many_conversations_through_models()
    {
        $service = Service::factory()->create();
        $model = AIModel::factory()->create(['ai_service_id' => $service->id]);
        $conversation = Conversation::factory()->create(['ai_model_id' => $model->id]);

        $this->assertEquals(1, $service->conversations()->count());
        $this->assertTrue($service->conversations->contains($conversation));
    }

    public function test_it_has_many_usage_logs_through_models()
    {
        $service = Service::factory()->create();
        $model = AIModel::factory()->create(['ai_service_id' => $service->id]);
        $usageLog = UsageLog::factory()->create(['ai_model_id' => $model->id]);

        $this->assertEquals(1, $service->usageLogs()->count());
        $this->assertTrue($service->usageLogs->contains($usageLog));
    }

    public function test_it_can_get_default_model()
    {
        $service = Service::factory()->create();
        $defaultModel = AIModel::factory()->default()->create([
            'ai_service_id' => $service->id,
            'type' => 'chat',
        ]);
        $otherModel = AIModel::factory()->create([
            'ai_service_id' => $service->id,
            'type' => 'chat',
            'is_default' => false,
        ]);

        $this->assertEquals($defaultModel->id, $service->defaultModel->id);
    }

    public function test_it_can_scope_enabled_services()
    {
        $enabledService = Service::factory()->enabled()->create();
        $disabledService = Service::factory()->disabled()->create();

        $enabledServices = Service::enabled()->get();

        $this->assertEquals(1, $enabledServices->count());
        $this->assertTrue($enabledServices->contains($enabledService));
        $this->assertFalse($enabledServices->contains($disabledService));
    }

    public function test_it_can_scope_by_provider()
    {
        $mistralService = Service::factory()->create(['provider' => 'mistral']);
        $openaiService = Service::factory()->create(['provider' => 'openai']);

        $mistralServices = Service::byProvider('mistral')->get();

        $this->assertEquals(1, $mistralServices->count());
        $this->assertTrue($mistralServices->contains($mistralService));
        $this->assertFalse($mistralServices->contains($openaiService));
    }

    public function test_it_can_get_default_service()
    {
        $defaultService = Service::factory()->default()->create();
        $otherService = Service::factory()->create(['is_default' => false]);

        $default = Service::getDefault();

        $this->assertEquals($defaultService->id, $default->id);
    }

    public function test_it_can_set_as_default()
    {
        $service1 = Service::factory()->default()->create();
        $service2 = Service::factory()->create(['is_default' => false]);

        $service2->setAsDefault();

        $this->assertFalse($service1->fresh()->is_default);
        $this->assertTrue($service2->fresh()->is_default);
    }

    public function test_it_can_toggle_status()
    {
        $service = Service::factory()->enabled()->create();

        $service->toggleStatus();
        $this->assertFalse($service->fresh()->is_enabled);

        $service->toggleStatus();
        $this->assertTrue($service->fresh()->is_enabled);
    }

    public function test_it_can_test_connection()
    {
        $service = Service::factory()->create([
            'provider' => 'mistral',
            'api_key' => 'test-key',
            'api_url' => 'https://api.mistral.ai/v1',
        ]);

        // Mock the connection test (in real implementation, this would make an API call)
        $result = $service->testConnection();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
        $this->assertArrayHasKey('message', $result);
    }

    public function test_it_calculates_usage_statistics()
    {
        $service = Service::factory()->create();
        $model = AIModel::factory()->create(['ai_service_id' => $service->id]);
        
        // Create some usage logs
        UsageLog::factory()->count(5)->successful()->create(['ai_model_id' => $model->id]);
        UsageLog::factory()->count(2)->failed()->create(['ai_model_id' => $model->id]);

        $stats = $service->getUsageStats('30 days');

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('total_requests', $stats);
        $this->assertArrayHasKey('success_rate', $stats);
        $this->assertEquals(7, $stats['total_requests']);
    }

    public function test_it_casts_configuration_to_array()
    {
        $service = Service::factory()->create([
            'configuration' => ['timeout' => 30, 'retries' => 3],
        ]);

        $this->assertIsArray($service->configuration);
        $this->assertEquals(30, $service->configuration['timeout']);
        $this->assertEquals(3, $service->configuration['retries']);
    }

    public function test_it_casts_supported_features_to_array()
    {
        $service = Service::factory()->create([
            'supported_features' => ['chat', 'completion', 'embedding'],
        ]);

        $this->assertIsArray($service->supported_features);
        $this->assertContains('chat', $service->supported_features);
        $this->assertContains('completion', $service->supported_features);
        $this->assertContains('embedding', $service->supported_features);
    }

    public function test_it_casts_boolean_fields()
    {
        $service = Service::factory()->create([
            'is_enabled' => 1,
            'is_default' => 0,
        ]);

        $this->assertIsBool($service->is_enabled);
        $this->assertIsBool($service->is_default);
        $this->assertTrue($service->is_enabled);
        $this->assertFalse($service->is_default);
    }

    public function test_it_casts_cost_per_token_to_decimal()
    {
        $service = Service::factory()->create([
            'cost_per_token' => 0.00002,
        ]);

        $this->assertEquals('0.00002000', $service->cost_per_token);
    }

    public function test_it_has_fillable_attributes()
    {
        $fillable = [
            'name',
            'slug',
            'provider',
            'api_key',
            'api_url',
            'configuration',
            'is_enabled',
            'is_default',
            'priority',
            'description',
            'supported_features',
            'cost_per_token',
            'rate_limit_per_minute',
            'max_tokens_per_request',
        ];

        $service = new Service();
        $this->assertEquals($fillable, $service->getFillable());
    }

    public function test_it_generates_unique_slug()
    {
        $service1 = Service::factory()->create(['name' => 'Test Service']);
        $service2 = Service::factory()->create(['name' => 'Test Service']);

        $this->assertNotEquals($service1->slug, $service2->slug);
        $this->assertEquals('test-service', $service1->slug);
        $this->assertEquals('test-service-1', $service2->slug);
    }

    public function test_it_validates_provider()
    {
        $validProviders = ['mistral', 'openai', 'anthropic', 'google', 'custom'];
        
        foreach ($validProviders as $provider) {
            $service = Service::factory()->create(['provider' => $provider]);
            $this->assertEquals($provider, $service->provider);
        }
    }

    public function test_it_can_check_if_supports_feature()
    {
        $service = Service::factory()->create([
            'supported_features' => ['chat', 'completion'],
        ]);

        $this->assertTrue($service->supportsFeature('chat'));
        $this->assertTrue($service->supportsFeature('completion'));
        $this->assertFalse($service->supportsFeature('embedding'));
    }

    public function test_it_can_get_enabled_models()
    {
        $service = Service::factory()->create();
        $enabledModel = AIModel::factory()->enabled()->create(['ai_service_id' => $service->id]);
        $disabledModel = AIModel::factory()->disabled()->create(['ai_service_id' => $service->id]);

        $enabledModels = $service->getEnabledModels();

        $this->assertEquals(1, $enabledModels->count());
        $this->assertTrue($enabledModels->contains($enabledModel));
        $this->assertFalse($enabledModels->contains($disabledModel));
    }

    public function test_it_can_get_models_by_type()
    {
        $service = Service::factory()->create();
        $chatModel = AIModel::factory()->chat()->create(['ai_service_id' => $service->id]);
        $completionModel = AIModel::factory()->completion()->create(['ai_service_id' => $service->id]);

        $chatModels = $service->getModelsByType('chat');

        $this->assertEquals(1, $chatModels->count());
        $this->assertTrue($chatModels->contains($chatModel));
        $this->assertFalse($chatModels->contains($completionModel));
    }

    public function test_it_can_calculate_total_cost()
    {
        $service = Service::factory()->create();
        $model = AIModel::factory()->create(['ai_service_id' => $service->id]);
        
        UsageLog::factory()->create([
            'ai_model_id' => $model->id,
            'cost' => 0.05,
        ]);
        
        UsageLog::factory()->create([
            'ai_model_id' => $model->id,
            'cost' => 0.03,
        ]);

        $totalCost = $service->getTotalCost('30 days');
        $this->assertEquals(0.08, $totalCost);
    }
}
