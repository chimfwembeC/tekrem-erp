<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectTimeLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectTimeLogController extends Controller
{
    /**
     * Display a listing of time logs for a project.
     */
    public function index(Request $request, Project $project)
    {
        $query = $project->timeLogs()->with(['user', 'milestone']);

        // Apply filters
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('date_from')) {
            $query->where('log_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('log_date', '<=', $request->date_to);
        }

        $timeLogs = $query->latest('log_date')->paginate(15);

        // Get users for filter dropdown
        $users = User::select('id', 'name')->get();

        return Inertia::render('Projects/TimeLogs/Index', [
            'project' => $project,
            'timeLogs' => $timeLogs,
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'user_id', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the form for creating a new time log.
     */
    public function create(Project $project)
    {
        $milestones = $project->milestones()->select('id', 'name')->get();
        $users = User::select('id', 'name')->get();

        return Inertia::render('Projects/TimeLogs/Create', [
            'project' => $project,
            'milestones' => $milestones,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created time log.
     */
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
            'hours' => 'required|numeric|min:0.1|max:24',
            'log_date' => 'required|date',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'user_id' => 'required|exists:users,id',
            'is_billable' => 'boolean',
            'hourly_rate' => 'nullable|numeric|min:0',
        ]);

        $validated['project_id'] = $project->id;

        $timeLog = ProjectTimeLog::create($validated);

        return redirect()->route('projects.time-logs.index', $project)
            ->with('success', 'Time log created successfully.');
    }

    /**
     * Display the specified time log.
     */
    public function show(Project $project, ProjectTimeLog $timeLog)
    {
        $timeLog->load('user', 'milestone');

        return Inertia::render('Projects/TimeLogs/Show', [
            'project' => $project,
            'timeLog' => $timeLog,
        ]);
    }

    /**
     * Show the form for editing the time log.
     */
    public function edit(Project $project, ProjectTimeLog $timeLog)
    {
        $milestones = $project->milestones()->select('id', 'name')->get();
        $users = User::select('id', 'name')->get();

        return Inertia::render('Projects/TimeLogs/Edit', [
            'project' => $project,
            'timeLog' => $timeLog,
            'milestones' => $milestones,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified time log.
     */
    public function update(Request $request, Project $project, ProjectTimeLog $timeLog)
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
            'hours' => 'required|numeric|min:0.1|max:24',
            'log_date' => 'required|date',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'user_id' => 'required|exists:users,id',
            'is_billable' => 'boolean',
            'hourly_rate' => 'nullable|numeric|min:0',
        ]);

        $timeLog->update($validated);

        return redirect()->route('projects.time-logs.show', [$project, $timeLog])
            ->with('success', 'Time log updated successfully.');
    }

    /**
     * Remove the specified time log.
     */
    public function destroy(Project $project, ProjectTimeLog $timeLog)
    {
        $timeLog->delete();

        return redirect()->route('projects.time-logs.index', $project)
            ->with('success', 'Time log deleted successfully.');
    }

    /**
     * Submit time log for approval.
     */
    public function submit(Project $project, ProjectTimeLog $timeLog)
    {
        $timeLog->submit();

        return back()->with('success', 'Time log submitted for approval.');
    }

    /**
     * Approve time log.
     */
    public function approve(Project $project, ProjectTimeLog $timeLog)
    {
        $timeLog->approve();

        return back()->with('success', 'Time log approved successfully.');
    }
}
