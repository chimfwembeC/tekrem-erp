<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Chat;
use App\Models\Conversation;
use App\Models\GuestSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class AIConversationExportTest extends TestCase
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
    public function admin_can_access_ai_conversation_export_page()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)
            ->get(route('crm.ai-conversations.export.index'));

        $response->assertStatus(200);
    }

    /** @test */
    public function non_admin_cannot_access_ai_conversation_export_page()
    {
        $user = User::factory()->create();
        $user->assignRole('staff');

        $response = $this->actingAs($user)
            ->get(route('crm.ai-conversations.export.index'));

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_get_ai_conversation_statistics()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create test data
        $this->createTestAIConversations();

        $response = $this->actingAs($admin)
            ->get(route('crm.ai-conversations.statistics'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_ai_conversations',
                'ai_services_breakdown',
                'conversation_outcomes',
                'average_conversation_length',
                'most_active_periods',
                'ai_response_effectiveness'
            ]);
    }

    /** @test */
    public function admin_can_preview_ai_conversation_data()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create test data
        $this->createTestAIConversations();

        $response = $this->actingAs($admin)
            ->postJson(route('crm.ai-conversations.preview'), [
                'format' => 'json',
                'anonymize' => true,
                'include_metadata' => true,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'preview_data',
                'total_conversations',
                'estimated_file_size'
            ]);
    }

    /** @test */
    public function admin_can_export_ai_conversations_as_json()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create test data
        $this->createTestAIConversations();

        $response = $this->actingAs($admin)
            ->postJson(route('crm.ai-conversations.export'), [
                'format' => 'json',
                'anonymize' => true,
                'include_metadata' => true,
            ]);

        $response->assertStatus(200)
            ->assertHeader('Content-Disposition');
    }

    /** @test */
    public function admin_can_export_ai_conversations_as_csv()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create test data
        $this->createTestAIConversations();

        $response = $this->actingAs($admin)
            ->postJson(route('crm.ai-conversations.export'), [
                'format' => 'csv',
                'anonymize' => true,
                'include_metadata' => true,
            ]);

        $response->assertStatus(200)
            ->assertHeader('Content-Disposition');

        // Check that Content-Type starts with text/csv (may include charset)
        $this->assertStringStartsWith('text/csv', $response->headers->get('Content-Type'));
    }

    /** @test */
    public function admin_can_export_ai_conversations_for_ml_training()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create test data
        $this->createTestAIConversations();

        $response = $this->actingAs($admin)
            ->postJson(route('crm.ai-conversations.export'), [
                'format' => 'ml-training',
                'anonymize' => true,
                'include_metadata' => true,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'training_data',
                'metadata' => [
                    'export_timestamp',
                    'total_conversations',
                    'total_training_pairs',
                    'format_version'
                ]
            ]);
    }

    /** @test */
    public function export_validates_required_parameters()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)
            ->postJson(route('crm.ai-conversations.export'), [
                'format' => 'invalid_format',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['format']);
    }

    /** @test */
    public function export_filters_by_ai_service()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create test data with different AI services
        $this->createTestAIConversations();

        $response = $this->actingAs($admin)
            ->postJson(route('crm.ai-conversations.preview'), [
                'format' => 'json',
                'ai_service' => 'mistral',
                'anonymize' => true,
            ]);

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertGreaterThan(0, $data['total_conversations']);
    }

    /** @test */
    public function export_filters_by_date_range()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create test data
        $this->createTestAIConversations();

        $response = $this->actingAs($admin)
            ->postJson(route('crm.ai-conversations.preview'), [
                'format' => 'json',
                'date_from' => now()->subDays(7)->format('Y-m-d'),
                'date_to' => now()->format('Y-m-d'),
                'anonymize' => true,
            ]);

        $response->assertStatus(200);
    }

    /** @test */
    public function export_anonymizes_personal_data_when_requested()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create test data
        $this->createTestAIConversations();

        $response = $this->actingAs($admin)
            ->postJson(route('crm.ai-conversations.preview'), [
                'format' => 'json',
                'anonymize' => true,
            ]);

        $response->assertStatus(200);

        $data = $response->json();
        if (!empty($data['preview_data'])) {
            $firstConversation = $data['preview_data'][0];
            $this->assertTrue($firstConversation['guest_info']['anonymized']);
            $this->assertStringStartsWith('guest_', $firstConversation['guest_info']['guest_id']);
        }
    }

    /**
     * Create test AI conversations for testing.
     */
    private function createTestAIConversations()
    {
        // Create guest sessions
        $guestSession1 = GuestSession::create([
            'session_id' => 'test_session_1',
            'guest_name' => 'Test Guest 1',
            'guest_email' => 'guest1@example.com',
            'ip_address' => '127.0.0.1',
        ]);

        $guestSession2 = GuestSession::create([
            'session_id' => 'test_session_2',
            'guest_name' => 'Test Guest 2',
            'guest_email' => 'guest2@example.com',
            'ip_address' => '127.0.0.2',
        ]);

        // Create conversations
        $conversation1 = Conversation::create([
            'title' => 'Test AI Conversation 1',
            'conversable_type' => GuestSession::class,
            'conversable_id' => $guestSession1->id,
            'status' => 'active',
            'priority' => 'normal',
            'created_at' => now()->subDays(2),
            'last_message_at' => now()->subDays(2),
        ]);

        $conversation2 = Conversation::create([
            'title' => 'Test AI Conversation 2',
            'conversable_type' => GuestSession::class,
            'conversable_id' => $guestSession2->id,
            'status' => 'archived',
            'priority' => 'normal',
            'created_at' => now()->subDays(1),
            'last_message_at' => now()->subDays(1),
        ]);

        // Create messages with AI responses
        $this->createConversationMessages($conversation1, $guestSession1);
        $this->createConversationMessages($conversation2, $guestSession2);
    }

    /**
     * Create messages for a conversation including AI responses.
     */
    private function createConversationMessages($conversation, $guestSession)
    {
        // Guest message
        $guestMessage = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => 'Hello, I need help with web development services.',
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => GuestSession::class,
            'chattable_id' => $guestSession->id,
            'user_id' => null,
            'metadata' => [
                'guest_session_id' => $guestSession->id,
                'guest_name' => $guestSession->guest_name,
                'guest_email' => $guestSession->guest_email,
                'ip_address' => $guestSession->ip_address,
            ],
            'created_at' => $conversation->created_at,
        ]);

        // AI response
        Chat::create([
            'conversation_id' => $conversation->id,
            'message' => 'Hello! I\'d be happy to help you with web development services. What specific type of project are you looking for?',
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => GuestSession::class,
            'chattable_id' => $guestSession->id,
            'user_id' => null,
            'metadata' => [
                'is_ai_response' => true,
                'ai_service' => 'mistral',
                'ai_model' => 'mistral-large-latest',
                'guest_session_id' => $guestSession->id,
                'guest_name' => $guestSession->guest_name,
                'guest_email' => $guestSession->guest_email,
                'reply_to_message_id' => $guestMessage->id,
                'generated_at' => now()->toISOString(),
            ],
            'created_at' => $conversation->created_at->addMinutes(1),
        ]);
    }
}
