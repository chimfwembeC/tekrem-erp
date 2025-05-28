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

class UsageLogTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Service $service;
    protected AIModel $model;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->user->assignRole('admin');
        
        $this->service = Service::factory()->enabled()->create();
        $this->model = AIModel::factory()->create([
            'ai_service_id' => $this->service->id,
            'is_enabled' => true,
        ]);
    }

    public function test_it_can_create_usage_log()
    {
        $conversation = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $template = PromptTemplate::factory()->create(['user_id' => $this->user->id]);

        $usageLog = UsageLog::create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'ai_conversation_id' => $conversation->id,
            'ai_prompt_template_id' => $template->id,
            'operation_type' => 'chat',
            'context_type' => 'crm',
            'context_id' => 123,
            'prompt' => 'Test prompt',
            'response' => 'Test response',
            'input_tokens' => 50,
            'output_tokens' => 100,
            'total_tokens' => 150,
            'cost' => 0.003,
            'response_time_ms' => 1500,
            'status' => 'success',
            'metadata' => ['test' => 'data'],
        ]);

        $this->assertDatabaseHas('ai_usage_logs', [
            'id' => $usageLog->id,
            'operation_type' => 'chat',
            'status' => 'success',
            'total_tokens' => 150,
        ]);
    }

    public function test_it_belongs_to_user()
    {
        $usageLog = UsageLog::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $this->assertEquals($this->user->id, $usageLog->user->id);
    }

    public function test_it_belongs_to_ai_model()
    {
        $usageLog = UsageLog::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $this->assertEquals($this->model->id, $usageLog->aiModel->id);
    }

    public function test_it_can_belong_to_conversation()
    {
        $conversation = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $usageLog = UsageLog::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'ai_conversation_id' => $conversation->id,
        ]);

        $this->assertEquals($conversation->id, $usageLog->conversation->id);
    }

    public function test_it_can_belong_to_prompt_template()
    {
        $template = PromptTemplate::factory()->create(['user_id' => $this->user->id]);

        $usageLog = UsageLog::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'ai_prompt_template_id' => $template->id,
        ]);

        $this->assertEquals($template->id, $usageLog->promptTemplate->id);
    }

    public function test_it_can_scope_by_operation_type()
    {
        UsageLog::factory()->chat()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        UsageLog::factory()->completion()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $chatLogs = UsageLog::byOperationType('chat')->get();
        $this->assertEquals(1, $chatLogs->count());
        $this->assertEquals('chat', $chatLogs->first()->operation_type);
    }

    public function test_it_can_scope_by_status()
    {
        UsageLog::factory()->successful()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        UsageLog::factory()->failed()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $successfulLogs = UsageLog::byStatus('success')->get();
        $this->assertEquals(1, $successfulLogs->count());
        $this->assertEquals('success', $successfulLogs->first()->status);
    }

    public function test_it_can_scope_by_date_range()
    {
        $oldLog = UsageLog::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'created_at' => now()->subDays(10),
        ]);

        $recentLog = UsageLog::factory()->recent()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $recentLogs = UsageLog::dateRange(now()->subDays(5), now())->get();
        $this->assertEquals(1, $recentLogs->count());
        $this->assertEquals($recentLog->id, $recentLogs->first()->id);
    }

    public function test_it_can_scope_by_context()
    {
        UsageLog::factory()->withContext('crm', 123)->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        UsageLog::factory()->withContext('finance', 456)->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $crmLogs = UsageLog::byContext('crm')->get();
        $this->assertEquals(1, $crmLogs->count());
        $this->assertEquals('crm', $crmLogs->first()->context_type);
    }

    public function test_it_calculates_usage_statistics()
    {
        // Create successful logs
        UsageLog::factory()->count(5)->successful()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'total_tokens' => 100,
            'cost' => 0.01,
            'created_at' => now(),
        ]);

        // Create failed logs
        UsageLog::factory()->count(2)->failed()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'total_tokens' => 0,
            'cost' => 0,
            'created_at' => now(),
        ]);

        $stats = UsageLog::getUsageStats('1 day');

        $this->assertEquals(7, $stats['total_requests']);
        $this->assertEquals(5, $stats['successful_requests']);
        $this->assertEquals(2, $stats['failed_requests']);
        $this->assertEquals(500, $stats['total_tokens']);
        $this->assertEquals(0.05, $stats['total_cost']);
        $this->assertEquals(71.43, round($stats['success_rate'], 2));
    }

    public function test_it_calculates_daily_usage()
    {
        // Create logs for today
        UsageLog::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'created_at' => now(),
        ]);

        // Create logs for yesterday
        UsageLog::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'created_at' => now()->subDay(),
        ]);

        $dailyUsage = UsageLog::getDailyUsage('7 days');

        $this->assertIsArray($dailyUsage);
        $this->assertCount(7, $dailyUsage);
        
        $today = $dailyUsage[6]; // Last item should be today
        $this->assertEquals(3, $today['requests']);
    }

    public function test_it_calculates_usage_by_operation()
    {
        UsageLog::factory()->count(3)->chat()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        UsageLog::factory()->count(2)->completion()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $usageByOperation = UsageLog::getUsageByOperation('30 days');

        $this->assertIsArray($usageByOperation);
        $this->assertArrayHasKey('chat', $usageByOperation);
        $this->assertArrayHasKey('completion', $usageByOperation);
        $this->assertEquals(3, $usageByOperation['chat']);
        $this->assertEquals(2, $usageByOperation['completion']);
    }

    public function test_it_calculates_cost_breakdown()
    {
        UsageLog::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'operation_type' => 'chat',
            'cost' => 0.05,
        ]);

        UsageLog::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'operation_type' => 'completion',
            'cost' => 0.03,
        ]);

        $costBreakdown = UsageLog::getCostBreakdown('30 days');

        $this->assertIsArray($costBreakdown);
        $this->assertEquals(0.08, $costBreakdown['total_cost']);
        $this->assertArrayHasKey('by_operation', $costBreakdown);
        $this->assertEquals(0.05, $costBreakdown['by_operation']['chat']);
        $this->assertEquals(0.03, $costBreakdown['by_operation']['completion']);
    }

    public function test_it_tracks_performance_metrics()
    {
        UsageLog::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'response_time_ms' => 1000,
            'status' => 'success',
        ]);

        $performance = UsageLog::getPerformanceMetrics('30 days');

        $this->assertIsArray($performance);
        $this->assertArrayHasKey('avg_response_time', $performance);
        $this->assertArrayHasKey('success_rate', $performance);
        $this->assertEquals(1000, $performance['avg_response_time']);
        $this->assertEquals(100, $performance['success_rate']);
    }

    public function test_it_handles_empty_usage_stats()
    {
        $stats = UsageLog::getUsageStats('30 days');

        $this->assertEquals(0, $stats['total_requests']);
        $this->assertEquals(0, $stats['successful_requests']);
        $this->assertEquals(0, $stats['failed_requests']);
        $this->assertEquals(0, $stats['total_tokens']);
        $this->assertEquals(0, $stats['total_cost']);
        $this->assertEquals(0, $stats['success_rate']);
    }

    public function test_it_casts_metadata_to_array()
    {
        $usageLog = UsageLog::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'metadata' => ['key' => 'value', 'number' => 123],
        ]);

        $this->assertIsArray($usageLog->metadata);
        $this->assertEquals('value', $usageLog->metadata['key']);
        $this->assertEquals(123, $usageLog->metadata['number']);
    }

    public function test_it_casts_cost_to_decimal()
    {
        $usageLog = UsageLog::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'cost' => 0.12345,
        ]);

        $this->assertEquals('0.1235', $usageLog->cost);
    }

    public function test_it_has_fillable_attributes()
    {
        $fillable = [
            'user_id',
            'ai_model_id',
            'ai_conversation_id',
            'ai_prompt_template_id',
            'operation_type',
            'context_type',
            'context_id',
            'prompt',
            'response',
            'input_tokens',
            'output_tokens',
            'total_tokens',
            'cost',
            'response_time_ms',
            'status',
            'error_message',
            'metadata',
        ];

        $usageLog = new UsageLog();
        $this->assertEquals($fillable, $usageLog->getFillable());
    }
}
