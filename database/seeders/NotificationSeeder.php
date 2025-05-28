<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Lead;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user
        $admin = User::role('admin')->first();
        if (!$admin) return;

        // Create sample notifications
        $types = ['chat', 'lead', 'client', 'communication'];
        $isRead = [true, false];

        // Get some clients and leads for the notifications
        $clients = Client::take(3)->get();
        $leads = Lead::take(3)->get();

        // Create 10 sample notifications
        for ($i = 0; $i < 10; $i++) {
            $type = $types[array_rand($types)];
            $read = $isRead[array_rand($isRead)];

            $data = [
                'user_id' => $admin->id,
                'type' => $type,
                'is_read' => $read,
                'created_at' => now()->subHours(rand(1, 72)),
            ];

            switch ($type) {
                case 'chat':
                    $data['message'] = 'You have a new message from John Doe';
                    $data['link'] = route('crm.livechat.index');
                    break;

                case 'lead':
                    if ($leads->count() > 0) {
                        $lead = $leads->random();
                        $data['message'] = "New lead '{$lead->name}' has been created";
                        $data['link'] = route('crm.leads.show', $lead->id);
                        $data['notifiable_type'] = Lead::class;
                        $data['notifiable_id'] = $lead->id;
                    } else {
                        $data['message'] = "New lead 'Sample Lead' has been created";
                        $data['link'] = route('crm.leads.index');
                    }
                    break;

                case 'client':
                    if ($clients->count() > 0) {
                        $client = $clients->random();
                        $data['message'] = "New client '{$client->name}' has been created";
                        $data['link'] = route('crm.clients.show', $client->id);
                        $data['notifiable_type'] = Client::class;
                        $data['notifiable_id'] = $client->id;
                    } else {
                        $data['message'] = "New client 'Sample Client' has been created";
                        $data['link'] = route('crm.clients.index');
                    }
                    break;

                case 'communication':
                    if ($clients->count() > 0) {
                        $client = $clients->random();
                        $data['message'] = "New communication added for client '{$client->name}'";
                        $data['link'] = route('crm.clients.show', $client->id) . '?tab=communications';
                        $data['notifiable_type'] = Client::class;
                        $data['notifiable_id'] = $client->id;
                    } else {
                        $data['message'] = "New communication added for a client";
                        $data['link'] = route('crm.clients.index');
                    }
                    break;
            }

            Notification::create($data);
        }
    }
}
