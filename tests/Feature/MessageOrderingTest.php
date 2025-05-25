<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Chat;
use App\Models\Conversation;
use App\Models\GuestSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Carbon\Carbon;

class MessageOrderingTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /** @test */
    public function conversation_model_returns_messages_in_chronological_order()
    {
        // Create a user and conversation
        $user = User::factory()->create();
        $conversation = Conversation::create([
            'title' => 'Test Conversation',
            'conversable_type' => User::class,
            'conversable_id' => $user->id,
            'created_by' => $user->id,
            'status' => 'active',
            'priority' => 'normal',
            'last_message_at' => now(),
        ]);

        // Create messages with different timestamps (ensure distinct times)
        $time1 = Carbon::parse('2024-01-01 10:00:00');
        $time2 = Carbon::parse('2024-01-01 11:00:00');
        $time3 = Carbon::parse('2024-01-01 12:00:00');

        $message1 = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => 'First message',
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => User::class,
            'chattable_id' => $user->id,
            'user_id' => $user->id,
            'created_at' => $time1,
            'updated_at' => $time1,
        ]);

        $message2 = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => 'Second message',
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => User::class,
            'chattable_id' => $user->id,
            'user_id' => $user->id,
            'created_at' => $time2,
            'updated_at' => $time2,
        ]);

        $message3 = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => 'Third message',
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => User::class,
            'chattable_id' => $user->id,
            'user_id' => $user->id,
            'created_at' => $time3,
            'updated_at' => $time3,
        ]);

        // Refresh the conversation to get updated messages
        $conversation = $conversation->fresh();

        // Test that messages relationship returns messages in chronological order
        $messages = $conversation->messages;

        $this->assertCount(3, $messages);
        $this->assertEquals('First message', $messages[0]->message);
        $this->assertEquals('Second message', $messages[1]->message);
        $this->assertEquals('Third message', $messages[2]->message);

        // Verify timestamps are in ascending order (check actual values for debugging)
        $this->assertTrue(
            $messages[0]->created_at->lte($messages[1]->created_at),
            "First message timestamp: {$messages[0]->created_at}, Second message timestamp: {$messages[1]->created_at}"
        );
        $this->assertTrue(
            $messages[1]->created_at->lte($messages[2]->created_at),
            "Second message timestamp: {$messages[1]->created_at}, Third message timestamp: {$messages[2]->created_at}"
        );
    }

    /** @test */
    public function guest_session_messages_are_ordered_chronologically()
    {
        // Create a guest session
        $guestSession = GuestSession::create([
            'session_id' => 'test_session_123',
            'guest_name' => 'Test Guest',
            'guest_email' => 'test@example.com',
            'ip_address' => '127.0.0.1',
            'last_activity_at' => now(),
        ]);

        // Create a conversation
        $conversation = Conversation::create([
            'title' => 'Test Conversation',
            'conversable_type' => GuestSession::class,
            'conversable_id' => $guestSession->id,
            'status' => 'active',
            'priority' => 'normal',
            'last_message_at' => now(),
        ]);

        // Create messages with different timestamps (oldest first)
        $time1 = Carbon::parse('2024-01-01 10:00:00');
        $time2 = Carbon::parse('2024-01-01 11:00:00');
        $time3 = Carbon::parse('2024-01-01 12:00:00');

        $message1 = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => 'First message (oldest)',
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => GuestSession::class,
            'chattable_id' => $guestSession->id,
            'created_at' => $time1,
            'updated_at' => $time1,
        ]);

        $message2 = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => 'Second message (middle)',
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => GuestSession::class,
            'chattable_id' => $guestSession->id,
            'created_at' => $time2,
            'updated_at' => $time2,
        ]);

        $message3 = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => 'Third message (newest)',
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => GuestSession::class,
            'chattable_id' => $guestSession->id,
            'created_at' => $time3,
            'updated_at' => $time3,
        ]);

        // Test that conversation messages are in chronological order
        $conversation = $conversation->fresh();
        $messages = $conversation->messages;

        $this->assertCount(3, $messages);
        $this->assertEquals('First message (oldest)', $messages[0]->message);
        $this->assertEquals('Second message (middle)', $messages[1]->message);
        $this->assertEquals('Third message (newest)', $messages[2]->message);

        // Verify timestamps are in ascending order
        $this->assertTrue(
            $messages[0]->created_at->lte($messages[1]->created_at),
            "First message timestamp: {$messages[0]->created_at}, Second message timestamp: {$messages[1]->created_at}"
        );
        $this->assertTrue(
            $messages[1]->created_at->lte($messages[2]->created_at),
            "Second message timestamp: {$messages[1]->created_at}, Third message timestamp: {$messages[2]->created_at}"
        );
    }

    /** @test */
    public function ai_responses_maintain_chronological_order_in_model()
    {
        // Create a guest session and conversation
        $guestSession = GuestSession::create([
            'session_id' => 'test_session_ai',
            'guest_name' => 'Test Guest',
            'guest_email' => 'test@example.com',
            'ip_address' => '127.0.0.1',
            'last_activity_at' => now(),
        ]);

        $conversation = Conversation::create([
            'title' => 'Test Conversation',
            'conversable_type' => GuestSession::class,
            'conversable_id' => $guestSession->id,
            'status' => 'active',
            'priority' => 'normal',
            'last_message_at' => now(),
        ]);

        // Create messages with proper timestamps
        $time1 = Carbon::parse('2024-01-01 10:00:00');
        $time2 = Carbon::parse('2024-01-01 11:00:00');
        $time3 = Carbon::parse('2024-01-01 12:00:00');

        // Create a guest message
        $guestMessage = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => 'Hello, I need help',
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => GuestSession::class,
            'chattable_id' => $guestSession->id,
            'created_at' => $time1,
            'updated_at' => $time1,
        ]);

        // Create an AI response
        $aiMessage = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => 'Hello! How can I help you today?',
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => GuestSession::class,
            'chattable_id' => $guestSession->id,
            'metadata' => [
                'is_ai_response' => true,
                'ai_service' => 'mistral',
                'ai_model' => 'mistral-large-latest',
                'reply_to_message_id' => $guestMessage->id,
            ],
            'created_at' => $time2,
            'updated_at' => $time2,
        ]);

        // Create another guest message
        $guestMessage2 = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => 'I need help with web development',
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => GuestSession::class,
            'chattable_id' => $guestSession->id,
            'created_at' => $time3,
            'updated_at' => $time3,
        ]);

        // Test that conversation messages are in chronological order
        $conversation = $conversation->fresh();
        $messages = $conversation->messages;

        $this->assertCount(3, $messages);

        // Verify chronological order: guest -> AI -> guest
        $this->assertEquals('Hello, I need help', $messages[0]->message);
        $this->assertEquals('Hello! How can I help you today?', $messages[1]->message);
        $this->assertEquals('I need help with web development', $messages[2]->message);

        // Verify AI message metadata
        $this->assertTrue($messages[1]->metadata['is_ai_response']);
        $this->assertEquals('mistral', $messages[1]->metadata['ai_service']);

        // Verify timestamps are in ascending order
        $this->assertTrue(
            $messages[0]->created_at->lte($messages[1]->created_at),
            "First message timestamp: {$messages[0]->created_at}, Second message timestamp: {$messages[1]->created_at}"
        );
        $this->assertTrue(
            $messages[1]->created_at->lte($messages[2]->created_at),
            "Second message timestamp: {$messages[1]->created_at}, Third message timestamp: {$messages[2]->created_at}"
        );
    }
}
