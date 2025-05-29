<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use App\Services\ProjectPlanningAIService;
use App\Services\AIService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AIProjectPlanningTest extends TestCase
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
    public function admin_can_generate_ai_milestones()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Mock AI service response
        Http::fake([
            '*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode([
                                [
                                    'name' => 'Project Planning',
                                    'description' => 'Define requirements and create project plan',
                                    'priority' => 'high',
                                    'estimated_days' => 7,
                                    'order' => 1,
                                    'dependencies' => []
                                ],
                                [
                                    'name' => 'Development Phase',
                                    'description' => 'Core functionality development',
                                    'priority' => 'critical',
                                    'estimated_days' => 30,
                                    'order' => 2,
                                    'dependencies' => []
                                ]
                            ])
                        ]
                    ]
                ]
            ], 200)
        ]);

        $response = $this->actingAs($admin)
            ->postJson(route('ai.project-planning.generate-milestones'), [
                'name' => 'Test Project',
                'description' => 'A test project for AI milestone generation',
                'category' => 'software',
                'priority' => 'high',
                'budget' => 10000,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'milestones',
                    'count'
                ]
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertCount(2, $data['data']['milestones']);
        $this->assertEquals('Project Planning', $data['data']['milestones'][0]['name']);
    }

    /** @test */
    public function admin_can_generate_ai_tasks()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Mock AI service response
        Http::fake([
            '*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode([
                                [
                                    'title' => 'Setup Development Environment',
                                    'description' => 'Configure development tools and environment',
                                    'type' => 'task',
                                    'priority' => 'high',
                                    'estimated_hours' => 4,
                                    'dependencies' => []
                                ],
                                [
                                    'title' => 'Create Database Schema',
                                    'description' => 'Design and implement database structure',
                                    'type' => 'task',
                                    'priority' => 'critical',
                                    'estimated_hours' => 8,
                                    'dependencies' => []
                                ]
                            ])
                        ]
                    ]
                ]
            ], 200)
        ]);

        $response = $this->actingAs($admin)
            ->postJson(route('ai.project-planning.generate-tasks'), [
                'description' => 'Create a web application with user authentication and dashboard',
                'project_name' => 'Test Project',
                'team_size' => 3,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'tasks',
                    'count'
                ]
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertCount(2, $data['data']['tasks']);
        $this->assertEquals('Setup Development Environment', $data['data']['tasks'][0]['title']);
    }

    /** @test */
    public function admin_can_estimate_project_timeline()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Mock AI service response
        Http::fake([
            '*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode([
                                'total_days' => 90,
                                'phases' => [
                                    ['name' => 'Planning', 'days' => 14],
                                    ['name' => 'Development', 'days' => 60],
                                    ['name' => 'Testing', 'days' => 16]
                                ],
                                'buffer_percentage' => 20,
                                'risk_factors' => ['complexity', 'team_experience']
                            ])
                        ]
                    ]
                ]
            ], 200)
        ]);

        $response = $this->actingAs($admin)
            ->postJson(route('ai.project-planning.estimate-timeline'), [
                'name' => 'Test Project',
                'description' => 'A complex web application project',
                'category' => 'software',
                'team_members' => [1, 2, 3],
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'total_days',
                    'phases',
                    'buffer_percentage',
                    'risk_factors'
                ]
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertEquals(90, $data['data']['total_days']);
        $this->assertCount(3, $data['data']['phases']);
    }

    /** @test */
    public function admin_can_get_resource_recommendations()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Mock AI service response
        Http::fake([
            '*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode([
                                'team_roles' => [
                                    ['role' => 'Project Manager', 'count' => 1, 'priority' => 'critical'],
                                    ['role' => 'Developer', 'count' => 2, 'priority' => 'high']
                                ],
                                'budget_allocation' => [
                                    'personnel' => 70,
                                    'tools' => 15,
                                    'infrastructure' => 10,
                                    'contingency' => 5
                                ],
                                'recommended_tools' => ['project_management_software', 'version_control'],
                                'external_resources' => ['training', 'consultation']
                            ])
                        ]
                    ]
                ]
            ], 200)
        ]);

        $response = $this->actingAs($admin)
            ->postJson(route('ai.project-planning.recommend-resources'), [
                'name' => 'Test Project',
                'description' => 'A software development project',
                'category' => 'software',
                'budget' => 50000,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'team_roles',
                    'budget_allocation',
                    'recommended_tools',
                    'external_resources'
                ]
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertCount(2, $data['data']['team_roles']);
        $this->assertEquals('Project Manager', $data['data']['team_roles'][0]['role']);
    }

    /** @test */
    public function admin_can_prioritize_tasks()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Mock AI service response
        Http::fake([
            '*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode([
                                ['task_index' => 0, 'priority' => 'critical', 'reasoning' => 'Blocks other tasks'],
                                ['task_index' => 1, 'priority' => 'high', 'reasoning' => 'Important for user experience']
                            ])
                        ]
                    ]
                ]
            ], 200)
        ]);

        $response = $this->actingAs($admin)
            ->postJson(route('ai.project-planning.prioritize-tasks'), [
                'tasks' => [
                    ['title' => 'Setup Database', 'description' => 'Configure database'],
                    ['title' => 'Create UI', 'description' => 'Design user interface']
                ],
                'deadline' => '2024-12-31',
                'team_capacity' => 'medium',
                'goals' => 'Launch MVP quickly',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'priorities',
                    'count'
                ]
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertCount(2, $data['data']['priorities']);
        $this->assertEquals('critical', $data['data']['priorities'][0]['priority']);
    }

    /** @test */
    public function admin_can_generate_comprehensive_plan()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Mock AI service response for comprehensive plan
        Http::fake([
            '*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode([
                                'milestones' => [
                                    ['name' => 'Planning', 'description' => 'Project planning phase', 'priority' => 'high', 'estimated_days' => 7, 'order' => 1]
                                ],
                                'timeline' => [
                                    'total_days' => 60,
                                    'phases' => [['name' => 'Development', 'days' => 45]],
                                    'buffer_percentage' => 20,
                                    'risk_factors' => ['complexity']
                                ],
                                'resources' => [
                                    'team_roles' => [['role' => 'Developer', 'count' => 2, 'priority' => 'high']],
                                    'budget_allocation' => ['personnel' => 80, 'tools' => 20]
                                ]
                            ])
                        ]
                    ]
                ]
            ], 200)
        ]);

        $response = $this->actingAs($admin)
            ->postJson(route('ai.project-planning.generate-comprehensive-plan'), [
                'name' => 'Comprehensive Test Project',
                'description' => 'A complete project planning test',
                'category' => 'software',
                'priority' => 'high',
                'budget' => 25000,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'milestones',
                    'timeline',
                    'resources',
                    'project_data'
                ]
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertArrayHasKey('milestones', $data['data']);
        $this->assertArrayHasKey('timeline', $data['data']);
        $this->assertArrayHasKey('resources', $data['data']);
    }

    /** @test */
    public function project_creation_with_ai_milestones_generates_milestones()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Mock AI service response
        Http::fake([
            '*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode([
                                [
                                    'name' => 'AI Generated Milestone',
                                    'description' => 'This milestone was generated by AI',
                                    'priority' => 'high',
                                    'estimated_days' => 14,
                                    'order' => 1,
                                    'dependencies' => []
                                ]
                            ])
                        ]
                    ]
                ]
            ], 200)
        ]);

        $response = $this->actingAs($admin)
            ->post(route('projects.store'), [
                'name' => 'AI Test Project',
                'description' => 'Testing AI milestone generation',
                'status' => 'draft',
                'priority' => 'medium',
                'category' => 'software',
                'manager_id' => $admin->id,
                'generate_ai_milestones' => true,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check that project was created
        $project = Project::where('name', 'AI Test Project')->first();
        $this->assertNotNull($project);

        // Check that AI milestones were generated
        $this->assertGreaterThan(0, $project->milestones()->count());
        
        $milestone = $project->milestones()->first();
        $this->assertNotNull($milestone->metadata);
        $this->assertTrue($milestone->metadata['ai_generated'] ?? false);
    }

    /** @test */
    public function non_admin_cannot_access_ai_planning_endpoints()
    {
        $user = User::factory()->create();
        $user->assignRole('customer');

        $response = $this->actingAs($user)
            ->postJson(route('ai.project-planning.generate-milestones'), [
                'name' => 'Test Project',
                'description' => 'Test description',
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function ai_planning_handles_service_failures_gracefully()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Mock AI service failure
        Http::fake([
            '*' => Http::response([], 500)
        ]);

        $response = $this->actingAs($admin)
            ->postJson(route('ai.project-planning.generate-milestones'), [
                'name' => 'Test Project',
                'description' => 'Test description',
                'category' => 'software',
            ]);

        $response->assertStatus(200);
        $data = $response->json();
        
        // Should return fallback milestones
        $this->assertTrue($data['success']);
        $this->assertGreaterThan(0, count($data['data']['milestones']));
    }
}
