<?php

namespace App\Http\Controllers\SocialMedia;

use App\Http\Controllers\Controller;
use App\Services\SocialMedia\FacebookService;
use App\Services\SocialMedia\InstagramService;
use App\Services\SocialMedia\LinkedInService;
use App\Models\SocialMedia\FacebookPage;
use App\Models\SocialMedia\InstagramAccount;
use App\Models\SocialMedia\LinkedInCompany;
use App\Models\SocialMedia\SocialPost;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class SocialMediaDashboardController extends Controller
{
    protected FacebookService $facebookService;
    protected InstagramService $instagramService;
    protected LinkedInService $linkedInService;

    public function __construct(
        FacebookService $facebookService,
        InstagramService $instagramService,
        LinkedInService $linkedInService
    ) {
        $this->facebookService = $facebookService;
        $this->instagramService = $instagramService;
        $this->linkedInService = $linkedInService;
    }

    /**
     * Display unified social media dashboard
     */
    public function index(): Response
    {
        // Get connection status for all platforms
        $connectionStatus = [
            'facebook' => $this->facebookService->testConnection(),
            'instagram' => $this->instagramService->testConnection(),
            'linkedin' => $this->linkedInService->testConnection(),
        ];

        // Get account counts
        $accountCounts = [
            'facebook_pages' => FacebookPage::count(),
            'instagram_accounts' => InstagramAccount::count(),
            'linkedin_companies' => LinkedInCompany::count(),
        ];

        // Get recent posts across all platforms
        $recentPosts = SocialPost::with(['user'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'platform' => $post->platform,
                    'content' => substr($post->content, 0, 100) . (strlen($post->content) > 100 ? '...' : ''),
                    'status' => $post->status,
                    'created_at' => $post->created_at,
                    'published_at' => $post->published_at,
                    'likes_count' => $post->likes_count ?? 0,
                    'comments_count' => $post->comments_count ?? 0,
                    'shares_count' => $post->shares_count ?? 0,
                    'created_by' => $post->user->name ?? 'Unknown',
                ];
            });

        // Get scheduled posts
        $scheduledPosts = SocialPost::where('status', SocialPost::STATUS_SCHEDULED)
            ->where('scheduled_at', '>', now())
            ->orderBy('scheduled_at')
            ->limit(10)
            ->get();

        // Get platform statistics
        $platformStats = [
            'facebook' => $this->getFacebookStats(),
            'instagram' => $this->getInstagramStats(),
            'linkedin' => $this->getLinkedInStats(),
        ];

        // Get overall engagement metrics
        $engagementMetrics = $this->getOverallEngagementMetrics();

        return Inertia::render('SocialMedia/Dashboard/Index', [
            'connectionStatus' => $connectionStatus,
            'accountCounts' => $accountCounts,
            'recentPosts' => $recentPosts,
            'scheduledPosts' => $scheduledPosts,
            'platformStats' => $platformStats,
            'engagementMetrics' => $engagementMetrics,
        ]);
    }

    /**
     * Create cross-platform post
     */
    public function createCrossPlatformPost(Request $request): JsonResponse
    {
        $request->validate([
            'content' => 'required|string|max:3000',
            'platforms' => 'required|array|min:1',
            'platforms.*' => 'in:facebook,instagram,linkedin',
            'media_urls' => 'nullable|array',
            'media_urls.*' => 'url',
            'scheduled_at' => 'nullable|date|after:now',
            'facebook_page_id' => 'required_if:platforms.*,facebook',
            'instagram_account_id' => 'required_if:platforms.*,instagram',
            'linkedin_company_id' => 'required_if:platforms.*,linkedin',
        ]);

        try {
            $posts = [];
            $errors = [];

            foreach ($request->platforms as $platform) {
                try {
                    $platformAccountId = match($platform) {
                        'facebook' => $request->facebook_page_id,
                        'instagram' => $request->instagram_account_id,
                        'linkedin' => $request->linkedin_company_id,
                    };

                    $post = SocialPost::create([
                        'platform' => $platform,
                        'platform_account_id' => $platformAccountId,
                        'content' => $request->content,
                        'media_urls' => $request->media_urls ?? [],
                        'media_type' => !empty($request->media_urls) ? 'image' : 'text',
                        'status' => $request->scheduled_at ? SocialPost::STATUS_SCHEDULED : SocialPost::STATUS_DRAFT,
                        'scheduled_at' => $request->scheduled_at ? Carbon::parse($request->scheduled_at) : null,
                        'created_by' => auth()->id(),
                    ]);

                    // If not scheduled, publish immediately
                    if (!$request->scheduled_at) {
                        $publishResult = $this->publishPostToPlatform($post);
                        if (!$publishResult['success']) {
                            $errors[] = "Failed to publish to {$platform}: " . $publishResult['message'];
                        }
                    }

                    $posts[] = $post;
                } catch (\Exception $e) {
                    $errors[] = "Failed to create post for {$platform}: " . $e->getMessage();
                }
            }

            return response()->json([
                'success' => empty($errors),
                'message' => empty($errors) 
                    ? ($request->scheduled_at ? 'Posts scheduled successfully' : 'Posts published successfully')
                    : 'Some posts failed to create/publish',
                'posts' => $posts,
                'errors' => $errors
            ], empty($errors) ? 200 : 207); // 207 Multi-Status for partial success
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create cross-platform post: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get platform analytics summary
     */
    public function getAnalyticsSummary(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|in:day,week,month,quarter,year',
            'platforms' => 'nullable|array',
            'platforms.*' => 'in:facebook,instagram,linkedin',
        ]);

        try {
            $period = $request->period ?? 'month';
            $platforms = $request->platforms ?? ['facebook', 'instagram', 'linkedin'];

            $analytics = [];

            foreach ($platforms as $platform) {
                $analytics[$platform] = match($platform) {
                    'facebook' => $this->getFacebookAnalytics($period),
                    'instagram' => $this->getInstagramAnalytics($period),
                    'linkedin' => $this->getLinkedInAnalytics($period),
                };
            }

            return response()->json([
                'success' => true,
                'analytics' => $analytics,
                'period' => $period
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get analytics summary: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync all platforms
     */
    public function syncAllPlatforms(): JsonResponse
    {
        try {
            $results = [];

            // Sync Facebook pages
            try {
                $facebookPages = $this->facebookService->getPages();
                $results['facebook'] = [
                    'success' => true,
                    'count' => count($facebookPages),
                    'message' => 'Facebook pages synced successfully'
                ];
            } catch (\Exception $e) {
                $results['facebook'] = [
                    'success' => false,
                    'message' => 'Failed to sync Facebook: ' . $e->getMessage()
                ];
            }

            // Sync Instagram accounts
            try {
                $instagramAccounts = $this->instagramService->getBusinessAccounts();
                $results['instagram'] = [
                    'success' => true,
                    'count' => count($instagramAccounts),
                    'message' => 'Instagram accounts synced successfully'
                ];
            } catch (\Exception $e) {
                $results['instagram'] = [
                    'success' => false,
                    'message' => 'Failed to sync Instagram: ' . $e->getMessage()
                ];
            }

            // Sync LinkedIn companies
            try {
                $linkedInCompanies = $this->linkedInService->getCompanyPages();
                $results['linkedin'] = [
                    'success' => true,
                    'count' => count($linkedInCompanies),
                    'message' => 'LinkedIn companies synced successfully'
                ];
            } catch (\Exception $e) {
                $results['linkedin'] = [
                    'success' => false,
                    'message' => 'Failed to sync LinkedIn: ' . $e->getMessage()
                ];
            }

            $successCount = collect($results)->where('success', true)->count();
            $totalCount = count($results);

            return response()->json([
                'success' => $successCount > 0,
                'message' => "Synced {$successCount}/{$totalCount} platforms successfully",
                'results' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync platforms: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Facebook statistics
     */
    private function getFacebookStats(): array
    {
        $pages = FacebookPage::count();
        $posts = SocialPost::where('platform', 'facebook')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
        
        return [
            'pages' => $pages,
            'posts_last_30_days' => $posts,
            'total_followers' => FacebookPage::sum('followers_count'),
        ];
    }

    /**
     * Get Instagram statistics
     */
    private function getInstagramStats(): array
    {
        $accounts = InstagramAccount::count();
        $posts = SocialPost::where('platform', 'instagram')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
        
        return [
            'accounts' => $accounts,
            'posts_last_30_days' => $posts,
            'total_followers' => InstagramAccount::sum('followers_count'),
        ];
    }

    /**
     * Get LinkedIn statistics
     */
    private function getLinkedInStats(): array
    {
        $companies = LinkedInCompany::count();
        $posts = SocialPost::where('platform', 'linkedin')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
        
        return [
            'companies' => $companies,
            'posts_last_30_days' => $posts,
            'total_followers' => LinkedInCompany::sum('follower_count'),
        ];
    }

    /**
     * Get overall engagement metrics
     */
    private function getOverallEngagementMetrics(): array
    {
        $posts = SocialPost::where('status', SocialPost::STATUS_PUBLISHED)
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        return [
            'total_posts' => $posts->count(),
            'total_likes' => $posts->sum('likes_count'),
            'total_comments' => $posts->sum('comments_count'),
            'total_shares' => $posts->sum('shares_count'),
            'avg_engagement_rate' => $posts->avg('engagement_rate') ?? 0,
        ];
    }

    /**
     * Publish post to specific platform
     */
    private function publishPostToPlatform(SocialPost $post): array
    {
        return match($post->platform) {
            'facebook' => app(FacebookController::class)->publishPost($post),
            'instagram' => app(InstagramController::class)->publishPost($post),
            'linkedin' => app(LinkedInController::class)->publishPost($post),
            default => ['success' => false, 'message' => 'Unknown platform']
        };
    }

    /**
     * Get Facebook analytics for period
     */
    private function getFacebookAnalytics(string $period): array
    {
        // Implementation would depend on Facebook API
        return ['posts' => 0, 'engagement' => 0, 'reach' => 0];
    }

    /**
     * Get Instagram analytics for period
     */
    private function getInstagramAnalytics(string $period): array
    {
        // Implementation would depend on Instagram API
        return ['posts' => 0, 'engagement' => 0, 'reach' => 0];
    }

    /**
     * Get LinkedIn analytics for period
     */
    private function getLinkedInAnalytics(string $period): array
    {
        // Implementation would depend on LinkedIn API
        return ['posts' => 0, 'engagement' => 0, 'reach' => 0];
    }
}
