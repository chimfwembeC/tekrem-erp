<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Services\ProjectPlanningAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProjectPlanningController extends Controller
{
    protected ProjectPlanningAIService $planningService;

    public function __construct(ProjectPlanningAIService $planningService)
    {
        $this->planningService = $planningService;
    }

    /**
     * Generate AI-powered milestones for a project.
     */
    public function generateMilestones(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'priority' => 'nullable|in:low,medium,high,critical',
            'budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'deadline' => 'nullable|date',
            'team_members' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $projectData = $validator->validated();
            $milestones = $this->planningService->generateMilestones($projectData);

            return response()->json([
                'success' => true,
                'message' => 'Milestones generated successfully',
                'data' => [
                    'milestones' => $milestones,
                    'count' => count($milestones),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate AI milestones: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate milestones. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Generate intelligent tasks from natural language description.
     */
    public function generateTasks(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'description' => 'required|string|min:10',
            'project_name' => 'nullable|string|max:255',
            'milestone' => 'nullable|string|max:255',
            'team_size' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $description = $request->input('description');
            $context = [
                'project_name' => $request->input('project_name'),
                'milestone' => $request->input('milestone'),
                'team_size' => $request->input('team_size'),
                'description' => $description,
            ];

            $tasks = $this->planningService->generateTasks($description, $context);

            return response()->json([
                'success' => true,
                'message' => 'Tasks generated successfully',
                'data' => [
                    'tasks' => $tasks,
                    'count' => count($tasks),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate AI tasks: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate tasks. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Estimate project timeline using AI.
     */
    public function estimateTimeline(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'team_members' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $projectData = $validator->validated();
            $timeline = $this->planningService->estimateTimeline($projectData);

            return response()->json([
                'success' => true,
                'message' => 'Timeline estimated successfully',
                'data' => $timeline,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to estimate timeline: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to estimate timeline. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Generate resource recommendations.
     */
    public function recommendResources(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'budget' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $projectData = $validator->validated();
            $resources = $this->planningService->recommendResources($projectData);

            return response()->json([
                'success' => true,
                'message' => 'Resource recommendations generated successfully',
                'data' => $resources,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate resource recommendations: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate resource recommendations. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Smart prioritization of tasks.
     */
    public function prioritizeTasks(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tasks' => 'required|array|min:1',
            'tasks.*.title' => 'required|string|max:255',
            'tasks.*.description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'team_capacity' => 'nullable|string',
            'goals' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $tasks = $request->input('tasks');
            $context = [
                'deadline' => $request->input('deadline'),
                'team_capacity' => $request->input('team_capacity'),
                'goals' => $request->input('goals'),
            ];

            $priorities = $this->planningService->prioritizeTasks($tasks, $context);

            return response()->json([
                'success' => true,
                'message' => 'Task prioritization completed successfully',
                'data' => [
                    'priorities' => $priorities,
                    'count' => count($priorities),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to prioritize tasks: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to prioritize tasks. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Generate comprehensive project plan with all AI features.
     */
    public function generateComprehensivePlan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'priority' => 'nullable|in:low,medium,high,critical',
            'budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'deadline' => 'nullable|date',
            'team_members' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $projectData = $validator->validated();

            // Generate all AI recommendations
            $milestones = $this->planningService->generateMilestones($projectData);
            $timeline = $this->planningService->estimateTimeline($projectData);
            $resources = $this->planningService->recommendResources($projectData);

            return response()->json([
                'success' => true,
                'message' => 'Comprehensive project plan generated successfully',
                'data' => [
                    'milestones' => $milestones,
                    'timeline' => $timeline,
                    'resources' => $resources,
                    'project_data' => $projectData,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate comprehensive plan: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate comprehensive plan. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
