<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Conversation;
use App\Models\MessageComment;
use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use App\Events\ChatMessageSent;
use App\Events\UserTyping;
use App\Notifications\NewChatMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LiveChatController extends Controller
{
    /**
     * Display the Chat dashboard.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Get conversations based on user role
        $conversationsQuery = Conversation::with([
            'conversable',
            'creator',
            'assignee',
            'latestMessage.user'
        ]);

        // Filter based on user role
        if ($user->hasRole('customer')) {
            // Customers only see their own conversations
            $conversationsQuery->where(function ($query) use ($user) {
                $query->where('created_by', $user->id)
                      ->orWhereJsonContains('participants', $user->id);
            });
        } else {
            // Staff can see all conversations or assigned ones, including guest conversations
            if ($request->get('assigned_to_me')) {
                $conversationsQuery->where('assigned_to', $user->id);
            }

            // Include guest conversations for staff
            if ($request->get('guest_only')) {
                $conversationsQuery->where('conversable_type', \App\Models\GuestSession::class);
            }
        }

        // Apply filters
        if ($request->get('status')) {
            $conversationsQuery->where('status', $request->get('status'));
        }

        if ($request->get('priority')) {
            $conversationsQuery->where('priority', $request->get('priority'));
        }

        if ($request->get('search')) {
            $search = $request->get('search');
            $conversationsQuery->where(function ($query) use ($search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhereHas('conversable', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                      });
            });
        }

        $conversations = $conversationsQuery
            ->orderBy('last_message_at', 'desc')
            ->paginate(20);

        // Get unread count for current user
        $unreadCount = Chat::whereHas('conversation', function ($query) use ($user) {
            if ($user->hasRole('customer')) {
                $query->where('created_by', $user->id)
                      ->orWhereJsonContains('participants', $user->id);
            }
        })
        ->where('user_id', '!=', $user->id)
        ->where('status', '!=', 'read')
        ->count();

        return Inertia::render('CRM/LiveChat/Dashboard', [
            'conversations' => $conversations,
            'unreadCount' => $unreadCount,
            'filters' => $request->only(['status', 'priority', 'search', 'assigned_to_me']),
            'userRole' => $user->getRoleNames()->first(),
        ]);
    }

    /**
     * Show a specific conversation.
     */
    public function show(Conversation $conversation): Response
    {
        $user = Auth::user();

        // Check if user has access to this conversation
        if ($user->hasRole('customer')) {
            if ($conversation->created_by !== $user->id &&
                !$conversation->hasParticipant($user->id)) {
                abort(403, 'Access denied to this conversation.');
            }
        }

        // Load conversation with messages including comments and reactions
        $conversation->load([
            'conversable',
            'creator',
            'assignee',
            'messages.user',
            'messages.replyTo.user',
            'messages.replies.user',
            'messages.comments.user',
            'messages.pinnedBy'
        ]);

        // Get pinned messages (max 3, ordered by pinned date)
        $pinnedMessages = Chat::where('conversation_id', $conversation->id)
            ->where('is_pinned', true)
            ->with(['user', 'pinnedBy'])
            ->orderBy('pinned_at', 'desc')
            ->limit(3)
            ->get();



        // Mark messages as read for current user
        $conversation->markAsReadFor($user);

        // Get available clients and leads for staff
        $clients = $user->hasRole('customer') ? [] : Client::select('id', 'name', 'email')->get();
        $leads = $user->hasRole('customer') ? [] : Lead::select('id', 'name', 'email')->get();
        $staff = $user->hasRole('customer') ? [] : User::role(['admin', 'staff'])->select('id', 'name', 'email')->get();

        return Inertia::render('CRM/LiveChat/Conversation', [
            'conversation' => $conversation,
            'pinnedMessages' => $pinnedMessages,
            'clients' => $clients,
            'leads' => $leads,
            'staff' => $staff,
            'userRole' => $user->getRoleNames()->first(),
        ]);
    }

    /**
     * Create a new conversation.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'conversable_type' => 'nullable|string|in:App\\Models\\Client,App\\Models\\Lead',
            'conversable_id' => 'nullable|integer|exists:clients,id|exists:leads,id',
            'assigned_to' => 'nullable|integer|exists:users,id',
            'priority' => 'string|in:low,normal,high,urgent',
            'is_internal' => 'boolean',
            'participants' => 'array',
            'participants.*' => 'integer|exists:users,id',
            'initial_message' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();

        // Create conversation
        $conversation = Conversation::create([
            'title' => $request->title,
            'conversable_type' => $request->conversable_type,
            'conversable_id' => $request->conversable_id,
            'created_by' => $user->id,
            'assigned_to' => $request->assigned_to,
            'priority' => $request->priority ?? 'normal',
            'is_internal' => $request->is_internal ?? false,
            'participants' => array_unique(array_merge(
                [$user->id],
                $request->participants ?? []
            )),
            'last_message_at' => now(),
        ]);

        // Create initial message
        $message = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => $request->initial_message,
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => $request->conversable_type,
            'chattable_id' => $request->conversable_id,
            'user_id' => $user->id,
        ]);

        // Load relationships
        $message->load(['user', 'conversation']);

        // Broadcast the message
        broadcast(new ChatMessageSent($message))->toOthers();

        // Send notifications to participants
        $participants = User::whereIn('id', $conversation->participants ?? [])->get();
        foreach ($participants as $participant) {
            if ($participant->id !== $user->id) {
                $participant->notify(new NewChatMessage($message));
            }
        }

        return response()->json([
            'conversation' => $conversation->load(['conversable', 'creator', 'assignee']),
            'message' => $message,
        ]);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:5000',
            'message_type' => 'string|in:text,file,image,video,audio',
            'reply_to_id' => 'nullable|integer|exists:chats,id',
            'is_internal_note' => 'nullable|in:0,1,true,false',
            'attachments' => 'array',
            'attachments.*' => 'file|max:10240', // 10MB max per file
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();

        // Check access
        if ($user->hasRole('customer')) {
            if ($conversation->created_by !== $user->id &&
                !$conversation->hasParticipant($user->id)) {
                return response()->json(['error' => 'Access denied'], 403);
            }
        }

        // Handle file attachments
        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('chat-attachments', 'public');
                $attachments[] = [
                    'id' => Str::uuid(),
                    'name' => $file->getClientOriginalName(),
                    'type' => $file->getClientOriginalExtension(),
                    'size' => $file->getSize(),
                    'url' => Storage::url($path),
                    'mime_type' => $file->getMimeType(),
                    'uploaded_at' => now()->toISOString(),
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
            'reply_to_id' => $request->reply_to_id,
            'is_internal_note' => filter_var($request->is_internal_note, FILTER_VALIDATE_BOOLEAN),
            'chattable_type' => $conversation->conversable_type,
            'chattable_id' => $conversation->conversable_id,
            'user_id' => $user->id,
        ]);

        // Update conversation
        $conversation->update([
            'last_message_at' => now(),
            'unread_count' => $conversation->unread_count + 1,
        ]);

        // Load relationships
        $message->load(['user', 'replyTo.user']);

        // Broadcast the message
        broadcast(new ChatMessageSent($message))->toOthers();

        // Send notifications to participants
        $participants = User::whereIn('id', $conversation->participants ?? [])->get();
        foreach ($participants as $participant) {
            if ($participant->id !== $user->id) {
                $participant->notify(new NewChatMessage($message));
            }
        }

        // For Inertia requests, redirect back to the conversation
        if ($request->header('X-Inertia')) {
            return redirect()->back();
        }

        // For AJAX requests, return JSON
        return response()->json(['message' => $message]);
    }

    /**
     * Mark messages as read.
     */
    public function markAsRead(Conversation $conversation): JsonResponse
    {
        $user = Auth::user();
        $conversation->markAsReadFor($user);

        return response()->json(['success' => true]);
    }

    /**
     * Handle typing indicator.
     */
    public function typing(Request $request, Conversation $conversation): JsonResponse
    {
        $user = Auth::user();

        broadcast(new UserTyping($user, $conversation))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Archive a conversation.
     */
    public function archive(Conversation $conversation): JsonResponse
    {
        $conversation->update(['status' => 'archived']);

        return response()->json(['success' => true]);
    }

    /**
     * Restore an archived conversation.
     */
    public function restore(Conversation $conversation): JsonResponse
    {
        $conversation->update(['status' => 'active']);

        return response()->json(['success' => true]);
    }

    /**
     * Find or create a conversation for a specific entity and redirect to it.
     */
    public function findOrCreateConversation(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'chattable_type' => 'required|string|in:App\\Models\\Client,App\\Models\\Lead',
            'chattable_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator);
        }

        $user = Auth::user();
        $chattableType = $request->chattable_type;
        $chattableId = $request->chattable_id;

        // Find existing conversation for this entity
        $conversation = Conversation::where('conversable_type', $chattableType)
            ->where('conversable_id', $chattableId)
            ->where('status', '!=', 'archived')
            ->first();

        // If no conversation exists, create one
        if (!$conversation) {
            // Get the entity (Lead or Client)
            $entity = $chattableType::find($chattableId);

            if (!$entity) {
                return redirect()->back()->with('error', 'Entity not found.');
            }

            // Create new conversation
            $conversation = Conversation::create([
                'title' => "Chat with {$entity->name}",
                'conversable_type' => $chattableType,
                'conversable_id' => $chattableId,
                'created_by' => $user->id,
                'assigned_to' => null, // Can be assigned later
                'priority' => 'normal',
                'is_internal' => false,
                'participants' => [$user->id],
                'last_message_at' => now(),
                'status' => 'active',
            ]);

            // Create initial system message
            Chat::create([
                'conversation_id' => $conversation->id,
                'message' => "Conversation started with {$entity->name}",
                'message_type' => 'system',
                'status' => 'sent',
                'chattable_type' => $chattableType,
                'chattable_id' => $chattableId,
                'user_id' => $user->id,
                'is_internal_note' => true,
            ]);
        } else {
            // Add current user as participant if not already
            if (!$conversation->hasParticipant($user->id)) {
                $conversation->addParticipant($user->id);
            }
        }

        // Redirect to the conversation
        return redirect()->route('crm.livechat.show', $conversation);
    }

    /**
     * Add a reaction to a message.
     */
    public function addReaction(Request $request, Chat $message): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'emoji' => 'required|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid emoji'], 400);
        }

        $user = Auth::user();
        $message->addReaction($request->emoji, $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Reaction added successfully',
            'reactions' => $message->fresh()->reactions
        ]);
    }

    /**
     * Remove a reaction from a message.
     */
    public function removeReaction(Request $request, Chat $message): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'emoji' => 'required|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid emoji'], 400);
        }

        $user = Auth::user();
        $message->removeReaction($request->emoji, $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Reaction removed successfully',
            'reactions' => $message->fresh()->reactions
        ]);
    }

    /**
     * Pin a message.
     */
    public function pinMessage(Chat $message): JsonResponse
    {
        $user = Auth::user();

        // Check if the conversation already has 3 pinned messages
        $pinnedCount = Chat::where('conversation_id', $message->conversation_id)
            ->where('is_pinned', true)
            ->count();

        if ($pinnedCount >= 3) {
            return response()->json([
                'error' => 'Maximum of 3 messages can be pinned per conversation. Please unpin a message first.'
            ], 400);
        }

        $message->pin($user->id);

        return response()->json([
            'success' => true,
            'message' => 'Message pinned successfully'
        ]);
    }

    /**
     * Unpin a message.
     */
    public function unpinMessage(Chat $message): JsonResponse
    {
        $message->unpin();

        return response()->json([
            'success' => true,
            'message' => 'Message unpinned successfully'
        ]);
    }

    /**
     * Reorder pinned messages.
     */
    public function reorderPinnedMessages(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message_ids' => 'required|array|min:1|max:3',
            'message_ids.*' => 'required|integer|exists:chats,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $messageIds = $request->message_ids;

        // Get all the messages and verify they are pinned
        $messages = Chat::whereIn('id', $messageIds)
            ->where('is_pinned', true)
            ->get();

        if ($messages->count() !== count($messageIds)) {
            return response()->json([
                'error' => 'Some messages are not found or not pinned'
            ], 400);
        }

        // Verify all messages belong to the same conversation
        $conversationIds = $messages->pluck('conversation_id')->unique();
        if ($conversationIds->count() > 1) {
            return response()->json([
                'error' => 'All messages must belong to the same conversation'
            ], 400);
        }

        // Check if user has access to the conversation
        $conversation = Conversation::find($conversationIds->first());
        if ($user->hasRole('customer')) {
            if ($conversation->created_by !== $user->id &&
                !$conversation->hasParticipant($user->id)) {
                return response()->json(['error' => 'Access denied'], 403);
            }
        }

        // Update the pin order by updating pinned_at timestamps
        // The first message in the array gets the most recent timestamp
        $baseTime = now();
        foreach ($messageIds as $index => $messageId) {
            $message = $messages->where('id', $messageId)->first();
            if ($message) {
                // Update pinned_at with decreasing timestamps to maintain order
                $message->update([
                    'pinned_at' => $baseTime->copy()->subSeconds($index)
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Pinned messages reordered successfully'
        ]);
    }

    /**
     * Add a comment to a message.
     */
    public function addComment(Request $request, Chat $message): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();

        $comment = MessageComment::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'comment' => $request->comment,
        ]);

        $comment->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully',
            'comment' => $comment
        ]);
    }

    /**
     * Delete a comment.
     */
    public function deleteComment(MessageComment $comment): JsonResponse
    {
        $user = Auth::user();

        // Only allow the comment author or admin to delete
        if ($comment->user_id !== $user->id && !$user->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully'
        ]);
    }

    /**
     * Edit a message.
     */
    public function editMessage(Request $request, Chat $message): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();

        // Check if user can edit this message
        if (!$message->canBeEditedBy($user->id)) {
            return response()->json([
                'error' => 'You can only edit your own messages within 15 minutes of posting'
            ], 403);
        }

        // Check if the message content is actually different
        if ($message->message === $request->message) {
            return response()->json([
                'error' => 'No changes detected in the message'
            ], 400);
        }

        // Edit the message
        $message->editMessage($request->message, $user->id);

        // Load fresh data with relationships
        $message->load(['user', 'replyTo.user', 'comments.user', 'pinnedBy']);

        return response()->json([
            'success' => true,
            'message' => 'Message edited successfully',
            'data' => $message
        ]);
    }

    /**
     * Get edit history for a message.
     */
    public function getEditHistory(Chat $message): JsonResponse
    {
        $user = Auth::user();

        // Only allow viewing edit history for messages the user can see
        // (you might want to add more specific permissions here)

        $editHistory = $message->edit_history ?? [];

        // Add user information to edit history
        $userIds = collect($editHistory)->pluck('edited_by')->unique();
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

        $enrichedHistory = collect($editHistory)->map(function ($edit) use ($users) {
            $edit['edited_by_user'] = $users->get($edit['edited_by']);
            return $edit;
        });

        return response()->json([
            'success' => true,
            'original_message' => $message->original_message,
            'current_message' => $message->message,
            'edit_count' => count($editHistory),
            'edit_history' => $enrichedHistory,
            'is_edited' => $message->is_edited,
            'edited_at' => $message->edited_at?->toISOString(),
        ]);
    }
}
