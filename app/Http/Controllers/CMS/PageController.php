<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\CMS\Page;
use App\Models\CMS\Template;
use App\Services\CMS\PageService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct(
        private PageService $pageService
    ) {}

    /**
     * Display a listing of pages.
     */
    public function index(Request $request): Response
    {
        $query = Page::with(['author', 'parent'])
            ->when($request->search, function ($q, $search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            })
            ->when($request->status, function ($q, $status) {
                $q->where('status', $status);
            })
            ->when($request->template, function ($q, $template) {
                $q->where('template', $template);
            })
            ->when($request->language, function ($q, $language) {
                $q->where('language', $language);
            })
            ->when($request->author, function ($q, $author) {
                $q->where('author_id', $author);
            });

        $pages = $query->orderBy('created_at', 'desc')->paginate(15);

        $templates = Template::active()->get(['slug', 'name']);
        $languages = Page::distinct()->pluck('language');
        $authors = \App\Models\User::whereIn('id', Page::distinct()->pluck('author_id'))->get(['id', 'name']);

        return Inertia::render('CMS/Pages/Index', [
            'pages' => $pages,
            'templates' => $templates,
            'languages' => $languages,
            'authors' => $authors,
            'filters' => $request->only(['search', 'status', 'template', 'language', 'author']),
        ]);
    }

    /**
     * Show the form for creating a new page.
     */
    public function create(): Response
    {
        $templates = Template::active()->get();
        $pages = Page::published()->get(['id', 'title', 'slug']);
        $languages = config('cms.languages', ['en' => 'English']);

        return Inertia::render('CMS/Pages/Create', [
            'templates' => $templates,
            'pages' => $pages,
            'languages' => $languages,
        ]);
    }

    /**
     * Store a newly created page.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'content_blocks' => ['nullable', 'array'],
            'template' => ['required', 'string', 'exists:cms_templates,slug'],
            'layout' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'array'],
            'og_title' => ['nullable', 'string', 'max:255'],
            'og_description' => ['nullable', 'string', 'max:500'],
            'og_image' => ['nullable', 'string'],
            'canonical_url' => ['nullable', 'url'],
            'status' => ['required', 'in:draft,published,scheduled'],
            'published_at' => ['nullable', 'date'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
            'parent_id' => ['nullable', 'exists:cms_pages,id'],
            'language' => ['required', 'string', 'size:2'],
            'is_homepage' => ['boolean'],
            'show_in_menu' => ['boolean'],
            'require_auth' => ['boolean'],
            'permissions' => ['nullable', 'array'],
            'settings' => ['nullable', 'array'],
        ]);

        $page = $this->pageService->createPage($validated, Auth::user());

        return redirect()->route('cms.pages.show', $page)
            ->with('success', 'Page created successfully.');
    }

    /**
     * Display the specified page.
     */
    public function show(Page $page): Response
    {
        $page->load(['author', 'editor', 'approvedBy', 'parent', 'children', 'revisions.createdBy']);

        $analytics = $this->pageService->getPageAnalytics($page);
        $seoAnalysis = $this->pageService->getSEOAnalysis($page);
        $relatedPages = $this->pageService->getRelatedPages($page);

        return Inertia::render('CMS/Pages/Show', [
            'page' => $page,
            'analytics' => $analytics,
            'seoAnalysis' => $seoAnalysis,
            'relatedPages' => $relatedPages,
        ]);
    }

    /**
     * Show the form for editing the specified page.
     */
    public function edit(Page $page): Response
    {
        if (!$page->canEdit(Auth::user())) {
            abort(403);
        }

        $page->load(['revisions.createdBy']);
        $templates = Template::active()->get();
        $pages = Page::where('id', '!=', $page->id)->published()->get(['id', 'title', 'slug']);
        $languages = config('cms.languages', ['en' => 'English']);

        return Inertia::render('CMS/Pages/Edit', [
            'page' => $page,
            'templates' => $templates,
            'pages' => $pages,
            'languages' => $languages,
        ]);
    }

    /**
     * Update the specified page.
     */
    public function update(Request $request, Page $page): RedirectResponse
    {
        if (!$page->canEdit(Auth::user())) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'content_blocks' => ['nullable', 'array'],
            'template' => ['required', 'string', 'exists:cms_templates,slug'],
            'layout' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'array'],
            'og_title' => ['nullable', 'string', 'max:255'],
            'og_description' => ['nullable', 'string', 'max:500'],
            'og_image' => ['nullable', 'string'],
            'canonical_url' => ['nullable', 'url'],
            'status' => ['required', 'in:draft,published,scheduled'],
            'published_at' => ['nullable', 'date'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
            'parent_id' => ['nullable', 'exists:cms_pages,id'],
            'language' => ['required', 'string', 'size:2'],
            'is_homepage' => ['boolean'],
            'show_in_menu' => ['boolean'],
            'require_auth' => ['boolean'],
            'permissions' => ['nullable', 'array'],
            'settings' => ['nullable', 'array'],
            'revision_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $revisionNotes = $validated['revision_notes'] ?? null;
        unset($validated['revision_notes']);

        $this->pageService->updatePage($page, $validated, Auth::user(), $revisionNotes);

        return redirect()->route('cms.pages.show', $page)
            ->with('success', 'Page updated successfully.');
    }

    /**
     * Remove the specified page.
     */
    public function destroy(Page $page): RedirectResponse
    {
        if (!$page->canEdit(Auth::user())) {
            abort(403);
        }

        $this->pageService->deletePage($page);

        return redirect()->route('cms.pages.index')
            ->with('success', 'Page deleted successfully.');
    }

    /**
     * Publish a page.
     */
    public function publish(Page $page): JsonResponse
    {
        if (!$page->canEdit(Auth::user())) {
            abort(403);
        }

        $success = $this->pageService->publishPage($page, Auth::user());

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Page published successfully.' : 'Failed to publish page.',
            'status' => $page->fresh()->status,
        ]);
    }

    /**
     * Unpublish a page.
     */
    public function unpublish(Page $page): JsonResponse
    {
        if (!$page->canEdit(Auth::user())) {
            abort(403);
        }

        $success = $this->pageService->unpublishPage($page);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Page unpublished successfully.' : 'Failed to unpublish page.',
            'status' => $page->fresh()->status,
        ]);
    }

    /**
     * Schedule a page for publishing.
     */
    public function schedule(Request $request, Page $page): JsonResponse
    {
        if (!$page->canEdit(Auth::user())) {
            abort(403);
        }

        $validated = $request->validate([
            'scheduled_at' => ['required', 'date', 'after:now'],
        ]);

        $success = $this->pageService->schedulePage($page, new \DateTime($validated['scheduled_at']));

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Page scheduled successfully.' : 'Failed to schedule page.',
            'status' => $page->fresh()->status,
            'scheduled_at' => $page->fresh()->scheduled_at,
        ]);
    }

    /**
     * Duplicate a page.
     */
    public function duplicate(Request $request, Page $page): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $overrides = [];
        if (!empty($validated['title'])) {
            $overrides['title'] = $validated['title'];
        }

        $duplicatedPage = $this->pageService->duplicatePage($page, Auth::user(), $overrides);

        return redirect()->route('cms.pages.edit', $duplicatedPage)
            ->with('success', 'Page duplicated successfully.');
    }

    /**
     * Restore page from revision.
     */
    public function restoreRevision(Request $request, Page $page): JsonResponse
    {
        if (!$page->canEdit(Auth::user())) {
            abort(403);
        }

        $validated = $request->validate([
            'revision_id' => ['required', 'exists:cms_page_revisions,id'],
        ]);

        $revision = $page->revisions()->findOrFail($validated['revision_id']);
        $success = $page->restoreFromRevision($revision);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Page restored from revision successfully.' : 'Failed to restore page.',
        ]);
    }

    /**
     * Preview a page.
     */
    public function preview(Page $page): Response
    {
        $page->incrementViews();

        return Inertia::render('CMS/Pages/Preview', [
            'page' => $page,
        ]);
    }

    /**
     * Get page SEO analysis.
     */
    public function seoAnalysis(Page $page): JsonResponse
    {
        $analysis = $this->pageService->getSEOAnalysis($page);

        return response()->json($analysis);
    }

    /**
     * Search pages.
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'min:2'],
            'language' => ['nullable', 'string', 'size:2'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $results = $this->pageService->searchPages(
            $validated['query'],
            $validated['language'] ?? 'en',
            $validated['limit'] ?? 10
        );

        return response()->json($results);
    }

    /**
     * Bulk actions on pages.
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:publish,unpublish,delete,archive'],
            'page_ids' => ['required', 'array'],
            'page_ids.*' => ['exists:cms_pages,id'],
        ]);

        $pages = Page::whereIn('id', $validated['page_ids'])->get();
        $processed = 0;

        foreach ($pages as $page) {
            if (!$page->canEdit(Auth::user())) {
                continue;
            }

            switch ($validated['action']) {
                case 'publish':
                    if ($this->pageService->publishPage($page, Auth::user())) {
                        $processed++;
                    }
                    break;
                case 'unpublish':
                    if ($this->pageService->unpublishPage($page)) {
                        $processed++;
                    }
                    break;
                case 'delete':
                    if ($this->pageService->deletePage($page)) {
                        $processed++;
                    }
                    break;
                case 'archive':
                    if ($page->archive()) {
                        $processed++;
                    }
                    break;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully processed {$processed} pages.",
            'processed' => $processed,
        ]);
    }
}
