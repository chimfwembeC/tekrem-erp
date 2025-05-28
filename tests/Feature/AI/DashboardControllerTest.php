<?php

namespace Tests\Feature\AI;

use App\Models\AI\Service;
use App\Models\AI\AIModel;
use App\Models\AI\Conversation;
use App\Models\AI\PromptTemplate;
use App\Models\AI\UsageLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Service $service;
    protected AIModel $model;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a user with admin role for testing
        $this->user = User::factory()->create();
        $this->user->assignRole('admin');
        
        // Create test AI service and model
        $this->service = Service::factory()->create([
            'name' => 'Test Service',
            'provider' => 'mistral',
            'is_enabled' => true,
            'is_default' => true,
        ]);
        
        $this->model = AIModel::factory()->create([
            'ai_service_id' => $this->service->id,
            'name' => 'Test Model',
            'is_enabled' => true,
            'is_default' => true,
        ]);
    }

    /** @test */
    public function it_can_display_dashboard()
    {
        $this->actingAs($this->user);

        $response = $this->get(route('ai.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('AI/Dashboard'));
    }

    /** @test */
    public function it_requires_authentication_for_dashboard()
    {
        $response = $this->get(route('ai.dashboard'));
        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function it_requires_proper_role_for_dashboard()
    {
        $user = User::factory()->create();
        // Don't assign admin or staff role

        $this->actingAs($user);

        $response = $this->get(route('ai.dashboard'));
        $response->assertStatus(403);
    }

    /** @test */
    public function it_returns_correct_dashboard_statistics()
    {
        $this->actingAs($this->user);

        // Create test data
        $conversation = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $template = PromptTemplate::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->get(route('ai.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('stats')
                ->where('stats.total_services', 1)
                ->where('stats.total_models', 1)
                ->where('stats.total_conversations', 1)
                ->where('stats.total_templates', 1)
        );
    }

    /** @test */
    public function it_can_get_service_status()
    {
        $this->actingAs($this->user);

        $response = $this->get(route('ai.dashboard.service-status'));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'id',
                'name',
                'provider',
                'is_default',
                'status',
                'usage'
            ]
        ]);
    }

    /** @test */
    public function it_can_get_analytics_data()
    {
        $this->actingAs($this->user);

        // Create some usage logs
        UsageLog::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'status' => 'success',
        ]);

        $response = $this->get(route('ai.dashboard.analytics', ['period' => '7 days']));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'overview',
            'daily_usage',
            'usage_by_operation',
            'usage_by_model'
        ]);
    }

    /** @test */
    public function it_can_test_connection()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('ai.dashboard.test-connection'), [
            'service_id' => $this->service->id
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'message'
        ]);
    }

    /** @test */
    public function it_validates_test_connection_request()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('ai.dashboard.test-connection'), [
            'service_id' => 999 // Non-existent service
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['service_id']);
    }

    /** @test */
    public function it_can_get_quick_stats()
    {
        $this->actingAs($this->user);

        // Create usage logs for today and yesterday
        UsageLog::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'created_at' => now(),
            'total_tokens' => 100,
            'cost' => 0.01,
            'status' => 'success',
        ]);

        UsageLog::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'created_at' => now()->subDay(),
            'total_tokens' => 50,
            'cost' => 0.005,
            'status' => 'success',
        ]);

        $response = $this->get(route('ai.dashboard.quick-stats'));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'today' => [
                'requests',
                'tokens',
                'cost',
                'success_rate'
            ],
            'yesterday' => [
                'requests',
                'tokens',
                'cost',
                'success_rate'
            ],
            'changes' => [
                'requests',
                'tokens',
                'cost',
                'success_rate'
            ]
        ]);
    }

    /** @test */
    public function it_calculates_percentage_changes_correctly()
    {
        $this->actingAs($this->user);

        // Create more usage today than yesterday
        UsageLog::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'created_at' => now(),
            'status' => 'success',
        ]);

        UsageLog::factory()->count(1)->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'created_at' => now()->subDay(),
            'status' => 'success',
        ]);

        $response = $this->get(route('ai.dashboard.quick-stats'));

        $response->assertStatus(200);
        $data = $response->json();

        // Should show 200% increase (from 1 to 3 requests)
        $this->assertEquals(200, $data['changes']['requests']);
    }

    /** @test */
    public function it_handles_zero_division_in_percentage_changes()
    {
        $this->actingAs($this->user);

        // Create usage only for today (yesterday = 0)
        UsageLog::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'created_at' => now(),
            'status' => 'success',
        ]);

        $response = $this->get(route('ai.dashboard.quick-stats'));

        $response->assertStatus(200);
        $data = $response->json();

        // Should show 100% when going from 0 to any positive number
        $this->assertEquals(100, $data['changes']['requests']);
    }

    /** @test */
    public function it_shows_correct_success_rates()
    {
        $this->actingAs($this->user);

        // Create mixed success/failure logs
        UsageLog::factory()->count(8)->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'created_at' => now(),
            'status' => 'success',
        ]);

        UsageLog::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'created_at' => now(),
            'status' => 'error',
        ]);

        $response = $this->get(route('ai.dashboard.quick-stats'));

        $response->assertStatus(200);
        $data = $response->json();

        // Should show 80% success rate (8 out of 10)
        $this->assertEquals(80, $data['today']['success_rate']);
    }
}
