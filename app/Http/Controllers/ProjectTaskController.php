<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\User;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectTaskController extends Controller
{
    /**
     * Display a listing of tasks for a project.
     */
    public function index(Request $request, Project $project)
    {
        $query = $project->tasks()->with(['assignee', 'creator', 'milestone', 'tags']);

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $tasks = $query->orderBy('order')->paginate(15);

        // Get staff users for filter dropdown (only admin and staff roles)
        $staffUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->select('id', 'name')->get();

        return Inertia::render('Projects/Tasks/Index', [
            'project' => $project,
            'tasks' => $tasks,
            'staffUsers' => $staffUsers,
            'filters' => $request->only(['search', 'status', 'type', 'priority', 'assigned_to']),
        ]);
    }

    /**
     * Show the form for creating a new task.
     */
    public function create(Project $project)
    {
        $milestones = $project->milestones()->select('id', 'name')->get();
        
        // Get staff users only (admin and staff roles)
        $staffUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->select('id', 'name')->get();

        $availableTasks = $project->tasks()->select('id', 'title')->get();
        $tags = Tag::active()->ofType('task')->select('id', 'name', 'color')->get();

        return Inertia::render('Projects/Tasks/Create', [
            'project' => $project,
            'milestones' => $milestones,
            'staffUsers' => $staffUsers,
            'availableTasks' => $availableTasks,
            'tags' => $tags,
        ]);
    }

    /**
     * Store a newly created task.
     */
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:task,issue,bug,feature,improvement',
            'priority' => 'required|in:low,medium,high,critical',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'start_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'dependencies' => 'nullable|array',
            'dependencies.*' => 'exists:project_tasks,id',
            'parent_task_id' => 'nullable|exists:project_tasks,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        // Validate that assigned user is staff/admin
        if ($validated['assigned_to']) {
            $user = User::find($validated['assigned_to']);
            if (!$user->hasRole(['admin', 'staff'])) {
                return back()->withErrors(['assigned_to' => 'Tasks can only be assigned to staff members or administrators.']);
            }
        }

        // Set the order as the next in sequence
        $validated['order'] = $project->tasks()->max('order') + 1;
        $validated['project_id'] = $project->id;
        $validated['created_by'] = Auth::id();

        $task = ProjectTask::create($validated);

        // Attach tags if provided
        if (!empty($validated['tags'])) {
            $task->tags()->attach($validated['tags']);
        }

        return redirect()->route('projects.tasks.show', [$project, $task])
            ->with('success', 'Task created successfully.');
    }

    /**
     * Display the specified task.
     */
    public function show(Project $project, ProjectTask $task)
    {
        $task->load(['assignee', 'creator', 'milestone', 'parentTask', 'subtasks', 'tags', 'timeLogs.user']);

        return Inertia::render('Projects/Tasks/Show', [
            'project' => $project,
            'task' => $task,
        ]);
    }

    /**
     * Show the form for editing the task.
     */
    public function edit(Project $project, ProjectTask $task)
    {
        $task->load('tags');
        $milestones = $project->milestones()->select('id', 'name')->get();
        
        // Get staff users only
        $staffUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->select('id', 'name')->get();

        $availableTasks = $project->tasks()
            ->where('id', '!=', $task->id)
            ->select('id', 'title')
            ->get();
        
        $tags = Tag::active()->ofType('task')->select('id', 'name', 'color')->get();

        return Inertia::render('Projects/Tasks/Edit', [
            'project' => $project,
            'task' => $task,
            'milestones' => $milestones,
            'staffUsers' => $staffUsers,
            'availableTasks' => $availableTasks,
            'tags' => $tags,
        ]);
    }

    /**
     * Update the specified task.
     */
    public function update(Request $request, Project $project, ProjectTask $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:task,issue,bug,feature,improvement',
            'status' => 'required|in:todo,in-progress,review,testing,done,cancelled',
            'priority' => 'required|in:low,medium,high,critical',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'start_date' => 'nullable|date',
            'progress' => 'nullable|integer|min:0|max:100',
            'estimated_hours' => 'nullable|numeric|min:0',
            'actual_hours' => 'nullable|numeric|min:0',
            'dependencies' => 'nullable|array',
            'dependencies.*' => 'exists:project_tasks,id',
            'parent_task_id' => 'nullable|exists:project_tasks,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        // Validate that assigned user is staff/admin
        if ($validated['assigned_to']) {
            $user = User::find($validated['assigned_to']);
            if (!$user->hasRole(['admin', 'staff'])) {
                return back()->withErrors(['assigned_to' => 'Tasks can only be assigned to staff members or administrators.']);
            }
        }

        $task->update($validated);

        // Sync tags
        if (isset($validated['tags'])) {
            $task->tags()->sync($validated['tags']);
        }

        // Update task status based on progress
        $task->updateStatus();

        return redirect()->route('projects.tasks.show', [$project, $task])
            ->with('success', 'Task updated successfully.');
    }

    /**
     * Remove the specified task.
     */
    public function destroy(Project $project, ProjectTask $task)
    {
        $task->delete();

        return redirect()->route('projects.tasks.index', $project)
            ->with('success', 'Task deleted successfully.');
    }

    /**
     * Update task status.
     */
    public function updateStatus(Request $request, Project $project, ProjectTask $task)
    {
        $validated = $request->validate([
            'status' => 'required|in:todo,in-progress,review,testing,done,cancelled',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $task->update($validated);

        if ($validated['status'] === 'done') {
            $task->markCompleted();
        } else {
            $task->updateStatus();
        }

        return back()->with('success', 'Task status updated successfully.');
    }

    /**
     * Get my tasks (assigned to current user).
     */
    public function myTasks(Request $request)
    {
        $query = ProjectTask::with(['project', 'milestone', 'tags'])
            ->where('assigned_to', Auth::id());

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $tasks = $query->orderBy('due_date')->paginate(15);

        return Inertia::render('Projects/Tasks/MyTasks', [
            'tasks' => $tasks,
            'filters' => $request->only(['status', 'priority']),
        ]);
    }
}
