<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TagController extends Controller
{
    /**
     * Display a listing of tags.
     */
    public function index(Request $request)
    {
        $query = Tag::with('creator');

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        $tags = $query->latest()->paginate(15);

        // Add usage count to each tag
        $tags->getCollection()->transform(function ($tag) {
            $tag->usage_count = $tag->projects()->count() + $tag->tasks()->count();
            return $tag;
        });

        return Inertia::render('Projects/Tags/Index', [
            'tags' => $tags,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new tag.
     */
    public function create()
    {
        return Inertia::render('Projects/Tags/Create');
    }

    /**
     * Store a newly created tag.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'type' => 'required|in:project,task,general',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = Auth::id();

        $tag = Tag::create($validated);

        return redirect()->route('projects.tags.index')
            ->with('success', 'Tag created successfully.');
    }

    /**
     * Display the specified tag.
     */
    public function show(Tag $tag)
    {
        $tag->load(['creator', 'projects', 'tasks']);
        $tag->usage_count = $tag->projects->count() + $tag->tasks->count();

        return Inertia::render('Projects/Tags/Show', [
            'tag' => $tag,
        ]);
    }

    /**
     * Show the form for editing the tag.
     */
    public function edit(Tag $tag)
    {
        return Inertia::render('Projects/Tags/Edit', [
            'tag' => $tag,
        ]);
    }

    /**
     * Update the specified tag.
     */
    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name,' . $tag->id,
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'type' => 'required|in:project,task,general',
            'is_active' => 'boolean',
        ]);

        $tag->update($validated);

        return redirect()->route('projects.tags.show', $tag)
            ->with('success', 'Tag updated successfully.');
    }

    /**
     * Remove the specified tag.
     */
    public function destroy(Tag $tag)
    {
        // Check if tag is in use
        $usageCount = $tag->projects()->count() + $tag->tasks()->count();
        
        if ($usageCount > 0) {
            return back()->withErrors([
                'error' => "Cannot delete tag '{$tag->name}' as it is currently used by {$usageCount} items."
            ]);
        }

        $tag->delete();

        return redirect()->route('projects.tags.index')
            ->with('success', 'Tag deleted successfully.');
    }

    /**
     * Get tags for autocomplete/search.
     */
    public function search(Request $request)
    {
        $query = Tag::active();

        if ($request->filled('q')) {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $tags = $query->select('id', 'name', 'color', 'type')
                     ->limit(20)
                     ->get();

        return response()->json($tags);
    }
}
