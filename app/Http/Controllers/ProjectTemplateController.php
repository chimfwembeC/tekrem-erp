<?php

namespace App\Http\Controllers;

use App\Models\ProjectTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectTemplateController extends Controller
{
    /**
     * Display a listing of project templates.
     */
    public function index(Request $request)
    {
        $query = ProjectTemplate::with('creator');

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('category', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('category')) {
            $query->where('category', 'like', '%' . $request->category . '%');
        }

        if ($request->filled('status')) {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        $templates = $query->latest()->paginate(12);

        return Inertia::render('Projects/Templates/Index', [
            'templates' => $templates,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new template.
     */
    public function create()
    {
        return Inertia::render('Projects/Templates/Create');
    }

    /**
     * Store a newly created template.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'template_data' => 'required|array',
            'template_data.milestones' => 'nullable|array',
            'template_data.milestones.*.name' => 'required|string|max:255',
            'template_data.milestones.*.description' => 'nullable|string',
            'template_data.milestones.*.priority' => 'required|in:low,medium,high,critical',
            'template_data.default_budget' => 'nullable|numeric|min:0',
            'template_data.estimated_duration' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = Auth::id();

        $template = ProjectTemplate::create($validated);

        return redirect()->route('projects.templates.show', $template)
            ->with('success', 'Project template created successfully.');
    }

    /**
     * Display the specified template.
     */
    public function show(ProjectTemplate $template)
    {
        $template->load('creator', 'projects');

        return Inertia::render('Projects/Templates/Show', [
            'template' => $template,
        ]);
    }

    /**
     * Show the form for editing the template.
     */
    public function edit(ProjectTemplate $template)
    {
        return Inertia::render('Projects/Templates/Edit', [
            'template' => $template,
        ]);
    }

    /**
     * Update the specified template.
     */
    public function update(Request $request, ProjectTemplate $template)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'template_data' => 'required|array',
            'template_data.milestones' => 'nullable|array',
            'template_data.milestones.*.name' => 'required|string|max:255',
            'template_data.milestones.*.description' => 'nullable|string',
            'template_data.milestones.*.priority' => 'required|in:low,medium,high,critical',
            'template_data.default_budget' => 'nullable|numeric|min:0',
            'template_data.estimated_duration' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return redirect()->route('projects.templates.show', $template)
            ->with('success', 'Project template updated successfully.');
    }

    /**
     * Remove the specified template.
     */
    public function destroy(ProjectTemplate $template)
    {
        $template->delete();

        return redirect()->route('projects.templates.index')
            ->with('success', 'Project template deleted successfully.');
    }

    /**
     * Duplicate the specified template.
     */
    public function duplicate(ProjectTemplate $template)
    {
        $newTemplate = $template->replicate();
        $newTemplate->name = $template->name . ' (Copy)';
        $newTemplate->usage_count = 0;
        $newTemplate->created_by = Auth::id();
        $newTemplate->save();

        return redirect()->route('projects.templates.edit', $newTemplate)
            ->with('success', 'Template duplicated successfully.');
    }
}
