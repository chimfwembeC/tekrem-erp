<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Communication;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CrmSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin and staff users
        $admin = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->first();

        $staff = User::whereHas('roles', function ($query) {
            $query->where('name', 'staff');
        })->first();

        if (!$admin || !$staff) {
            $this->command->info('Please run the RoleSeeder and UserSeeder first.');
            return;
        }

        // Create sample clients
        $clients = [
            [
                'name' => 'Acme Corporation',
                'email' => 'contact@acme.com',
                'phone' => '555-123-4567',
                'company' => 'Acme Corporation',
                'position' => 'Client',
                'address' => '123 Main St',
                'city' => 'Metropolis',
                'state' => 'NY',
                'postal_code' => '10001',
                'country' => 'USA',
                'notes' => 'Long-term client since 2020',
                'status' => 'active',
                'user_id' => $admin->id,
            ],
            [
                'name' => 'Wayne Enterprises',
                'email' => 'bruce@wayne.com',
                'phone' => '555-987-6543',
                'company' => 'Wayne Enterprises',
                'position' => 'CEO',
                'address' => '1007 Mountain Drive',
                'city' => 'Gotham',
                'state' => 'NJ',
                'postal_code' => '07101',
                'country' => 'USA',
                'notes' => 'High-value client with multiple projects',
                'status' => 'active',
                'user_id' => $staff->id,
            ],
            [
                'name' => 'Stark Industries',
                'email' => 'tony@stark.com',
                'phone' => '555-555-5555',
                'company' => 'Stark Industries',
                'position' => 'Owner',
                'address' => '10880 Malibu Point',
                'city' => 'Malibu',
                'state' => 'CA',
                'postal_code' => '90265',
                'country' => 'USA',
                'notes' => 'Innovative technology company',
                'status' => 'inactive',
                'user_id' => $admin->id,
            ],
        ];

        foreach ($clients as $clientData) {
            $client = Client::create($clientData);

            // Add communications for each client
            Communication::create([
                'type' => 'email',
                'content' => 'Initial contact email discussing project requirements.',
                'subject' => 'Project Discussion',
                'communication_date' => now()->subDays(rand(1, 30)),
                'direction' => 'outbound',
                'status' => 'completed',
                'communicable_id' => $client->id,
                'communicable_type' => Client::class,
                'user_id' => $clientData['user_id'],
            ]);

            Communication::create([
                'type' => 'call',
                'content' => 'Follow-up call to discuss project timeline and budget.',
                'subject' => 'Project Timeline',
                'communication_date' => now()->subDays(rand(1, 15)),
                'direction' => 'outbound',
                'status' => 'completed',
                'communicable_id' => $client->id,
                'communicable_type' => Client::class,
                'user_id' => $clientData['user_id'],
            ]);
        }

        // Create sample leads
        $leads = [
            [
                'name' => 'LexCorp',
                'email' => 'lex@lexcorp.com',
                'phone' => '555-111-2222',
                'company' => 'LexCorp',
                'position' => 'CEO',
                'address' => '1000 Lexington Ave',
                'city' => 'Metropolis',
                'state' => 'NY',
                'postal_code' => '10001',
                'country' => 'USA',
                'notes' => 'Potential high-value client',
                'source' => 'Website',
                'status' => 'new',
                'user_id' => $admin->id,
            ],
            [
                'name' => 'Queen Industries',
                'email' => 'oliver@queen.com',
                'phone' => '555-333-4444',
                'company' => 'Queen Industries',
                'position' => 'CEO',
                'address' => '123 Arrow St',
                'city' => 'Star City',
                'state' => 'WA',
                'postal_code' => '98101',
                'country' => 'USA',
                'notes' => 'Interested in our services',
                'source' => 'Referral',
                'status' => 'contacted',
                'user_id' => $staff->id,
            ],
            [
                'name' => 'Oscorp',
                'email' => 'norman@oscorp.com',
                'phone' => '555-666-7777',
                'company' => 'Oscorp',
                'position' => 'CEO',
                'address' => '456 Science Blvd',
                'city' => 'New York',
                'state' => 'NY',
                'postal_code' => '10002',
                'country' => 'USA',
                'notes' => 'Looking for technology solutions',
                'source' => 'Trade Show',
                'status' => 'qualified',
                'user_id' => $admin->id,
            ],
        ];

        foreach ($leads as $leadData) {
            $lead = Lead::create($leadData);

            // Add communications for each lead
            Communication::create([
                'type' => 'email',
                'content' => 'Initial outreach email introducing our services.',
                'subject' => 'Introduction to Our Services',
                'communication_date' => now()->subDays(rand(1, 30)),
                'direction' => 'outbound',
                'status' => 'completed',
                'communicable_id' => $lead->id,
                'communicable_type' => Lead::class,
                'user_id' => $leadData['user_id'],
            ]);

            if ($leadData['status'] !== 'new') {
                Communication::create([
                    'type' => 'call',
                    'content' => 'Follow-up call to discuss their needs and our solutions.',
                    'subject' => 'Needs Assessment',
                    'communication_date' => now()->subDays(rand(1, 15)),
                    'direction' => 'outbound',
                    'status' => 'completed',
                    'communicable_id' => $lead->id,
                    'communicable_type' => Lead::class,
                    'user_id' => $leadData['user_id'],
                ]);
            }
        }

        // Create sample notifications
        $this->call(NotificationSeeder::class);

        $this->command->info('CRM sample data created successfully.');
    }
}
