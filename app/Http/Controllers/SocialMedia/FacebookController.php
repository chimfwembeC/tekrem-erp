<?php

namespace App\Http\Controllers\SocialMedia;

use App\Http\Controllers\Controller;
use App\Services\SocialMedia\FacebookService;
use App\Models\SocialMedia\FacebookPage;
use App\Models\SocialMedia\FacebookLead;
use App\Models\SocialMedia\SocialPost;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FacebookController extends Controller
{
    public function __construct(
        private FacebookService $facebookService
    ) {}

    /**
     * Display Facebook integration dashboard
     */
    public function index(): Response
    {
        $pages = FacebookPage::with(['facebookLeads', 'socialPosts'])
            ->withCount(['facebookLeads', 'socialPosts'])
            ->get();

        $recentLeads = FacebookLead::with('lead')
            ->latest('created_time')
            ->take(10)
            ->get();

        $recentPosts = SocialPost::where('platform', 'facebook')
            ->with('user')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('SocialMedia/Facebook/Index', [
            'pages' => $pages,
            'recentLeads' => $recentLeads,
            'recentPosts' => $recentPosts,
            'stats' => [
                'total_pages' => $pages->count(),
                'active_pages' => $pages->where('is_active', true)->count(),
                'total_leads' => FacebookLead::count(),
                'leads_this_month' => FacebookLead::whereMonth('created_time', now()->month)->count(),
                'total_posts' => SocialPost::where('platform', 'facebook')->count(),
                'published_posts' => SocialPost::where('platform', 'facebook')->where('status', 'published')->count(),
            ]
        ]);
    }

    /**
     * Sync Facebook pages
     */
    public function syncPages(): JsonResponse
    {
        try {
            $pages = $this->facebookService->getPages();
            
            foreach ($pages as $pageData) {
                FacebookPage::updateOrCreate(
                    ['facebook_page_id' => $pageData['id']],
                    [
                        'name' => $pageData['name'],
                        'category' => $pageData['category'] ?? null,
                        'access_token' => $pageData['access_token'],
                        'picture_url' => $pageData['picture']['data']['url'] ?? null,
                        'last_sync_at' => now(),
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Pages synced successfully',
                'pages_count' => count($pages)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync pages: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Subscribe page to webhooks
     */
    public function subscribeWebhooks(Request $request): JsonResponse
    {
        $request->validate([
            'page_id' => 'required|string'
        ]);

        try {
            $page = FacebookPage::where('facebook_page_id', $request->page_id)->firstOrFail();
            
            $success = $this->facebookService->subscribeToWebhooks(
                $page->facebook_page_id,
                $page->access_token
            );

            if ($success) {
                $page->update(['webhook_subscribed' => true]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Webhooks subscribed successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to subscribe to webhooks'
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to subscribe webhooks: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync leads from Facebook
     */
    public function syncLeads(Request $request): JsonResponse
    {
        $request->validate([
            'page_id' => 'required|string',
            'since' => 'nullable|date'
        ]);

        try {
            $since = $request->since ? \Carbon\Carbon::parse($request->since) : null;
            $leads = $this->facebookService->getLeads($request->page_id, $since);
            
            $processedCount = 0;
            foreach ($leads as $leadData) {
                $lead = $this->facebookService->processLead($leadData);
                if ($lead) {
                    $processedCount++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Processed {$processedCount} leads successfully",
                'leads_count' => $processedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync leads: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create and schedule a Facebook post
     */
    public function createPost(Request $request): JsonResponse
    {
        $request->validate([
            'page_id' => 'required|string',
            'content' => 'required|string',
            'title' => 'nullable|string',
            'link_url' => 'nullable|url',
            'media_urls' => 'nullable|array',
            'scheduled_at' => 'nullable|date|after:now'
        ]);

        try {
            $post = SocialPost::create([
                'user_id' => auth()->id(),
                'platform' => 'facebook',
                'platform_page_id' => $request->page_id,
                'title' => $request->title,
                'content' => $request->content,
                'link_url' => $request->link_url,
                'media_urls' => $request->media_urls,
                'status' => $request->scheduled_at ? 'scheduled' : 'draft',
                'scheduled_at' => $request->scheduled_at,
            ]);

            // If not scheduled, publish immediately
            if (!$request->scheduled_at) {
                $this->publishPost($post);
            }

            return response()->json([
                'success' => true,
                'message' => $request->scheduled_at ? 'Post scheduled successfully' : 'Post published successfully',
                'post' => $post
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create post: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Publish a post to Facebook
     */
    public function publishPost(SocialPost $post): JsonResponse
    {
        try {
            $page = FacebookPage::where('facebook_page_id', $post->platform_page_id)->firstOrFail();
            
            $content = [
                'message' => $post->content,
                'link' => $post->link_url,
            ];

            if ($post->media_urls && count($post->media_urls) > 0) {
                $content['picture'] = $post->media_urls[0];
            }

            $result = $this->facebookService->postToPage(
                $page->facebook_page_id,
                $page->access_token,
                $content
            );

            if ($result['status'] === 'success') {
                $post->markAsPublished($result['post_id']);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Post published successfully'
                ]);
            }

            $post->markAsFailed($result['message']);
            return response()->json([
                'success' => false,
                'message' => $result['message']
            ], 400);
        } catch (\Exception $e) {
            $post->markAsFailed($e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to publish post: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get page insights
     */
    public function getInsights(Request $request): JsonResponse
    {
        $request->validate([
            'page_id' => 'required|string',
            'since' => 'nullable|date',
            'until' => 'nullable|date'
        ]);

        try {
            $page = FacebookPage::where('facebook_page_id', $request->page_id)->firstOrFail();
            
            $since = $request->since ? \Carbon\Carbon::parse($request->since) : now()->subDays(30);
            $until = $request->until ? \Carbon\Carbon::parse($request->until) : now();

            $insights = $this->facebookService->getPageInsights(
                $page->facebook_page_id,
                $page->access_token,
                [],
                $since,
                $until
            );

            return response()->json([
                'success' => true,
                'insights' => $insights
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get insights: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Facebook webhooks
     */
    public function webhook(Request $request)
    {
        // Webhook verification
        if ($request->has(['hub_mode', 'hub_verify_token', 'hub_challenge'])) {
            $challenge = $this->facebookService->verifyWebhook(
                $request->hub_mode,
                $request->hub_verify_token,
                $request->hub_challenge
            );

            if ($challenge) {
                return response($challenge, 200);
            }

            return response('Forbidden', 403);
        }

        // Process webhook payload
        $payload = $request->all();
        $success = $this->facebookService->processWebhook($payload);

        return response()->json(['success' => $success]);
    }

    /**
     * Test Facebook connection
     */
    public function testConnection(): JsonResponse
    {
        $result = $this->facebookService->testConnection();
        
        return response()->json($result, $result['status'] === 'success' ? 200 : 400);
    }
}
