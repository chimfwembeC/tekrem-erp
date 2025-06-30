<?php

namespace App\Http\Controllers\SocialMedia;

use App\Http\Controllers\Controller;
use App\Models\SocialMedia\SocialWebhook;
use App\Models\SocialMedia\FacebookLead;
use App\Models\SocialMedia\FacebookPage;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\SocialMediaNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;

class WebhookController extends Controller
{
    /**
     * Handle Facebook webhook verification
     */
    public function verifyFacebookWebhook(Request $request): string
    {
        $verifyToken = config('services.facebook.webhook_verify_token');
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            Log::info('Facebook webhook verified successfully');
            return $challenge;
        }

        Log::warning('Facebook webhook verification failed', [
            'mode' => $mode,
            'token' => $token,
            'expected_token' => $verifyToken
        ]);

        abort(403, 'Forbidden');
    }

    /**
     * Handle Facebook webhook events
     */
    public function handleFacebookWebhook(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            
            // Log the webhook for debugging
            SocialWebhook::create([
                'platform' => 'facebook',
                'event_type' => $data['object'] ?? 'unknown',
                'payload' => $data,
                'processed' => false,
            ]);

            if (isset($data['object']) && $data['object'] === 'page') {
                foreach ($data['entry'] ?? [] as $entry) {
                    $this->processFacebookPageEntry($entry);
                }
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Facebook webhook processing failed', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Handle Instagram webhook verification
     */
    public function verifyInstagramWebhook(Request $request): string
    {
        $verifyToken = config('services.instagram.webhook_verify_token');
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            Log::info('Instagram webhook verified successfully');
            return $challenge;
        }

        Log::warning('Instagram webhook verification failed', [
            'mode' => $mode,
            'token' => $token,
            'expected_token' => $verifyToken
        ]);

        abort(403, 'Forbidden');
    }

    /**
     * Handle Instagram webhook events
     */
    public function handleInstagramWebhook(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            
            // Log the webhook for debugging
            SocialWebhook::create([
                'platform' => 'instagram',
                'event_type' => $data['object'] ?? 'unknown',
                'payload' => $data,
                'processed' => false,
            ]);

            if (isset($data['object']) && $data['object'] === 'instagram') {
                foreach ($data['entry'] ?? [] as $entry) {
                    $this->processInstagramEntry($entry);
                }
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Instagram webhook processing failed', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Handle LinkedIn webhook verification
     */
    public function verifyLinkedInWebhook(Request $request): string
    {
        $verifyToken = config('services.linkedin.webhook_verify_token');
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            Log::info('LinkedIn webhook verified successfully');
            return $challenge;
        }

        Log::warning('LinkedIn webhook verification failed', [
            'mode' => $mode,
            'token' => $token,
            'expected_token' => $verifyToken
        ]);

        abort(403, 'Forbidden');
    }

    /**
     * Handle LinkedIn webhook events
     */
    public function handleLinkedInWebhook(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            
            // Log the webhook for debugging
            SocialWebhook::create([
                'platform' => 'linkedin',
                'event_type' => $data['eventType'] ?? 'unknown',
                'payload' => $data,
                'processed' => false,
            ]);

            $this->processLinkedInEvent($data);

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('LinkedIn webhook processing failed', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Process Facebook page entry
     */
    private function processFacebookPageEntry(array $entry): void
    {
        $pageId = $entry['id'] ?? null;
        $changes = $entry['changes'] ?? [];

        foreach ($changes as $change) {
            $field = $change['field'] ?? null;
            $value = $change['value'] ?? [];

            switch ($field) {
                case 'leadgen':
                    $this->processFacebookLead($pageId, $value);
                    break;
                case 'feed':
                    $this->processFacebookFeedUpdate($pageId, $value);
                    break;
                case 'messages':
                    $this->processFacebookMessage($pageId, $value);
                    break;
                default:
                    Log::info('Unhandled Facebook webhook field', ['field' => $field, 'value' => $value]);
            }
        }
    }

    /**
     * Process Facebook lead
     */
    private function processFacebookLead(string $pageId, array $leadData): void
    {
        try {
            $leadgenId = $leadData['leadgen_id'] ?? null;
            $adId = $leadData['ad_id'] ?? null;
            $formId = $leadData['form_id'] ?? null;
            $createdTime = $leadData['created_time'] ?? null;

            if (!$leadgenId) {
                Log::warning('Facebook lead webhook missing leadgen_id', $leadData);
                return;
            }

            // Create Facebook lead record
            $facebookLead = FacebookLead::create([
                'facebook_lead_id' => $leadgenId,
                'page_id' => $pageId,
                'ad_id' => $adId,
                'form_id' => $formId,
                'created_time' => $createdTime ? Carbon::parse($createdTime) : now(),
                'raw_data' => $leadData,
                'is_processed' => false,
            ]);

            // Create CRM lead
            $lead = Lead::create([
                'source' => 'facebook',
                'status' => 'new',
                'facebook_lead_id' => $facebookLead->id,
                'facebook_ad_id' => $adId,
                'facebook_form_id' => $formId,
                'facebook_created_time' => $createdTime ? Carbon::parse($createdTime) : now(),
            ]);

            $facebookLead->update(['lead_id' => $lead->id]);

            // Notify relevant users
            $this->notifyNewLead($lead, 'facebook');

            Log::info('Facebook lead processed successfully', [
                'facebook_lead_id' => $facebookLead->id,
                'crm_lead_id' => $lead->id
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to process Facebook lead', [
                'error' => $e->getMessage(),
                'lead_data' => $leadData
            ]);
        }
    }

    /**
     * Process Facebook feed update
     */
    private function processFacebookFeedUpdate(string $pageId, array $feedData): void
    {
        $verb = $feedData['verb'] ?? null;
        $postId = $feedData['post_id'] ?? null;

        if ($verb === 'add' && $postId) {
            // New post published
            $this->notifyPostPublished($pageId, $postId, 'facebook');
        } elseif ($verb === 'edited' && $postId) {
            // Post edited
            $this->notifyPostEdited($pageId, $postId, 'facebook');
        }
    }

    /**
     * Process Facebook message
     */
    private function processFacebookMessage(string $pageId, array $messageData): void
    {
        // Handle new messages - could integrate with LiveChat system
        $this->notifyNewMessage($pageId, $messageData, 'facebook');
    }

    /**
     * Process Instagram entry
     */
    private function processInstagramEntry(array $entry): void
    {
        $instagramId = $entry['id'] ?? null;
        $changes = $entry['changes'] ?? [];

        foreach ($changes as $change) {
            $field = $change['field'] ?? null;
            $value = $change['value'] ?? [];

            switch ($field) {
                case 'comments':
                    $this->processInstagramComment($instagramId, $value);
                    break;
                case 'mentions':
                    $this->processInstagramMention($instagramId, $value);
                    break;
                default:
                    Log::info('Unhandled Instagram webhook field', ['field' => $field, 'value' => $value]);
            }
        }
    }

    /**
     * Process Instagram comment
     */
    private function processInstagramComment(string $accountId, array $commentData): void
    {
        $this->notifyNewComment($accountId, $commentData, 'instagram');
    }

    /**
     * Process Instagram mention
     */
    private function processInstagramMention(string $accountId, array $mentionData): void
    {
        $this->notifyNewMention($accountId, $mentionData, 'instagram');
    }

    /**
     * Process LinkedIn event
     */
    private function processLinkedInEvent(array $eventData): void
    {
        $eventType = $eventData['eventType'] ?? null;

        switch ($eventType) {
            case 'SHARE_STATISTICS_UPDATE':
                $this->processLinkedInShareUpdate($eventData);
                break;
            case 'FOLLOWER_STATISTICS_UPDATE':
                $this->processLinkedInFollowerUpdate($eventData);
                break;
            default:
                Log::info('Unhandled LinkedIn webhook event', ['event_type' => $eventType, 'data' => $eventData]);
        }
    }

    /**
     * Process LinkedIn share update
     */
    private function processLinkedInShareUpdate(array $eventData): void
    {
        // Handle share statistics updates
        Log::info('LinkedIn share statistics updated', $eventData);
    }

    /**
     * Process LinkedIn follower update
     */
    private function processLinkedInFollowerUpdate(array $eventData): void
    {
        // Handle follower statistics updates
        Log::info('LinkedIn follower statistics updated', $eventData);
    }

    /**
     * Notify about new lead
     */
    private function notifyNewLead(Lead $lead, string $platform): void
    {
        $admins = User::role(['admin', 'manager'])->get();
        
        Notification::send($admins, new SocialMediaNotification([
            'type' => 'new_lead',
            'platform' => $platform,
            'title' => 'New Lead from ' . ucfirst($platform),
            'message' => "A new lead has been captured from {$platform}",
            'data' => ['lead_id' => $lead->id],
        ]));
    }

    /**
     * Notify about post published
     */
    private function notifyPostPublished(string $accountId, string $postId, string $platform): void
    {
        $admins = User::role(['admin', 'manager'])->get();
        
        Notification::send($admins, new SocialMediaNotification([
            'type' => 'post_published',
            'platform' => $platform,
            'title' => 'Post Published on ' . ucfirst($platform),
            'message' => "A new post has been published on {$platform}",
            'data' => ['account_id' => $accountId, 'post_id' => $postId],
        ]));
    }

    /**
     * Notify about post edited
     */
    private function notifyPostEdited(string $accountId, string $postId, string $platform): void
    {
        $admins = User::role(['admin', 'manager'])->get();
        
        Notification::send($admins, new SocialMediaNotification([
            'type' => 'post_edited',
            'platform' => $platform,
            'title' => 'Post Edited on ' . ucfirst($platform),
            'message' => "A post has been edited on {$platform}",
            'data' => ['account_id' => $accountId, 'post_id' => $postId],
        ]));
    }

    /**
     * Notify about new message
     */
    private function notifyNewMessage(string $accountId, array $messageData, string $platform): void
    {
        $admins = User::role(['admin', 'manager'])->get();
        
        Notification::send($admins, new SocialMediaNotification([
            'type' => 'new_message',
            'platform' => $platform,
            'title' => 'New Message on ' . ucfirst($platform),
            'message' => "A new message has been received on {$platform}",
            'data' => ['account_id' => $accountId, 'message_data' => $messageData],
        ]));
    }

    /**
     * Notify about new comment
     */
    private function notifyNewComment(string $accountId, array $commentData, string $platform): void
    {
        $admins = User::role(['admin', 'manager'])->get();
        
        Notification::send($admins, new SocialMediaNotification([
            'type' => 'new_comment',
            'platform' => $platform,
            'title' => 'New Comment on ' . ucfirst($platform),
            'message' => "A new comment has been posted on {$platform}",
            'data' => ['account_id' => $accountId, 'comment_data' => $commentData],
        ]));
    }

    /**
     * Notify about new mention
     */
    private function notifyNewMention(string $accountId, array $mentionData, string $platform): void
    {
        $admins = User::role(['admin', 'manager'])->get();
        
        Notification::send($admins, new SocialMediaNotification([
            'type' => 'new_mention',
            'platform' => $platform,
            'title' => 'New Mention on ' . ucfirst($platform),
            'message' => "You have been mentioned on {$platform}",
            'data' => ['account_id' => $accountId, 'mention_data' => $mentionData],
        ]));
    }
}
