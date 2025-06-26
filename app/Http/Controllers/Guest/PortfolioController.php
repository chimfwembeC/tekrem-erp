<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\CMS\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    /**
     * Show the public portfolio.
     */
    public function index(Request $request): Response
    {
        $query = Project::where('status', 'completed')
            ->whereNotNull('metadata->showcase')
            ->where('metadata->showcase->public', true);

        // Filter by project type
        if ($request->filled('type')) {
            $query->where('category', $request->type);
        }

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereJsonContains('tags', $search);
            });
        }

        $projects = $query->with(['client:id,name,company'])
            ->select([
                'id', 'name', 'description', 'category', 'start_date', 
                'end_date', 'budget', 'client_id', 'tags', 'metadata'
            ])
            ->orderBy('end_date', 'desc')
            ->paginate(12)
            ->withQueryString();

        // Transform projects for public display
        $projects->getCollection()->transform(function ($project) {
            $showcase = $project->metadata['showcase'] ?? [];
            
            return [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'category' => $project->category,
                'start_date' => $project->start_date,
                'end_date' => $project->end_date,
                'client_name' => $showcase['client_name'] ?? ($project->client?->company ?: $project->client?->name),
                'tags' => $project->tags,
                'images' => $showcase['images'] ?? [],
                'features' => $showcase['features'] ?? [],
                'technologies' => $showcase['technologies'] ?? [],
                'live_url' => $showcase['live_url'] ?? null,
                'case_study_url' => $showcase['case_study_url'] ?? null,
                'testimonial' => $showcase['testimonial'] ?? null,
            ];
        });

        // Get available project categories for filtering
        $categories = Project::where('status', 'completed')
            ->whereNotNull('metadata->showcase')
            ->where('metadata->showcase->public', true)
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('Guest/Portfolio/Index', [
            'projects' => $projects,
            'categories' => $categories,
            'filters' => $request->only(['type', 'search'])
        ]);
    }

    /**
     * Show a specific project case study.
     */
    public function show(int $id): Response
    {
        $project = Project::where('id', $id)
            ->where('status', 'completed')
            ->whereNotNull('metadata->showcase')
            ->where('metadata->showcase->public', true)
            ->with(['client:id,name,company'])
            ->firstOrFail();

        $showcase = $project->metadata['showcase'] ?? [];

        $projectData = [
            'id' => $project->id,
            'name' => $project->name,
            'description' => $project->description,
            'category' => $project->category,
            'start_date' => $project->start_date,
            'end_date' => $project->end_date,
            'duration_months' => $project->start_date && $project->end_date 
                ? $project->start_date->diffInMonths($project->end_date) 
                : null,
            'client_name' => $showcase['client_name'] ?? ($project->client?->company ?: $project->client?->name),
            'tags' => $project->tags,
            'images' => $showcase['images'] ?? [],
            'features' => $showcase['features'] ?? [],
            'technologies' => $showcase['technologies'] ?? [],
            'challenges' => $showcase['challenges'] ?? [],
            'solutions' => $showcase['solutions'] ?? [],
            'results' => $showcase['results'] ?? [],
            'live_url' => $showcase['live_url'] ?? null,
            'testimonial' => $showcase['testimonial'] ?? null,
            'detailed_description' => $showcase['detailed_description'] ?? $project->description,
        ];

        // Get related projects
        $relatedProjects = Project::where('status', 'completed')
            ->whereNotNull('metadata->showcase')
            ->where('metadata->showcase->public', true)
            ->where('category', $project->category)
            ->where('id', '!=', $project->id)
            ->take(3)
            ->get()
            ->map(function ($relatedProject) {
                $relatedShowcase = $relatedProject->metadata['showcase'] ?? [];
                return [
                    'id' => $relatedProject->id,
                    'name' => $relatedProject->name,
                    'description' => $relatedProject->description,
                    'category' => $relatedProject->category,
                    'images' => $relatedShowcase['images'] ?? [],
                    'client_name' => $relatedShowcase['client_name'] ?? null,
                ];
            });

        return Inertia::render('Guest/Portfolio/Show', [
            'project' => $projectData,
            'relatedProjects' => $relatedProjects
        ]);
    }

    /**
     * Show services page with project examples.
     */
    public function services(): Response
    {
        // Get featured projects by category
        $serviceCategories = [
            'web_development' => 'Web Development',
            'mobile_app' => 'Mobile Applications',
            'ai_solution' => 'AI Solutions',
            'e-commerce' => 'E-commerce',
            'saas' => 'SaaS Platforms'
        ];

        $serviceProjects = [];
        foreach ($serviceCategories as $category => $title) {
            $projects = Project::where('status', 'completed')
                ->whereNotNull('metadata->showcase')
                ->where('metadata->showcase->public', true)
                ->where('category', $category)
                ->take(3)
                ->get()
                ->map(function ($project) {
                    $showcase = $project->metadata['showcase'] ?? [];
                    return [
                        'id' => $project->id,
                        'name' => $project->name,
                        'description' => $project->description,
                        'images' => $showcase['images'] ?? [],
                        'client_name' => $showcase['client_name'] ?? null,
                        'technologies' => $showcase['technologies'] ?? [],
                    ];
                });

            if ($projects->isNotEmpty()) {
                $serviceProjects[$category] = [
                    'title' => $title,
                    'projects' => $projects
                ];
            }
        }

        // Get service information from CMS if available
        $servicesPage = Page::where('slug', 'services')
            ->where('status', 'published')
            ->first();

        return Inertia::render('Guest/Portfolio/Services', [
            'serviceProjects' => $serviceProjects,
            'servicesContent' => $servicesPage?->content,
            'serviceCategories' => $serviceCategories
        ]);
    }

    /**
     * Show testimonials page.
     */
    public function testimonials(): Response
    {
        $testimonials = Project::where('status', 'completed')
            ->whereNotNull('metadata->showcase->testimonial')
            ->get()
            ->map(function ($project) {
                $showcase = $project->metadata['showcase'] ?? [];
                $testimonial = $showcase['testimonial'] ?? [];
                
                if (empty($testimonial['content'])) {
                    return null;
                }

                return [
                    'project_id' => $project->id,
                    'project_name' => $project->name,
                    'project_category' => $project->category,
                    'content' => $testimonial['content'],
                    'author_name' => $testimonial['author_name'] ?? null,
                    'author_position' => $testimonial['author_position'] ?? null,
                    'author_company' => $testimonial['author_company'] ?? null,
                    'author_image' => $testimonial['author_image'] ?? null,
                    'rating' => $testimonial['rating'] ?? null,
                    'date' => $project->end_date,
                ];
            })
            ->filter()
            ->sortByDesc('date')
            ->values();

        return Inertia::render('Guest/Portfolio/Testimonials', [
            'testimonials' => $testimonials
        ]);
    }

    /**
     * Get portfolio statistics for display.
     */
    public function statistics(): array
    {
        $completedProjects = Project::where('status', 'completed')->count();
        $activeProjects = Project::where('status', 'active')->count();
        $totalClients = Project::distinct('client_id')->whereNotNull('client_id')->count();
        
        $categories = Project::where('status', 'completed')
            ->groupBy('category')
            ->selectRaw('category, count(*) as count')
            ->pluck('count', 'category')
            ->toArray();

        return [
            'completed_projects' => $completedProjects,
            'active_projects' => $activeProjects,
            'total_clients' => $totalClients,
            'categories' => $categories,
        ];
    }
}
