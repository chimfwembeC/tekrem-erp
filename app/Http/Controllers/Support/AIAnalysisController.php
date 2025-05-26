<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\Ticket;
use App\Models\Support\KnowledgeBaseArticle;
use App\Services\Support\SupportAIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AIAnalysisController extends Controller
{
    public function __construct(
        private SupportAIService $aiService
    ) {}

    /**
     * Get AI suggestions for ticket resolution.
     */
    public function getTicketSuggestions(Request $request, Ticket $ticket): JsonResponse
    {
        $suggestions = $this->aiService->generateTicketSuggestions($ticket);

        return response()->json($suggestions);
    }

    /**
     * Auto-categorize ticket using AI.
     */
    public function categorizeTicket(Request $request, Ticket $ticket): JsonResponse
    {
        $categoryId = $this->aiService->categorizeTicket($ticket);

        if ($categoryId) {
            $ticket->update(['category_id' => $categoryId]);
            
            return response()->json([
                'success' => true,
                'category_id' => $categoryId,
                'message' => 'Ticket categorized successfully using AI analysis.'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unable to determine appropriate category.'
        ]);
    }

    /**
     * Determine ticket priority using AI.
     */
    public function determinePriority(Request $request, Ticket $ticket): JsonResponse
    {
        $priority = $this->aiService->determinePriority($ticket);

        $ticket->update(['priority' => $priority]);

        return response()->json([
            'success' => true,
            'priority' => $priority,
            'message' => 'Ticket priority updated using AI analysis.'
        ]);
    }

    /**
     * Generate auto-response for ticket.
     */
    public function generateAutoResponse(Request $request, Ticket $ticket): JsonResponse
    {
        $response = $this->aiService->generateAutoResponse($ticket);

        if ($response) {
            // Optionally auto-post the response as a comment
            if ($request->boolean('auto_post')) {
                $ticket->comments()->create([
                    'content' => $response,
                    'user_id' => Auth::id(),
                    'is_internal' => false,
                    'is_ai_generated' => true,
                ]);
            }

            return response()->json([
                'success' => true,
                'response' => $response,
                'auto_posted' => $request->boolean('auto_post')
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unable to generate auto-response for this ticket.'
        ]);
    }

    /**
     * Analyze ticket sentiment.
     */
    public function analyzeSentiment(Request $request, Ticket $ticket): JsonResponse
    {
        $analysis = $this->aiService->analyzeSentiment($ticket);

        // Store sentiment analysis in ticket metadata
        $metadata = $ticket->metadata ?? [];
        $metadata['ai_sentiment'] = $analysis;
        $ticket->update(['metadata' => $metadata]);

        return response()->json([
            'success' => true,
            'analysis' => $analysis
        ]);
    }

    /**
     * Predict ticket resolution time.
     */
    public function predictResolutionTime(Request $request, Ticket $ticket): JsonResponse
    {
        $prediction = $this->aiService->predictResolutionTime($ticket);

        // Update ticket with AI prediction
        $metadata = $ticket->metadata ?? [];
        $metadata['ai_resolution_prediction'] = $prediction;
        $ticket->update(['metadata' => $metadata]);

        return response()->json([
            'success' => true,
            'prediction' => $prediction
        ]);
    }

    /**
     * Get escalation recommendations.
     */
    public function getEscalationRecommendations(Request $request, Ticket $ticket): JsonResponse
    {
        $recommendations = $this->aiService->generateEscalationRecommendations($ticket);

        return response()->json([
            'success' => true,
            'recommendations' => $recommendations
        ]);
    }

    /**
     * Bulk analyze tickets with AI.
     */
    public function bulkAnalyze(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ticket_ids' => ['required', 'array'],
            'ticket_ids.*' => ['exists:tickets,id'],
            'analysis_types' => ['required', 'array'],
            'analysis_types.*' => ['in:categorize,priority,sentiment,resolution_time'],
        ]);

        $tickets = Ticket::whereIn('id', $validated['ticket_ids'])->get();
        $results = [];

        foreach ($tickets as $ticket) {
            $ticketResults = ['ticket_id' => $ticket->id];

            foreach ($validated['analysis_types'] as $type) {
                try {
                    switch ($type) {
                        case 'categorize':
                            $categoryId = $this->aiService->categorizeTicket($ticket);
                            if ($categoryId) {
                                $ticket->update(['category_id' => $categoryId]);
                                $ticketResults['category'] = $categoryId;
                            }
                            break;

                        case 'priority':
                            $priority = $this->aiService->determinePriority($ticket);
                            $ticket->update(['priority' => $priority]);
                            $ticketResults['priority'] = $priority;
                            break;

                        case 'sentiment':
                            $sentiment = $this->aiService->analyzeSentiment($ticket);
                            $metadata = $ticket->metadata ?? [];
                            $metadata['ai_sentiment'] = $sentiment;
                            $ticket->update(['metadata' => $metadata]);
                            $ticketResults['sentiment'] = $sentiment;
                            break;

                        case 'resolution_time':
                            $prediction = $this->aiService->predictResolutionTime($ticket);
                            $metadata = $ticket->metadata ?? [];
                            $metadata['ai_resolution_prediction'] = $prediction;
                            $ticket->update(['metadata' => $metadata]);
                            $ticketResults['resolution_prediction'] = $prediction;
                            break;
                    }
                } catch (\Exception $e) {
                    $ticketResults['errors'][$type] = $e->getMessage();
                }
            }

            $results[] = $ticketResults;
        }

        return response()->json([
            'success' => true,
            'results' => $results,
            'processed' => count($tickets)
        ]);
    }

    /**
     * Generate knowledge base article suggestions.
     */
    public function generateArticleSuggestions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'topic' => ['required', 'string', 'max:255'],
        ]);

        $suggestions = $this->aiService->generateArticleSuggestions($validated['topic']);

        return response()->json([
            'success' => true,
            'suggestions' => $suggestions
        ]);
    }

    /**
     * Improve knowledge base article content.
     */
    public function improveArticleContent(Request $request, KnowledgeBaseArticle $article): JsonResponse
    {
        $improvedContent = $this->aiService->improveArticleContent($article);

        return response()->json([
            'success' => true,
            'improved_content' => $improvedContent,
            'original_content' => $article->content
        ]);
    }

    /**
     * Generate FAQ from ticket patterns.
     */
    public function generateFAQFromTickets(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['nullable', 'exists:ticket_categories,id'],
            'days' => ['integer', 'min:1', 'max:365'],
            'status' => ['nullable', 'in:resolved,closed'],
        ]);

        $query = Ticket::query();

        if (!empty($validated['category_id'])) {
            $query->where('category_id', $validated['category_id']);
        }

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $days = $validated['days'] ?? 30;
        $tickets = $query->where('created_at', '>=', now()->subDays($days))
            ->limit(50)
            ->get();

        if ($tickets->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No tickets found for the specified criteria.'
            ]);
        }

        $faqSuggestions = $this->aiService->generateFAQFromTickets($tickets);

        return response()->json([
            'success' => true,
            'faq_suggestions' => $faqSuggestions,
            'analyzed_tickets' => $tickets->count()
        ]);
    }

    /**
     * AI-powered ticket search and recommendations.
     */
    public function smartSearch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'max:500'],
            'limit' => ['integer', 'min:1', 'max:20'],
        ]);

        $limit = $validated['limit'] ?? 10;

        // Use AI to understand the search intent and find relevant tickets
        $tickets = Ticket::where(function ($query) use ($validated) {
            $query->where('title', 'like', "%{$validated['query']}%")
                  ->orWhere('description', 'like', "%{$validated['query']}%");
        })
        ->with(['category', 'assignedTo', 'requester'])
        ->limit($limit)
        ->get();

        // Get AI analysis of the search results
        $searchAnalysis = [
            'intent' => 'search', // Could be enhanced with AI intent detection
            'suggested_filters' => [],
            'related_articles' => [],
        ];

        return response()->json([
            'success' => true,
            'tickets' => $tickets,
            'analysis' => $searchAnalysis,
            'total_found' => $tickets->count()
        ]);
    }

    /**
     * Get AI insights dashboard.
     */
    public function getInsightsDashboard(): Response
    {
        // Get recent AI analysis data
        $recentAnalyses = Ticket::whereNotNull('metadata')
            ->where('created_at', '>=', now()->subDays(7))
            ->get()
            ->map(function ($ticket) {
                $metadata = $ticket->metadata ?? [];
                return [
                    'ticket_id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'title' => $ticket->title,
                    'sentiment' => $metadata['ai_sentiment'] ?? null,
                    'resolution_prediction' => $metadata['ai_resolution_prediction'] ?? null,
                    'created_at' => $ticket->created_at,
                ];
            })
            ->filter(function ($item) {
                return $item['sentiment'] || $item['resolution_prediction'];
            });

        // Calculate AI insights statistics
        $stats = [
            'total_analyzed' => $recentAnalyses->count(),
            'sentiment_breakdown' => $recentAnalyses
                ->pluck('sentiment.sentiment')
                ->filter()
                ->countBy()
                ->toArray(),
            'avg_predicted_resolution' => $recentAnalyses
                ->pluck('resolution_prediction.estimated_minutes')
                ->filter()
                ->avg(),
            'escalation_risks' => $recentAnalyses
                ->pluck('sentiment.escalation_risk')
                ->filter()
                ->countBy()
                ->toArray(),
        ];

        return Inertia::render('Support/AI/Dashboard', [
            'recentAnalyses' => $recentAnalyses->take(20),
            'stats' => $stats,
        ]);
    }

    /**
     * Test AI service connectivity.
     */
    public function testAIService(): JsonResponse
    {
        try {
            $testPrompt = "Respond with 'AI service is working correctly' if you can process this request.";
            $response = $this->aiService->generateResponse($testPrompt);

            return response()->json([
                'success' => true,
                'message' => 'AI service is connected and working.',
                'response' => $response
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'AI service connection failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
