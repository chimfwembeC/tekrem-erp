<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectMilestone;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectMilestoneController extends Controller
{
    /**
     * Display a listing of milestones for a project.
     */
    public function index(Request $request, Project $project)
    {
        $query = $project->milestones()->with('assignee');

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $milestones = $query->orderBy('order')->paginate(10);

        return Inertia::render('Projects/Milestones/Index', [
            'project' => $project,
            'milestones' => $milestones,
            'filters' => $request->only(['search', 'status', 'priority']),
        ]);
    }

    /**
     * Show the form for creating a new milestone.
     */
    public function create(Project $project)
    {
        $users = User::select('id', 'name')->get();

        return Inertia::render('Projects/Milestones/Create', [
            'project' => $project,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created milestone.
     */
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high,critical',
            'assigned_to' => 'nullable|exists:users,id',
            'dependencies' => 'nullable|array',
            'dependencies.*' => 'exists:project_milestones,id',
        ]);

        // Set the order as the next in sequence
        $validated['order'] = $project->milestones()->max('order') + 1;
        $validated['project_id'] = $project->id;

        $milestone = ProjectMilestone::create($validated);

        return redirect()->route('projects.milestones.show', [$project, $milestone])
            ->with('success', 'Milestone created successfully.');
    }

    /**
     * Display the specified milestone.
     */
    public function show(Project $project, ProjectMilestone $milestone)
    {
        $milestone->load('assignee', 'files', 'timeLogs.user');

        return Inertia::render('Projects/Milestones/Show', [
            'project' => $project,
            'milestone' => $milestone,
        ]);
    }

    /**
     * Show the form for editing the milestone.
     */
    public function edit(Project $project, ProjectMilestone $milestone)
    {
        $users = User::select('id', 'name')->get();
        $availableDependencies = $project->milestones()
            ->where('id', '!=', $milestone->id)
            ->select('id', 'name')
            ->get();

        return Inertia::render('Projects/Milestones/Edit', [
            'project' => $project,
            'milestone' => $milestone,
            'users' => $users,
            'availableDependencies' => $availableDependencies,
        ]);
    }

    /**
     * Update the specified milestone.
     */
    public function update(Request $request, Project $project, ProjectMilestone $milestone)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high,critical',
            'assigned_to' => 'nullable|exists:users,id',
            'dependencies' => 'nullable|array',
            'dependencies.*' => 'exists:project_milestones,id',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $milestone->update($validated);

        // Update milestone status based on progress
        $milestone->updateStatus();

        return redirect()->route('projects.milestones.show', [$project, $milestone])
            ->with('success', 'Milestone updated successfully.');
    }

    /**
     * Remove the specified milestone.
     */
    public function destroy(Project $project, ProjectMilestone $milestone)
    {
        $milestone->delete();

        return redirect()->route('projects.milestones.index', $project)
            ->with('success', 'Milestone deleted successfully.');
    }

    /**
     * Update milestone status.
     */
    public function updateStatus(Request $request, Project $project, ProjectMilestone $milestone)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in-progress,completed,overdue',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $milestone->update($validated);

        if ($validated['status'] === 'completed') {
            $milestone->markCompleted();
        } else {
            $milestone->updateStatus();
        }

        return back()->with('success', 'Milestone status updated successfully.');
    }
}
