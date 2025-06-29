<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Communication;
use App\Models\Chat;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CommunicationController extends Controller
{
    /**
     * Display customer's communication history.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        
        $query = Communication::where(function ($q) use ($user) {
                $q->where('communicable_type', get_class($user))
                  ->where('communicable_id', $user->id);
            })
            ->orWhere(function ($q) use ($user) {
                $q->whereHas('client', function ($subQ) use ($user) {
                    $subQ->where('user_id', $user->id);
                });
            })
            ->with(['user', 'communicable']);

        // Apply filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('subject', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        $communications = $query->orderBy('created_at', 'desc')->paginate(20);

        // Get communication statistics
        $stats = [
            'total' => Communication::where('communicable_type', get_class($user))
                ->where('communicable_id', $user->id)
                ->count(),
            'emails' => Communication::where('communicable_type', get_class($user))
                ->where('communicable_id', $user->id)
                ->where('type', 'email')
                ->count(),
            'calls' => Communication::where('communicable_type', get_class($user))
                ->where('communicable_id', $user->id)
                ->where('type', 'call')
                ->count(),
            'meetings' => Communication::where('communicable_type', get_class($user))
                ->where('communicable_id', $user->id)
                ->where('type', 'meeting')
                ->count(),
        ];

        return Inertia::render('Customer/Communications/Index', [
            'communications' => $communications,
            'stats' => $stats,
            'filters' => $request->only(['type', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display the specified communication.
     */
    public function show(Communication $communication): Response
    {
        $user = Auth::user();
        
        // Ensure user can access this communication
        if (!$this->canAccessCommunication($communication, $user)) {
            abort(403, 'Access denied.');
        }

        $communication->load(['user', 'communicable', 'attachments']);

        return Inertia::render('Customer/Communications/Show', [
            'communication' => $communication,
        ]);
    }

    /**
     * Display customer's chat conversations.
     */
    public function chats(Request $request): Response
    {
        $user = Auth::user();
        
        $query = Chat::where('client_id', $user->id)
            ->with(['participants.user', 'lastMessage']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $chats = $query->orderBy('updated_at', 'desc')->paginate(20);

        return Inertia::render('Customer/Communications/Chats', [
            'chats' => $chats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Display the specified chat conversation.
     */
    public function showChat(Chat $chat): Response
    {
        $user = Auth::user();
        
        // Ensure user can access this chat
        if ($chat->client_id !== $user->id) {
            abort(403, 'Access denied.');
        }

        $chat->load([
            'participants.user',
            'messages' => function ($query) {
                $query->with(['user', 'attachments'])
                      ->orderBy('created_at', 'asc');
            }
        ]);

        // Mark messages as read for the customer
        $chat->messages()
            ->where('user_id', '!=', $user->id)
            ->where('read_at', null)
            ->update(['read_at' => now()]);

        return Inertia::render('Customer/Communications/ShowChat', [
            'chat' => $chat,
        ]);
    }

    /**
     * Send a message in the chat.
     */
    public function sendMessage(Chat $chat, Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        // Ensure user can access this chat
        if ($chat->client_id !== $user->id) {
            abort(403, 'Access denied.');
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'], // 10MB max
        ]);

        $message = $chat->messages()->create([
            'user_id' => $user->id,
            'message' => $validated['message'],
            'message_type' => 'text',
        ]);

        // Handle attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('chat-attachments', 'public');
                
                $message->attachments()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        // Update chat timestamp
        $chat->touch();

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Message sent successfully!'
        ]);

        return redirect()->route('customer.communications.chats.show', $chat);
    }

    /**
     * Create a new communication request.
     */
    public function create(): Response
    {
        return Inertia::render('Customer/Communications/Create');
    }

    /**
     * Store a new communication request.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'type' => ['required', 'in:email,call,meeting'],
            'subject' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'preferred_date' => ['nullable', 'date', 'after:now'],
            'preferred_time' => ['nullable', 'string'],
            'priority' => ['required', 'in:low,medium,high'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'], // 10MB max
        ]);

        $communication = Communication::create([
            'user_id' => $user->id,
            'communicable_type' => get_class($user),
            'communicable_id' => $user->id,
            'type' => $validated['type'],
            'subject' => $validated['subject'],
            'content' => $validated['content'],
            'status' => 'pending',
            'direction' => 'outbound',
            'priority' => $validated['priority'],
            'scheduled_at' => $validated['preferred_date'] && $validated['preferred_time'] 
                ? $validated['preferred_date'] . ' ' . $validated['preferred_time']
                : null,
        ]);

        // Handle attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('communication-attachments', 'public');
                
                $communication->attachments()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Communication request submitted successfully!'
        ]);

        return redirect()->route('customer.communications.show', $communication);
    }

    /**
     * Download communication attachment.
     */
    public function downloadAttachment(Communication $communication, $attachmentId)
    {
        $user = Auth::user();
        
        // Ensure user can access this communication
        if (!$this->canAccessCommunication($communication, $user)) {
            abort(403, 'Access denied.');
        }

        $attachment = $communication->attachments()
            ->where('id', $attachmentId)
            ->firstOrFail();

        return response()->download(
            storage_path('app/public/' . $attachment->file_path),
            $attachment->file_name
        );
    }

    /**
     * Check if user can access the communication.
     */
    private function canAccessCommunication(Communication $communication, $user): bool
    {
        // User can access if they are the communicable entity
        if ($communication->communicable_type === get_class($user) && 
            $communication->communicable_id === $user->id) {
            return true;
        }

        // User can access if they are the client associated with the communication
        if ($communication->communicable_type === 'App\Models\Client') {
            $client = $communication->communicable;
            return $client && $client->user_id === $user->id;
        }

        return false;
    }
}
