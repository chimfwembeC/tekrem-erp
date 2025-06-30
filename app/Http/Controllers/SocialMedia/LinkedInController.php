<?php

namespace App\Http\Controllers\SocialMedia;

use App\Http\Controllers\Controller;
use App\Services\SocialMedia\LinkedInService;
use App\Models\SocialMedia\LinkedInCompany;
use App\Models\SocialMedia\LinkedInLead;
use App\Models\SocialMedia\SocialPost;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class LinkedInController extends Controller
{
    protected LinkedInService $linkedInService;

    public function __construct(LinkedInService $linkedInService)
    {
        $this->linkedInService = $linkedInService;
    }

    /**
     * Display LinkedIn dashboard
     */
    public function index(): Response
    {
        $companies = LinkedInCompany::with(['socialPosts' => function ($query) {
            $query->orderBy('created_at', 'desc')->limit(5);
        }])->get();

        $recentLeads = LinkedInLead::with('lead')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $stats = [
            'total_companies' => $companies->count(),
            'total_leads' => LinkedInLead::count(),
            'total_followers' => $companies->sum('follower_count'),
            'avg_engagement' => $companies->avg('engagement_rate') ?? 0,
            'unprocessed_leads' => LinkedInLead::unprocessed()->count(),
            'high_value_leads' => LinkedInLead::highValue()->count(),
        ];

        return Inertia::render('SocialMedia/LinkedIn/Index', [
            'companies' => $companies,
            'recentLeads' => $recentLeads,
            'stats' => $stats,
        ]);
    }

    /**
     * Sync LinkedIn company pages
     */
    public function syncCompanies(Request $request): JsonResponse
    {
        try {
            $companyPages = $this->linkedInService->getCompanyPages();
            $syncedCount = 0;

            foreach ($companyPages as $companyData) {
                $companyInfo = $this->linkedInService->getCompanyInfo($companyData['id']);
                
                if (!empty($companyInfo)) {
                    LinkedInCompany::updateOrCreate(
                        ['linkedin_company_id' => $companyData['id']],
                        [
                            'name' => $companyInfo['localizedName'] ?? $companyData['name'],
                            'description' => $companyInfo['localizedDescription'] ?? null,
                            'logo_url' => $companyInfo['logoV2']['original~']['elements'][0]['identifiers'][0]['identifier'] ?? null,
                            'website_url' => $companyInfo['websiteUrl'] ?? null,
                            'industries' => $companyInfo['industries'] ?? [],
                            'specialties' => $companyInfo['specialties'] ?? [],
                            'founded_on' => isset($companyInfo['foundedOn']) ? Carbon::createFromFormat('Y', $companyInfo['foundedOn']['year']) : null,
                            'locations' => $companyInfo['locations'] ?? [],
                            'last_sync_at' => now(),
                        ]
                    );
                    $syncedCount++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Synced {$syncedCount} LinkedIn companies",
                'companies_count' => $syncedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync LinkedIn companies: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search for LinkedIn leads
     */
    public function searchLeads(Request $request): JsonResponse
    {
        $request->validate([
            'keywords' => 'nullable|string',
            'company' => 'nullable|string',
            'title' => 'nullable|string',
            'count' => 'nullable|integer|min:1|max:50'
        ]);

        try {
            $criteria = [
                'keywords' => $request->keywords,
                'company' => $request->company,
                'title' => $request->title,
                'count' => $request->count ?? 10,
                'start' => 0
            ];

            $people = $this->linkedInService->searchPeople($criteria);

            return response()->json([
                'success' => true,
                'leads' => $people,
                'count' => count($people)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search LinkedIn leads: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import LinkedIn lead to CRM
     */
    public function importLead(Request $request): JsonResponse
    {
        $request->validate([
            'linkedin_profile_id' => 'required|string',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'headline' => 'nullable|string',
            'profile_url' => 'nullable|url',
            'current_company' => 'nullable|string',
            'current_position' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
        ]);

        try {
            // Create CRM lead
            $lead = Lead::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'company' => $request->current_company,
                'job_title' => $request->current_position,
                'source' => 'linkedin',
                'status' => 'new',
                'assigned_to' => auth()->id(),
            ]);

            // Create LinkedIn lead record
            $linkedInLead = LinkedInLead::create([
                'lead_id' => $lead->id,
                'linkedin_profile_id' => $request->linkedin_profile_id,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'headline' => $request->headline,
                'profile_url' => $request->profile_url,
                'current_company' => $request->current_company,
                'current_position' => $request->current_position,
                'contact_info' => [
                    'email' => $request->email,
                    'phone' => $request->phone,
                ],
                'lead_source' => 'search',
                'engagement_level' => 'low',
            ]);

            // Calculate and update lead score
            $linkedInLead->updateLeadScore();

            return response()->json([
                'success' => true,
                'message' => 'Lead imported successfully',
                'lead' => $lead,
                'linkedin_lead' => $linkedInLead
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to import lead: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create and schedule LinkedIn post
     */
    public function createPost(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|string',
            'content' => 'required|string|max:3000',
            'media_urls' => 'nullable|array',
            'media_urls.*' => 'url',
            'visibility' => 'nullable|in:PUBLIC,CONNECTIONS',
            'scheduled_at' => 'nullable|date|after:now'
        ]);

        try {
            $post = SocialPost::create([
                'platform' => 'linkedin',
                'platform_account_id' => $request->company_id,
                'content' => $request->content,
                'media_urls' => $request->media_urls ?? [],
                'media_type' => !empty($request->media_urls) ? 'image' : 'text',
                'status' => $request->scheduled_at ? SocialPost::STATUS_SCHEDULED : SocialPost::STATUS_DRAFT,
                'scheduled_at' => $request->scheduled_at ? Carbon::parse($request->scheduled_at) : null,
                'metadata' => [
                    'visibility' => $request->visibility ?? 'PUBLIC'
                ],
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
     * Publish LinkedIn post
     */
    public function publishPost(SocialPost $post): array
    {
        try {
            $authorUrn = "urn:li:organization:{$post->platform_account_id}";
            $visibility = $post->metadata['visibility'] ?? 'PUBLIC';

            if (empty($post->media_urls)) {
                // Text post
                $result = $this->linkedInService->createTextPost(
                    $authorUrn,
                    $post->content,
                    $visibility
                );
            } else {
                // Media post - first upload media
                $mediaUrns = [];
                foreach ($post->media_urls as $mediaUrl) {
                    $uploadResult = $this->linkedInService->uploadMedia($authorUrn, $mediaUrl);
                    if ($uploadResult['status'] === 'success') {
                        $mediaUrns[] = $uploadResult['asset_urn'];
                    }
                }

                if (empty($mediaUrns)) {
                    $post->update([
                        'status' => SocialPost::STATUS_FAILED,
                        'error_message' => 'Failed to upload media'
                    ]);

                    return [
                        'success' => false,
                        'message' => 'Failed to upload media'
                    ];
                }

                $result = $this->linkedInService->createMediaPost(
                    $authorUrn,
                    $post->content,
                    $mediaUrns,
                    $visibility
                );
            }

            if ($result['status'] === 'success') {
                $post->update([
                    'status' => SocialPost::STATUS_PUBLISHED,
                    'platform_post_id' => $result['post_id'],
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
                    'error_message' => $result['message']
                ]);

                return [
                    'success' => false,
                    'message' => $result['message']
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
     * Get LinkedIn analytics
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|string',
            'period' => 'nullable|in:day,week,month',
        ]);

        try {
            $period = $request->period ?? 'week';
            $endDate = now();
            $startDate = match($period) {
                'day' => $endDate->copy()->subDay(),
                'week' => $endDate->copy()->subWeek(),
                'month' => $endDate->copy()->subMonth(),
                default => $endDate->copy()->subWeek()
            };

            $analytics = $this->linkedInService->getCompanyAnalytics(
                $request->company_id,
                $startDate,
                $endDate
            );

            $followers = $this->linkedInService->getCompanyFollowers($request->company_id);

            return response()->json([
                'success' => true,
                'analytics' => $analytics,
                'followers' => $followers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test LinkedIn connection
     */
    public function testConnection(): JsonResponse
    {
        $result = $this->linkedInService->testConnection();
        
        return response()->json($result, $result['status'] === 'success' ? 200 : 500);
    }
}
