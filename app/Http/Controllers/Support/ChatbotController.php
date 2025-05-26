<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\Ticket;
use App\Models\Support\KnowledgeBaseArticle;
use App\Models\Support\FAQ;
use App\Services\Support\SupportAIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class ChatbotController extends Controller
{
    public function __construct(
        private SupportAIService $aiService
    ) {}

    /**
     * Handle chatbot conversation.
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'conversation_id' => ['nullable', 'string'],
            'context' => ['nullable', 'array'],
        ]);

        $conversationId = $validated['conversation_id'] ?? $this->generateConversationId();
        $userMessage = $validated['message'];
        $context = $validated['context'] ?? [];

        // Get conversation history
        $conversation = $this->getConversationHistory($conversationId);
        
        // Add user message to conversation
        $conversation[] = [
            'role' => 'user',
            'message' => $userMessage,
            'timestamp' => now()->toISOString(),
        ];

        // Analyze user intent
        $intent = $this->analyzeIntent($userMessage, $context);

        // Generate AI response based on intent
        $response = $this->generateResponse($userMessage, $intent, $conversation, $context);

        // Add AI response to conversation
        $conversation[] = [
            'role' => 'assistant',
            'message' => $response['message'],
            'intent' => $intent,
            'suggestions' => $response['suggestions'] ?? [],
            'actions' => $response['actions'] ?? [],
            'timestamp' => now()->toISOString(),
        ];

        // Store conversation
        $this->storeConversation($conversationId, $conversation);

        return response()->json([
            'conversation_id' => $conversationId,
            'response' => $response['message'],
            'intent' => $intent,
            'suggestions' => $response['suggestions'] ?? [],
            'actions' => $response['actions'] ?? [],
            'confidence' => $response['confidence'] ?? 0.8,
            'requires_human' => $response['requires_human'] ?? false,
        ]);
    }

    /**
     * Get conversation history.
     */
    public function getConversation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'string'],
        ]);

        $conversation = $this->getConversationHistory($validated['conversation_id']);

        return response()->json([
            'conversation_id' => $validated['conversation_id'],
            'messages' => $conversation,
        ]);
    }

    /**
     * Create ticket from chatbot conversation.
     */
    public function createTicketFromChat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'string'],
            'title' => ['required', 'string', 'max:255'],
            'priority' => ['required', 'in:low,medium,high,urgent'],
            'category_id' => ['nullable', 'exists:ticket_categories,id'],
        ]);

        $conversation = $this->getConversationHistory($validated['conversation_id']);
        
        if (empty($conversation)) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found.'
            ], 404);
        }

        // Build description from conversation
        $description = "Ticket created from chatbot conversation:\n\n";
        foreach ($conversation as $message) {
            if ($message['role'] === 'user') {
                $description .= "Customer: " . $message['message'] . "\n";
            } else {
                $description .= "AI Assistant: " . $message['message'] . "\n";
            }
            $description .= "\n";
        }

        // Create ticket
        $user = Auth::user();
        $ticket = Ticket::create([
            'title' => $validated['title'],
            'description' => $description,
            'priority' => $validated['priority'],
            'category_id' => $validated['category_id'],
            'status' => 'open',
            'requester_type' => get_class($user),
            'requester_id' => $user->id,
            'requester_email' => $user->email,
            'created_by' => $user->id,
            'metadata' => [
                'created_from_chat' => true,
                'conversation_id' => $validated['conversation_id'],
            ],
        ]);

        // Auto-categorize and set priority using AI if not provided
        if (!$validated['category_id']) {
            $categoryId = $this->aiService->categorizeTicket($ticket);
            if ($categoryId) {
                $ticket->update(['category_id' => $categoryId]);
            }
        }

        return response()->json([
            'success' => true,
            'ticket' => $ticket,
            'message' => 'Ticket created successfully from conversation.'
        ]);
    }

    /**
     * Get chatbot suggestions for common issues.
     */
    public function getSuggestions(Request $request): JsonResponse
    {
        $suggestions = [
            [
                'text' => 'I need help with login issues',
                'intent' => 'login_help',
                'category' => 'Account'
            ],
            [
                'text' => 'How do I reset my password?',
                'intent' => 'password_reset',
                'category' => 'Account'
            ],
            [
                'text' => 'I found a bug in the system',
                'intent' => 'bug_report',
                'category' => 'Technical'
            ],
            [
                'text' => 'I need billing support',
                'intent' => 'billing_help',
                'category' => 'Billing'
            ],
            [
                'text' => 'How do I use this feature?',
                'intent' => 'feature_help',
                'category' => 'General'
            ],
        ];

        return response()->json([
            'suggestions' => $suggestions
        ]);
    }

    /**
     * Rate chatbot response.
     */
    public function rateResponse(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'string'],
            'message_index' => ['required', 'integer'],
            'rating' => ['required', 'in:helpful,not_helpful'],
            'feedback' => ['nullable', 'string', 'max:500'],
        ]);

        // Store rating in conversation metadata
        $conversation = $this->getConversationHistory($validated['conversation_id']);
        
        if (isset($conversation[$validated['message_index']])) {
            $conversation[$validated['message_index']]['rating'] = $validated['rating'];
            $conversation[$validated['message_index']]['feedback'] = $validated['feedback'] ?? null;
            
            $this->storeConversation($validated['conversation_id'], $conversation);
        }

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your feedback!'
        ]);
    }

    /**
     * Escalate to human agent.
     */
    public function escalateToHuman(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'string'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $conversation = $this->getConversationHistory($validated['conversation_id']);
        
        // Mark conversation as escalated
        $escalationData = [
            'escalated_at' => now()->toISOString(),
            'reason' => $validated['reason'] ?? 'User requested human assistance',
            'user_id' => Auth::id(),
        ];

        $this->storeConversationMetadata($validated['conversation_id'], 'escalation', $escalationData);

        return response()->json([
            'success' => true,
            'message' => 'Your conversation has been escalated to a human agent. They will be with you shortly.',
            'escalation_id' => $validated['conversation_id'],
        ]);
    }

    /**
     * Analyze user intent from message.
     */
    private function analyzeIntent(string $message, array $context = []): string
    {
        $message = strtolower($message);

        // Simple intent detection - could be enhanced with AI
        if (str_contains($message, 'login') || str_contains($message, 'sign in')) {
            return 'login_help';
        } elseif (str_contains($message, 'password') || str_contains($message, 'reset')) {
            return 'password_reset';
        } elseif (str_contains($message, 'bug') || str_contains($message, 'error') || str_contains($message, 'broken')) {
            return 'bug_report';
        } elseif (str_contains($message, 'billing') || str_contains($message, 'payment') || str_contains($message, 'invoice')) {
            return 'billing_help';
        } elseif (str_contains($message, 'how') || str_contains($message, 'tutorial') || str_contains($message, 'guide')) {
            return 'how_to';
        } elseif (str_contains($message, 'ticket') || str_contains($message, 'support')) {
            return 'ticket_inquiry';
        } else {
            return 'general_inquiry';
        }
    }

    /**
     * Generate AI response based on intent and context.
     */
    private function generateResponse(string $message, string $intent, array $conversation, array $context): array
    {
        // Build conversation context for AI
        $conversationContext = '';
        foreach (array_slice($conversation, -5) as $msg) {
            $conversationContext .= "{$msg['role']}: {$msg['message']}\n";
        }

        // Get relevant knowledge base content
        $relevantContent = $this->findRelevantContent($message, $intent);

        // Build AI prompt
        $prompt = $this->buildChatbotPrompt($message, $intent, $conversationContext, $relevantContent);

        try {
            $aiResponse = $this->aiService->generateResponse($prompt);
            
            return [
                'message' => $aiResponse,
                'confidence' => 0.85,
                'suggestions' => $this->generateSuggestions($intent),
                'actions' => $this->generateActions($intent),
                'requires_human' => $this->shouldEscalateToHuman($message, $intent),
            ];

        } catch (\Exception $e) {
            return [
                'message' => "I'm sorry, I'm having trouble processing your request right now. Would you like me to connect you with a human agent?",
                'confidence' => 0.1,
                'requires_human' => true,
                'actions' => [['type' => 'escalate', 'label' => 'Connect with Human Agent']],
            ];
        }
    }

    /**
     * Build chatbot prompt for AI.
     */
    private function buildChatbotPrompt(string $message, string $intent, string $context, array $content): string
    {
        $prompt = "You are a helpful customer support chatbot. Respond professionally and helpfully.\n\n";
        $prompt .= "User Intent: {$intent}\n";
        $prompt .= "Current Message: {$message}\n\n";
        
        if (!empty($context)) {
            $prompt .= "Conversation History:\n{$context}\n";
        }

        if (!empty($content)) {
            $prompt .= "Relevant Information:\n";
            foreach ($content as $item) {
                $prompt .= "- {$item['title']}: {$item['content']}\n";
            }
            $prompt .= "\n";
        }

        $prompt .= "Guidelines:\n";
        $prompt .= "- Be concise but helpful\n";
        $prompt .= "- Provide step-by-step instructions when appropriate\n";
        $prompt .= "- If you can't fully resolve the issue, suggest creating a support ticket\n";
        $prompt .= "- Be empathetic and professional\n";
        $prompt .= "- If the issue is complex, recommend human assistance\n\n";
        $prompt .= "Respond to the user's message:";

        return $prompt;
    }

    /**
     * Find relevant content for the user's query.
     */
    private function findRelevantContent(string $message, string $intent): array
    {
        $keywords = explode(' ', strtolower($message));
        $content = [];

        // Search FAQs
        $faqs = FAQ::published()
            ->where(function ($query) use ($keywords) {
                foreach ($keywords as $keyword) {
                    if (strlen($keyword) > 3) {
                        $query->orWhere('question', 'like', "%{$keyword}%")
                              ->orWhere('answer', 'like', "%{$keyword}%");
                    }
                }
            })
            ->limit(2)
            ->get();

        foreach ($faqs as $faq) {
            $content[] = [
                'title' => $faq->question,
                'content' => substr($faq->answer, 0, 200),
                'type' => 'faq'
            ];
        }

        // Search knowledge base
        $articles = KnowledgeBaseArticle::published()
            ->where(function ($query) use ($keywords) {
                foreach ($keywords as $keyword) {
                    if (strlen($keyword) > 3) {
                        $query->orWhere('title', 'like', "%{$keyword}%")
                              ->orWhere('content', 'like', "%{$keyword}%");
                    }
                }
            })
            ->limit(2)
            ->get();

        foreach ($articles as $article) {
            $content[] = [
                'title' => $article->title,
                'content' => substr($article->content, 0, 200),
                'type' => 'article'
            ];
        }

        return $content;
    }

    /**
     * Generate suggestions based on intent.
     */
    private function generateSuggestions(string $intent): array
    {
        return match($intent) {
            'login_help' => [
                'Check if Caps Lock is on',
                'Try resetting your password',
                'Clear your browser cache',
                'Contact support if issue persists'
            ],
            'password_reset' => [
                'Use the "Forgot Password" link',
                'Check your email for reset instructions',
                'Contact admin if you don\'t receive the email'
            ],
            'bug_report' => [
                'Provide steps to reproduce the issue',
                'Include screenshots if possible',
                'Note your browser and operating system'
            ],
            default => [
                'Browse our knowledge base',
                'Check our FAQ section',
                'Create a support ticket for detailed help'
            ]
        };
    }

    /**
     * Generate action buttons based on intent.
     */
    private function generateActions(string $intent): array
    {
        return match($intent) {
            'login_help' => [
                ['type' => 'link', 'label' => 'Reset Password', 'url' => '/password/reset'],
                ['type' => 'link', 'label' => 'Contact Support', 'url' => '/support/create']
            ],
            'bug_report' => [
                ['type' => 'action', 'label' => 'Create Bug Report', 'action' => 'create_ticket'],
            ],
            'billing_help' => [
                ['type' => 'link', 'label' => 'View Billing', 'url' => '/billing'],
                ['type' => 'action', 'label' => 'Contact Billing Support', 'action' => 'create_ticket']
            ],
            default => [
                ['type' => 'link', 'label' => 'Browse Knowledge Base', 'url' => '/support/knowledge-base'],
                ['type' => 'action', 'label' => 'Create Support Ticket', 'action' => 'create_ticket']
            ]
        };
    }

    /**
     * Determine if conversation should be escalated to human.
     */
    private function shouldEscalateToHuman(string $message, string $intent): bool
    {
        $escalationKeywords = ['human', 'agent', 'person', 'speak to someone', 'not helpful', 'frustrated'];
        
        foreach ($escalationKeywords as $keyword) {
            if (str_contains(strtolower($message), $keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate unique conversation ID.
     */
    private function generateConversationId(): string
    {
        return 'chat_' . uniqid() . '_' . time();
    }

    /**
     * Get conversation history from session/cache.
     */
    private function getConversationHistory(string $conversationId): array
    {
        return Session::get("chatbot_conversation_{$conversationId}", []);
    }

    /**
     * Store conversation in session/cache.
     */
    private function storeConversation(string $conversationId, array $conversation): void
    {
        Session::put("chatbot_conversation_{$conversationId}", $conversation);
    }

    /**
     * Store conversation metadata.
     */
    private function storeConversationMetadata(string $conversationId, string $key, mixed $data): void
    {
        $metadataKey = "chatbot_metadata_{$conversationId}_{$key}";
        Session::put($metadataKey, $data);
    }
}
