<?php

namespace Tests\Feature\AI;

use App\Models\AI\Service;
use App\Models\AI\AIModel;
use App\Models\AI\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ConversationControllerTest extends TestCase
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

    public function test_it_can_display_conversations_index()
    {
        $this->actingAs($this->user);

        $response = $this->get(route('ai.conversations.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('AI/Conversations/Index'));
    }

    public function test_it_can_filter_conversations_by_model()
    {
        $this->actingAs($this->user);

        $conversation1 = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $otherModel = AIModel::factory()->create(['ai_service_id' => $this->service->id]);
        $conversation2 = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $otherModel->id,
        ]);

        $response = $this->get(route('ai.conversations.index', ['model_id' => $this->model->id]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('conversations.data', 1)
                ->where('conversations.data.0.id', $conversation1->id)
        );
    }

    public function test_it_can_filter_conversations_by_context()
    {
        $this->actingAs($this->user);

        $crmConversation = Conversation::factory()->crm()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $financeConversation = Conversation::factory()->finance()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $response = $this->get(route('ai.conversations.index', ['context_type' => 'crm']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('conversations.data', 1)
                ->where('conversations.data.0.id', $crmConversation->id)
        );
    }

    public function test_it_can_show_conversation_details()
    {
        $this->actingAs($this->user);

        $conversation = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $response = $this->get(route('ai.conversations.show', $conversation));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('AI/Conversations/Show')
                ->where('conversation.id', $conversation->id)
        );
    }

    public function test_it_can_add_message_to_conversation()
    {
        $this->actingAs($this->user);

        $conversation = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'messages' => [],
            'message_count' => 0,
        ]);

        $messageData = [
            'role' => 'user',
            'content' => 'Hello, can you help me with lead qualification?',
        ];

        $response = $this->post(route('ai.conversations.messages', $conversation), $messageData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $conversation->refresh();
        $this->assertEquals(1, $conversation->message_count);
        $this->assertCount(1, $conversation->messages);
        $this->assertEquals('user', $conversation->messages[0]['role']);
        $this->assertEquals($messageData['content'], $conversation->messages[0]['content']);
    }

    public function test_it_validates_message_data()
    {
        $this->actingAs($this->user);

        $conversation = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $response = $this->post(route('ai.conversations.messages', $conversation), [
            'role' => 'invalid-role',
            'content' => '',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['role', 'content']);
    }

    public function test_it_can_archive_conversation()
    {
        $this->actingAs($this->user);

        $conversation = Conversation::factory()->active()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $response = $this->post(route('ai.conversations.archive', $conversation));

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $conversation->refresh();
        $this->assertTrue($conversation->is_archived);
    }

    public function test_it_can_unarchive_conversation()
    {
        $this->actingAs($this->user);

        $conversation = Conversation::factory()->archived()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $response = $this->post(route('ai.conversations.unarchive', $conversation));

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $conversation->refresh();
        $this->assertFalse($conversation->is_archived);
    }

    public function test_it_can_update_conversation_title()
    {
        $this->actingAs($this->user);

        $conversation = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'title' => 'Original Title',
        ]);

        $updateData = [
            'title' => 'Updated Conversation Title',
        ];

        $response = $this->put(route('ai.conversations.update', $conversation), $updateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('ai_conversations', [
            'id' => $conversation->id,
            'title' => 'Updated Conversation Title',
        ]);
    }

    public function test_it_can_delete_conversation()
    {
        $this->actingAs($this->user);

        $conversation = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $response = $this->delete(route('ai.conversations.destroy', $conversation));

        $response->assertRedirect();
        $this->assertDatabaseMissing('ai_conversations', ['id' => $conversation->id]);
    }

    public function test_user_can_only_access_own_conversations()
    {
        $this->actingAs($this->user);

        $otherUser = User::factory()->create();
        $otherUser->assignRole('admin');

        $ownConversation = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $otherConversation = Conversation::factory()->create([
            'user_id' => $otherUser->id,
            'ai_model_id' => $this->model->id,
        ]);

        // Can access own conversation
        $response = $this->get(route('ai.conversations.show', $ownConversation));
        $response->assertStatus(200);

        // Cannot access other user's conversation
        $response = $this->get(route('ai.conversations.show', $otherConversation));
        $response->assertStatus(403);
    }

    public function test_it_requires_authentication_for_conversation_routes()
    {
        $conversation = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $response = $this->get(route('ai.conversations.index'));
        $response->assertRedirect(route('login'));

        $response = $this->get(route('ai.conversations.show', $conversation));
        $response->assertRedirect(route('login'));
    }

    public function test_it_requires_proper_role_for_conversation_routes()
    {
        $user = User::factory()->create();
        // Don't assign admin or staff role

        $this->actingAs($user);

        $response = $this->get(route('ai.conversations.index'));
        $response->assertStatus(403);
    }

    public function test_it_can_search_conversations()
    {
        $this->actingAs($this->user);

        $conversation1 = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'title' => 'Lead Qualification Discussion',
        ]);

        $conversation2 = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'title' => 'Finance Report Analysis',
        ]);

        $response = $this->get(route('ai.conversations.index', ['search' => 'Lead']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('conversations.data', 1)
                ->where('conversations.data.0.id', $conversation1->id)
        );
    }

    public function test_it_can_filter_by_date_range()
    {
        $this->actingAs($this->user);

        $oldConversation = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'created_at' => now()->subDays(10),
        ]);

        $recentConversation = Conversation::factory()->recent()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
        ]);

        $response = $this->get(route('ai.conversations.index', [
            'date_from' => now()->subDays(5)->format('Y-m-d'),
            'date_to' => now()->format('Y-m-d'),
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('conversations.data', 1)
                ->where('conversations.data.0.id', $recentConversation->id)
        );
    }

    public function test_it_tracks_conversation_statistics()
    {
        $this->actingAs($this->user);

        $conversation = Conversation::factory()->create([
            'user_id' => $this->user->id,
            'ai_model_id' => $this->model->id,
            'messages' => [],
            'message_count' => 0,
            'total_tokens' => 0,
            'total_cost' => 0,
        ]);

        // Add a message
        $this->post(route('ai.conversations.messages', $conversation), [
            'role' => 'user',
            'content' => 'Test message',
        ]);

        $conversation->refresh();
        $this->assertEquals(1, $conversation->message_count);
        $this->assertNotNull($conversation->last_message_at);
    }
}
