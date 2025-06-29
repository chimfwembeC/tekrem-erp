<?php

namespace App\Services\SocialMedia;

use App\Models\Setting;
use App\Models\Client;
use App\Models\Lead;
use App\Models\SocialMedia\FacebookPage;
use App\Models\SocialMedia\FacebookLead;
use App\Models\SocialMedia\SocialPost;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class FacebookService
{
    private string $apiVersion = 'v18.0';
    private string $baseUrl;
    private ?string $accessToken;
    private ?string $appId;
    private ?string $appSecret;

    public function __construct()
    {
        $this->baseUrl = "https://graph.facebook.com/{$this->apiVersion}";
        $this->accessToken = Setting::get('integration.facebook.page_access_token');
        $this->appId = Setting::get('integration.facebook.app_id');
        $this->appSecret = Setting::get('integration.facebook.app_secret');
    }

    /**
     * Test Facebook API connection
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
                    'message' => "Connected to Facebook as: {$data['name']}",
                    'data' => $data
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to connect to Facebook API'
            ];
        } catch (\Exception $e) {
            Log::error('Facebook connection test failed', ['error' => $e->getMessage()]);
            return [
                'status' => 'error',
                'message' => 'Connection failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get Facebook pages managed by the user
     */
    public function getPages(): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/me/accounts", [
                'access_token' => $this->accessToken,
                'fields' => 'id,name,access_token,category,picture'
            ]);

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Facebook pages', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Subscribe to page webhooks
     */
    public function subscribeToWebhooks(string $pageId, string $pageAccessToken): bool
    {
        try {
            $response = Http::post("{$this->baseUrl}/{$pageId}/subscribed_apps", [
                'access_token' => $pageAccessToken,
                'subscribed_fields' => 'messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads,messaging_payments,messaging_pre_checkouts,messaging_checkout_updates,messaging_account_linking,messaging_referrals,message_echoes,messaging_game_plays,standby,messaging_handovers,messaging_policy_enforcement,leadgen'
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Failed to subscribe to Facebook webhooks', [
                'page_id' => $pageId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get leads from Facebook Lead Ads
     */
    public function getLeads(string $pageId, ?Carbon $since = null): array
    {
        try {
            $params = [
                'access_token' => $this->accessToken,
                'fields' => 'id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,field_data'
            ];

            if ($since) {
                $params['since'] = $since->timestamp;
            }

            $response = Http::get("{$this->baseUrl}/{$pageId}/leadgen_forms", [
                'access_token' => $this->accessToken,
                'fields' => 'id,name,leads{id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,field_data}'
            ]);

            if ($response->successful()) {
                $forms = $response->json()['data'] ?? [];
                $allLeads = [];

                foreach ($forms as $form) {
                    if (isset($form['leads']['data'])) {
                        $allLeads = array_merge($allLeads, $form['leads']['data']);
                    }
                }

                return $allLeads;
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Facebook leads', [
                'page_id' => $pageId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Process and store Facebook lead in CRM
     */
    public function processLead(array $leadData): ?Lead
    {
        try {
            // Extract field data
            $fieldData = [];
            foreach ($leadData['field_data'] as $field) {
                $fieldData[$field['name']] = $field['values'][0] ?? '';
            }

            // Create or update lead
            $lead = Lead::updateOrCreate(
                ['facebook_lead_id' => $leadData['id']],
                [
                    'name' => $fieldData['full_name'] ?? $fieldData['first_name'] . ' ' . $fieldData['last_name'] ?? 'Unknown',
                    'email' => $fieldData['email'] ?? null,
                    'phone' => $fieldData['phone_number'] ?? null,
                    'company' => $fieldData['company_name'] ?? null,
                    'source' => 'facebook_ads',
                    'status' => 'new',
                    'facebook_ad_id' => $leadData['ad_id'] ?? null,
                    'facebook_campaign_id' => $leadData['campaign_id'] ?? null,
                    'facebook_form_id' => $leadData['form_id'] ?? null,
                    'facebook_created_time' => isset($leadData['created_time']) ? Carbon::parse($leadData['created_time']) : now(),
                    'notes' => 'Lead captured from Facebook Ad: ' . ($leadData['ad_name'] ?? 'Unknown Ad'),
                    'assigned_to' => null, // Will be assigned based on lead routing rules
                ]
            );

            // Store additional Facebook-specific data
            FacebookLead::updateOrCreate(
                ['lead_id' => $lead->id],
                [
                    'facebook_lead_id' => $leadData['id'],
                    'ad_id' => $leadData['ad_id'] ?? null,
                    'ad_name' => $leadData['ad_name'] ?? null,
                    'adset_id' => $leadData['adset_id'] ?? null,
                    'adset_name' => $leadData['adset_name'] ?? null,
                    'campaign_id' => $leadData['campaign_id'] ?? null,
                    'campaign_name' => $leadData['campaign_name'] ?? null,
                    'form_id' => $leadData['form_id'] ?? null,
                    'field_data' => $fieldData,
                    'created_time' => isset($leadData['created_time']) ? Carbon::parse($leadData['created_time']) : now(),
                ]
            );

            return $lead;
        } catch (\Exception $e) {
            Log::error('Failed to process Facebook lead', [
                'lead_data' => $leadData,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Post content to Facebook page
     */
    public function postToPage(string $pageId, string $pageAccessToken, array $content): array
    {
        try {
            $postData = [
                'access_token' => $pageAccessToken,
                'message' => $content['message']
            ];

            if (isset($content['link'])) {
                $postData['link'] = $content['link'];
            }

            if (isset($content['picture'])) {
                $postData['picture'] = $content['picture'];
            }

            $response = Http::post("{$this->baseUrl}/{$pageId}/feed", $postData);

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'post_id' => $response->json()['id'],
                    'message' => 'Post published successfully'
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to publish post'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to post to Facebook page', [
                'page_id' => $pageId,
                'error' => $e->getMessage()
            ]);
            return [
                'status' => 'error',
                'message' => 'Failed to publish post: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get page insights/analytics
     */
    public function getPageInsights(string $pageId, string $pageAccessToken, array $metrics = [], ?Carbon $since = null, ?Carbon $until = null): array
    {
        try {
            $defaultMetrics = [
                'page_impressions',
                'page_reach',
                'page_engaged_users',
                'page_post_engagements',
                'page_fans'
            ];

            $params = [
                'access_token' => $pageAccessToken,
                'metric' => implode(',', $metrics ?: $defaultMetrics),
                'period' => 'day'
            ];

            if ($since) {
                $params['since'] = $since->format('Y-m-d');
            }

            if ($until) {
                $params['until'] = $until->format('Y-m-d');
            }

            $response = Http::get("{$this->baseUrl}/{$pageId}/insights", $params);

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Facebook page insights', [
                'page_id' => $pageId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Handle webhook verification
     */
    public function verifyWebhook(string $mode, string $token, string $challenge): ?string
    {
        $verifyToken = Setting::get('integration.facebook.webhook_verify_token');
        
        if ($mode === 'subscribe' && $token === $verifyToken) {
            return $challenge;
        }
        
        return null;
    }

    /**
     * Process webhook payload
     */
    public function processWebhook(array $payload): bool
    {
        try {
            foreach ($payload['entry'] ?? [] as $entry) {
                // Process leadgen events
                if (isset($entry['changes'])) {
                    foreach ($entry['changes'] as $change) {
                        if ($change['field'] === 'leadgen') {
                            $this->processLeadgenWebhook($change['value']);
                        }
                    }
                }

                // Process messaging events
                if (isset($entry['messaging'])) {
                    foreach ($entry['messaging'] as $messaging) {
                        $this->processMessagingWebhook($messaging);
                    }
                }
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to process Facebook webhook', [
                'payload' => $payload,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Process leadgen webhook
     */
    private function processLeadgenWebhook(array $value): void
    {
        try {
            $leadId = $value['leadgen_id'];
            $pageId = $value['page_id'];
            
            // Fetch the lead data
            $response = Http::get("{$this->baseUrl}/{$leadId}", [
                'access_token' => $this->accessToken,
                'fields' => 'id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,field_data'
            ]);

            if ($response->successful()) {
                $leadData = $response->json();
                $this->processLead($leadData);
            }
        } catch (\Exception $e) {
            Log::error('Failed to process leadgen webhook', [
                'value' => $value,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Process messaging webhook
     */
    private function processMessagingWebhook(array $messaging): void
    {
        // Handle Facebook Messenger messages
        // This can be integrated with the existing LiveChat system
        Log::info('Facebook messaging webhook received', $messaging);
    }
}
