<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Client;
use App\Models\User;
use App\Models\ProjectTemplate;
use App\Models\ProjectTimeLog;
use App\Models\Tag;
use App\Services\ProjectPlanningAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display the projects dashboard.
     */
    public function dashboard()
    {
        $user = Auth::user();

        // Get analytics data
        $analytics = [
            'total_projects' => Project::count(),
            'active_projects' => Project::where('status', 'active')->count(),
            'completed_projects' => Project::where('status', 'completed')->count(),
            'overdue_projects' => Project::overdue()->count(),
            'total_budget' => Project::sum('budget'),
            'total_spent' => Project::sum('spent_amount'),
        ];

        // Get recent projects
        $recentProjects = Project::with(['client', 'manager'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($project) {
                // Load team members from JSON array
                if ($project->team_members) {
                    $project->team = User::whereIn('id', $project->team_members)->get();
                }
                return $project;
            });

        // Get overdue projects
        $overdueProjects = Project::with(['client', 'manager'])
            ->overdue()
            ->limit(5)
            ->get()
            ->map(function ($project) {
                // Load team members from JSON array
                if ($project->team_members) {
                    $project->team = User::whereIn('id', $project->team_members)->get();
                }
                return $project;
            });

        // Get upcoming deadlines (next 30 days)
        $upcomingDeadlines = Project::with(['client', 'manager'])
            ->where('deadline', '>=', now())
            ->where('deadline', '<=', now()->addDays(30))
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->orderBy('deadline')
            ->limit(10)
            ->get()
            ->map(function ($project) {
                // Load team members from JSON array
                if ($project->team_members) {
                    $project->team = User::whereIn('id', $project->team_members)->get();
                }
                return $project;
            });

        return Inertia::render('Projects/Dashboard', [
            'analytics' => $analytics,
            'recentProjects' => $recentProjects,
            'overdueProjects' => $overdueProjects,
            'upcomingDeadlines' => $upcomingDeadlines,
        ]);
    }

    /**
     * Display a listing of projects.
     */
    public function index(Request $request)
    {
        $query = Project::with(['client', 'manager', 'milestones']);

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('category', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category')) {
            $query->where('category', 'like', '%' . $request->category . '%');
        }

        $projects = $query->latest()->paginate(12);

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'status', 'priority', 'category']),
        ]);
    }

    /**
     * Show the form for creating a new project.
     */
    public function create()
    {
        $clients = Client::select('id', 'name', 'company')->get();

        // Get only staff and admin users for team members
        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->select('id', 'name')->get();

        $templates = ProjectTemplate::where('is_active', true)->get();
        $tags = Tag::active()->ofType('project')->select('id', 'name', 'color')->get();

        return Inertia::render('Projects/Create', [
            'clients' => $clients,
            'users' => $users,
            'templates' => $templates,
            'tags' => $tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'color' => $tag->color,
                    'slug' => $tag->slug,
                ];
            }),
        ]);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:draft,active,on-hold,completed,cancelled',
            'priority' => 'required|in:low,medium,high,critical',
            'category' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'deadline' => 'nullable|date',
            'budget' => 'nullable|numeric|min:0',
            'client_id' => 'nullable|exists:clients,id',
            'manager_id' => 'required|exists:users,id',
            'team_members' => 'nullable|array',
            'team_members.*' => 'exists:users,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:255',
            'template_id' => 'nullable|exists:project_templates,id',
            'generate_ai_milestones' => 'nullable|boolean',
        ]);

        // Validate that team members are staff/admin
        if (!empty($validated['team_members'])) {
            $staffUsers = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['admin', 'staff']);
            })->whereIn('id', $validated['team_members'])->count();

            if ($staffUsers !== count($validated['team_members'])) {
                return back()->withErrors(['team_members' => 'Team members must be staff or administrators.']);
            }
        }

        DB::beginTransaction();
        try {
            // Create project from template if specified
            if ($request->filled('template_id')) {
                $template = ProjectTemplate::findOrFail($request->template_id);
                $project = $template->createProject($validated);
            } else {
                $project = Project::create($validated);

                // Generate AI milestones if requested and no template is used
                if ($request->boolean('generate_ai_milestones')) {
                    $this->generateAIMilestones($project, $validated);
                }
            }

            // Process and attach tags if provided
            if (!empty($validated['tags'])) {
                $tagIds = $this->processProjectTags($validated['tags']);
                $project->projectTags()->attach($tagIds);
            }

            DB::commit();

            $message = 'Project created successfully.';
            if ($request->boolean('generate_ai_milestones') && !$request->filled('template_id')) {
                $message .= ' AI-generated milestones have been added.';
            }

            return redirect()->route('projects.show', $project)
                ->with('success', $message);
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to create project: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project)
    {
        $project->load([
            'client',
            'manager',
            'milestones.assignee',
            'files.uploader',
            'timeLogs.user',
            'conversations'
        ]);

        // Load team members from JSON array
        if ($project->team_members) {
            $project->team = User::whereIn('id', $project->team_members)->get();
        } else {
            $project->team = collect();
        }

        // Calculate additional metrics
        $project->total_hours = $project->timeLogs->sum('hours');
        $project->total_billable_amount = $project->timeLogs
            ->where('is_billable', true)
            ->sum(function ($log) {
                return $log->hours * ($log->hourly_rate ?? 0);
            });

        return Inertia::render('Projects/Show', [
            'project' => $project,
        ]);
    }

    /**
     * Show the form for editing the project.
     */
    public function edit(Project $project)
    {
        $project->load('projectTags');
        $clients = Client::select('id', 'name', 'company')->get();

        // Get only staff and admin users for team members
        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->select('id', 'name')->get();

        $tags = Tag::active()->ofType('project')->select('id', 'name', 'color')->get();

        return Inertia::render('Projects/Edit', [
            'project' => $project,
            'clients' => $clients,
            'users' => $users,
            'tags' => $tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'color' => $tag->color,
                    'slug' => $tag->slug,
                ];
            }),
            'selectedTags' => $project->projectTags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'color' => $tag->color,
                    'slug' => $tag->slug,
                ];
            }),
        ]);
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:draft,active,on-hold,completed,cancelled',
            'priority' => 'required|in:low,medium,high,critical',
            'category' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'deadline' => 'nullable|date',
            'budget' => 'nullable|numeric|min:0',
            'client_id' => 'nullable|exists:clients,id',
            'manager_id' => 'required|exists:users,id',
            'team_members' => 'nullable|array',
            'team_members.*' => 'exists:users,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:255',
        ]);

        // Validate that team members are staff/admin
        if (!empty($validated['team_members'])) {
            $staffUsers = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['admin', 'staff']);
            })->whereIn('id', $validated['team_members'])->count();

            if ($staffUsers !== count($validated['team_members'])) {
                return back()->withErrors(['team_members' => 'Team members must be staff or administrators.']);
            }
        }

        $project->update($validated);

        // Process and sync tags
        if (isset($validated['tags'])) {
            $tagIds = $this->processProjectTags($validated['tags']);
            $project->projectTags()->sync($tagIds);
        }

        return redirect()->route('projects.show', $project)
            ->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Project deleted successfully.');
    }

    /**
     * Display the Kanban board for a project.
     */
    public function kanban(Project $project)
    {
        $project->load(['milestones.assignee']);

        return Inertia::render('Projects/Kanban', [
            'project' => $project,
            'milestones' => $project->milestones,
        ]);
    }

    /**
     * Display project analytics.
     */
    public function analytics()
    {
        // Get comprehensive analytics data
        $analytics = [
            'total_projects' => Project::count(),
            'active_projects' => Project::where('status', 'active')->count(),
            'completed_projects' => Project::where('status', 'completed')->count(),
            'overdue_projects' => Project::overdue()->count(),
            'total_budget' => Project::sum('budget'),
            'total_spent' => Project::sum('spent_amount'),
            'average_completion_time' => Project::where('status', 'completed')
                ->whereNotNull('start_date')
                ->whereNotNull('end_date')
                ->get()
                ->avg(function ($project) {
                    return $project->start_date->diffInDays($project->end_date);
                }),
            'team_utilization' => User::withCount(['managedProjects as active_projects' => function ($query) {
                    $query->where('status', 'active');
                }])
                ->get()
                ->map(function ($user) {
                    // Get time logs for this user in the last 30 days
                    $timeLogs = ProjectTimeLog::where('user_id', $user->id)
                        ->whereBetween('log_date', [now()->subDays(30), now()])
                        ->get();

                    $totalHours = $timeLogs->sum('hours');

                    return [
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'active_projects' => $user->active_projects,
                        'total_hours' => $totalHours,
                        'utilization_percentage' => min(100, ($totalHours / 160) * 100), // Assuming 160 hours per month
                    ];
                }),
            'project_status_distribution' => Project::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
                ->map(function ($item) {
                    $total = Project::count();
                    return [
                        'status' => $item->status,
                        'count' => $item->count,
                        'percentage' => $total > 0 ? round(($item->count / $total) * 100, 1) : 0,
                    ];
                }),
            'monthly_completion_trend' => Project::select(
                    DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                    DB::raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed'),
                    DB::raw('COUNT(*) as started')
                )
                ->where('created_at', '>=', now()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month')
                ->get(),
        ];

        return Inertia::render('Projects/Analytics', [
            'analytics' => $analytics,
        ]);
    }

    /**
     * Process project tags, creating new ones if they don't exist.
     */
    protected function processProjectTags(array $tags): array
    {
        $tagIds = [];

        foreach ($tags as $tagInput) {
            // If it's already a numeric ID, use it directly
            if (is_numeric($tagInput)) {
                $tagIds[] = (int) $tagInput;
                continue;
            }

            // If it's a string, find or create the tag
            if (is_string($tagInput) && !empty(trim($tagInput))) {
                $tag = Tag::findOrCreateByName(trim($tagInput), 'project');
                $tagIds[] = $tag->id;
            }
        }

        return array_unique($tagIds);
    }

    /**
     * Generate AI milestones for a project.
     */
    protected function generateAIMilestones(Project $project, array $projectData)
    {
        try {
            $aiService = app(ProjectPlanningAIService::class);
            $milestones = $aiService->generateMilestones($projectData);

            foreach ($milestones as $milestoneData) {
                $project->milestones()->create([
                    'name' => $milestoneData['name'],
                    'description' => $milestoneData['description'],
                    'priority' => $milestoneData['priority'],
                    'order' => $milestoneData['order'],
                    'dependencies' => $milestoneData['dependencies'] ?? [],
                    'metadata' => [
                        'ai_generated' => true,
                        'estimated_days' => $milestoneData['estimated_days'],
                        'generated_at' => now()->toISOString(),
                    ],
                ]);
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the project creation
            \Log::warning('Failed to generate AI milestones for project ' . $project->id . ': ' . $e->getMessage());
        }
    }
}
