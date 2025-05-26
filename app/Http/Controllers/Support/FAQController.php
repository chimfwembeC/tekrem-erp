<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\FAQ;
use App\Models\Support\KnowledgeBaseCategory;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FAQController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = FAQ::query()
            ->with(['category', 'author'])
            ->when($request->search, function ($query, $search) {
                $query->search($search);
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->published !== null, function ($query) use ($request) {
                $query->where('is_published', $request->boolean('published'));
            })
            ->when($request->featured === 'true', function ($query) {
                $query->featured();
            });

        $faqs = $query->ordered()->paginate(15)->withQueryString();

        $categories = KnowledgeBaseCategory::active()->ordered()->get(['id', 'name']);

        return Inertia::render('Support/FAQ/Index', [
            'faqs' => $faqs,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'published', 'featured']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $categories = KnowledgeBaseCategory::active()->ordered()->get();

        return Inertia::render('Support/FAQ/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string'],
            'category_id' => ['nullable', 'exists:knowledge_base_categories,id'],
            'is_published' => ['boolean'],
            'is_featured' => ['boolean'],
            'tags' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $validated['author_id'] = Auth::id();

        $faq = FAQ::create($validated);

        // Create notifications for published FAQs
        if ($validated['is_published']) {
            $notifiableUsers = NotificationService::getNotifiableUsers($faq, Auth::user());
            $message = Auth::user()->name . " published a new FAQ: '{$faq->question}'";
            $link = route('support.faq.show', $faq->id);

            NotificationService::notifyUsers($notifiableUsers, 'faq', $message, $link, $faq);
        }

        return redirect()->route('support.faq.show', $faq)
            ->with('success', 'FAQ created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(FAQ $faq): Response
    {
        $faq->load(['category', 'author']);

        // Increment view count
        $faq->incrementViewCount();

        // Get related FAQs
        $relatedFAQs = FAQ::published()
            ->where('id', '!=', $faq->id)
            ->when($faq->category_id, function ($query) use ($faq) {
                $query->where('category_id', $faq->category_id);
            })
            ->take(5)
            ->get(['id', 'question', 'view_count']);

        return Inertia::render('Support/FAQ/Show', [
            'faq' => $faq,
            'relatedFAQs' => $relatedFAQs,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FAQ $faq): Response
    {
        $categories = KnowledgeBaseCategory::active()->ordered()->get();

        return Inertia::render('Support/FAQ/Edit', [
            'faq' => $faq,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FAQ $faq): RedirectResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string'],
            'category_id' => ['nullable', 'exists:knowledge_base_categories,id'],
            'is_published' => ['boolean'],
            'is_featured' => ['boolean'],
            'tags' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $faq->update($validated);

        return redirect()->route('support.faq.show', $faq)
            ->with('success', 'FAQ updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FAQ $faq): RedirectResponse
    {
        $faq->delete();

        return redirect()->route('support.faq.index')
            ->with('success', 'FAQ deleted successfully.');
    }

    /**
     * Publish an FAQ.
     */
    public function publish(FAQ $faq): JsonResponse
    {
        $faq->update(['is_published' => true]);

        // Create notifications
        $notifiableUsers = NotificationService::getNotifiableUsers($faq, Auth::user());
        $message = Auth::user()->name . " published FAQ: '{$faq->question}'";
        $link = route('support.faq.show', $faq->id);

        NotificationService::notifyUsers($notifiableUsers, 'faq', $message, $link, $faq);

        return response()->json(['message' => 'FAQ published successfully.']);
    }

    /**
     * Mark FAQ as helpful.
     */
    public function markHelpful(FAQ $faq): JsonResponse
    {
        $faq->markAsHelpful();

        return response()->json([
            'success' => true,
            'helpful_count' => $faq->helpful_count,
            'helpfulness_ratio' => $faq->helpfulness_ratio,
        ]);
    }

    /**
     * Mark FAQ as not helpful.
     */
    public function markNotHelpful(FAQ $faq): JsonResponse
    {
        $faq->markAsNotHelpful();

        return response()->json([
            'success' => true,
            'not_helpful_count' => $faq->not_helpful_count,
            'helpfulness_ratio' => $faq->helpfulness_ratio,
        ]);
    }
}
