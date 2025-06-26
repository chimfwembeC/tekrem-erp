<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectMilestone;
use App\Models\ProjectTask;
use App\Models\User;
use App\Models\Tag;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ProjectPlanningAIService
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Generate AI-powered milestones for a project.
     */
    public function generateMilestones(array $projectData): array
    {
        $prompt = $this->buildMilestonePrompt($projectData);

        $response = $this->aiService->makeRequest($prompt, [
            'temperature' => 0.3, // Lower temperature for more structured output
            'max_tokens' => 1500,
        ]);

        if (!$response || !isset($response['choices'][0]['message']['content'])) {
            Log::warning('Failed to generate AI milestones');
            return $this->getFallbackMilestones($projectData);
        }

        return $this->parseMilestonesResponse($response['choices'][0]['message']['content'], $projectData);
    }

    /**
     * Generate intelligent tasks from natural language description.
     */
    public function generateTasks(string $description, array $context = []): array
    {
        $prompt = $this->buildTaskPrompt($description, $context);

        $response = $this->aiService->makeRequest($prompt, [
            'temperature' => 0.4,
            'max_tokens' => 1200,
        ]);

        if (!$response || !isset($response['choices'][0]['message']['content'])) {
            Log::warning('Failed to generate AI tasks');
            return $this->getFallbackTasks($description);
        }

        return $this->parseTasksResponse($response['choices'][0]['message']['content'], $context);
    }

    /**
     * Estimate project timeline using AI.
     */
    public function estimateTimeline(array $projectData): array
    {
        $prompt = $this->buildTimelinePrompt($projectData);

        $response = $this->aiService->makeRequest($prompt, [
            'temperature' => 0.2,
            'max_tokens' => 800,
        ]);

        if (!$response || !isset($response['choices'][0]['message']['content'])) {
            Log::warning('Failed to generate AI timeline estimate');
            return $this->getFallbackTimeline($projectData);
        }

        return $this->parseTimelineResponse($response['choices'][0]['message']['content']);
    }

    /**
     * Generate resource recommendations.
     */
    public function recommendResources(array $projectData): array
    {
        $prompt = $this->buildResourcePrompt($projectData);

        $response = $this->aiService->makeRequest($prompt, [
            'temperature' => 0.3,
            'max_tokens' => 1000,
        ]);

        if (!$response || !isset($response['choices'][0]['message']['content'])) {
            Log::warning('Failed to generate AI resource recommendations');
            return $this->getFallbackResources($projectData);
        }

        return $this->parseResourceResponse($response['choices'][0]['message']['content'], $projectData);
    }

    /**
     * Smart prioritization based on project context.
     */
    public function prioritizeTasks(array $tasks, array $projectContext): array
    {
        $prompt = $this->buildPrioritizationPrompt($tasks, $projectContext);

        $response = $this->aiService->makeRequest($prompt, [
            'temperature' => 0.2,
            'max_tokens' => 800,
        ]);

        if (!$response || !isset($response['choices'][0]['message']['content'])) {
            Log::warning('Failed to generate AI task prioritization');
            return $this->getFallbackPrioritization($tasks);
        }

        return $this->parsePrioritizationResponse($response['choices'][0]['message']['content'], $tasks);
    }

    /**
     * Build milestone generation prompt.
     */
    protected function buildMilestonePrompt(array $projectData): string
    {
        $name = $projectData['name'] ?? 'Unnamed Project';
        $description = $projectData['description'] ?? 'No description provided';
        $category = $projectData['category'] ?? 'general';
        $priority = $projectData['priority'] ?? 'medium';
        $budget = $projectData['budget'] ?? 'not specified';
        $duration = $this->calculateDuration($projectData);

        return "As a project management expert, analyze this project and generate 4-6 appropriate milestones:
        Project Details:
        - Name: {$name}
        - Description: {$description}
        - Category: {$category}
        - Priority: {$priority}
        - Budget: {$budget}
        - Duration: {$duration}

        Generate milestones that are:
        1. Specific and measurable
        2. Logically sequenced
        3. Appropriate for the project type and complexity
        4. Include realistic time estimates

        Return ONLY a JSON array with this exact structure:
        [
        {
            \"name\": \"Milestone Name\",
            \"description\": \"Detailed description\",
            \"priority\": \"low|medium|high|critical\",
            \"estimated_days\": 7,
            \"order\": 1,
            \"dependencies\": []
        }
        ]

        Ensure the JSON is valid and complete.";
    }

    /**
     * Build task generation prompt.
     */
    protected function buildTaskPrompt(string $description, array $context): string
    {
        $projectName = $context['project_name'] ?? 'Current Project';
        $milestone = $context['milestone'] ?? 'General Tasks';
        $teamSize = $context['team_size'] ?? 'unknown';

        return "As a project management expert, break down this task description into specific, actionable tasks:
            Task Description: {$description}
            Project: {$projectName}
            Milestone: {$milestone}
            Team Size: {$teamSize}

            Generate 3-8 specific tasks that:
            1. Are actionable and clear
            2. Have appropriate priorities
            3. Include realistic time estimates
            4. Consider dependencies

            Return ONLY a JSON array with this exact structure:
            [
            {
                \"title\": \"Task Title\",
                \"description\": \"Detailed description\",
                \"type\": \"task|feature|bug|improvement\",
                \"priority\": \"low|medium|high|critical\",
                \"estimated_hours\": 8,
                \"dependencies\": []
            }
            ]

            Ensure the JSON is valid and complete.";
    }

    /**
     * Build timeline estimation prompt.
     */
    protected function buildTimelinePrompt(array $projectData): string
    {
        $name = $projectData['name'] ?? 'Unnamed Project';
        $description = $projectData['description'] ?? 'No description provided';
        $category = $projectData['category'] ?? 'general';
        $teamSize = count($projectData['team_members'] ?? []);

        return "As a project management expert, estimate realistic timelines for this project:

        Project Details:
        - Name: {$name}
        - Description: {$description}
        - Category: {$category}
        - Team Size: {$teamSize} members

        Provide estimates for:
        1. Total project duration
        2. Key phases
        3. Buffer time recommendations
        4. Risk factors

        Return ONLY a JSON object with this exact structure:
        {
        \"total_days\": 90,
        \"phases\": [
            {\"name\": \"Planning\", \"days\": 14},
            {\"name\": \"Development\", \"days\": 60},
            {\"name\": \"Testing\", \"days\": 16}
        ],
        \"buffer_percentage\": 20,
        \"risk_factors\": [\"complexity\", \"team_experience\"]
        }

        Ensure the JSON is valid and complete.";
    }

    /**
     * Build resource recommendation prompt.
     */
    protected function buildResourcePrompt(array $projectData): string
    {
        $name = $projectData['name'] ?? 'Unnamed Project';
        $description = $projectData['description'] ?? 'No description provided';
        $category = $projectData['category'] ?? 'general';
        $budget = $projectData['budget'] ?? 'not specified';

        return "As a project management expert, recommend optimal resources for this project:

        Project Details:
        - Name: {$name}
        - Description: {$description}
        - Category: {$category}
        - Budget: {$budget}

        Recommend:
        1. Team composition and roles
        2. Budget allocation
        3. Tools and technologies
        4. External resources

        Return ONLY a JSON object with this exact structure:
        {
        \"team_roles\": [
            {\"role\": \"Project Manager\", \"count\": 1, \"priority\": \"critical\"},
            {\"role\": \"Developer\", \"count\": 2, \"priority\": \"high\"}
        ],
        \"budget_allocation\": {
            \"personnel\": 70,
            \"tools\": 15,
            \"infrastructure\": 10,
            \"contingency\": 5
        },
        \"recommended_tools\": [\"tool1\", \"tool2\"],
        \"external_resources\": [\"consultant\", \"training\"]
        }

        Ensure the JSON is valid and complete.";
    }

    /**
     * Build prioritization prompt.
     */
    protected function buildPrioritizationPrompt(array $tasks, array $context): string
    {
        $deadline = $context['deadline'] ?? 'not specified';
        $teamCapacity = $context['team_capacity'] ?? 'unknown';
        $projectGoals = $context['goals'] ?? 'general project completion';

        $taskList = '';
        foreach ($tasks as $index => $task) {
            $taskList .= ($index + 1) . ". {$task['title']} - {$task['description']}\n";
        }

        return "As a project management expert, prioritize these tasks based on the project context:

Project Context:
- Deadline: {$deadline}
- Team Capacity: {$teamCapacity}
- Goals: {$projectGoals}

Tasks to prioritize:
{$taskList}

Consider:
1. Impact on project goals
2. Dependencies
3. Resource requirements
4. Risk factors

Return ONLY a JSON array with task priorities in order:
[
  {\"task_index\": 0, \"priority\": \"critical\", \"reasoning\": \"explanation\"},
  {\"task_index\": 1, \"priority\": \"high\", \"reasoning\": \"explanation\"}
]

Ensure the JSON is valid and complete.";
    }

    /**
     * Calculate project duration from dates.
     */
    protected function calculateDuration(array $projectData): string
    {
        if (isset($projectData['start_date']) && isset($projectData['end_date'])) {
            $start = Carbon::parse($projectData['start_date']);
            $end = Carbon::parse($projectData['end_date']);
            $days = $start->diffInDays($end);
            return "{$days} days";
        }

        if (isset($projectData['deadline'])) {
            $deadline = Carbon::parse($projectData['deadline']);
            $days = now()->diffInDays($deadline);
            return "approximately {$days} days until deadline";
        }

        return "duration not specified";
    }

    /**
     * Parse AI milestone response.
     */
    protected function parseMilestonesResponse(string $response, array $projectData): array
    {
        try {
            // Extract JSON from response
            $jsonStart = strpos($response, '[');
            $jsonEnd = strrpos($response, ']') + 1;

            if ($jsonStart === false || $jsonEnd === false) {
                throw new \Exception('No JSON array found in response');
            }

            $jsonString = substr($response, $jsonStart, $jsonEnd - $jsonStart);
            $milestones = json_decode($jsonString, true);

            if (!is_array($milestones)) {
                throw new \Exception('Invalid JSON structure');
            }

            // Validate and clean milestones
            $validatedMilestones = [];
            foreach ($milestones as $index => $milestone) {
                if (isset($milestone['name']) && !empty($milestone['name'])) {
                    $validatedMilestones[] = [
                        'name' => $milestone['name'],
                        'description' => $milestone['description'] ?? '',
                        'priority' => in_array($milestone['priority'] ?? 'medium', ['low', 'medium', 'high', 'critical'])
                            ? $milestone['priority'] : 'medium',
                        'estimated_days' => max(1, intval($milestone['estimated_days'] ?? 7)),
                        'order' => $milestone['order'] ?? ($index + 1),
                        'dependencies' => is_array($milestone['dependencies'] ?? []) ? $milestone['dependencies'] : [],
                    ];
                }
            }

            return $validatedMilestones;
        } catch (\Exception $e) {
            Log::warning('Failed to parse AI milestone response: ' . $e->getMessage());
            return $this->getFallbackMilestones($projectData);
        }
    }

    /**
     * Parse AI tasks response.
     */
    protected function parseTasksResponse(string $response, array $context): array
    {
        try {
            $jsonStart = strpos($response, '[');
            $jsonEnd = strrpos($response, ']') + 1;

            if ($jsonStart === false || $jsonEnd === false) {
                throw new \Exception('No JSON array found in response');
            }

            $jsonString = substr($response, $jsonStart, $jsonEnd - $jsonStart);
            $tasks = json_decode($jsonString, true);

            if (!is_array($tasks)) {
                throw new \Exception('Invalid JSON structure');
            }

            $validatedTasks = [];
            foreach ($tasks as $task) {
                if (isset($task['title']) && !empty($task['title'])) {
                    $validatedTasks[] = [
                        'title' => $task['title'],
                        'description' => $task['description'] ?? '',
                        'type' => in_array($task['type'] ?? 'task', ['task', 'feature', 'bug', 'improvement'])
                            ? $task['type'] : 'task',
                        'priority' => in_array($task['priority'] ?? 'medium', ['low', 'medium', 'high', 'critical'])
                            ? $task['priority'] : 'medium',
                        'estimated_hours' => max(1, floatval($task['estimated_hours'] ?? 8)),
                        'dependencies' => is_array($task['dependencies'] ?? []) ? $task['dependencies'] : [],
                    ];
                }
            }

            return $validatedTasks;
        } catch (\Exception $e) {
            Log::warning('Failed to parse AI tasks response: ' . $e->getMessage());
            return $this->getFallbackTasks($context['description'] ?? 'Task generation');
        }
    }

    /**
     * Parse AI timeline response.
     */
    protected function parseTimelineResponse(string $response): array
    {
        try {
            $jsonStart = strpos($response, '{');
            $jsonEnd = strrpos($response, '}') + 1;

            if ($jsonStart === false || $jsonEnd === false) {
                throw new \Exception('No JSON object found in response');
            }

            $jsonString = substr($response, $jsonStart, $jsonEnd - $jsonStart);
            $timeline = json_decode($jsonString, true);

            if (!is_array($timeline)) {
                throw new \Exception('Invalid JSON structure');
            }

            return [
                'total_days' => max(1, intval($timeline['total_days'] ?? 30)),
                'phases' => is_array($timeline['phases'] ?? []) ? $timeline['phases'] : [],
                'buffer_percentage' => max(0, min(50, intval($timeline['buffer_percentage'] ?? 20))),
                'risk_factors' => is_array($timeline['risk_factors'] ?? []) ? $timeline['risk_factors'] : [],
            ];
        } catch (\Exception $e) {
            Log::warning('Failed to parse AI timeline response: ' . $e->getMessage());
            return $this->getFallbackTimeline([]);
        }
    }

    /**
     * Parse AI resource response.
     */
    protected function parseResourceResponse(string $response, array $projectData): array
    {
        try {
            $jsonStart = strpos($response, '{');
            $jsonEnd = strrpos($response, '}') + 1;

            if ($jsonStart === false || $jsonEnd === false) {
                throw new \Exception('No JSON object found in response');
            }

            $jsonString = substr($response, $jsonStart, $jsonEnd - $jsonStart);
            $resources = json_decode($jsonString, true);

            if (!is_array($resources)) {
                throw new \Exception('Invalid JSON structure');
            }

            return [
                'team_roles' => is_array($resources['team_roles'] ?? []) ? $resources['team_roles'] : [],
                'budget_allocation' => is_array($resources['budget_allocation'] ?? []) ? $resources['budget_allocation'] : [],
                'recommended_tools' => is_array($resources['recommended_tools'] ?? []) ? $resources['recommended_tools'] : [],
                'external_resources' => is_array($resources['external_resources'] ?? []) ? $resources['external_resources'] : [],
            ];
        } catch (\Exception $e) {
            Log::warning('Failed to parse AI resource response: ' . $e->getMessage());
            return $this->getFallbackResources($projectData);
        }
    }

    /**
     * Parse AI prioritization response.
     */
    protected function parsePrioritizationResponse(string $response, array $tasks): array
    {
        try {
            $jsonStart = strpos($response, '[');
            $jsonEnd = strrpos($response, ']') + 1;

            if ($jsonStart === false || $jsonEnd === false) {
                throw new \Exception('No JSON array found in response');
            }

            $jsonString = substr($response, $jsonStart, $jsonEnd - $jsonStart);
            $priorities = json_decode($jsonString, true);

            if (!is_array($priorities)) {
                throw new \Exception('Invalid JSON structure');
            }

            $validatedPriorities = [];
            foreach ($priorities as $priority) {
                if (isset($priority['task_index']) && isset($tasks[$priority['task_index']])) {
                    $validatedPriorities[] = [
                        'task_index' => intval($priority['task_index']),
                        'priority' => in_array($priority['priority'] ?? 'medium', ['low', 'medium', 'high', 'critical'])
                            ? $priority['priority'] : 'medium',
                        'reasoning' => $priority['reasoning'] ?? 'AI-generated priority',
                    ];
                }
            }

            return $validatedPriorities;
        } catch (\Exception $e) {
            Log::warning('Failed to parse AI prioritization response: ' . $e->getMessage());
            return $this->getFallbackPrioritization($tasks);
        }
    }

    /**
     * Get fallback milestones when AI generation fails.
     */
    protected function getFallbackMilestones(array $projectData): array
    {
        $category = $projectData['category'] ?? 'general';

        // Basic milestones based on project category
        switch (strtolower($category)) {
            case 'software':
            case 'development':
                return [
                    ['name' => 'Project Planning', 'description' => 'Define requirements and create project plan', 'priority' => 'high', 'estimated_days' => 7, 'order' => 1],
                    ['name' => 'Design & Architecture', 'description' => 'Create system design and architecture', 'priority' => 'high', 'estimated_days' => 14, 'order' => 2],
                    ['name' => 'Development Phase 1', 'description' => 'Core functionality development', 'priority' => 'critical', 'estimated_days' => 30, 'order' => 3],
                    ['name' => 'Testing & QA', 'description' => 'Quality assurance and testing', 'priority' => 'high', 'estimated_days' => 14, 'order' => 4],
                    ['name' => 'Deployment', 'description' => 'Production deployment and go-live', 'priority' => 'critical', 'estimated_days' => 7, 'order' => 5],
                ];
            case 'marketing':
                return [
                    ['name' => 'Strategy Development', 'description' => 'Develop marketing strategy and goals', 'priority' => 'high', 'estimated_days' => 10, 'order' => 1],
                    ['name' => 'Content Creation', 'description' => 'Create marketing materials and content', 'priority' => 'medium', 'estimated_days' => 21, 'order' => 2],
                    ['name' => 'Campaign Launch', 'description' => 'Launch marketing campaigns', 'priority' => 'critical', 'estimated_days' => 7, 'order' => 3],
                    ['name' => 'Performance Analysis', 'description' => 'Analyze campaign performance and optimize', 'priority' => 'medium', 'estimated_days' => 14, 'order' => 4],
                ];
            default:
                return [
                    ['name' => 'Project Initiation', 'description' => 'Project kickoff and planning', 'priority' => 'high', 'estimated_days' => 7, 'order' => 1],
                    ['name' => 'Execution Phase 1', 'description' => 'First phase of project execution', 'priority' => 'medium', 'estimated_days' => 21, 'order' => 2],
                    ['name' => 'Review & Adjustment', 'description' => 'Mid-project review and adjustments', 'priority' => 'medium', 'estimated_days' => 7, 'order' => 3],
                    ['name' => 'Final Delivery', 'description' => 'Project completion and delivery', 'priority' => 'critical', 'estimated_days' => 14, 'order' => 4],
                ];
        }
    }

    /**
     * Get fallback tasks when AI generation fails.
     */
    protected function getFallbackTasks(string $description): array
    {
        return [
            [
                'title' => 'Analyze Requirements',
                'description' => 'Break down and analyze the requirements for: ' . $description,
                'type' => 'task',
                'priority' => 'high',
                'estimated_hours' => 4,
                'dependencies' => [],
            ],
            [
                'title' => 'Create Implementation Plan',
                'description' => 'Develop a detailed plan for implementing: ' . $description,
                'type' => 'task',
                'priority' => 'medium',
                'estimated_hours' => 6,
                'dependencies' => [],
            ],
            [
                'title' => 'Execute Implementation',
                'description' => 'Implement the planned solution for: ' . $description,
                'type' => 'task',
                'priority' => 'critical',
                'estimated_hours' => 16,
                'dependencies' => [],
            ],
            [
                'title' => 'Review and Test',
                'description' => 'Review and test the implementation of: ' . $description,
                'type' => 'task',
                'priority' => 'high',
                'estimated_hours' => 8,
                'dependencies' => [],
            ],
        ];
    }

    /**
     * Get fallback timeline when AI generation fails.
     */
    protected function getFallbackTimeline(array $projectData): array
    {
        return [
            'total_days' => 60,
            'phases' => [
                ['name' => 'Planning', 'days' => 10],
                ['name' => 'Execution', 'days' => 40],
                ['name' => 'Review', 'days' => 10],
            ],
            'buffer_percentage' => 20,
            'risk_factors' => ['scope_creep', 'resource_availability'],
        ];
    }

    /**
     * Get fallback resources when AI generation fails.
     */
    protected function getFallbackResources(array $projectData): array
    {
        return [
            'team_roles' => [
                ['role' => 'Project Manager', 'count' => 1, 'priority' => 'critical'],
                ['role' => 'Team Lead', 'count' => 1, 'priority' => 'high'],
                ['role' => 'Team Member', 'count' => 2, 'priority' => 'medium'],
            ],
            'budget_allocation' => [
                'personnel' => 70,
                'tools' => 15,
                'infrastructure' => 10,
                'contingency' => 5,
            ],
            'recommended_tools' => ['project_management_software', 'communication_tools'],
            'external_resources' => ['training', 'consultation'],
        ];
    }

    /**
     * Get fallback prioritization when AI generation fails.
     */
    protected function getFallbackPrioritization(array $tasks): array
    {
        $priorities = [];
        foreach ($tasks as $index => $task) {
            $priorities[] = [
                'task_index' => $index,
                'priority' => 'medium',
                'reasoning' => 'Default prioritization applied',
            ];
        }
        return $priorities;
    }
}
