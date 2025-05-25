<?php

use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Client chat channel
Broadcast::channel('client.{clientId}', function (User $user, $clientId) {
    // Check if the user has permission to access this client
    $client = Client::find($clientId);

    if (!$client) {
        return false;
    }

    // Allow access if the user is an admin, staff, or the assigned user
    return $user->hasRole(['admin', 'staff']) || $user->id === $client->user_id;
});

// Lead chat channel
Broadcast::channel('lead.{leadId}', function (User $user, $leadId) {
    // Check if the user has permission to access this lead
    $lead = Lead::find($leadId);

    if (!$lead) {
        return false;
    }

    // Allow access if the user is an admin, staff, or the assigned user
    return $user->hasRole(['admin', 'staff']) || $user->id === $lead->user_id;
});

// User private channel for receiving messages
Broadcast::channel('user.{userId}', function (User $user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Conversation channel for LiveChat
Broadcast::channel('conversation.{conversationId}', function (User $user, $conversationId) {
    $conversation = \App\Models\Conversation::find($conversationId);

    if (!$conversation) {
        return false;
    }

    // Allow access if the user is a participant, creator, assignee, or has admin/staff role
    return $user->hasRole(['admin', 'staff']) ||
           $conversation->created_by === $user->id ||
           $conversation->assigned_to === $user->id ||
           $conversation->hasParticipant($user->id);
});

// Guest chat channel - allows staff to receive guest messages
Broadcast::channel('guest-chat', function (User $user) {
    // Only staff and admin can listen to guest chat notifications
    return $user->hasRole(['admin', 'staff']);
});

// Guest session channel - for specific guest conversations
Broadcast::channel('guest-session.{sessionId}', function ($user, $sessionId) {
    // Allow access for staff/admin or if it's a guest session (no user)
    if ($user instanceof User) {
        return $user->hasRole(['admin', 'staff']);
    }

    // For guest users, we'll handle this differently in the frontend
    return true;
});
