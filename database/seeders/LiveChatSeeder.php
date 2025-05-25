<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Conversation;
use App\Models\Chat;
use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use Carbon\Carbon;

class LiveChatSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get users, clients, and leads
        $users = User::all();
        $clients = Client::all();
        $leads = Lead::all();

        if ($users->isEmpty()) {
            $this->command->info('No users found. Please run UserSeeder first.');
            return;
        }

        $staff = $users->filter(function ($user) {
            return $user->hasAnyRole(['admin', 'staff']);
        });

        $customers = $users->filter(function ($user) {
            return $user->hasRole('customer');
        });

        if ($staff->isEmpty()) {
            $this->command->info('No staff users found. Creating sample conversations with available users.');
        }

        $priorities = ['low', 'normal', 'high', 'urgent'];
        $statuses = ['active', 'archived', 'closed'];

        // Sample conversation titles
        $conversationTitles = [
            'Website Development Inquiry',
            'Technical Support Request',
            'Project Status Update',
            'Billing Question',
            'Feature Request Discussion',
            'Bug Report Follow-up',
            'Consultation Scheduling',
            'Service Upgrade Discussion',
            'General Support',
            'Partnership Inquiry'
        ];

        // Sample messages for different conversation types
        $sampleMessages = [
            'customer' => [
                'Hi, I need help with my website project.',
                'Can you provide an update on the timeline?',
                'I\'m experiencing some issues with the login functionality.',
                'What are the next steps for our project?',
                'I have a question about the billing.',
                'Can we schedule a call to discuss the requirements?',
                'The feature we discussed isn\'t working as expected.',
                'I\'d like to upgrade my service plan.',
                'Thank you for your help with this issue.',
                'When can we expect the next deliverable?'
            ],
            'staff' => [
                'Hello! I\'d be happy to help you with that.',
                'Let me check on the status and get back to you.',
                'I\'ve reviewed your request and here\'s what I found...',
                'Thanks for bringing this to our attention.',
                'I\'ll escalate this to our development team.',
                'Let me schedule a call for us to discuss this further.',
                'I\'ve updated your account with the new settings.',
                'The issue has been resolved. Please try again.',
                'I\'ll send you the updated timeline by end of day.',
                'Is there anything else I can help you with today?'
            ]
        ];

        // Create conversations with clients
        foreach ($clients->take(5) as $client) {
            $conversation = Conversation::create([
                'title' => $conversationTitles[array_rand($conversationTitles)],
                'conversable_type' => Client::class,
                'conversable_id' => $client->id,
                'created_by' => $customers->isNotEmpty() ? $customers->random()->id : $users->random()->id,
                'assigned_to' => $staff->isNotEmpty() ? $staff->random()->id : null,
                'status' => $statuses[array_rand($statuses)],
                'priority' => $priorities[array_rand($priorities)],
                'participants' => $staff->isNotEmpty() ?
                    [$customers->isNotEmpty() ? $customers->random()->id : $users->random()->id, $staff->random()->id] :
                    [$users->random()->id],
                'last_message_at' => Carbon::now()->subHours(rand(1, 48)),
                'unread_count' => rand(0, 5),
                'is_internal' => false,
            ]);

            // Create messages for this conversation
            $messageCount = rand(3, 10);
            $lastMessageTime = Carbon::now()->subHours(rand(1, 48));

            for ($i = 0; $i < $messageCount; $i++) {
                $isCustomerMessage = $i % 2 === 0; // Alternate between customer and staff
                $messageType = $isCustomerMessage ? 'customer' : 'staff';
                $userId = $isCustomerMessage ?
                    ($customers->isNotEmpty() ? $customers->random()->id : $users->random()->id) :
                    ($staff->isNotEmpty() ? $staff->random()->id : $users->random()->id);

                $message = Chat::create([
                    'conversation_id' => $conversation->id,
                    'message' => $sampleMessages[$messageType][array_rand($sampleMessages[$messageType])],
                    'message_type' => 'text',
                    'status' => rand(0, 1) ? 'read' : 'delivered',
                    'chattable_type' => Client::class,
                    'chattable_id' => $client->id,
                    'user_id' => $userId,
                    'is_internal_note' => false,
                    'created_at' => $lastMessageTime->addMinutes(rand(5, 30)),
                ]);

                // Add some reactions to random messages (30% chance)
                if (rand(1, 100) <= 30) {
                    $emojis = ['👍', '❤️', '😂', '😮', '👏', '🎉'];
                    $selectedEmoji = $emojis[array_rand($emojis)];
                    $reactionUsers = $users->random(rand(1, 3))->pluck('id')->toArray();

                    $reactions = [[
                        'emoji' => $selectedEmoji,
                        'users' => $reactionUsers,
                        'count' => count($reactionUsers)
                    ]];

                    $message->update(['reactions' => $reactions]);
                }

                // Add some comments to random messages (20% chance)
                if (rand(1, 100) <= 20) {
                    $commentTexts = [
                        'Great point!',
                        'I agree with this.',
                        'Let me follow up on this.',
                        'Thanks for clarifying.',
                        'This is important.',
                        'Good question.',
                        'I\'ll check on this.',
                        'Noted.',
                    ];

                    \App\Models\MessageComment::create([
                        'message_id' => $message->id,
                        'user_id' => $users->random()->id,
                        'comment' => $commentTexts[array_rand($commentTexts)],
                    ]);
                }

                // Pin some messages (10% chance)
                if (rand(1, 100) <= 10) {
                    $message->update([
                        'is_pinned' => true,
                        'pinned_at' => now(),
                        'pinned_by' => $users->random()->id,
                    ]);
                }

                // Edit some messages (15% chance)
                if (rand(1, 100) <= 15) {
                    $editedMessage = $message->message . ' (Updated)';
                    $message->update([
                        'message' => $editedMessage,
                        'is_edited' => true,
                        'edited_at' => now(),
                        'original_message' => $message->message,
                        'edit_history' => [[
                            'previous_message' => $message->message,
                            'edited_by' => $message->user_id,
                            'edited_at' => now()->toISOString(),
                        ]],
                    ]);
                }

                // Randomly mark some messages as read
                if (rand(0, 1)) {
                    $message->update([
                        'read_at' => $message->created_at->addMinutes(rand(1, 10)),
                        'is_read' => true,
                    ]);
                }
            }

            // Update conversation's last message time
            $conversation->update([
                'last_message_at' => $conversation->messages()->latest()->first()?->created_at,
            ]);
        }

        // Create conversations with leads
        foreach ($leads->take(3) as $lead) {
            $conversation = Conversation::create([
                'title' => $conversationTitles[array_rand($conversationTitles)],
                'conversable_type' => Lead::class,
                'conversable_id' => $lead->id,
                'created_by' => $customers->isNotEmpty() ? $customers->random()->id : $users->random()->id,
                'assigned_to' => $staff->isNotEmpty() ? $staff->random()->id : null,
                'status' => 'active', // Leads are usually active
                'priority' => $priorities[array_rand($priorities)],
                'participants' => $staff->isNotEmpty() ?
                    [$customers->isNotEmpty() ? $customers->random()->id : $users->random()->id, $staff->random()->id] :
                    [$users->random()->id],
                'last_message_at' => Carbon::now()->subHours(rand(1, 24)),
                'unread_count' => rand(0, 3),
                'is_internal' => false,
            ]);

            // Create messages for this conversation
            $messageCount = rand(2, 6);
            $lastMessageTime = Carbon::now()->subHours(rand(1, 24));

            for ($i = 0; $i < $messageCount; $i++) {
                $isCustomerMessage = $i % 2 === 0;
                $messageType = $isCustomerMessage ? 'customer' : 'staff';
                $userId = $isCustomerMessage ?
                    ($customers->isNotEmpty() ? $customers->random()->id : $users->random()->id) :
                    ($staff->isNotEmpty() ? $staff->random()->id : $users->random()->id);

                Chat::create([
                    'conversation_id' => $conversation->id,
                    'message' => $sampleMessages[$messageType][array_rand($sampleMessages[$messageType])],
                    'message_type' => 'text',
                    'status' => rand(0, 1) ? 'read' : 'sent',
                    'chattable_type' => Lead::class,
                    'chattable_id' => $lead->id,
                    'user_id' => $userId,
                    'is_internal_note' => false,
                    'created_at' => $lastMessageTime->addMinutes(rand(5, 30)),
                ]);
            }

            // Update conversation's last message time
            $conversation->update([
                'last_message_at' => $conversation->messages()->latest()->first()?->created_at,
            ]);
        }

        // Create some internal staff conversations
        if ($staff->count() >= 2) {
            $conversation = Conversation::create([
                'title' => 'Internal Team Discussion',
                'conversable_type' => null,
                'conversable_id' => null,
                'created_by' => $staff->random()->id,
                'assigned_to' => null,
                'status' => 'active',
                'priority' => 'normal',
                'participants' => $staff->take(2)->pluck('id')->toArray(),
                'last_message_at' => Carbon::now()->subHours(rand(1, 12)),
                'unread_count' => rand(0, 2),
                'is_internal' => true,
            ]);

            // Create internal messages
            $internalMessages = [
                'Can you review the client requirements for the Johnson project?',
                'I\'ve updated the project timeline. Please check when you have a moment.',
                'The client called about the delivery date. Should we schedule a meeting?',
                'I think we need to allocate more resources to this project.',
                'Let\'s discuss this in our next team meeting.',
            ];

            foreach ($internalMessages as $index => $messageText) {
                Chat::create([
                    'conversation_id' => $conversation->id,
                    'message' => $messageText,
                    'message_type' => 'text',
                    'status' => 'read',
                    'chattable_type' => null,
                    'chattable_id' => null,
                    'user_id' => $staff->random()->id,
                    'is_internal_note' => true,
                    'created_at' => Carbon::now()->subHours(12 - $index),
                ]);
            }

            $conversation->update([
                'last_message_at' => $conversation->messages()->latest()->first()?->created_at,
            ]);
        }

        $this->command->info('LiveChat conversations and messages seeded successfully!');
    }
}
