<?php

namespace App\Services\Support;

use App\Models\Support\Ticket;
use App\Models\Support\AutomationRule;
use App\Services\Support\SupportAIService;
use Illuminate\Support\Facades\Log;

class AutomationService
{
    public function __construct(
        private SupportAIService $aiService
    ) {}

    /**
     * Process automation rules for a ticket event.
     */
    public function processTicketEvent(Ticket $ticket, string $event, array $context = []): array
    {
        $results = [];

        try {
            $rules = AutomationRule::active()
                ->byTrigger($event)
                ->ordered()
                ->get();

            foreach ($rules as $rule) {
                if ($rule->matchesConditions($ticket)) {
                    $actionResults = $rule->executeActions($ticket);

                    $results[] = [
                        'rule_id' => $rule->id,
                        'rule_name' => $rule->name,
                        'executed' => true,
                        'actions' => $actionResults,
                    ];

                    Log::info('Automation rule executed', [
                        'rule_id' => $rule->id,
                        'rule_name' => $rule->name,
                        'ticket_id' => $ticket->id,
                        'event' => $event,
                        'actions' => count($actionResults),
                    ]);
                } else {
                    $results[] = [
                        'rule_id' => $rule->id,
                        'rule_name' => $rule->name,
                        'executed' => false,
                        'reason' => 'Conditions not met',
                    ];
                }
            }

        } catch (\Exception $e) {
            Log::error('Automation processing failed', [
                'ticket_id' => $ticket->id,
                'event' => $event,
                'error' => $e->getMessage(),
            ]);

            $results[] = [
                'error' => true,
                'message' => $e->getMessage(),
            ];
        }

        return $results;
    }

    /**
     * Process ticket created event.
     */
    public function processTicketCreated(Ticket $ticket): array
    {
        $results = $this->processTicketEvent($ticket, 'ticket_created');

        // Apply AI-powered automation
        $this->applyAIAutomation($ticket);

        return $results;
    }

    /**
     * Process ticket updated event.
     */
    public function processTicketUpdated(Ticket $ticket, array $changes = []): array
    {
        return $this->processTicketEvent($ticket, 'ticket_updated', ['changes' => $changes]);
    }

    /**
     * Process ticket assigned event.
     */
    public function processTicketAssigned(Ticket $ticket): array
    {
        return $this->processTicketEvent($ticket, 'ticket_assigned');
    }

    /**
     * Process ticket status changed event.
     */
    public function processTicketStatusChanged(Ticket $ticket, string $oldStatus): array
    {
        return $this->processTicketEvent($ticket, 'ticket_status_changed', ['old_status' => $oldStatus]);
    }

    /**
     * Process ticket priority changed event.
     */
    public function processTicketPriorityChanged(Ticket $ticket, string $oldPriority): array
    {
        return $this->processTicketEvent($ticket, 'ticket_priority_changed', ['old_priority' => $oldPriority]);
    }

    /**
     * Process comment added event.
     */
    public function processCommentAdded(Ticket $ticket, $comment): array
    {
        return $this->processTicketEvent($ticket, 'comment_added', ['comment' => $comment]);
    }

    /**
     * Process SLA breach event.
     */
    public function processSLABreach(Ticket $ticket, string $breachType): array
    {
        return $this->processTicketEvent($ticket, 'sla_breach', ['breach_type' => $breachType]);
    }

    /**
     * Process ticket overdue event.
     */
    public function processTicketOverdue(Ticket $ticket): array
    {
        return $this->processTicketEvent($ticket, 'ticket_overdue');
    }

