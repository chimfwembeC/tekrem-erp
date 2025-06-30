<?php

namespace App\Http\Controllers\SocialMedia;

use App\Http\Controllers\Controller;
use App\Services\SocialMedia\InstagramService;
use App\Models\SocialMedia\InstagramAccount;
use App\Models\SocialMedia\InstagramMedia;
use App\Models\SocialMedia\SocialPost;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class InstagramController extends Controller
{
    protected InstagramService $instagramService;

    public function __construct(InstagramService $instagramService)
    {
        $this->instagramService = $instagramService;
    }

    /**
     * Display Instagram dashboard
     */
    public function index(): Response
    {
        $accounts = InstagramAccount::with(['media' => function ($query) {
            $query->orderBy('timestamp', 'desc')->limit(10);
        }])->get();

        $recentMedia = InstagramMedia::with('account')
            ->orderBy('timestamp', 'desc')
            ->limit(20)
            ->get();

        $stats = [
            'total_accounts' => $accounts->count(),
            'total_media' => InstagramMedia::count(),
            'total_followers' => $accounts->sum('followers_count'),
            'avg_engagement' => $accounts->avg('engagement_rate') ?? 0,
        ];

        return Inertia::render('SocialMedia/Instagram/Index', [
            'accounts' => $accounts,
            'recentMedia' => $recentMedia,
            'stats' => $stats,
        ]);
    }

    /**
     * Sync Instagram business accounts
     */
    public function syncAccounts(Request $request): JsonResponse
    {
        try {
            $businessAccounts = $this->instagramService->getBusinessAccounts();
            $syncedCount = 0;

            foreach ($businessAccounts as $accountData) {
                $accountInfo = $this->instagramService->getAccountInfo($accountData['id']);
                
                if (!empty($accountInfo)) {
                    InstagramAccount::updateOrCreate(
                        ['instagram_account_id' => $accountData['id']],
                        [
                            'username' => $accountInfo['username'] ?? '',
                            'name' => $accountInfo['name'] ?? $accountData['name'],
                            'profile_picture_url' => $accountInfo['profile_picture_url'] ?? null,
                            'followers_count' => $accountInfo['followers_count'] ?? 0,
                            'follows_count' => $accountInfo['follows_count'] ?? 0,
                            'media_count' => $accountInfo['media_count'] ?? 0,
                            'biography' => $accountInfo['biography'] ?? null,
                            'website' => $accountInfo['website'] ?? null,
                            'last_sync_at' => now(),
                        ]
                    );
                    $syncedCount++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Synced {$syncedCount} Instagram accounts",
                'accounts_count' => $syncedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync Instagram accounts: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync media for an Instagram account
     */
    public function syncMedia(Request $request): JsonResponse
    {
        $request->validate([
            'account_id' => 'required|string'
        ]);

        try {
            $syncedCount = $this->instagramService->syncMedia($request->account_id);

            return response()->json([
                'success' => true,
                'message' => "Synced {$syncedCount} media items",
                'media_count' => $syncedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync media: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search hashtags
     */
    public function searchHashtags(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:1'
        ]);

        try {
            $hashtags = $this->instagramService->searchHashtags($request->query);

            return response()->json([
                'success' => true,
                'hashtags' => $hashtags
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search hashtags: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get hashtag information and recent media
     */
    public function getHashtagInfo(Request $request): JsonResponse
    {
        $request->validate([
            'hashtag_id' => 'required|string'
        ]);

        try {
            $hashtagInfo = $this->instagramService->getHashtagInfo($request->hashtag_id);
            $recentMedia = $this->instagramService->getHashtagMedia($request->hashtag_id, 20);

            return response()->json([
                'success' => true,
                'hashtag' => $hashtagInfo,
                'recent_media' => $recentMedia
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get hashtag info: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create and schedule Instagram post
     */
    public function createPost(Request $request): JsonResponse
    {
        $request->validate([
            'account_id' => 'required|string',
            'caption' => 'required|string|max:2200',
            'media_url' => 'required|url',
            'media_type' => 'required|in:image,video',
            'scheduled_at' => 'nullable|date|after:now'
        ]);

        try {
            $post = SocialPost::create([
                'platform' => 'instagram',
                'platform_account_id' => $request->account_id,
                'content' => $request->caption,
                'media_urls' => [$request->media_url],
                'media_type' => $request->media_type,
                'status' => $request->scheduled_at ? SocialPost::STATUS_SCHEDULED : SocialPost::STATUS_DRAFT,
                'scheduled_at' => $request->scheduled_at ? Carbon::parse($request->scheduled_at) : null,
                'created_by' => auth()->id(),
            ]);

            // If not scheduled, publish immediately
            if (!$request->scheduled_at) {
                $result = $this->publishPost($post);
                if (!$result['success']) {
                    return response()->json($result, 500);
                }
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
     * Publish Instagram post
     */
    public function publishPost(SocialPost $post): array
    {
        try {
            // Create media container
            $mediaData = [
                'caption' => $post->content,
            ];

            if ($post->media_type === 'image') {
                $mediaData['image_url'] = $post->media_urls[0];
            } else {
                $mediaData['video_url'] = $post->media_urls[0];
            }

            $containerResult = $this->instagramService->createMediaContainer(
                $post->platform_account_id,
                $mediaData
            );

            if ($containerResult['status'] !== 'success') {
                $post->update([
                    'status' => SocialPost::STATUS_FAILED,
                    'error_message' => $containerResult['message']
                ]);

                return [
                    'success' => false,
                    'message' => $containerResult['message']
                ];
            }

            // Publish media
            $publishResult = $this->instagramService->publishMedia(
                $post->platform_account_id,
                $containerResult['container_id']
            );

            if ($publishResult['status'] === 'success') {
                $post->update([
                    'status' => SocialPost::STATUS_PUBLISHED,
                    'platform_post_id' => $publishResult['media_id'],
                    'published_at' => now(),
                    'error_message' => null
                ]);

                return [
                    'success' => true,
                    'message' => 'Post published successfully'
                ];
            } else {
                $post->update([
                    'status' => SocialPost::STATUS_FAILED,
                    'error_message' => $publishResult['message']
                ]);

                return [
                    'success' => false,
                    'message' => $publishResult['message']
                ];
            }
        } catch (\Exception $e) {
            $post->update([
                'status' => SocialPost::STATUS_FAILED,
                'error_message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to publish post: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get Instagram insights
     */
    public function getInsights(Request $request): JsonResponse
    {
        $request->validate([
            'account_id' => 'required|string',
            'period' => 'nullable|in:day,week,month',
            'metrics' => 'nullable|array'
        ]);

        try {
            $period = $request->period ?? 'week';
            $since = match($period) {
                'day' => now()->subDay(),
                'week' => now()->subWeek(),
                'month' => now()->subMonth(),
                default => now()->subWeek()
            };

            $insights = $this->instagramService->getAccountInsights(
                $request->account_id,
                $request->metrics ?? [],
                $since
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
     * Test Instagram connection
     */
    public function testConnection(): JsonResponse
    {
        $result = $this->instagramService->testConnection();
        
        return response()->json($result, $result['status'] === 'success' ? 200 : 500);
    }
}
