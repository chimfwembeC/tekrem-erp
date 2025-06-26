<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\ProjectMilestone;
use App\Models\ProjectTemplate;
use App\Models\User;
use App\Models\Client;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users and clients for relationships
        $users = User::all();
        $clients = Client::all();

        if ($users->isEmpty() || $clients->isEmpty()) {
            $this->command->warn('No users or clients found. Please run UserSeeder and ClientSeeder first.');
            return;
        }

        // Create project templates
        $templates = [
            [
                'name' => 'Web Development Project',
                'description' => 'Standard web development project template',
                'category' => 'Web Development',
                'template_data' => [
                    'milestones' => [
                        [
                            'name' => 'Project Planning & Requirements',
                            'description' => 'Define project scope, requirements, and create project plan',
                            'priority' => 'high',
                        ],
                        [
                            'name' => 'Design & Wireframes',
                            'description' => 'Create UI/UX designs and wireframes',
                            'priority' => 'medium',
                        ],
                        [
                            'name' => 'Development Phase 1',
                            'description' => 'Core functionality development',
                            'priority' => 'high',
                        ],
                        [
                            'name' => 'Testing & QA',
                            'description' => 'Quality assurance and testing',
                            'priority' => 'high',
                        ],
                        [
                            'name' => 'Deployment & Launch',
                            'description' => 'Deploy to production and launch',
                            'priority' => 'critical',
                        ],
                    ],
                    'default_budget' => 50000,
                    'estimated_duration' => 90,
                ],
                'created_by' => $users->first()->id,
            ],
            [
                'name' => 'Mobile App Development',
                'description' => 'Mobile application development template',
                'category' => 'Mobile Development',
                'template_data' => [
                    'milestones' => [
                        [
                            'name' => 'App Concept & Planning',
                            'description' => 'Define app concept, features, and technical requirements',
                            'priority' => 'high',
                        ],
                        [
                            'name' => 'UI/UX Design',
                            'description' => 'Create app designs and user experience flow',
                            'priority' => 'medium',
                        ],
                        [
                            'name' => 'Backend Development',
                            'description' => 'Develop backend APIs and services',
                            'priority' => 'high',
                        ],
                        [
                            'name' => 'Frontend Development',
                            'description' => 'Develop mobile app frontend',
                            'priority' => 'high',
                        ],
                        [
                            'name' => 'Testing & Beta Release',
                            'description' => 'Testing and beta version release',
                            'priority' => 'high',
                        ],
                        [
                            'name' => 'App Store Submission',
                            'description' => 'Submit to app stores and launch',
                            'priority' => 'critical',
                        ],
                    ],
                    'default_budget' => 75000,
                    'estimated_duration' => 120,
                ],
                'created_by' => $users->first()->id,
            ],
            [
                'name' => 'AI Integration Project',
                'description' => 'AI solution integration template',
                'category' => 'AI Solutions',
                'template_data' => [
                    'milestones' => [
                        [
                            'name' => 'AI Requirements Analysis',
                            'description' => 'Analyze AI requirements and select appropriate models',
                            'priority' => 'critical',
                        ],
                        [
                            'name' => 'Data Preparation',
                            'description' => 'Prepare and clean data for AI training',
                            'priority' => 'high',
                        ],
                        [
                            'name' => 'Model Development',
                            'description' => 'Develop and train AI models',
                            'priority' => 'high',
                        ],
                        [
                            'name' => 'Integration & Testing',
                            'description' => 'Integrate AI models and test performance',
                            'priority' => 'high',
                        ],
                        [
                            'name' => 'Deployment & Monitoring',
                            'description' => 'Deploy AI solution and set up monitoring',
                            'priority' => 'critical',
                        ],
                    ],
                    'default_budget' => 100000,
                    'estimated_duration' => 150,
                ],
                'created_by' => $users->first()->id,
            ],
        ];

        foreach ($templates as $templateData) {
            ProjectTemplate::create($templateData);
        }

        // Create sample projects
        $projects = [
            [
                'name' => 'TekRem ERP Enhancement',
                'description' => 'Enhance the existing TekRem ERP system with new features and improvements',
                'status' => 'active',
                'priority' => 'high',
                'category' => 'Web Development',
                'start_date' => now()->subDays(30),
                'deadline' => now()->addDays(60),
                'budget' => 75000,
                'spent_amount' => 25000,
                'progress' => 35,
                'client_id' => $clients->random()->id,
                'manager_id' => $users->random()->id,
                'team_members' => $users->random(min(3, $users->count()))->pluck('id')->toArray(),
                'tags' => ['ERP', 'Enhancement', 'Web Development'],
            ],
            [
                'name' => 'Mobile CRM App',
                'description' => 'Develop a mobile application for CRM functionality',
                'status' => 'active',
                'priority' => 'medium',
                'category' => 'Mobile Development',
                'start_date' => now()->subDays(15),
                'deadline' => now()->addDays(90),
                'budget' => 60000,
                'spent_amount' => 15000,
                'progress' => 20,
                'client_id' => $clients->random()->id,
                'manager_id' => $users->random()->id,
                'team_members' => $users->random(min(4, $users->count()))->pluck('id')->toArray(),
                'tags' => ['Mobile', 'CRM', 'React Native'],
            ],
            [
                'name' => 'AI Chatbot Integration',
                'description' => 'Integrate advanced AI chatbot capabilities into the existing system',
                'status' => 'draft',
                'priority' => 'critical',
                'category' => 'AI Solutions',
                'start_date' => now()->addDays(7),
                'deadline' => now()->addDays(120),
                'budget' => 85000,
                'spent_amount' => 0,
                'progress' => 0,
                'client_id' => $clients->random()->id,
                'manager_id' => $users->random()->id,
                'team_members' => $users->random(min(2, $users->count()))->pluck('id')->toArray(),
                'tags' => ['AI', 'Chatbot', 'Machine Learning'],
            ],
            [
                'name' => 'E-commerce Platform',
                'description' => 'Build a comprehensive e-commerce platform with modern features',
                'status' => 'completed',
                'priority' => 'high',
                'category' => 'Web Development',
                'start_date' => now()->subDays(120),
                'end_date' => now()->subDays(10),
                'deadline' => now()->subDays(5),
                'budget' => 95000,
                'spent_amount' => 92000,
                'progress' => 100,
                'client_id' => $clients->random()->id,
                'manager_id' => $users->random()->id,
                'team_members' => $users->random(min(5, $users->count()))->pluck('id')->toArray(),
                'tags' => ['E-commerce', 'Laravel', 'React'],
            ],
            [
                'name' => 'Data Analytics Dashboard',
                'description' => 'Create an advanced analytics dashboard for business intelligence',
                'status' => 'on-hold',
                'priority' => 'medium',
                'category' => 'Data Analytics',
                'start_date' => now()->subDays(45),
                'deadline' => now()->addDays(30),
                'budget' => 45000,
                'spent_amount' => 20000,
                'progress' => 40,
                'client_id' => $clients->random()->id,
                'manager_id' => $users->random()->id,
                'team_members' => $users->random(min(3, $users->count()))->pluck('id')->toArray(),
                'tags' => ['Analytics', 'Dashboard', 'BI'],
            ],
        ];

        foreach ($projects as $projectData) {
            $project = Project::create($projectData);

            // Create milestones for each project
            $this->createMilestonesForProject($project, $users);
        }

        $this->command->info('Projects seeded successfully!');
    }

    /**
     * Create milestones for a project.
     */
    private function createMilestonesForProject(Project $project, $users): void
    {
        $milestoneTemplates = [
            [
                'name' => 'Project Kickoff',
                'description' => 'Initial project setup and team alignment',
                'priority' => 'high',
                'progress' => $project->status === 'completed' ? 100 : ($project->progress > 0 ? 100 : 0),
                'status' => $project->status === 'completed' ? 'completed' : ($project->progress > 0 ? 'completed' : 'pending'),
                'order' => 1,
            ],
            [
                'name' => 'Requirements Analysis',
                'description' => 'Detailed analysis of project requirements',
                'priority' => 'high',
                'progress' => $project->status === 'completed' ? 100 : ($project->progress > 20 ? 100 : ($project->progress > 0 ? 50 : 0)),
                'status' => $project->status === 'completed' ? 'completed' : ($project->progress > 20 ? 'completed' : ($project->progress > 0 ? 'in-progress' : 'pending')),
                'order' => 2,
            ],
            [
                'name' => 'Development Phase',
                'description' => 'Main development work',
                'priority' => 'critical',
                'progress' => $project->status === 'completed' ? 100 : ($project->progress > 50 ? 80 : ($project->progress > 20 ? 30 : 0)),
                'status' => $project->status === 'completed' ? 'completed' : ($project->progress > 50 ? 'in-progress' : ($project->progress > 20 ? 'in-progress' : 'pending')),
                'order' => 3,
            ],
            [
                'name' => 'Testing & QA',
                'description' => 'Quality assurance and testing phase',
                'priority' => 'high',
                'progress' => $project->status === 'completed' ? 100 : ($project->progress > 80 ? 60 : 0),
                'status' => $project->status === 'completed' ? 'completed' : ($project->progress > 80 ? 'in-progress' : 'pending'),
                'order' => 4,
            ],
            [
                'name' => 'Deployment',
                'description' => 'Final deployment and launch',
                'priority' => 'critical',
                'progress' => $project->status === 'completed' ? 100 : 0,
                'status' => $project->status === 'completed' ? 'completed' : 'pending',
                'order' => 5,
            ],
        ];

        foreach ($milestoneTemplates as $milestoneData) {
            $milestone = $project->milestones()->create([
                'name' => $milestoneData['name'],
                'description' => $milestoneData['description'],
                'priority' => $milestoneData['priority'],
                'progress' => $milestoneData['progress'],
                'status' => $milestoneData['status'],
                'order' => $milestoneData['order'],
                'assigned_to' => $users->random()->id,
                'due_date' => $project->deadline ?
                    $project->start_date?->addDays($milestoneData['order'] * 15) :
                    now()->addDays($milestoneData['order'] * 15),
                'completion_date' => $milestoneData['status'] === 'completed' ?
                    now()->subDays(rand(1, 30)) : null,
            ]);
        }
    }
}
