<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AutomationRule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'is_active',
        'trigger_event',
        'conditions',
        'actions',
        'priority',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'conditions' => 'array',
        'actions' => 'array',
        'priority' => 'integer',
    ];

    /**
     * Get the user who created the rule.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get the user who last updated the rule.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }

    /**
     * Scope for active rules.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for rules by trigger event.
     */
    public function scopeByTrigger($query, string $trigger)
    {
        return $query->where('trigger_event', $trigger);
    }

    /**
     * Scope for ordered rules by priority.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('priority', 'desc')->orderBy('created_at', 'asc');
    }

    /**
     * Check if rule conditions match the given ticket.
     */
    public function matchesConditions(Ticket $ticket): bool
    {
        if (empty($this->conditions)) {
            return true;
        }

        foreach ($this->conditions as $condition) {
            if (!$this->evaluateCondition($condition, $ticket)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Execute rule actions on the given ticket.
     */
    public function executeActions(Ticket $ticket): array
    {
        $results = [];

        if (empty($this->actions)) {
            return $results;
        }

        foreach ($this->actions as $action) {
            try {
                $result = $this->executeAction($action, $ticket);
                $results[] = [
                    'action' => $action,
                    'success' => true,
                    'result' => $result,
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'action' => $action,
                    'success' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Evaluate a single condition.
     */
    private function evaluateCondition(array $condition, Ticket $ticket): bool
    {
        $field = $condition['field'] ?? '';
        $operator = $condition['operator'] ?? '';
        $value = $condition['value'] ?? '';

        $ticketValue = $this->getTicketFieldValue($field, $ticket);

        return match ($operator) {
            'equals' => $ticketValue == $value,
            'not_equals' => $ticketValue != $value,
            'contains' => str_contains(strtolower($ticketValue), strtolower($value)),
            'not_contains' => !str_contains(strtolower($ticketValue), strtolower($value)),
            'starts_with' => str_starts_with(strtolower($ticketValue), strtolower($value)),
            'ends_with' => str_ends_with(strtolower($ticketValue), strtolower($value)),
            'in' => in_array($ticketValue, (array) $value),
            'not_in' => !in_array($ticketValue, (array) $value),
            'greater_than' => $ticketValue > $value,
            'less_than' => $ticketValue < $value,
            'is_empty' => empty($ticketValue),
            'is_not_empty' => !empty($ticketValue),
            default => false,
        };
    }

    /**
     * Execute a single action.
     */
    private function executeAction(array $action, Ticket $ticket): mixed
    {
        $type = $action['type'] ?? '';
        $params = $action['params'] ?? [];

        return match ($type) {
            'assign_to_user' => $this->assignToUser($ticket, $params),
            'set_priority' => $this->setPriority($ticket, $params),
            'set_status' => $this->setStatus($ticket, $params),
            'set_category' => $this->setCategory($ticket, $params),
            'set_sla_policy' => $this->setSLAPolicy($ticket, $params),
            'add_tag' => $this->addTag($ticket, $params),
            'remove_tag' => $this->removeTag($ticket, $params),
            'send_email' => $this->sendEmail($ticket, $params),
            'add_comment' => $this->addComment($ticket, $params),
            'escalate' => $this->escalateTicket($ticket, $params),
            default => throw new \InvalidArgumentException("Unknown action type: {$type}"),
        };
    }

    /**
     * Get ticket field value.
     */
    private function getTicketFieldValue(string $field, Ticket $ticket): mixed
    {
        return match ($field) {
            'title' => $ticket->title,
            'description' => $ticket->description,
            'status' => $ticket->status,
            'priority' => $ticket->priority,
            'category_id' => $ticket->category_id,
            'category_name' => $ticket->category?->name,
            'assigned_to' => $ticket->assigned_to,
            'requester_email' => $ticket->requester_email,
            'created_at' => $ticket->created_at,
            'tags' => $ticket->tags ?? [],
            default => null,
        };
    }

    /**
     * Assign ticket to user.
     */
    private function assignToUser(Ticket $ticket, array $params): bool
    {
        $userId = $params['user_id'] ?? null;
        
        if ($userId) {
            $ticket->update(['assigned_to' => $userId]);
            return true;
        }

        return false;
    }

    /**
     * Set ticket priority.
     */
    private function setPriority(Ticket $ticket, array $params): bool
    {
        $priority = $params['priority'] ?? null;
        
        if (in_array($priority, ['low', 'medium', 'high', 'urgent'])) {
            $ticket->update(['priority' => $priority]);
            return true;
        }

        return false;
    }

    /**
     * Set ticket status.
     */
    private function setStatus(Ticket $ticket, array $params): bool
    {
        $status = $params['status'] ?? null;
        
        if (in_array($status, ['open', 'in_progress', 'pending', 'resolved', 'closed'])) {
            $ticket->update(['status' => $status]);
            return true;
        }

        return false;
    }

    /**
     * Set ticket category.
     */
    private function setCategory(Ticket $ticket, array $params): bool
    {
        $categoryId = $params['category_id'] ?? null;
        
        if ($categoryId && TicketCategory::find($categoryId)) {
            $ticket->update(['category_id' => $categoryId]);
            return true;
        }

        return false;
    }

    /**
     * Set SLA policy.
     */
    private function setSLAPolicy(Ticket $ticket, array $params): bool
    {
        $slaId = $params['sla_policy_id'] ?? null;
        
        if ($slaId && SLA::find($slaId)) {
            $ticket->update(['sla_policy_id' => $slaId]);
            return true;
        }

        return false;
    }

    /**
     * Add tag to ticket.
     */
    private function addTag(Ticket $ticket, array $params): bool
    {
        $tag = $params['tag'] ?? null;
        
        if ($tag) {
            $tags = $ticket->tags ?? [];
            if (!in_array($tag, $tags)) {
                $tags[] = $tag;
                $ticket->update(['tags' => $tags]);
            }
            return true;
        }

        return false;
    }

    /**
     * Remove tag from ticket.
     */
    private function removeTag(Ticket $ticket, array $params): bool
    {
        $tag = $params['tag'] ?? null;
        
        if ($tag) {
            $tags = $ticket->tags ?? [];
            $tags = array_filter($tags, fn($t) => $t !== $tag);
            $ticket->update(['tags' => array_values($tags)]);
            return true;
        }

        return false;
    }

    /**
     * Send email notification.
     */
    private function sendEmail(Ticket $ticket, array $params): bool
    {
        // This would integrate with the email notification service
        // For now, just return true
        return true;
    }

    /**
     * Add comment to ticket.
     */
    private function addComment(Ticket $ticket, array $params): bool
    {
        $content = $params['content'] ?? null;
        $isInternal = $params['is_internal'] ?? true;
        
        if ($content) {
            $ticket->comments()->create([
                'content' => $content,
                'user_id' => 1, // System user
                'is_internal' => $isInternal,
            ]);
            return true;
        }

        return false;
    }

    /**
     * Escalate ticket.
     */
    private function escalateTicket(Ticket $ticket, array $params): bool
    {
        $level = $params['level'] ?? ($ticket->escalation_level + 1);
        $reason = $params['reason'] ?? 'Automated escalation';
        
        $ticket->escalations()->create([
            'escalated_to' => $params['escalated_to'] ?? null,
            'escalated_by' => 1, // System user
            'reason' => $reason,
            'level' => $level,
        ]);

        $ticket->update(['escalation_level' => $level]);
        
        return true;
    }
}
