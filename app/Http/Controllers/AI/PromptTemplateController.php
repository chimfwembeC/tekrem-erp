<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\AI\PromptTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PromptTemplateController extends Controller
{
    /**
     * Display a listing of prompt templates.
     */
    public function index(Request $request)
    {
        $query = PromptTemplate::query()
            ->with('user')
            ->when($request->search, function ($query, $search) {
                $query->search($search);
            })
            ->when($request->category, function ($query, $category) {
                $query->byCategory($category);
            })
            ->when($request->visibility, function ($query, $visibility) {
                if ($visibility === 'public') {
                    $query->where('is_public', true);
                } elseif ($visibility === 'private') {
                    $query->where('is_public', false)->where('user_id', Auth::id());
                } elseif ($visibility === 'system') {
                    $query->where('is_system', true);
                }
            })
            ->when($request->tags, function ($query, $tags) {
                $tagsArray = is_string($tags) ? explode(',', $tags) : $tags;
                $query->byTags($tagsArray);
            });

        // If no specific visibility filter, show accessible templates
        if (!$request->visibility) {
            $query->accessibleBy(Auth::id());
        }

        $templates = $query->orderBy('usage_count', 'desc')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $categories = PromptTemplate::distinct()->pluck('category')->filter()->sort()->values();
        $allTags = PromptTemplate::whereNotNull('tags')
            ->get()
            ->pluck('tags')
            ->flatten()
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('AI/PromptTemplates/Index', [
            'templates' => $templates,
            'categories' => $categories,
            'tags' => $allTags,
            'filters' => $request->only(['search', 'category', 'visibility', 'tags']),
        ]);
    }

    /**
     * Show the form for creating a new template.
     */
    public function create()
    {
        $categories = PromptTemplate::distinct()->pluck('category')->filter()->sort()->values();
        $allTags = PromptTemplate::whereNotNull('tags')
            ->get()
            ->pluck('tags')
            ->flatten()
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('AI/PromptTemplates/Create', [
            'categories' => $categories,
            'tags' => $allTags,
        ]);
    }

    /**
     * Store a newly created template.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'template' => ['required', 'string'],
            'variables' => ['array'],
            'example_data' => ['array'],
            'is_public' => ['boolean'],
            'tags' => ['array'],
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        // Ensure slug is unique
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (PromptTemplate::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Set user ID
        $validated['user_id'] = Auth::id();

        // Extract variables from template if not provided
        if (empty($validated['variables'])) {
            $template = new PromptTemplate(['template' => $validated['template']]);
            $validated['variables'] = $template->extractVariables();
        }

        $template = PromptTemplate::create($validated);

        return redirect()->route('ai.prompt-templates.show', $template)
            ->with('success', 'Prompt template created successfully.');
    }

    /**
     * Display the specified template.
     */
    public function show(PromptTemplate $promptTemplate)
    {
        $promptTemplate->load('user');

        // Check if user can view this template
        if (!$promptTemplate->is_public && !$promptTemplate->is_system && $promptTemplate->user_id !== Auth::id()) {
            abort(403, 'You do not have permission to view this template.');
        }

        return Inertia::render('AI/PromptTemplates/Show', [
            'template' => $promptTemplate,
        ]);
    }

    /**
     * Show the form for editing the specified template.
     */
    public function edit(PromptTemplate $promptTemplate)
    {
        // Check if user can edit this template
        if ($promptTemplate->is_system || ($promptTemplate->user_id !== Auth::id() && !$promptTemplate->is_public)) {
            abort(403, 'You do not have permission to edit this template.');
        }

        $promptTemplate->load('user');
        $categories = PromptTemplate::distinct()->pluck('category')->filter()->sort()->values();
        $allTags = PromptTemplate::whereNotNull('tags')
            ->get()
            ->pluck('tags')
            ->flatten()
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('AI/PromptTemplates/Edit', [
            'template' => $promptTemplate,
            'categories' => $categories,
            'tags' => $allTags,
        ]);
    }

    /**
     * Update the specified template.
     */
    public function update(Request $request, PromptTemplate $promptTemplate)
    {
        // Check if user can edit this template
        if ($promptTemplate->is_system || ($promptTemplate->user_id !== Auth::id() && !$promptTemplate->is_public)) {
            abort(403, 'You do not have permission to edit this template.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'template' => ['required', 'string'],
            'variables' => ['array'],
            'example_data' => ['array'],
            'is_public' => ['boolean'],
            'tags' => ['array'],
        ]);

        // Update slug if name changed
        if ($validated['name'] !== $promptTemplate->name) {
            $newSlug = Str::slug($validated['name']);
            
            // Ensure slug is unique (excluding current template)
            $originalSlug = $newSlug;
            $counter = 1;
            while (PromptTemplate::where('slug', $newSlug)->where('id', '!=', $promptTemplate->id)->exists()) {
                $newSlug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            $validated['slug'] = $newSlug;
        }

        // Extract variables from template if not provided
        if (empty($validated['variables'])) {
            $template = new PromptTemplate(['template' => $validated['template']]);
            $validated['variables'] = $template->extractVariables();
        }

        $promptTemplate->update($validated);

        return redirect()->route('ai.prompt-templates.show', $promptTemplate)
            ->with('success', 'Prompt template updated successfully.');
    }

    /**
     * Remove the specified template.
     */
    public function destroy(PromptTemplate $promptTemplate)
    {
        // Check if user can delete this template
        if ($promptTemplate->is_system || ($promptTemplate->user_id !== Auth::id() && !Auth::user()->hasRole('admin'))) {
            abort(403, 'You do not have permission to delete this template.');
        }

        $promptTemplate->delete();

        return redirect()->route('ai.prompt-templates.index')
            ->with('success', 'Prompt template deleted successfully.');
    }

    /**
     * Duplicate the specified template.
     */
    public function duplicate(PromptTemplate $promptTemplate)
    {
        $newTemplate = $promptTemplate->replicate();
        $newTemplate->name = $promptTemplate->name . ' (Copy)';
        $newTemplate->slug = Str::slug($newTemplate->name);
        $newTemplate->user_id = Auth::id();
        $newTemplate->is_public = false;
        $newTemplate->is_system = false;
        $newTemplate->usage_count = 0;
        $newTemplate->avg_rating = null;

        // Ensure slug is unique
        $originalSlug = $newTemplate->slug;
        $counter = 1;
        while (PromptTemplate::where('slug', $newTemplate->slug)->exists()) {
            $newTemplate->slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $newTemplate->save();

        return redirect()->route('ai.prompt-templates.show', $newTemplate)
            ->with('success', 'Template duplicated successfully.');
    }

    /**
     * Rate the specified template.
     */
    public function rate(Request $request, PromptTemplate $promptTemplate)
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $promptTemplate->addRating($validated['rating']);

        return response()->json([
            'success' => true,
            'message' => 'Rating added successfully.',
            'avg_rating' => $promptTemplate->fresh()->avg_rating
        ]);
    }

    /**
     * Render the template with provided data.
     */
    public function render(Request $request, PromptTemplate $promptTemplate)
    {
        $validated = $request->validate([
            'data' => ['required', 'array'],
        ]);

        // Validate that all required variables are provided
        $validation = $promptTemplate->validateData($validated['data']);

        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'message' => 'Missing required variables: ' . implode(', ', $validation['missing_variables']),
                'missing_variables' => $validation['missing_variables'],
                'required_variables' => $validation['required_variables']
            ], 400);
        }

        $renderedTemplate = $promptTemplate->render($validated['data']);

        // Increment usage count
        $promptTemplate->incrementUsage();

        return response()->json([
            'success' => true,
            'rendered_template' => $renderedTemplate,
            'usage_count' => $promptTemplate->fresh()->usage_count
        ]);
    }

    /**
     * Get template statistics.
     */
    public function statistics(Request $request)
    {
        $period = $request->get('period', '30 days');
        $userId = $request->get('user_id');

        $query = PromptTemplate::query();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $query->where('created_at', '>=', now()->sub($period));

        $stats = [
            'total_templates' => $query->count(),
            'public_templates' => $query->where('is_public', true)->count(),
            'private_templates' => $query->where('is_public', false)->where('is_system', false)->count(),
            'system_templates' => $query->where('is_system', true)->count(),
            'total_usage' => $query->sum('usage_count'),
            'avg_rating' => $query->whereNotNull('avg_rating')->avg('avg_rating'),
        ];

        // Get templates by category
        $byCategory = $query->groupBy('category')
            ->selectRaw('category, count(*) as count')
            ->get()
            ->pluck('count', 'category');

        // Get most popular templates
        $popular = PromptTemplate::orderBy('usage_count', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'usage_count', 'avg_rating']);

        return response()->json([
            'stats' => $stats,
            'by_category' => $byCategory,
            'popular_templates' => $popular,
        ]);
    }
}
