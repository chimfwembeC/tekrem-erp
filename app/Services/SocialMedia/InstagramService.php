<?php

namespace App\Services\SocialMedia;

use App\Models\Setting;
use App\Models\SocialMedia\SocialPost;
use App\Models\SocialMedia\InstagramAccount;
use App\Models\SocialMedia\InstagramMedia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class InstagramService
{
    private string $apiVersion = 'v18.0';
    private string $baseUrl;
    private ?string $accessToken;
    private ?string $businessAccountId;

    public function __construct()
    {
        $this->baseUrl = "https://graph.facebook.com/{$this->apiVersion}";
        $this->accessToken = Setting::get('integration.instagram.access_token');
        $this->businessAccountId = Setting::get('integration.instagram.business_account_id');
    }

    /**
     * Test Instagram API connection
     */
    public function testConnection(): array
    {
        try {
            if (!$this->accessToken) {
                return [
                    'status' => 'error',
                    'message' => 'Access token not configured'
                ];
            }

            $response = Http::get("{$this->baseUrl}/me", [
                'access_token' => $this->accessToken,
                'fields' => 'id,name'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'status' => 'success',
                    'message' => "Connected to Instagram as: {$data['name']}",
                    'data' => $data
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to connect to Instagram API'
            ];
        } catch (\Exception $e) {
            Log::error('Instagram connection test failed', ['error' => $e->getMessage()]);
            return [
                'status' => 'error',
                'message' => 'Connection failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get Instagram business accounts
     */
    public function getBusinessAccounts(): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/me/accounts", [
                'access_token' => $this->accessToken,
                'fields' => 'id,name,instagram_business_account'
            ]);

            if ($response->successful()) {
                $accounts = [];
                foreach ($response->json()['data'] as $page) {
                    if (isset($page['instagram_business_account'])) {
                        $igAccount = $page['instagram_business_account'];
                        $accounts[] = [
                            'id' => $igAccount['id'],
                            'name' => $page['name'],
                            'page_id' => $page['id']
                        ];
                    }
                }
                return $accounts;
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Instagram business accounts', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get Instagram account info
     */
    public function getAccountInfo(string $accountId): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/{$accountId}", [
                'access_token' => $this->accessToken,
                'fields' => 'id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website'
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Instagram account info', [
                'account_id' => $accountId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get Instagram media
     */
    public function getMedia(string $accountId, int $limit = 25): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/{$accountId}/media", [
                'access_token' => $this->accessToken,
                'fields' => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
                'limit' => $limit
            ]);

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Instagram media', [
                'account_id' => $accountId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get media insights
     */
    public function getMediaInsights(string $mediaId): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/{$mediaId}/insights", [
                'access_token' => $this->accessToken,
                'metric' => 'impressions,reach,engagement,saves,profile_visits,website_clicks'
            ]);

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Instagram media insights', [
                'media_id' => $mediaId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Search hashtags
     */
    public function searchHashtags(string $query): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/ig_hashtag_search", [
                'access_token' => $this->accessToken,
                'user_id' => $this->businessAccountId,
                'q' => $query
            ]);

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to search Instagram hashtags', [
                'query' => $query,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get hashtag info
     */
    public function getHashtagInfo(string $hashtagId): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/{$hashtagId}", [
                'access_token' => $this->accessToken,
                'fields' => 'id,name,media_count'
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Instagram hashtag info', [
                'hashtag_id' => $hashtagId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get recent media for hashtag
     */
    public function getHashtagMedia(string $hashtagId, int $limit = 25): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/{$hashtagId}/recent_media", [
                'access_token' => $this->accessToken,
                'user_id' => $this->businessAccountId,
                'fields' => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
                'limit' => $limit
            ]);

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Instagram hashtag media', [
                'hashtag_id' => $hashtagId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Create Instagram media container
     */
    public function createMediaContainer(string $accountId, array $mediaData): array
    {
        try {
            $params = [
                'access_token' => $this->accessToken,
                'caption' => $mediaData['caption'] ?? '',
            ];

            if (isset($mediaData['image_url'])) {
                $params['image_url'] = $mediaData['image_url'];
            } elseif (isset($mediaData['video_url'])) {
                $params['video_url'] = $mediaData['video_url'];
                $params['media_type'] = 'VIDEO';
            }

            $response = Http::post("{$this->baseUrl}/{$accountId}/media", $params);

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'container_id' => $response->json()['id']
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to create media container'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to create Instagram media container', [
                'account_id' => $accountId,
                'error' => $e->getMessage()
            ]);
            return [
                'status' => 'error',
                'message' => 'Failed to create media container: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Publish Instagram media
     */
    public function publishMedia(string $accountId, string $containerId): array
    {
        try {
            $response = Http::post("{$this->baseUrl}/{$accountId}/media_publish", [
                'access_token' => $this->accessToken,
                'creation_id' => $containerId
            ]);

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'media_id' => $response->json()['id']
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to publish media'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to publish Instagram media', [
                'account_id' => $accountId,
                'container_id' => $containerId,
                'error' => $e->getMessage()
            ]);
            return [
                'status' => 'error',
                'message' => 'Failed to publish media: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get account insights
     */
    public function getAccountInsights(string $accountId, array $metrics = [], ?Carbon $since = null, ?Carbon $until = null): array
    {
        try {
            $defaultMetrics = [
                'impressions',
                'reach',
                'profile_views',
                'website_clicks'
            ];

            $params = [
                'access_token' => $this->accessToken,
                'metric' => implode(',', $metrics ?: $defaultMetrics),
                'period' => 'day'
            ];

            if ($since) {
                $params['since'] = $since->timestamp;
            }

            if ($until) {
                $params['until'] = $until->timestamp;
            }

            $response = Http::get("{$this->baseUrl}/{$accountId}/insights", $params);

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Instagram account insights', [
                'account_id' => $accountId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Sync media from Instagram
     */
    public function syncMedia(string $accountId): int
    {
        try {
            $media = $this->getMedia($accountId, 50);
            $syncedCount = 0;

            foreach ($media as $mediaData) {
                InstagramMedia::updateOrCreate(
                    ['instagram_media_id' => $mediaData['id']],
                    [
                        'account_id' => $accountId,
                        'media_type' => $mediaData['media_type'],
                        'media_url' => $mediaData['media_url'] ?? null,
                        'thumbnail_url' => $mediaData['thumbnail_url'] ?? null,
                        'caption' => $mediaData['caption'] ?? null,
                        'permalink' => $mediaData['permalink'],
                        'timestamp' => Carbon::parse($mediaData['timestamp']),
                        'like_count' => $mediaData['like_count'] ?? 0,
                        'comments_count' => $mediaData['comments_count'] ?? 0,
                        'last_sync_at' => now(),
                    ]
                );
                $syncedCount++;
            }

            return $syncedCount;
        } catch (\Exception $e) {
            Log::error('Failed to sync Instagram media', [
                'account_id' => $accountId,
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }
}
