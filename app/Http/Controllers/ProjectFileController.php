<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProjectFileController extends Controller
{
    /**
     * Display a listing of files for a project.
     */
    public function index(Request $request, Project $project)
    {
        $query = $project->files()->with('uploader')->latestVersions();

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('original_name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $files = $query->latest()->paginate(12);

        return Inertia::render('Projects/Files/Index', [
            'project' => $project,
            'files' => $files,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * Show the form for creating a new file.
     */
    public function create(Project $project)
    {
        $milestones = $project->milestones()->select('id', 'name')->get();

        return Inertia::render('Projects/Files/Create', [
            'project' => $project,
            'milestones' => $milestones,
        ]);
    }

    /**
     * Store a newly created file.
     */
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:document,image,contract,design,other',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'access_level' => 'required|in:public,team,managers,private',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $fileName = $validated['name'] ?: pathinfo($originalName, PATHINFO_FILENAME);
        
        // Store the file
        $path = $file->store('projects/' . $project->id . '/files', 'public');

        $projectFile = ProjectFile::create([
            'project_id' => $project->id,
            'milestone_id' => $validated['milestone_id'] ?? null,
            'name' => $fileName,
            'original_name' => $originalName,
            'file_path' => $path,
            'file_url' => Storage::url($path),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'category' => $validated['category'],
            'description' => $validated['description'],
            'uploaded_by' => Auth::id(),
            'access_level' => $validated['access_level'],
        ]);

        return redirect()->route('projects.files.index', $project)
            ->with('success', 'File uploaded successfully.');
    }

    /**
     * Display the specified file.
     */
    public function show(Project $project, ProjectFile $file)
    {
        $file->load('uploader', 'milestone', 'versions');

        return Inertia::render('Projects/Files/Show', [
            'project' => $project,
            'file' => $file,
        ]);
    }

    /**
     * Download the specified file.
     */
    public function download(Project $project, ProjectFile $file)
    {
        if (!$file->can_access) {
            abort(403, 'You do not have permission to access this file.');
        }

        return Storage::download($file->file_path, $file->original_name);
    }

    /**
     * Remove the specified file.
     */
    public function destroy(Project $project, ProjectFile $file)
    {
        $file->delete(); // This will also delete the physical file via the model's boot method

        return redirect()->route('projects.files.index', $project)
            ->with('success', 'File deleted successfully.');
    }

    /**
     * Create a new version of the file.
     */
    public function newVersion(Request $request, Project $project, ProjectFile $file)
    {
        $validated = $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'description' => 'nullable|string',
        ]);

        $uploadedFile = $request->file('file');
        $path = $uploadedFile->store('projects/' . $project->id . '/files', 'public');

        $newVersion = $file->createNewVersion([
            'original_name' => $uploadedFile->getClientOriginalName(),
            'file_path' => $path,
            'file_url' => Storage::url($path),
            'mime_type' => $uploadedFile->getMimeType(),
            'file_size' => $uploadedFile->getSize(),
            'description' => $validated['description'],
        ]);

        return redirect()->route('projects.files.show', [$project, $newVersion])
            ->with('success', 'New file version uploaded successfully.');
    }
}
