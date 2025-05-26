<?php

namespace App\Services\Support;

use App\Mail\Support\TicketCreated;
use App\Mail\Support\TicketUpdated;
use App\Mail\Support\TicketCommentAdded;
use App\Models\Support\Ticket;
use App\Models\Support\TicketComment;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailNotificationService
{
    /**
     * Send ticket created notification.
     */
    public function sendTicketCreated(Ticket $ticket): void
    {
        try {
            // Notify customer/requester
            if ($ticket->requester_email) {
                Mail::to($ticket->requester_email)
                    ->send(new TicketCreated($ticket, 'customer'));
            }

            // Notify assigned user
            if ($ticket->assignedTo) {
                Mail::to($ticket->assignedTo->email)
                    ->send(new TicketCreated($ticket, 'staff'));
            }

            // Notify category auto-assign user
            if (!$ticket->assignedTo && $ticket->category && $ticket->category->auto_assign_user) {
                Mail::to($ticket->category->auto_assign_user->email)
                    ->send(new TicketCreated($ticket, 'staff'));
            }

            // Notify support managers
            $this->notifySupportManagers($ticket, new TicketCreated($ticket, 'staff'));

        } catch (\Exception $e) {
            Log::error('Failed to send ticket created email', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send ticket updated notification.
     */
    public function sendTicketUpdated(Ticket $ticket, string $updateType, array $changes = []): void
    {
        try {
            // Notify customer/requester
            if ($ticket->requester_email) {
                Mail::to($ticket->requester_email)
                    ->send(new TicketUpdated($ticket, $updateType, $changes, 'customer'));
            }

            // Notify assigned user
            if ($ticket->assignedTo) {
                Mail::to($ticket->assignedTo->email)
                    ->send(new TicketUpdated($ticket, $updateType, $changes, 'staff'));
            }

            // Notify previous assignee if assignment changed
            if ($updateType === 'assigned' && isset($changes['assigned_to']['from'])) {
                $previousAssignee = User::find($changes['assigned_to']['from']);
                if ($previousAssignee) {
                    Mail::to($previousAssignee->email)
                        ->send(new TicketUpdated($ticket, $updateType, $changes, 'staff'));
                }
            }

            // Notify support managers for important updates
            if (in_array($updateType, ['escalated', 'resolved', 'closed'])) {
                $this->notifySupportManagers($ticket, new TicketUpdated($ticket, $updateType, $changes, 'staff'));
            }

        } catch (\Exception $e) {
            Log::error('Failed to send ticket updated email', [
                'ticket_id' => $ticket->id,
                'update_type' => $updateType,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send comment added notification.
     */
    public function sendCommentAdded(Ticket $ticket, TicketComment $comment): void
    {
        try {
            // Don't send notifications for internal comments to customers
            if (!$comment->is_internal && $ticket->requester_email) {
                Mail::to($ticket->requester_email)
                    ->send(new TicketCommentAdded($ticket, $comment, 'customer'));
            }

            // Notify assigned user (if not the comment author)
            if ($ticket->assignedTo && $ticket->assignedTo->id !== $comment->user_id) {
                Mail::to($ticket->assignedTo->email)
                    ->send(new TicketCommentAdded($ticket, $comment, 'staff'));
            }

            // Notify other staff who have commented on this ticket
            $staffCommenters = $ticket->comments()
                ->with('user')
                ->where('user_id', '!=', $comment->user_id)
                ->whereHas('user.roles', function ($query) {
                    $query->whereIn('name', ['admin', 'staff']);
                })
                ->get()
                ->pluck('user')
                ->unique('id');

            foreach ($staffCommenters as $staff) {
                if ($staff->id !== $ticket->assigned_to) {
                    Mail::to($staff->email)
                        ->send(new TicketCommentAdded($ticket, $comment, 'staff'));
                }
            }

        } catch (\Exception $e) {
            Log::error('Failed to send comment added email', [
                'ticket_id' => $ticket->id,
                'comment_id' => $comment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send SLA breach notification.
     */
    public function sendSLABreachNotification(Ticket $ticket, string $breachType): void
    {
        try {
            $subject = "SLA Breach Alert: #{$ticket->ticket_number}";
            $message = "Ticket #{$ticket->ticket_number} has breached its {$breachType} SLA.";

            // Notify assigned user
            if ($ticket->assignedTo) {
                Mail::raw($message, function ($mail) use ($ticket, $subject) {
                    $mail->to($ticket->assignedTo->email)
                         ->subject($subject);
                });
            }

            // Notify support managers
            $this->notifySupportManagers($ticket, null, $subject, $message);

        } catch (\Exception $e) {
            Log::error('Failed to send SLA breach email', [
                'ticket_id' => $ticket->id,
                'breach_type' => $breachType,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send escalation notification.
     */
    public function sendEscalationNotification(Ticket $ticket, User $escalatedTo, string $reason): void
    {
        try {
            $subject = "Ticket Escalated: #{$ticket->ticket_number}";
            $message = "Ticket #{$ticket->ticket_number} has been escalated to you.\n\nReason: {$reason}";

            Mail::raw($message, function ($mail) use ($escalatedTo, $subject) {
                $mail->to($escalatedTo->email)
                     ->subject($subject);
            });

        } catch (\Exception $e) {
            Log::error('Failed to send escalation email', [
                'ticket_id' => $ticket->id,
                'escalated_to' => $escalatedTo->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Notify support managers.
     */
    private function notifySupportManagers(Ticket $ticket, $mailable = null, string $subject = null, string $message = null): void
    {
        $managers = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->get();

        foreach ($managers as $manager) {
            if ($mailable) {
                Mail::to($manager->email)->send($mailable);
            } elseif ($subject && $message) {
                Mail::raw($message, function ($mail) use ($manager, $subject) {
                    $mail->to($manager->email)->subject($subject);
                });
            }
        }
    }

    /**
     * Get email preferences for a user.
     */
    public function getUserEmailPreferences(User $user): array
    {
        // This could be expanded to include user-specific email preferences
        return [
            'ticket_created' => true,
            'ticket_updated' => true,
            'comment_added' => true,
            'sla_breach' => true,
            'escalation' => true,
        ];
    }

    /**
     * Check if user wants to receive email for specific event.
     */
    public function shouldSendEmail(User $user, string $eventType): bool
    {
        $preferences = $this->getUserEmailPreferences($user);
        return $preferences[$eventType] ?? false;
    }
}
