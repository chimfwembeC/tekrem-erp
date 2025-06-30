<?php

namespace App\Services\SocialMedia;

use App\Models\Setting;
use App\Models\SocialMedia\SocialPost;
use App\Models\SocialMedia\LinkedInCompany;
use App\Models\SocialMedia\LinkedInLead;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class LinkedInService
{
    private string $apiVersion = 'v2';
    private string $baseUrl;
    private ?string $accessToken;

    public function __construct()
    {
        $this->baseUrl = "https://api.linkedin.com/{$this->apiVersion}";
        $this->accessToken = Setting::get('integration.linkedin.access_token');
    }

    /**
     * Test LinkedIn API connection
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

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'X-Restli-Protocol-Version' => '2.0.0'
            ])->get("{$this->baseUrl}/me");

            if ($response->successful()) {
                $data = $response->json();
                $name = $data['localizedFirstName'] . ' ' . $data['localizedLastName'];
                return [
                    'status' => 'success',
                    'message' => "Connected to LinkedIn as: {$name}",
                    'data' => $data
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to connect to LinkedIn API'
            ];
        } catch (\Exception $e) {
            Log::error('LinkedIn connection test failed', ['error' => $e->getMessage()]);
            return [
                'status' => 'error',
                'message' => 'Connection failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get user profile information
     */
    public function getUserProfile(): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'X-Restli-Protocol-Version' => '2.0.0'
            ])->get("{$this->baseUrl}/me", [
                'projection' => '(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))'
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch LinkedIn user profile', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get company pages managed by the user
     */
    public function getCompanyPages(): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'X-Restli-Protocol-Version' => '2.0.0'
            ])->get("{$this->baseUrl}/organizationAcls", [
                'q' => 'roleAssignee',
                'projection' => '(elements*(organizationalTarget~(id,localizedName,logoV2(original~:playableStreams)),role))'
            ]);

            if ($response->successful()) {
                $companies = [];
                $data = $response->json();
                
                foreach ($data['elements'] ?? [] as $element) {
                    if (isset($element['organizationalTarget~'])) {
                        $company = $element['organizationalTarget~'];
                        $companies[] = [
                            'id' => $company['id'],
                            'name' => $company['localizedName'],
                            'logo' => $company['logoV2']['original~']['elements'][0]['identifiers'][0]['identifier'] ?? null,
                            'role' => $element['role']
                        ];
                    }
                }
                
                return $companies;
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch LinkedIn company pages', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get company information
     */
    public function getCompanyInfo(string $companyId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'X-Restli-Protocol-Version' => '2.0.0'
            ])->get("{$this->baseUrl}/organizations/{$companyId}", [
                'projection' => '(id,localizedName,localizedDescription,logoV2(original~:playableStreams),websiteUrl,industries,specialties,foundedOn,locations)'
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch LinkedIn company info', [
                'company_id' => $companyId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Create a text post
     */
    public function createTextPost(string $authorUrn, string $text, string $visibility = 'PUBLIC'): array
    {
        try {
            $postData = [
                'author' => $authorUrn,
                'lifecycleState' => 'PUBLISHED',
                'specificContent' => [
                    'com.linkedin.ugc.ShareContent' => [
                        'shareCommentary' => [
                            'text' => $text
                        ],
                        'shareMediaCategory' => 'NONE'
                    ]
                ],
                'visibility' => [
                    'com.linkedin.ugc.MemberNetworkVisibility' => $visibility
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'X-Restli-Protocol-Version' => '2.0.0',
                'Content-Type' => 'application/json'
            ])->post("{$this->baseUrl}/ugcPosts", $postData);

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'post_id' => $response->json()['id']
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to create post'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to create LinkedIn text post', [
                'author' => $authorUrn,
                'error' => $e->getMessage()
            ]);
            return [
                'status' => 'error',
                'message' => 'Failed to create post: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create a post with media
     */
    public function createMediaPost(string $authorUrn, string $text, array $mediaUrns, string $visibility = 'PUBLIC'): array
    {
        try {
            $media = [];
            foreach ($mediaUrns as $mediaUrn) {
                $media[] = [
                    'status' => 'READY',
                    'description' => [
                        'text' => ''
                    ],
                    'media' => $mediaUrn,
                    'title' => [
                        'text' => ''
                    ]
                ];
            }

            $postData = [
                'author' => $authorUrn,
                'lifecycleState' => 'PUBLISHED',
                'specificContent' => [
                    'com.linkedin.ugc.ShareContent' => [
                        'shareCommentary' => [
                            'text' => $text
                        ],
                        'shareMediaCategory' => 'IMAGE',
                        'media' => $media
                    ]
                ],
                'visibility' => [
                    'com.linkedin.ugc.MemberNetworkVisibility' => $visibility
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'X-Restli-Protocol-Version' => '2.0.0',
                'Content-Type' => 'application/json'
            ])->post("{$this->baseUrl}/ugcPosts", $postData);

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'post_id' => $response->json()['id']
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to create media post'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to create LinkedIn media post', [
                'author' => $authorUrn,
                'error' => $e->getMessage()
            ]);
            return [
                'status' => 'error',
                'message' => 'Failed to create media post: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Upload media to LinkedIn
     */
    public function uploadMedia(string $authorUrn, string $mediaUrl): array
    {
        try {
            // Step 1: Register upload
            $registerData = [
                'registerUploadRequest' => [
                    'recipes' => ['urn:li:digitalmediaRecipe:feedshare-image'],
                    'owner' => $authorUrn,
                    'serviceRelationships' => [
                        [
                            'relationshipType' => 'OWNER',
                            'identifier' => 'urn:li:userGeneratedContent'
                        ]
                    ]
                ]
            ];

            $registerResponse = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'X-Restli-Protocol-Version' => '2.0.0',
                'Content-Type' => 'application/json'
            ])->post("{$this->baseUrl}/assets?action=registerUpload", $registerData);

            if (!$registerResponse->successful()) {
                return [
                    'status' => 'error',
                    'message' => 'Failed to register upload'
                ];
            }

            $registerResult = $registerResponse->json();
            $uploadUrl = $registerResult['value']['uploadMechanism']['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']['uploadUrl'];
            $asset = $registerResult['value']['asset'];

            // Step 2: Upload the media
            $mediaContent = file_get_contents($mediaUrl);
            $uploadResponse = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'Content-Type' => 'application/octet-stream'
            ])->withBody($mediaContent, 'application/octet-stream')
              ->put($uploadUrl);

            if ($uploadResponse->successful()) {
                return [
                    'status' => 'success',
                    'asset_urn' => $asset
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to upload media'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to upload LinkedIn media', [
                'author' => $authorUrn,
                'media_url' => $mediaUrl,
                'error' => $e->getMessage()
            ]);
            return [
                'status' => 'error',
                'message' => 'Failed to upload media: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get company analytics
     */
    public function getCompanyAnalytics(string $companyId, Carbon $startDate, Carbon $endDate): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'X-Restli-Protocol-Version' => '2.0.0'
            ])->get("{$this->baseUrl}/organizationalEntityShareStatistics", [
                'q' => 'organizationalEntity',
                'organizationalEntity' => "urn:li:organization:{$companyId}",
                'timeIntervals.timeGranularityType' => 'DAY',
                'timeIntervals.timeRange.start' => $startDate->timestamp * 1000,
                'timeIntervals.timeRange.end' => $endDate->timestamp * 1000
            ]);

            if ($response->successful()) {
                return $response->json()['elements'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch LinkedIn company analytics', [
                'company_id' => $companyId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get company followers
     */
    public function getCompanyFollowers(string $companyId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'X-Restli-Protocol-Version' => '2.0.0'
            ])->get("{$this->baseUrl}/organizationalEntityFollowerStatistics", [
                'q' => 'organizationalEntity',
                'organizationalEntity' => "urn:li:organization:{$companyId}"
            ]);

            if ($response->successful()) {
                return $response->json()['elements'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch LinkedIn company followers', [
                'company_id' => $companyId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Search for people (lead generation)
     */
    public function searchPeople(array $criteria): array
    {
        try {
            $params = [
                'q' => 'people',
                'start' => $criteria['start'] ?? 0,
                'count' => $criteria['count'] ?? 10
            ];

            if (isset($criteria['keywords'])) {
                $params['keywords'] = $criteria['keywords'];
            }

            if (isset($criteria['company'])) {
                $params['currentCompany'] = $criteria['company'];
            }

            if (isset($criteria['title'])) {
                $params['title'] = $criteria['title'];
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'X-Restli-Protocol-Version' => '2.0.0'
            ])->get("{$this->baseUrl}/people", $params);

            if ($response->successful()) {
                return $response->json()['elements'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to search LinkedIn people', [
                'criteria' => $criteria,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get post analytics
     */
    public function getPostAnalytics(string $postId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'X-Restli-Protocol-Version' => '2.0.0'
            ])->get("{$this->baseUrl}/socialActions/{$postId}");

            if ($response->successful()) {
                return $response->json();
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch LinkedIn post analytics', [
                'post_id' => $postId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
}
