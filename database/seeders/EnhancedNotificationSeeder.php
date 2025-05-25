<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Database\Seeder;

class EnhancedNotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users with different roles
        $adminUsers = User::role('admin')->get();
        $staffUsers = User::role('staff')->get();
        $allUsers = $adminUsers->merge($staffUsers);

        if ($allUsers->isEmpty()) {
            $this->command->info('No users found. Please run UserSeeder first.');
            return;
        }

        // Get some sample entities
        $clients = Client::take(3)->get();
        $leads = Lead::take(3)->get();

        // Create various types of notifications for each user
        foreach ($allUsers as $user) {
            // Chat notifications
            NotificationService::create(
                $user,
                'chat',
                'You have a new message from John Doe in the support conversation',
                route('crm.livechat.index')
            );

            NotificationService::create(
                $user,
                'new_chat_message',
                'Sarah Wilson sent you a message: "Can we schedule a meeting?"',
                route('crm.livechat.index')
            );

            // Lead notifications
            if ($leads->isNotEmpty()) {
                $lead = $leads->random();
                NotificationService::createLeadNotification(
                    $user,
                    "New lead '{$lead->name}' has been assigned to you",
                    $lead
                );

                NotificationService::createLeadNotification(
                    $user,
                    "Lead '{$lead->name}' status changed to 'qualified'",
                    $lead
                );
            }

            // Client notifications
            if ($clients->isNotEmpty()) {
                $client = $clients->random();
                NotificationService::createClientNotification(
                    $user,
                    "Client '{$client->name}' has been updated",
                    $client
                );

                NotificationService::createClientNotification(
                    $user,
                    "New project started for client '{$client->name}'",
                    $client
                );
            }

            // Communication notifications
            if ($clients->isNotEmpty()) {
                $client = $clients->random();
                NotificationService::create(
                    $user,
                    'communication',
                    "New email communication added for client '{$client->name}'",
                    route('crm.clients.show', $client->id) . '?tab=communications'
                );
            }

            // System notifications
            NotificationService::create(
                $user,
                'system',
                'System maintenance scheduled for tonight at 2:00 AM',
                route('dashboard')
            );

            // Task notifications
            NotificationService::create(
                $user,
                'task',
                'Task "Follow up with prospect" is due tomorrow',
                route('dashboard')
            );

            // Reminder notifications
            NotificationService::create(
                $user,
                'reminder',
                'Reminder: Team meeting at 3:00 PM today',
                route('dashboard')
            );

            // Create some read notifications (older ones)
            $oldNotifications = [
                [
                    'type' => 'lead',
                    'message' => 'Lead conversion completed successfully',
                    'link' => route('crm.leads.index'),
                    'created_at' => now()->subDays(2),
                ],
                [
                    'type' => 'client',
                    'message' => 'Monthly report generated for all clients',
                    'link' => route('crm.clients.index'),
                    'created_at' => now()->subDays(3),
                ],
                [
                    'type' => 'communication',
                    'message' => 'Weekly communication summary is ready',
                    'link' => route('dashboard'),
                    'created_at' => now()->subDays(5),
                ],
            ];

            foreach ($oldNotifications as $notificationData) {
                $notification = NotificationService::create(
                    $user,
                    $notificationData['type'],
                    $notificationData['message'],
                    $notificationData['link']
                );
                
                // Mark as read and update timestamp
                $notification->update([
                    'is_read' => true,
                    'created_at' => $notificationData['created_at'],
                    'updated_at' => $notificationData['created_at'],
                ]);
            }
        }

        $this->command->info('Enhanced notifications seeded successfully!');
    }
}