    /**
     * Create a new automation rule.
     */
    public function createRule(array $data): AutomationRule
    {
        return AutomationRule::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'is_active' => $data['is_active'] ?? true,
            'trigger_event' => $data['trigger_event'],
            'conditions' => $data['conditions'] ?? [],
            'actions' => $data['actions'] ?? [],
            'priority' => $data['priority'] ?? 0,
            'created_by' => auth()->id(),
        ]);
    }

    /**
     * Update an automation rule.
     */
    public function updateRule(AutomationRule $rule, array $data): AutomationRule
    {
        $rule->update([
            'name' => $data['name'] ?? $rule->name,
            'description' => $data['description'] ?? $rule->description,
            'is_active' => $data['is_active'] ?? $rule->is_active,
            'trigger_event' => $data['trigger_event'] ?? $rule->trigger_event,
            'conditions' => $data['conditions'] ?? $rule->conditions,
            'actions' => $data['actions'] ?? $rule->actions,
            'priority' => $data['priority'] ?? $rule->priority,
            'updated_by' => auth()->id(),
        ]);

        return $rule;
    }

    /**
     * Test a rule against a ticket without executing actions.
     */
    public function testRule(AutomationRule $rule, Ticket $ticket): array
    {
        $matches = $rule->matchesConditions($ticket);

        return [
            'rule_id' => $rule->id,
            'rule_name' => $rule->name,
            'matches' => $matches,
            'conditions' => $rule->conditions,
            'actions' => $rule->actions,
            'ticket_data' => [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'category' => $ticket->category?->name,
                'assigned_to' => $ticket->assignedTo?->name,
            ],
        ];
    }

    /**
     * Get available trigger events.
     */
    public function getAvailableTriggers(): array
    {
        return [
            'ticket_created' => 'Ticket Created',
            'ticket_updated' => 'Ticket Updated',
            'ticket_assigned' => 'Ticket Assigned',
            'ticket_status_changed' => 'Ticket Status Changed',
            'ticket_priority_changed' => 'Ticket Priority Changed',
            'comment_added' => 'Comment Added',
            'sla_breach' => 'SLA Breach',
            'ticket_overdue' => 'Ticket Overdue',
        ];
    }

    /**
     * Get available condition fields.
     */
    public function getAvailableConditionFields(): array
    {
        return [
            'title' => ['label' => 'Title', 'type' => 'string'],
            'description' => ['label' => 'Description', 'type' => 'string'],
            'status' => ['label' => 'Status', 'type' => 'select', 'options' => ['open', 'in_progress', 'pending', 'resolved', 'closed']],
            'priority' => ['label' => 'Priority', 'type' => 'select', 'options' => ['low', 'medium', 'high', 'urgent']],
            'category_id' => ['label' => 'Category', 'type' => 'select'],
            'category_name' => ['label' => 'Category Name', 'type' => 'string'],
            'assigned_to' => ['label' => 'Assigned To', 'type' => 'select'],
            'requester_email' => ['label' => 'Requester Email', 'type' => 'string'],
            'tags' => ['label' => 'Tags', 'type' => 'array'],
        ];
    }

    /**
     * Get available condition operators.
     */
    public function getAvailableOperators(): array
    {
        return [
            'equals' => 'Equals',
            'not_equals' => 'Not Equals',
            'contains' => 'Contains',
            'not_contains' => 'Does Not Contain',
            'starts_with' => 'Starts With',
            'ends_with' => 'Ends With',
            'in' => 'Is One Of',
            'not_in' => 'Is Not One Of',
            'greater_than' => 'Greater Than',
            'less_than' => 'Less Than',
            'is_empty' => 'Is Empty',
            'is_not_empty' => 'Is Not Empty',
        ];
    }

    /**
     * Get available action types.
     */
    public function getAvailableActions(): array
    {
        return [
            'assign_to_user' => ['label' => 'Assign to User', 'params' => ['user_id']],
            'set_priority' => ['label' => 'Set Priority', 'params' => ['priority']],
            'set_status' => ['label' => 'Set Status', 'params' => ['status']],
            'set_category' => ['label' => 'Set Category', 'params' => ['category_id']],
            'set_sla_policy' => ['label' => 'Set SLA Policy', 'params' => ['sla_policy_id']],
            'add_tag' => ['label' => 'Add Tag', 'params' => ['tag']],
            'remove_tag' => ['label' => 'Remove Tag', 'params' => ['tag']],
            'send_email' => ['label' => 'Send Email', 'params' => ['to', 'subject', 'message']],
            'add_comment' => ['label' => 'Add Comment', 'params' => ['content', 'is_internal']],
            'escalate' => ['label' => 'Escalate Ticket', 'params' => ['level', 'escalated_to', 'reason']],
        ];
    }

    /**
     * Get rule execution statistics.
     */
    public function getRuleStatistics(AutomationRule $rule, int $days = 30): array
    {
        // This would query execution logs to provide statistics
        // For now, return mock data
        return [
            'executions' => 0,
            'success_rate' => 0,
            'avg_execution_time' => 0,
            'last_executed' => null,
        ];
    }

    /**
     * Validate rule configuration.
     */
    public function validateRule(array $data): array
    {
        $errors = [];

        // Validate trigger event
        if (empty($data['trigger_event']) || !array_key_exists($data['trigger_event'], $this->getAvailableTriggers())) {
            $errors['trigger_event'] = 'Invalid trigger event';
        }

        // Validate conditions
        if (!empty($data['conditions'])) {
            foreach ($data['conditions'] as $index => $condition) {
                if (empty($condition['field']) || empty($condition['operator'])) {
                    $errors["conditions.{$index}"] = 'Field and operator are required';
                }
            }
        }

        // Validate actions
        if (empty($data['actions'])) {
            $errors['actions'] = 'At least one action is required';
        } else {
            foreach ($data['actions'] as $index => $action) {
                if (empty($action['type']) || !array_key_exists($action['type'], $this->getAvailableActions())) {
                    $errors["actions.{$index}"] = 'Invalid action type';
                }
            }
        }

        return $errors;
    }

    /**
     * Apply AI-powered automation to a ticket.
     */
    public function applyAIAutomation(Ticket $ticket): array
    {
        $results = [];

        try {
            // Auto-categorize if no category is set
            if (!$ticket->category_id) {
                $categoryId = $this->aiService->categorizeTicket($ticket);
                if ($categoryId) {
                    $ticket->update(['category_id' => $categoryId]);
                    $results['categorization'] = [
                        'success' => true,
                        'category_id' => $categoryId,
                    ];
                }
            }

            // Auto-determine priority if it's set to default
            if ($ticket->priority === 'medium') {
                $aiPriority = $this->aiService->determinePriority($ticket);
                if ($aiPriority !== 'medium') {
                    $ticket->update(['priority' => $aiPriority]);
                    $results['priority'] = [
                        'success' => true,
                        'priority' => $aiPriority,
                    ];
                }
            }

            // Analyze sentiment and store in metadata
            $sentiment = $this->aiService->analyzeSentiment($ticket);
            $metadata = $ticket->metadata ?? [];
            $metadata['ai_sentiment'] = $sentiment;
            $ticket->update(['metadata' => $metadata]);
            $results['sentiment'] = $sentiment;

            // Predict resolution time
            $prediction = $this->aiService->predictResolutionTime($ticket);
            $metadata['ai_resolution_prediction'] = $prediction;
            $ticket->update(['metadata' => $metadata]);
            $results['resolution_prediction'] = $prediction;

            // Generate auto-response for common issues
            $autoResponse = $this->aiService->generateAutoResponse($ticket);
            if ($autoResponse) {
                $ticket->comments()->create([
                    'content' => $autoResponse,
                    'user_id' => 1, // System user
                    'is_internal' => false,
                    'is_ai_generated' => true,
                ]);
                $results['auto_response'] = [
                    'success' => true,
                    'response' => $autoResponse,
                ];
            }

            // Check for escalation recommendations
            $escalationRec = $this->aiService->generateEscalationRecommendations($ticket);
            if ($escalationRec['should_escalate']) {
                $results['escalation_recommendation'] = $escalationRec;

                // Auto-escalate if high urgency and no assignment
                if ($escalationRec['urgency'] === 'critical' && !$ticket->assigned_to) {
                    $this->autoEscalateTicket($ticket, $escalationRec);
                    $results['auto_escalated'] = true;
                }
            }

        } catch (\Exception $e) {
            Log::error('AI automation failed', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);

            $results['error'] = $e->getMessage();
        }

        return $results;
    }

    /**
     * Auto-escalate ticket based on AI recommendations.
     */
    private function autoEscalateTicket(Ticket $ticket, array $recommendation): void
    {
        $escalationLevel = $ticket->escalation_level + 1;

        $ticket->escalations()->create([
            'escalated_by' => 1, // System user
            'escalated_to' => null, // Will be assigned by rules
            'escalation_level' => $escalationLevel,
            'reason' => 'AI-powered auto-escalation: ' . $recommendation['reason'],
            'notes' => 'Automatically escalated based on AI analysis',
            'escalated_at' => now(),
        ]);

        $ticket->update([
            'escalation_level' => $escalationLevel,
            'escalated_at' => now(),
        ]);
    }

    /**
     * Generate AI-powered automation rule suggestions.
     */
    public function generateAIRuleSuggestions(): array
    {
        try {
            // Analyze recent tickets to suggest automation rules
            $recentTickets = Ticket::where('created_at', '>=', now()->subDays(30))
                ->with(['category', 'comments'])
                ->limit(100)
                ->get();

            $suggestions = [];

            // Analyze patterns for categorization rules
            $categoryPatterns = $this->analyzeCategorizationPatterns($recentTickets);
            foreach ($categoryPatterns as $pattern) {
                $suggestions[] = [
                    'type' => 'categorization',
                    'name' => "Auto-categorize: {$pattern['keywords']}",
                    'description' => "Automatically categorize tickets containing '{$pattern['keywords']}' as {$pattern['category']}",
                    'trigger_event' => 'ticket_created',
                    'conditions' => [
                        [
                            'field' => 'title',
                            'operator' => 'contains',
                            'value' => $pattern['keywords']
                        ]
                    ],
                    'actions' => [
                        [
                            'type' => 'set_category',
                            'params' => ['category_id' => $pattern['category_id']]
                        ]
                    ],
                    'confidence' => $pattern['confidence']
                ];
            }

            // Analyze patterns for priority rules
            $priorityPatterns = $this->analyzePriorityPatterns($recentTickets);
            foreach ($priorityPatterns as $pattern) {
                $suggestions[] = [
                    'type' => 'priority',
                    'name' => "Auto-priority: {$pattern['keywords']}",
                    'description' => "Set priority to {$pattern['priority']} for tickets containing '{$pattern['keywords']}'",
                    'trigger_event' => 'ticket_created',
                    'conditions' => [
                        [
                            'field' => 'description',
                            'operator' => 'contains',
                            'value' => $pattern['keywords']
                        ]
                    ],
                    'actions' => [
                        [
                            'type' => 'set_priority',
                            'params' => ['priority' => $pattern['priority']]
                        ]
                    ],
                    'confidence' => $pattern['confidence']
                ];
            }

            return $suggestions;

        } catch (\Exception $e) {
            Log::error('Failed to generate AI rule suggestions', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Analyze categorization patterns from tickets.
     */
    private function analyzeCategorizationPatterns($tickets): array
    {
        $patterns = [];
        $categoryKeywords = [];

        foreach ($tickets as $ticket) {
            if ($ticket->category_id) {
                $words = str_word_count(strtolower($ticket->title . ' ' . $ticket->description), 1);
                foreach ($words as $word) {
                    if (strlen($word) > 4) {
                        $categoryKeywords[$ticket->category_id][$word] =
                            ($categoryKeywords[$ticket->category_id][$word] ?? 0) + 1;
                    }
                }
            }
        }

        foreach ($categoryKeywords as $categoryId => $keywords) {
            arsort($keywords);
            $topKeywords = array_slice($keywords, 0, 3, true);

            foreach ($topKeywords as $keyword => $count) {
                if ($count >= 3) { // Minimum threshold
                    $patterns[] = [
                        'category_id' => $categoryId,
                        'category' => $tickets->where('category_id', $categoryId)->first()?->category?->name ?? 'Unknown',
                        'keywords' => $keyword,
                        'confidence' => min(($count / 10) * 100, 95) // Max 95% confidence
                    ];
                }
            }
        }

        return $patterns;
    }

    /**
     * Analyze priority patterns from tickets.
     */
    private function analyzePriorityPatterns($tickets): array
    {
        $patterns = [];
        $priorityKeywords = [];

        foreach ($tickets as $ticket) {
            $words = str_word_count(strtolower($ticket->title . ' ' . $ticket->description), 1);
            foreach ($words as $word) {
                if (strlen($word) > 4) {
                    $priorityKeywords[$ticket->priority][$word] =
                        ($priorityKeywords[$ticket->priority][$word] ?? 0) + 1;
                }
            }
        }

        foreach ($priorityKeywords as $priority => $keywords) {
            if ($priority !== 'medium') { // Skip default priority
                arsort($keywords);
                $topKeywords = array_slice($keywords, 0, 2, true);

                foreach ($topKeywords as $keyword => $count) {
                    if ($count >= 2) {
                        $patterns[] = [
                            'priority' => $priority,
                            'keywords' => $keyword,
                            'confidence' => min(($count / 5) * 100, 90)
                        ];
                    }
                }
            }
        }

        return $patterns;
    }
}
