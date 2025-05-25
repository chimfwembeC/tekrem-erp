<?php

namespace App\Http\Controllers;

use App\Events\ChatMessageSent;
use App\Models\Chat;
use App\Models\Conversation;
use App\Models\GuestSession;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class GuestChatController extends Controller
{
    /**
     * Initialize or get existing guest chat session.
     */
    public function initializeSession(Request $request): JsonResponse
    {
        $sessionId = $request->session()->getId();

        $guestSession = GuestSession::getOrCreateBySessionId($sessionId);

        // Get or create conversation for this guest session
        $conversation = $guestSession->conversation;

        if (!$conversation) {
            $conversation = $this->createGuestConversation($guestSession);
        }

        // Get messages without trying to load user for guest messages
        $messages = $conversation->messages()
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($message) {
                // Only load user if message has user_id
                if ($message->user_id) {
                    $message->load('user');
                }
                return $message;
            })
            ->reverse()
            ->values();

        return response()->json([
            'session' => $guestSession,
            'conversation' => $conversation->load('assignee'),
            'messages' => $messages,
        ]);
    }

    /**
     * Update guest information.
     */
    public function updateGuestInfo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'guest_name' => 'nullable|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'nullable|string|max:20',
            'inquiry_type' => 'nullable|string|in:general,support,sales',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sessionId = $request->session()->getId();
        $guestSession = GuestSession::getOrCreateBySessionId($sessionId);

        $guestSession->update($validator->validated());
        $guestSession->updateActivity();

        return response()->json(['session' => $guestSession]);
    }

    /**
     * Send a message from guest.
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:5000',
            'message_type' => 'string|in:text,image,file',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240', // 10MB max per file
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sessionId = $request->session()->getId();
        $guestSession = GuestSession::getOrCreateBySessionId($sessionId);
        $guestSession->updateActivity();

        $conversation = $guestSession->conversation;
        if (!$conversation) {
            $conversation = $this->createGuestConversation($guestSession);
        }

        // Handle file attachments
        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('chat-attachments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
        }

        // Create message
        $message = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => $request->message,
            'message_type' => $request->message_type ?? 'text',
            'attachments' => $attachments,
            'status' => 'sent',
            'chattable_type' => GuestSession::class,
            'chattable_id' => $guestSession->id,
            'user_id' => null, // Guest messages have no user_id
            'metadata' => [
                'guest_session_id' => $guestSession->id,
                'guest_name' => $guestSession->guest_name,
                'guest_email' => $guestSession->guest_email,
                'ip_address' => $request->ip(),
            ],
        ]);

        // Update conversation
        $conversation->update([
            'last_message_at' => now(),
            'unread_count' => $conversation->unread_count + 1,
        ]);

        // Load relationships
        $message->load(['conversation']);

        // Broadcast the message to staff
        broadcast(new ChatMessageSent($message))->toOthers();

        // Notify available staff members
        $this->notifyAvailableStaff($conversation, $message, $guestSession);

        return response()->json(['message' => $message]);
    }

    /**
     * Get conversation messages for guest.
     */
    public function getMessages(Request $request): JsonResponse
    {
        $sessionId = $request->session()->getId();
        $guestSession = GuestSession::where('session_id', $sessionId)->first();

        if (!$guestSession || !$guestSession->conversation) {
            return response()->json(['messages' => []]);
        }

        $conversation = $guestSession->conversation;
        $messages = $conversation->messages()
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($message) {
                // Only load user if message has user_id
                if ($message->user_id) {
                    $message->load('user');
                }
                return $message;
            })
            ->reverse()
            ->values();

        $guestSession->updateActivity();

        return response()->json([
            'messages' => $messages,
            'conversation' => $conversation->load('assignee'),
        ]);
    }

    /**
     * Create a new conversation for guest session.
     */
    private function createGuestConversation(GuestSession $guestSession): Conversation
    {
        $title = "Guest Chat - {$guestSession->display_name}";

        return Conversation::create([
            'title' => $title,
            'conversable_type' => GuestSession::class,
            'conversable_id' => $guestSession->id,
            'created_by' => null, // No user for guest conversations
            'assigned_to' => null, // Will be assigned when staff claims it
            'status' => 'active',
            'priority' => 'normal',
            'participants' => [], // Will be updated when staff joins
            'is_internal' => false,
            'last_message_at' => now(),
            'metadata' => [
                'guest_session_id' => $guestSession->id,
                'inquiry_type' => $guestSession->inquiry_type,
                'guest_info' => [
                    'name' => $guestSession->guest_name,
                    'email' => $guestSession->guest_email,
                    'phone' => $guestSession->guest_phone,
                ],
            ],
        ]);
    }

    /**
     * Notify available staff members about new guest message.
     */
    private function notifyAvailableStaff(Conversation $conversation, Chat $message, GuestSession $guestSession): void
    {
        // Get staff with admin or staff roles (simplified for now)
        $availableStaff = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->get();

        // If no users found, get all users (fallback)
        if ($availableStaff->isEmpty()) {
            $availableStaff = User::take(5)->get(); // Limit to first 5 users as fallback
        }

        foreach ($availableStaff as $staff) {
            $notificationMessage = "New guest message from {$guestSession->display_name}: " .
                                 Str::limit($message->message, 100);

            NotificationService::create(
                $staff,
                'chat',
                $notificationMessage,
                route('crm.livechat.show', $conversation->id)
            );
        }
    }
}
