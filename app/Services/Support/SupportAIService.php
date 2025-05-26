<?php

namespace App\Services\Support;

use App\Models\Support\Ticket;
use App\Models\Support\KnowledgeBaseArticle;
use App\Models\Support\FAQ;
use App\Models\Support\TicketCategory;
use App\Services\AIService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class SupportAIService
{
    public function __construct(
        private AIService $aiService
    ) {}

    /**
     * Generate ticket resolution suggestions based on ticket content.
     */
    public function generateTicketSuggestions(Ticket $ticket): array
    {
        try {
            $context = $this->buildTicketContext($ticket);
            
            $prompt = "As a support expert, analyze this ticket and provide helpful suggestions:\n\n{$context}\n\n";
            $prompt .= "Please provide:\n";
            $prompt .= "1. Potential root causes\n";
            $prompt .= "2. Step-by-step resolution suggestions\n";
            $prompt .= "3. Similar known issues\n";
            $prompt .= "4. Preventive measures\n";
            $prompt .= "5. Estimated resolution time\n\n";
            $prompt .= "Format your response as structured suggestions that a support agent can follow.";

            $suggestions = $this->aiService->generateResponse($prompt);

            return [
                'suggestions' => $suggestions,
                'confidence' => $this->calculateConfidence($ticket),
                'similar_tickets' => $this->findSimilarTickets($ticket),
                'recommended_articles' => $this->findRelevantArticles($ticket),
            ];

        } catch (\Exception $e) {
            Log::error('Failed to generate ticket suggestions', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage()
            ]);

            return [
                'suggestions' => 'Unable to generate AI suggestions at this time.',
                'confidence' => 0,
                'similar_tickets' => [],
                'recommended_articles' => [],
            ];
        }
    }

    /**
     * Auto-categorize ticket based on content.
     */
    public function categorizeTicket(Ticket $ticket): ?int
    {
        try {
            $categories = TicketCategory::active()->get();
            $categoryDescriptions = $categories->map(function ($category) {
                return "- {$category->name}: {$category->description}";
            })->implode("\n");

            $prompt = "Analyze this support ticket and determine the most appropriate category:\n\n";
            $prompt .= "Ticket Title: {$ticket->title}\n";
            $prompt .= "Description: {$ticket->description}\n\n";
            $prompt .= "Available Categories:\n{$categoryDescriptions}\n\n";
            $prompt .= "Respond with only the category name that best matches this ticket.";

            $response = $this->aiService->generateResponse($prompt);
            
            // Find matching category
            $matchedCategory = $categories->first(function ($category) use ($response) {
                return stripos($response, $category->name) !== false;
            });

            return $matchedCategory?->id;

        } catch (\Exception $e) {
            Log::error('Failed to categorize ticket', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Determine ticket priority based on content analysis.
     */
    public function determinePriority(Ticket $ticket): string
    {
        try {
            $prompt = "Analyze this support ticket and determine the appropriate priority level:\n\n";
            $prompt .= "Title: {$ticket->title}\n";
            $prompt .= "Description: {$ticket->description}\n\n";
            $prompt .= "Priority Levels:\n";
            $prompt .= "- urgent: System down, security breach, data loss, business-critical issues\n";
            $prompt .= "- high: Major functionality broken, significant user impact, deadline-sensitive\n";
            $prompt .= "- medium: Minor functionality issues, moderate user impact, can wait\n";
            $prompt .= "- low: Cosmetic issues, feature requests, general questions\n\n";
            $prompt .= "Respond with only one word: urgent, high, medium, or low";

            $response = strtolower(trim($this->aiService->generateResponse($prompt)));
            
            return in_array($response, ['urgent', 'high', 'medium', 'low']) ? $response : 'medium';

        } catch (\Exception $e) {
            Log::error('Failed to determine ticket priority', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage()
            ]);
            return 'medium';
        }
    }

    /**
     * Generate automated response for common issues.
     */
    public function generateAutoResponse(Ticket $ticket): ?string
    {
        try {
            // Find relevant FAQ and knowledge base articles
            $relevantContent = $this->findRelevantContent($ticket);
            
            if (empty($relevantContent)) {
                return null;
            }

            $context = "Based on our knowledge base, here's information that might help:\n\n";
            foreach ($relevantContent as $content) {
                $context .= "- {$content['title']}: {$content['content']}\n";
            }

            $prompt = "Create a helpful, professional auto-response for this support ticket:\n\n";
            $prompt .= "Ticket: {$ticket->title}\n";
            $prompt .= "Description: {$ticket->description}\n\n";
            $prompt .= "Relevant Information:\n{$context}\n\n";
            $prompt .= "Generate a helpful response that:\n";
            $prompt .= "1. Acknowledges the issue\n";
            $prompt .= "2. Provides relevant information or steps\n";
            $prompt .= "3. Offers next steps if the solution doesn't work\n";
            $prompt .= "4. Maintains a professional, helpful tone\n";
            $prompt .= "5. Is concise but comprehensive\n\n";
            $prompt .= "If the information isn't sufficient to provide a complete solution, suggest escalation to a human agent.";

            return $this->aiService->generateResponse($prompt);

        } catch (\Exception $e) {
            Log::error('Failed to generate auto response', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Analyze ticket sentiment and urgency.
     */
    public function analyzeSentiment(Ticket $ticket): array
    {
        try {
            $prompt = "Analyze the sentiment and urgency of this support ticket:\n\n";
            $prompt .= "Title: {$ticket->title}\n";
            $prompt .= "Description: {$ticket->description}\n\n";
            $prompt .= "Provide analysis in this format:\n";
            $prompt .= "Sentiment: [positive/neutral/negative]\n";
            $prompt .= "Urgency: [low/medium/high/critical]\n";
            $prompt .= "Emotion: [calm/frustrated/angry/confused/urgent]\n";
            $prompt .= "Escalation_Risk: [low/medium/high]\n";
            $prompt .= "Key_Concerns: [list main concerns]";

            $response = $this->aiService->generateResponse($prompt);
            
            return $this->parseSentimentResponse($response);

        } catch (\Exception $e) {
            Log::error('Failed to analyze sentiment', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'sentiment' => 'neutral',
                'urgency' => 'medium',
                'emotion' => 'calm',
                'escalation_risk' => 'low',
                'key_concerns' => [],
            ];
        }
    }

    /**
     * Generate knowledge base article suggestions.
     */
    public function generateArticleSuggestions(string $topic): array
    {
        try {
            $prompt = "Generate comprehensive knowledge base article suggestions for: {$topic}\n\n";
            $prompt .= "Provide 5 article ideas with:\n";
            $prompt .= "1. Title\n";
            $prompt .= "2. Brief description\n";
            $prompt .= "3. Target audience (beginner/intermediate/advanced)\n";
            $prompt .= "4. Key topics to cover\n";
            $prompt .= "5. Estimated reading time\n\n";
            $prompt .= "Format as JSON array with these fields: title, description, audience, topics, reading_time";

            $response = $this->aiService->generateResponse($prompt);
            
            return json_decode($response, true) ?? [];

        } catch (\Exception $e) {
            Log::error('Failed to generate article suggestions', [
                'topic' => $topic,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Improve knowledge base article content.
     */
    public function improveArticleContent(KnowledgeBaseArticle $article): string
    {
        try {
            $prompt = "Improve this knowledge base article for better clarity and helpfulness:\n\n";
            $prompt .= "Title: {$article->title}\n";
            $prompt .= "Current Content:\n{$article->content}\n\n";
            $prompt .= "Please improve the article by:\n";
            $prompt .= "1. Making it more clear and concise\n";
            $prompt .= "2. Adding step-by-step instructions where appropriate\n";
            $prompt .= "3. Including troubleshooting tips\n";
            $prompt .= "4. Adding relevant examples\n";
            $prompt .= "5. Improving structure and readability\n";
            $prompt .= "6. Ensuring technical accuracy\n\n";
            $prompt .= "Maintain the same topic but make it more helpful for users.";

            return $this->aiService->generateResponse($prompt);

        } catch (\Exception $e) {
            Log::error('Failed to improve article content', [
                'article_id' => $article->id,
                'error' => $e->getMessage()
            ]);
            return $article->content;
        }
    }

    /**
     * Generate FAQ from ticket patterns.
     */
    public function generateFAQFromTickets(Collection $tickets): array
    {
        try {
            $ticketSummary = $tickets->map(function ($ticket) {
                return "Q: {$ticket->title}\nIssue: {$ticket->description}\n";
            })->implode("\n");

            $prompt = "Analyze these support tickets and generate FAQ entries for common issues:\n\n";
            $prompt .= $ticketSummary . "\n\n";
            $prompt .= "Generate 5 FAQ entries in JSON format with:\n";
            $prompt .= "- question: Clear, concise question\n";
            $prompt .= "- answer: Comprehensive answer with steps\n";
            $prompt .= "- category: Suggested category\n";
            $prompt .= "- priority: How common this issue is (high/medium/low)\n\n";
            $prompt .= "Focus on the most frequently occurring issues.";

            $response = $this->aiService->generateResponse($prompt);
            
            return json_decode($response, true) ?? [];

        } catch (\Exception $e) {
            Log::error('Failed to generate FAQ from tickets', [
                'ticket_count' => $tickets->count(),
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Predict ticket resolution time.
     */
    public function predictResolutionTime(Ticket $ticket): array
    {
        try {
            // Get historical data for similar tickets
            $similarTickets = $this->findSimilarTickets($ticket, 50);
            $avgResolutionTime = $similarTickets->avg('resolution_time_minutes') ?? 240; // 4 hours default

            $prompt = "Predict resolution time for this support ticket based on complexity:\n\n";
            $prompt .= "Title: {$ticket->title}\n";
            $prompt .= "Description: {$ticket->description}\n";
            $prompt .= "Priority: {$ticket->priority}\n";
            $prompt .= "Category: " . ($ticket->category?->name ?? 'Uncategorized') . "\n";
            $prompt .= "Historical average for similar tickets: {$avgResolutionTime} minutes\n\n";
            $prompt .= "Provide prediction in this format:\n";
            $prompt .= "Estimated_Minutes: [number]\n";
            $prompt .= "Confidence: [low/medium/high]\n";
            $prompt .= "Factors: [list key factors affecting resolution time]\n";
            $prompt .= "Complexity: [simple/moderate/complex/very_complex]";

            $response = $this->aiService->generateResponse($prompt);
            
            return $this->parseResolutionPrediction($response, $avgResolutionTime);

        } catch (\Exception $e) {
            Log::error('Failed to predict resolution time', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'estimated_minutes' => 240,
                'confidence' => 'low',
                'factors' => ['Unable to analyze'],
                'complexity' => 'moderate',
            ];
        }
    }

    /**
     * Generate escalation recommendations.
     */
    public function generateEscalationRecommendations(Ticket $ticket): array
    {
        try {
            $prompt = "Analyze this ticket and determine if escalation is needed:\n\n";
            $prompt .= "Title: {$ticket->title}\n";
            $prompt .= "Description: {$ticket->description}\n";
            $prompt .= "Priority: {$ticket->priority}\n";
            $prompt .= "Status: {$ticket->status}\n";
            $prompt .= "Created: {$ticket->created_at}\n";
            $prompt .= "Current escalation level: {$ticket->escalation_level}\n\n";
            $prompt .= "Provide escalation analysis:\n";
            $prompt .= "Should_Escalate: [yes/no]\n";
            $prompt .= "Urgency: [low/medium/high/critical]\n";
            $prompt .= "Recommended_Level: [1/2/3]\n";
            $prompt .= "Reason: [explanation]\n";
            $prompt .= "Suggested_Actions: [list of actions]";

            $response = $this->aiService->generateResponse($prompt);
            
            return $this->parseEscalationResponse($response);

        } catch (\Exception $e) {
            Log::error('Failed to generate escalation recommendations', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'should_escalate' => false,
                'urgency' => 'low',
                'recommended_level' => 1,
                'reason' => 'Unable to analyze',
                'suggested_actions' => [],
            ];
        }
    }

    /**
     * Build comprehensive ticket context for AI analysis.
     */
    private function buildTicketContext(Ticket $ticket): string
    {
        $context = "Ticket #{$ticket->ticket_number}\n";
        $context .= "Title: {$ticket->title}\n";
        $context .= "Description: {$ticket->description}\n";
        $context .= "Priority: {$ticket->priority}\n";
        $context .= "Status: {$ticket->status}\n";
        $context .= "Category: " . ($ticket->category?->name ?? 'Uncategorized') . "\n";
        $context .= "Created: {$ticket->created_at}\n";

        if ($ticket->comments && $ticket->comments->count() > 0) {
            $context .= "\nRecent Comments:\n";
            foreach ($ticket->comments->take(3) as $comment) {
                $context .= "- {$comment->user->name}: {$comment->content}\n";
            }
        }

        return $context;
    }

    /**
     * Calculate confidence score for AI suggestions.
     */
    private function calculateConfidence(Ticket $ticket): int
    {
        $score = 50; // Base score

        // Increase confidence based on available data
        if ($ticket->category_id) $score += 15;
        if (strlen($ticket->description) > 100) $score += 10;
        if ($ticket->comments && $ticket->comments->count() > 0) $score += 10;
        if ($ticket->priority !== 'medium') $score += 5;

        // Find similar tickets to increase confidence
        $similarCount = $this->findSimilarTickets($ticket, 10)->count();
        $score += min($similarCount * 2, 10);

        return min($score, 95); // Cap at 95%
    }

    /**
     * Find similar tickets based on content similarity.
     */
    private function findSimilarTickets(Ticket $ticket, int $limit = 5): Collection
    {
        // Simple similarity based on category and keywords
        $keywords = $this->extractKeywords($ticket->title . ' ' . $ticket->description);
        
        return Ticket::where('id', '!=', $ticket->id)
            ->when($ticket->category_id, function ($query) use ($ticket) {
                $query->where('category_id', $ticket->category_id);
            })
            ->where(function ($query) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $query->orWhere('title', 'like', "%{$keyword}%")
                          ->orWhere('description', 'like', "%{$keyword}%");
                }
            })
            ->limit($limit)
            ->get();
    }

    /**
     * Find relevant knowledge base articles.
     */
    private function findRelevantArticles(Ticket $ticket, int $limit = 3): Collection
    {
        $keywords = $this->extractKeywords($ticket->title . ' ' . $ticket->description);
        
        return KnowledgeBaseArticle::published()
            ->where(function ($query) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $query->orWhere('title', 'like', "%{$keyword}%")
                          ->orWhere('content', 'like', "%{$keyword}%");
                }
            })
            ->orderBy('view_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Find relevant content from FAQ and knowledge base.
     */
    private function findRelevantContent(Ticket $ticket): array
    {
        $keywords = $this->extractKeywords($ticket->title . ' ' . $ticket->description);
        $content = [];

        // Get relevant FAQs
        $faqs = FAQ::published()
            ->where(function ($query) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $query->orWhere('question', 'like', "%{$keyword}%")
                          ->orWhere('answer', 'like', "%{$keyword}%");
                }
            })
            ->limit(2)
            ->get();

        foreach ($faqs as $faq) {
            $content[] = [
                'title' => $faq->question,
                'content' => substr($faq->answer, 0, 200) . '...',
                'type' => 'faq'
            ];
        }

        // Get relevant articles
        $articles = $this->findRelevantArticles($ticket, 2);
        foreach ($articles as $article) {
            $content[] = [
                'title' => $article->title,
                'content' => substr($article->content, 0, 200) . '...',
                'type' => 'article'
            ];
        }

        return $content;
    }

    /**
     * Extract keywords from text.
     */
    private function extractKeywords(string $text): array
    {
        // Simple keyword extraction
        $text = strtolower($text);
        $words = str_word_count($text, 1);
        
        // Filter out common words
        $stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'cannot', 'cant', 'wont', 'dont', 'doesnt', 'didnt', 'isnt', 'arent', 'wasnt', 'werent', 'hasnt', 'havent', 'hadnt', 'wouldnt', 'couldnt', 'shouldnt', 'mightnt'];
        
        $keywords = array_filter($words, function ($word) use ($stopWords) {
            return strlen($word) > 3 && !in_array($word, $stopWords);
        });

        return array_slice(array_unique($keywords), 0, 10);
    }

    /**
     * Parse sentiment analysis response.
     */
    private function parseSentimentResponse(string $response): array
    {
        $lines = explode("\n", $response);
        $result = [
            'sentiment' => 'neutral',
            'urgency' => 'medium',
            'emotion' => 'calm',
            'escalation_risk' => 'low',
            'key_concerns' => [],
        ];

        foreach ($lines as $line) {
            if (strpos($line, 'Sentiment:') !== false) {
                $result['sentiment'] = trim(str_replace('Sentiment:', '', $line));
            } elseif (strpos($line, 'Urgency:') !== false) {
                $result['urgency'] = trim(str_replace('Urgency:', '', $line));
            } elseif (strpos($line, 'Emotion:') !== false) {
                $result['emotion'] = trim(str_replace('Emotion:', '', $line));
            } elseif (strpos($line, 'Escalation_Risk:') !== false) {
                $result['escalation_risk'] = trim(str_replace('Escalation_Risk:', '', $line));
            } elseif (strpos($line, 'Key_Concerns:') !== false) {
                $concerns = trim(str_replace('Key_Concerns:', '', $line));
                $result['key_concerns'] = array_map('trim', explode(',', $concerns));
            }
        }

        return $result;
    }

    /**
     * Parse resolution time prediction response.
     */
    private function parseResolutionPrediction(string $response, float $fallback): array
    {
        $lines = explode("\n", $response);
        $result = [
            'estimated_minutes' => $fallback,
            'confidence' => 'medium',
            'factors' => [],
            'complexity' => 'moderate',
        ];

        foreach ($lines as $line) {
            if (strpos($line, 'Estimated_Minutes:') !== false) {
                $minutes = (int) trim(str_replace('Estimated_Minutes:', '', $line));
                $result['estimated_minutes'] = $minutes > 0 ? $minutes : $fallback;
            } elseif (strpos($line, 'Confidence:') !== false) {
                $result['confidence'] = trim(str_replace('Confidence:', '', $line));
            } elseif (strpos($line, 'Factors:') !== false) {
                $factors = trim(str_replace('Factors:', '', $line));
                $result['factors'] = array_map('trim', explode(',', $factors));
            } elseif (strpos($line, 'Complexity:') !== false) {
                $result['complexity'] = trim(str_replace('Complexity:', '', $line));
            }
        }

        return $result;
    }

    /**
     * Parse escalation recommendation response.
     */
    private function parseEscalationResponse(string $response): array
    {
        $lines = explode("\n", $response);
        $result = [
            'should_escalate' => false,
            'urgency' => 'low',
            'recommended_level' => 1,
            'reason' => '',
            'suggested_actions' => [],
        ];

        foreach ($lines as $line) {
            if (strpos($line, 'Should_Escalate:') !== false) {
                $escalate = trim(str_replace('Should_Escalate:', '', $line));
                $result['should_escalate'] = strtolower($escalate) === 'yes';
            } elseif (strpos($line, 'Urgency:') !== false) {
                $result['urgency'] = trim(str_replace('Urgency:', '', $line));
            } elseif (strpos($line, 'Recommended_Level:') !== false) {
                $level = (int) trim(str_replace('Recommended_Level:', '', $line));
                $result['recommended_level'] = max(1, min(3, $level));
            } elseif (strpos($line, 'Reason:') !== false) {
                $result['reason'] = trim(str_replace('Reason:', '', $line));
            } elseif (strpos($line, 'Suggested_Actions:') !== false) {
                $actions = trim(str_replace('Suggested_Actions:', '', $line));
                $result['suggested_actions'] = array_map('trim', explode(',', $actions));
            }
        }

        return $result;
    }
}
