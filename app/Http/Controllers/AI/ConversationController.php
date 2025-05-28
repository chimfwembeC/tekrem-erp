<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\AI\Conversation;
use App\Models\AI\AIModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ConversationController extends Controller
{
    /**
     * Display a listing of conversations.
     */
    public function index(Request $request)
    {
        $query = Conversation::query()
            ->with(['user', 'aiModel.service'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($query) use ($search) {
                            $query->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->model_id, function ($query, $modelId) {
                $query->where('ai_model_id', $modelId);
            })
            ->when($request->context_type, function ($query, $contextType) {
                $query->where('context_type', $contextType);
            })
            ->when($request->status !== null, function ($query) use ($request) {
                if ($request->status === 'archived') {
                    $query->where('is_archived', true);
                } else {
                    $query->where('is_archived', false);
                }
            });

        $conversations = $query->latest('last_message_at')
            ->paginate(10)
            ->withQueryString();

        $models = AIModel::with('service')->enabled()->orderBy('name')->get(['id', 'name', 'ai_service_id']);
        $contextTypes = Conversation::distinct()->pluck('context_type')->filter()->sort()->values();

        return Inertia::render('AI/Conversations/Index', [
            'conversations' => $conversations,
            'models' => $models,
            'contextTypes' => $contextTypes,
            'filters' => $request->only(['search', 'model_id', 'context_type', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new conversation.
     */
    public function create()
    {
        $models = AIModel::with('service')->enabled()->orderBy('name')->get();
        $contextTypes = ['crm', 'finance', 'support', 'general'];

        return Inertia::render('AI/Conversations/Create', [
            'models' => $models,
            'contextTypes' => $contextTypes,
        ]);
    }

    /**
     * Store a newly created conversation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'ai_model_id' => ['required', 'exists:ai_models,id'],
            'context_type' => ['nullable', 'string', 'in:crm,finance,support,general'],
            'context_id' => ['nullable', 'integer'],
            'initial_message' => ['nullable', 'string'],
            'metadata' => ['array'],
        ]);

        $conversation = Conversation::create([
            'user_id' => auth()->id(),
            'ai_model_id' => $validated['ai_model_id'],
            'title' => $validated['title'],
            'context_type' => $validated['context_type'] ?? null,
            'context_id' => $validated['context_id'] ?? null,
            'metadata' => $validated['metadata'] ?? [],
            'messages' => [],
            'message_count' => 0,
            'total_tokens' => 0,
            'total_cost' => 0,
            'last_message_at' => now(),
        ]);

        // Add initial message if provided
        if (!empty($validated['initial_message'])) {
            $conversation->addMessage('user', $validated['initial_message']);
        }

        return redirect()->route('ai.conversations.show', $conversation)
            ->with('success', 'Conversation created successfully.');
    }

    /**
     * Display the specified conversation.
     */
    public function show(Conversation $conversation)
    {
        $conversation->load(['user', 'aiModel.service', 'usageLogs']);

        return Inertia::render('AI/Conversations/Show', [
            'conversation' => $conversation,
        ]);
    }

    /**
     * Show the form for editing the specified conversation.
     */
    public function edit(Conversation $conversation)
    {
        $conversation->load(['user', 'aiModel.service']);

        return Inertia::render('AI/Conversations/Edit', [
            'conversation' => $conversation,
        ]);
    }

    /**
     * Update the specified conversation.
     */
    public function update(Request $request, Conversation $conversation)
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'metadata' => ['array'],
        ]);

        $conversation->update($validated);

        return redirect()->route('ai.conversations.show', $conversation)
            ->with('success', 'Conversation updated successfully.');
    }

    /**
     * Remove the specified conversation.
     */
    public function destroy(Conversation $conversation)
    {
        $conversation->delete();

        return redirect()->route('ai.conversations.index')
            ->with('success', 'Conversation deleted successfully.');
    }

    /**
     * Archive the specified conversation.
     */
    public function archive(Conversation $conversation)
    {
        $conversation->archive();

        return response()->json([
            'success' => true,
            'message' => 'Conversation archived successfully.'
        ]);
    }

    /**
     * Unarchive the specified conversation.
     */
    public function unarchive(Conversation $conversation)
    {
        $conversation->unarchive();

        return response()->json([
            'success' => true,
            'message' => 'Conversation unarchived successfully.'
        ]);
    }

    /**
     * Add a message to the conversation.
     */
    public function addMessage(Request $request, Conversation $conversation)
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'in:user,assistant,system'],
            'content' => ['required', 'string'],
            'metadata' => ['array'],
        ]);

        $message = $conversation->addMessage(
            $validated['role'],
            $validated['content'],
            $validated['metadata'] ?? []
        );

        return response()->json([
            'success' => true,
            'message' => $message,
            'conversation' => $conversation->fresh()
        ]);
    }

    /**
     * Get conversation statistics.
     */
    public function statistics(Request $request)
    {
        $period = $request->get('period', '30 days');
        $userId = $request->get('user_id');

        $query = Conversation::query();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $query->where('created_at', '>=', now()->sub($period));

        $stats = [
            'total_conversations' => $query->count(),
            'active_conversations' => $query->where('is_archived', false)->count(),
            'archived_conversations' => $query->where('is_archived', true)->count(),
            'total_messages' => $query->sum('message_count'),
            'total_tokens' => $query->sum('total_tokens'),
            'total_cost' => $query->sum('total_cost'),
            'avg_messages_per_conversation' => $query->avg('message_count'),
            'avg_cost_per_conversation' => $query->avg('total_cost'),
        ];

        // Get conversations by context type
        $byContextType = $query->groupBy('context_type')
            ->selectRaw('context_type, count(*) as count')
            ->get()
            ->pluck('count', 'context_type');

        // Get conversations by model
        $byModel = $query->with('aiModel')
            ->groupBy('ai_model_id')
            ->selectRaw('ai_model_id, count(*) as count')
            ->get()
            ->map(function ($item) {
                return [
                    'model_name' => $item->aiModel->name ?? 'Unknown',
                    'count' => $item->count
                ];
            });

        return response()->json([
            'stats' => $stats,
            'by_context_type' => $byContextType,
            'by_model' => $byModel,
        ]);
    }

    /**
     * Export conversations.
     */
    public function export(Request $request)
    {
        $format = $request->get('format', 'json');
        $period = $request->get('period', '30 days');
        $userId = $request->get('user_id');

        $query = Conversation::query()->with(['user', 'aiModel.service']);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($period !== 'all') {
            $query->where('created_at', '>=', now()->sub($period));
        }

        $conversations = $query->get();

        $filename = 'conversations_export_' . now()->format('Y-m-d_H-i-s');

        switch ($format) {
            case 'csv':
                return $this->exportToCsv($conversations, $filename);
            case 'json':
                return $this->exportToJson($conversations, $filename);
            default:
                return response()->json(['error' => 'Invalid format'], 400);
        }
    }

    /**
     * Export conversations to CSV.
     */
    private function exportToCsv($conversations, $filename)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
        ];

        $callback = function () use ($conversations) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'ID', 'Title', 'User', 'AI Model', 'Service', 'Context Type',
                'Message Count', 'Total Tokens', 'Total Cost', 'Created At', 'Last Message At'
            ]);

            foreach ($conversations as $conversation) {
                fputcsv($file, [
                    $conversation->id,
                    $conversation->title,
                    $conversation->user->name,
                    $conversation->aiModel->name,
                    $conversation->aiModel->service->name,
                    $conversation->context_type,
                    $conversation->message_count,
                    $conversation->total_tokens,
                    $conversation->total_cost,
                    $conversation->created_at->toDateTimeString(),
                    $conversation->last_message_at?->toDateTimeString(),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export conversations to JSON.
     */
    private function exportToJson($conversations, $filename)
    {
        $data = [
            'export_date' => now()->toISOString(),
            'total_conversations' => $conversations->count(),
            'conversations' => $conversations->toArray(),
        ];

        $headers = [
            'Content-Type' => 'application/json',
            'Content-Disposition' => "attachment; filename=\"{$filename}.json\"",
        ];

        return response()->json($data, 200, $headers);
    }
}
