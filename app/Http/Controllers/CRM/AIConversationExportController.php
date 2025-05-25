<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Chat;
use App\Models\GuestSession;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as BaseResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AIConversationExportController extends Controller
{
    /**
     * Export AI conversations for ML training.
     */
    public function export(Request $request): BaseResponse
    {
        // Ensure user has admin role
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized. Admin access required.');
        }

        $validator = Validator::make($request->all(), [
            'format' => 'string|in:json,csv,excel,ml-training',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'ai_service' => 'nullable|string|in:mistral,openai,anthropic',
            'min_messages' => 'integer|min:1|max:100',
            'anonymize' => 'boolean',
            'include_ip' => 'boolean',
            'include_metadata' => 'boolean',
            'conversation_outcome' => 'nullable|string|in:active,archived,resolved',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $filters = $this->buildFilters($request);
        $dateRange = $this->getDateRange($request);

        $conversations = $this->getAIConversations($dateRange, $filters);

        $format = $request->get('format', 'json');
        $filename = "ai_conversations_export_" . now()->format('Y-m-d_H-i-s');

        return match($format) {
            'csv' => $this->exportAsCsv($conversations, $filename),
            'excel' => $this->exportAsExcel($conversations, $filename),
            'ml-training' => $this->exportForMLTraining($conversations, $filename),
            default => $this->exportAsJson($conversations, $filename),
        };
    }

    /**
     * Get AI conversation statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized. Admin access required.');
        }

        $dateRange = $this->getDateRange($request);

        $stats = [
            'total_ai_conversations' => $this->getTotalAIConversations($dateRange),
            'ai_services_breakdown' => $this->getAIServicesBreakdown($dateRange),
            'conversation_outcomes' => $this->getConversationOutcomes($dateRange),
            'average_conversation_length' => $this->getAverageConversationLength($dateRange),
            'most_active_periods' => $this->getMostActivePeriods($dateRange),
            'ai_response_effectiveness' => $this->getAIResponseEffectiveness($dateRange),
        ];

        return response()->json($stats);
    }

    /**
     * Preview export data.
     */
    public function preview(Request $request): JsonResponse
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized. Admin access required.');
        }

        $filters = $this->buildFilters($request);
        $dateRange = $this->getDateRange($request);

        $conversations = $this->getAIConversations($dateRange, $filters, 5); // Limit to 5 for preview

        return response()->json([
            'preview_data' => $conversations,
            'total_conversations' => $this->getTotalAIConversations($dateRange, $filters),
            'estimated_file_size' => $this->estimateFileSize($conversations),
        ]);
    }

    /**
     * Build filters from request.
     */
    private function buildFilters(Request $request): array
    {
        return [
            'ai_service' => $request->get('ai_service'),
            'min_messages' => $request->get('min_messages', 2),
            'anonymize' => $request->boolean('anonymize', true),
            'include_ip' => $request->boolean('include_ip', false),
            'include_metadata' => $request->boolean('include_metadata', true),
            'conversation_outcome' => $request->get('conversation_outcome'),
        ];
    }

    /**
     * Get date range from request.
     */
    private function getDateRange(Request $request): array
    {
        $dateFrom = $request->get('date_from')
            ? Carbon::parse($request->get('date_from'))->startOfDay()
            : Carbon::now()->subDays(30)->startOfDay();

        $dateTo = $request->get('date_to')
            ? Carbon::parse($request->get('date_to'))->endOfDay()
            : Carbon::now()->endOfDay();

        return ['start' => $dateFrom, 'end' => $dateTo];
    }

    /**
     * Get AI conversations with filters.
     */
    private function getAIConversations(array $dateRange, array $filters, ?int $limit = null): array
    {
        $query = Conversation::whereBetween('conversations.created_at', [$dateRange['start'], $dateRange['end']])
            ->with(['messages' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }, 'conversable']);

        // Filter for guest conversations that have AI responses
        $query->where('conversable_type', GuestSession::class)
              ->whereHas('messages', function ($q) {
                  $q->whereJsonContains('metadata->is_ai_response', true);
              });

        // Apply filters
        if (!empty($filters['ai_service'])) {
            $query->whereHas('messages', function ($q) use ($filters) {
                $q->whereJsonContains('metadata->ai_service', $filters['ai_service']);
            });
        }

        if (!empty($filters['min_messages'])) {
            $query->has('messages', '>=', $filters['min_messages']);
        }

        if (!empty($filters['conversation_outcome'])) {
            $query->where('status', $filters['conversation_outcome']);
        }

        if ($limit) {
            $query->limit($limit);
        }

        $conversations = $query->get();

        return $this->formatConversationsForExport($conversations, $filters);
    }

    /**
     * Format conversations for export.
     */
    private function formatConversationsForExport($conversations, array $filters): array
    {
        $exportData = [];

        foreach ($conversations as $conversation) {
            $conversationData = [
                'conversation_id' => $conversation->id,
                'conversation_title' => $conversation->display_title,
                'created_at' => $conversation->created_at->toISOString(),
                'last_message_at' => $conversation->last_message_at?->toISOString(),
                'status' => $conversation->status,
                'priority' => $conversation->priority,
                'guest_info' => $this->getGuestInfo($conversation->conversable, $filters['anonymize']),
                'messages' => [],
                'ai_services_used' => [],
                'conversation_metrics' => [
                    'total_messages' => $conversation->messages->count(),
                    'ai_message_count' => $conversation->messages->where('metadata.is_ai_response', true)->count(),
                    'guest_message_count' => $conversation->messages->where('metadata.is_ai_response', '!=', true)->count(),
                    'conversation_duration_minutes' => $this->getConversationDuration($conversation),
                ],
            ];

            foreach ($conversation->messages as $message) {
                $isAI = $message->metadata['is_ai_response'] ?? false;

                $messageData = [
                    'message_id' => $message->id,
                    'timestamp' => $message->created_at->toISOString(),
                    'sender_type' => $isAI ? 'ai' : 'guest',
                    'message' => $message->message,
                    'message_type' => $message->message_type,
                    'sequence_number' => count($conversationData['messages']) + 1,
                ];

                if ($isAI && $filters['include_metadata']) {
                    $messageData['ai_metadata'] = [
                        'service' => $message->metadata['ai_service'] ?? null,
                        'model' => $message->metadata['ai_model'] ?? null,
                        'reply_to_message_id' => $message->metadata['reply_to_message_id'] ?? null,
                        'generated_at' => $message->metadata['generated_at'] ?? null,
                    ];

                    $service = $message->metadata['ai_service'] ?? 'unknown';
                    if (!in_array($service, $conversationData['ai_services_used'])) {
                        $conversationData['ai_services_used'][] = $service;
                    }
                } elseif (!$isAI && $filters['include_metadata']) {
                    $messageData['guest_metadata'] = [
                        'ip_address' => $filters['include_ip'] ? ($message->metadata['ip_address'] ?? null) : null,
                        'guest_session_id' => $message->metadata['guest_session_id'] ?? null,
                    ];
                }

                $conversationData['messages'][] = $messageData;
            }

            $exportData[] = $conversationData;
        }

        return $exportData;
    }

    /**
     * Get guest information with optional anonymization.
     */
    private function getGuestInfo($guestSession, bool $anonymize): array
    {
        if (!$guestSession) {
            return [];
        }

        if ($anonymize) {
            return [
                'guest_id' => 'guest_' . hash('sha256', $guestSession->id),
                'guest_name' => 'Guest_' . substr(hash('sha256', $guestSession->guest_name ?? ''), 0, 8),
                'guest_email' => $guestSession->guest_email
                    ? 'guest_' . substr(hash('sha256', $guestSession->guest_email), 0, 8) . '@example.com'
                    : null,
                'anonymized' => true,
            ];
        }

        return [
            'guest_id' => $guestSession->id,
            'guest_name' => $guestSession->guest_name,
            'guest_email' => $guestSession->guest_email,
            'anonymized' => false,
        ];
    }

    /**
     * Calculate conversation duration in minutes.
     */
    private function getConversationDuration($conversation): ?int
    {
        if (!$conversation->last_message_at) {
            return null;
        }

        return $conversation->created_at->diffInMinutes($conversation->last_message_at);
    }

    /**
     * Export as JSON.
     */
    private function exportAsJson(array $conversations, string $filename): JsonResponse
    {
        return response()->json($conversations)
            ->header('Content-Disposition', "attachment; filename={$filename}.json");
    }

    /**
     * Export as CSV.
     */
    private function exportAsCsv(array $conversations, string $filename): Response
    {
        $csvData = [];

        foreach ($conversations as $conversation) {
            foreach ($conversation['messages'] as $message) {
                $csvData[] = [
                    'conversation_id' => $conversation['conversation_id'],
                    'conversation_title' => $conversation['conversation_title'],
                    'conversation_status' => $conversation['status'],
                    'guest_name' => $conversation['guest_info']['guest_name'] ?? '',
                    'guest_email' => $conversation['guest_info']['guest_email'] ?? '',
                    'message_id' => $message['message_id'],
                    'timestamp' => $message['timestamp'],
                    'sender_type' => $message['sender_type'],
                    'message' => $message['message'],
                    'ai_service' => $message['ai_metadata']['service'] ?? '',
                    'ai_model' => $message['ai_metadata']['model'] ?? '',
                    'sequence_number' => $message['sequence_number'],
                ];
            }
        }

        $csv = $this->arrayToCsv($csvData);

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename={$filename}.csv");
    }

    /**
     * Export as Excel (placeholder - would need PhpSpreadsheet).
     */
    private function exportAsExcel(array $conversations, string $filename): JsonResponse
    {
        // For now, return JSON with Excel headers
        // In production, implement with PhpSpreadsheet
        return response()->json($conversations)
            ->header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            ->header('Content-Disposition', "attachment; filename={$filename}.xlsx");
    }

    /**
     * Export formatted for ML training.
     */
    private function exportForMLTraining(array $conversations, string $filename): JsonResponse
    {
        $mlData = [];

        foreach ($conversations as $conversation) {
            $conversationPairs = [];
            $context = [];

            foreach ($conversation['messages'] as $message) {
                if ($message['sender_type'] === 'guest') {
                    $context[] = [
                        'role' => 'user',
                        'content' => $message['message'],
                        'timestamp' => $message['timestamp'],
                    ];
                } elseif ($message['sender_type'] === 'ai') {
                    $conversationPairs[] = [
                        'input' => end($context)['content'] ?? '',
                        'output' => $message['message'],
                        'context' => array_slice($context, -3), // Last 3 messages for context
                        'metadata' => [
                            'conversation_id' => $conversation['conversation_id'],
                            'ai_service' => $message['ai_metadata']['service'] ?? null,
                            'ai_model' => $message['ai_metadata']['model'] ?? null,
                            'timestamp' => $message['timestamp'],
                            'conversation_status' => $conversation['status'],
                        ],
                    ];
                }
            }

            $mlData = array_merge($mlData, $conversationPairs);
        }

        return response()->json([
            'training_data' => $mlData,
            'metadata' => [
                'export_timestamp' => now()->toISOString(),
                'total_conversations' => count($conversations),
                'total_training_pairs' => count($mlData),
                'format_version' => '1.0',
            ],
        ])->header('Content-Disposition', "attachment; filename={$filename}_ml_training.json");
    }

    /**
     * Convert array to CSV.
     */
    private function arrayToCsv(array $data): string
    {
        if (empty($data)) {
            return '';
        }

        $output = fopen('php://temp', 'r+');

        // Add headers
        fputcsv($output, array_keys($data[0]));

        // Add data rows
        foreach ($data as $row) {
            fputcsv($output, $row);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Get total AI conversations count.
     */
    private function getTotalAIConversations(array $dateRange, array $filters = []): int
    {
        $query = Conversation::whereBetween('conversations.created_at', [$dateRange['start'], $dateRange['end']])
            ->where('conversable_type', GuestSession::class)
            ->whereHas('messages', function ($q) {
                $q->whereJsonContains('metadata->is_ai_response', true);
            });

        if (!empty($filters['ai_service'])) {
            $query->whereHas('messages', function ($q) use ($filters) {
                $q->whereJsonContains('metadata->ai_service', $filters['ai_service']);
            });
        }

        return $query->count();
    }

    /**
     * Get AI services breakdown.
     */
    private function getAIServicesBreakdown(array $dateRange): array
    {
        $messages = Chat::whereHas('conversation', function ($q) use ($dateRange) {
            $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
              ->where('conversable_type', GuestSession::class);
        })
        ->whereJsonContains('metadata->is_ai_response', true)
        ->get();

        $breakdown = [];
        foreach ($messages as $message) {
            $service = $message->metadata['ai_service'] ?? 'unknown';
            $breakdown[$service] = ($breakdown[$service] ?? 0) + 1;
        }

        return $breakdown;
    }

    /**
     * Get conversation outcomes.
     */
    private function getConversationOutcomes(array $dateRange): array
    {
        return Conversation::whereBetween('conversations.created_at', [$dateRange['start'], $dateRange['end']])
            ->where('conversable_type', GuestSession::class)
            ->whereHas('messages', function ($q) {
                $q->whereJsonContains('metadata->is_ai_response', true);
            })
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }

    /**
     * Get average conversation length.
     */
    private function getAverageConversationLength(array $dateRange): float
    {
        $conversations = Conversation::whereBetween('conversations.created_at', [$dateRange['start'], $dateRange['end']])
            ->where('conversable_type', GuestSession::class)
            ->whereHas('messages', function ($q) {
                $q->whereJsonContains('metadata->is_ai_response', true);
            })
            ->withCount('messages')
            ->get();

        return $conversations->avg('messages_count') ?? 0;
    }

    /**
     * Get most active periods.
     */
    private function getMostActivePeriods(array $dateRange): array
    {
        $conversations = Conversation::whereBetween('conversations.created_at', [$dateRange['start'], $dateRange['end']])
            ->where('conversable_type', GuestSession::class)
            ->whereHas('messages', function ($q) {
                $q->whereJsonContains('metadata->is_ai_response', true);
            })
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->toArray();

        return $conversations;
    }

    /**
     * Get AI response effectiveness (placeholder).
     */
    private function getAIResponseEffectiveness(array $dateRange): array
    {
        // This would analyze conversation outcomes, response times, etc.
        // For now, return basic metrics
        return [
            'total_ai_responses' => Chat::whereHas('conversation', function ($q) use ($dateRange) {
                $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                  ->where('conversable_type', GuestSession::class);
            })
            ->whereJsonContains('metadata->is_ai_response', true)
            ->count(),
            'conversations_resolved_by_ai' => 0, // Would need additional tracking
            'average_response_time_seconds' => 0, // Would need response time tracking
        ];
    }

    /**
     * Estimate file size for preview.
     */
    private function estimateFileSize(array $conversations): string
    {
        $jsonSize = strlen(json_encode($conversations));

        if ($jsonSize < 1024) {
            return $jsonSize . ' bytes';
        } elseif ($jsonSize < 1024 * 1024) {
            return round($jsonSize / 1024, 2) . ' KB';
        } else {
            return round($jsonSize / (1024 * 1024), 2) . ' MB';
        }
    }
}
