<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Communication;
use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use Carbon\Carbon;

class CommunicationSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get some users, clients, and leads
        $users = User::all();
        $clients = Client::all();
        $leads = Lead::all();

        if ($users->isEmpty() || ($clients->isEmpty() && $leads->isEmpty())) {
            $this->command->info('No users, clients, or leads found. Please run UserSeeder, ClientSeeder, and LeadSeeder first.');
            return;
        }

        $communicationTypes = ['email', 'call', 'meeting', 'note'];
        $directions = ['inbound', 'outbound'];
        $statuses = ['completed', 'scheduled', 'cancelled'];

        // Sample communication content
        $emailContents = [
            'Thank you for your inquiry about our services. We would be happy to schedule a consultation to discuss your needs in detail.',
            'Following up on our previous conversation regarding the project timeline. Please let me know if you have any questions.',
            'I wanted to reach out to see if you had a chance to review the proposal we sent last week.',
            'Thank you for taking the time to meet with us today. As discussed, I am attaching the detailed project scope.',
            'We have completed the initial analysis and would like to schedule a follow-up meeting to present our findings.'
        ];

        $callContents = [
            'Discussed project requirements and timeline. Client is interested in moving forward with Phase 1.',
            'Follow-up call to address technical questions about the implementation approach.',
            'Initial consultation call to understand business needs and current challenges.',
            'Status update call - project is on track and client is satisfied with progress.',
            'Emergency support call - resolved critical issue with system integration.'
        ];

        $meetingContents = [
            'Kickoff meeting to introduce team members and review project scope and deliverables.',
            'Weekly status meeting to review progress and address any blockers or concerns.',
            'Requirements gathering session with key stakeholders to define project specifications.',
            'Demo session to showcase completed features and gather feedback for next iteration.',
            'Project closure meeting to review deliverables and discuss ongoing support options.'
        ];

        $noteContents = [
            'Client expressed interest in additional services during our conversation.',
            'Important: Client has budget constraints and needs revised proposal by end of month.',
            'Technical note: Client\'s current system uses legacy database that may require migration.',
            'Follow-up required: Send additional documentation about security compliance.',
            'Client feedback: Very satisfied with current progress and communication level.'
        ];

        $subjects = [
            'Project Consultation',
            'Follow-up Discussion',
            'Proposal Review',
            'Technical Requirements',
            'Status Update',
            'Budget Discussion',
            'Timeline Planning',
            'Feature Demo',
            'Support Request',
            'Contract Review'
        ];

        // Create communications for clients
        foreach ($clients as $client) {
            $numCommunications = rand(2, 8);
            
            for ($i = 0; $i < $numCommunications; $i++) {
                $type = $communicationTypes[array_rand($communicationTypes)];
                $direction = $directions[array_rand($directions)];
                $status = $statuses[array_rand($statuses)];
                
                // Choose content based on type
                switch ($type) {
                    case 'email':
                        $content = $emailContents[array_rand($emailContents)];
                        break;
                    case 'call':
                        $content = $callContents[array_rand($callContents)];
                        break;
                    case 'meeting':
                        $content = $meetingContents[array_rand($meetingContents)];
                        break;
                    case 'note':
                        $content = $noteContents[array_rand($noteContents)];
                        break;
                    default:
                        $content = 'General communication content.';
                }

                Communication::create([
                    'type' => $type,
                    'content' => $content,
                    'subject' => $type !== 'note' ? $subjects[array_rand($subjects)] : null,
                    'communication_date' => Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
                    'direction' => $direction,
                    'status' => $status,
                    'communicable_type' => Client::class,
                    'communicable_id' => $client->id,
                    'user_id' => $users->random()->id,
                ]);
            }
        }

        // Create communications for leads
        foreach ($leads as $lead) {
            $numCommunications = rand(1, 5);
            
            for ($i = 0; $i < $numCommunications; $i++) {
                $type = $communicationTypes[array_rand($communicationTypes)];
                $direction = $directions[array_rand($directions)];
                $status = $statuses[array_rand($statuses)];
                
                // Choose content based on type
                switch ($type) {
                    case 'email':
                        $content = $emailContents[array_rand($emailContents)];
                        break;
                    case 'call':
                        $content = $callContents[array_rand($callContents)];
                        break;
                    case 'meeting':
                        $content = $meetingContents[array_rand($meetingContents)];
                        break;
                    case 'note':
                        $content = $noteContents[array_rand($noteContents)];
                        break;
                    default:
                        $content = 'General communication content.';
                }

                Communication::create([
                    'type' => $type,
                    'content' => $content,
                    'subject' => $type !== 'note' ? $subjects[array_rand($subjects)] : null,
                    'communication_date' => Carbon::now()->subDays(rand(0, 15))->subHours(rand(0, 23)),
                    'direction' => $direction,
                    'status' => $status,
                    'communicable_type' => Lead::class,
                    'communicable_id' => $lead->id,
                    'user_id' => $users->random()->id,
                ]);
            }
        }

        $this->command->info('Communications seeded successfully!');
    }
}
