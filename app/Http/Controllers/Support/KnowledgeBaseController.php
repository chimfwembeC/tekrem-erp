<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\KnowledgeBaseArticle;
use App\Models\Support\KnowledgeBaseCategory;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class KnowledgeBaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = KnowledgeBaseArticle::query()
            ->with(['category', 'author'])
            ->when($request->search, function ($query, $search) {
                $query->search($search);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->featured === 'true', function ($query) {
                $query->featured();
            });

        $articles = $query->latest()->paginate(15)->withQueryString();

        $categories = KnowledgeBaseCategory::active()->ordered()->get(['id', 'name']);

        return Inertia::render('Support/KnowledgeBase/Index', [
            'articles' => $articles,
            'categories' => $categories,
            'filters' => $request->only(['search', 'status', 'category_id', 'featured']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $categories = KnowledgeBaseCategory::active()->ordered()->get();

        return Inertia::render('Support/KnowledgeBase/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:knowledge_base_articles,slug'],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'category_id' => ['nullable', 'exists:knowledge_base_categories,id'],
            'status' => ['required', 'string', Rule::in(['draft', 'published', 'archived'])],
            'is_featured' => ['boolean'],
            'tags' => ['nullable', 'array'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $validated['author_id'] = Auth::id();

        if ($validated['status'] === 'published' && !isset($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $article = KnowledgeBaseArticle::create($validated);

        // Create notifications for published articles
        if ($validated['status'] === 'published') {
            $notifiableUsers = NotificationService::getNotifiableUsers($article, Auth::user());
            $message = Auth::user()->name . " published a new knowledge base article: '{$article->title}'";
            $link = route('support.knowledge-base.show', $article->id);

            NotificationService::notifyUsers($notifiableUsers, 'knowledge_base', $message, $link, $article);
        }

        return redirect()->route('support.knowledge-base.show', $article)
            ->with('success', 'Article created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(KnowledgeBaseArticle $knowledgeBase): Response
    {
        $knowledgeBase->load(['category', 'author']);

        // Increment view count
        $knowledgeBase->incrementViewCount();

        // Get related articles
        $relatedArticles = KnowledgeBaseArticle::published()
            ->where('id', '!=', $knowledgeBase->id)
            ->when($knowledgeBase->category_id, function ($query) use ($knowledgeBase) {
                $query->where('category_id', $knowledgeBase->category_id);
            })
            ->take(5)
            ->get(['id', 'title', 'excerpt', 'view_count']);

        return Inertia::render('Support/KnowledgeBase/Show', [
            'article' => $knowledgeBase,
            'relatedArticles' => $relatedArticles,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(KnowledgeBaseArticle $knowledgeBase): Response
    {
        $categories = KnowledgeBaseCategory::active()->ordered()->get();

        return Inertia::render('Support/KnowledgeBase/Edit', [
            'article' => $knowledgeBase,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, KnowledgeBaseArticle $knowledgeBase): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('knowledge_base_articles', 'slug')->ignore($knowledgeBase->id)],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'category_id' => ['nullable', 'exists:knowledge_base_categories,id'],
            'status' => ['required', 'string', Rule::in(['draft', 'published', 'archived'])],
            'is_featured' => ['boolean'],
            'tags' => ['nullable', 'array'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Set published_at if status changed to published
        if ($validated['status'] === 'published' && $knowledgeBase->status !== 'published') {
            $validated['published_at'] = now();
        }

        $knowledgeBase->update($validated);

        return redirect()->route('support.knowledge-base.show', $knowledgeBase)
            ->with('success', 'Article updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KnowledgeBaseArticle $knowledgeBase): RedirectResponse
    {
        $knowledgeBase->delete();

        return redirect()->route('support.knowledge-base.index')
            ->with('success', 'Article deleted successfully.');
    }

    /**
     * Publish an article.
     */
    public function publish(KnowledgeBaseArticle $knowledgeBase): JsonResponse
    {
        $knowledgeBase->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        // Create notifications
        $notifiableUsers = NotificationService::getNotifiableUsers($knowledgeBase, Auth::user());
        $message = Auth::user()->name . " published knowledge base article: '{$knowledgeBase->title}'";
        $link = route('support.knowledge-base.show', $knowledgeBase->id);

        NotificationService::notifyUsers($notifiableUsers, 'knowledge_base', $message, $link, $knowledgeBase);

        return response()->json(['message' => 'Article published successfully.']);
    }

    /**
     * Unpublish an article.
     */
    public function unpublish(KnowledgeBaseArticle $knowledgeBase): JsonResponse
    {
        $knowledgeBase->update([
            'status' => 'draft',
            'published_at' => null,
        ]);

        return response()->json(['message' => 'Article unpublished successfully.']);
    }

    /**
     * Mark article as helpful.
     */
    public function markHelpful(KnowledgeBaseArticle $knowledgeBase): JsonResponse
    {
        $knowledgeBase->markAsHelpful();

        return response()->json([
            'success' => true,
            'helpful_count' => $knowledgeBase->helpful_count,
            'helpfulness_ratio' => $knowledgeBase->helpfulness_ratio,
        ]);
    }

    /**
     * Mark article as not helpful.
     */
    public function markNotHelpful(KnowledgeBaseArticle $knowledgeBase): JsonResponse
    {
        $knowledgeBase->markAsNotHelpful();

        return response()->json([
            'success' => true,
            'not_helpful_count' => $knowledgeBase->not_helpful_count,
            'helpfulness_ratio' => $knowledgeBase->helpfulness_ratio,
        ]);
    }
}
