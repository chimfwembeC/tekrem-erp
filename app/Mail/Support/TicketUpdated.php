<?php

namespace App\Mail\Support;

use App\Models\Support\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Ticket $ticket,
        public string $updateType,
        public array $changes = [],
        public string $recipientType = 'customer'
    ) {}

    public function envelope(): Envelope
    {
        $subject = match($this->updateType) {
            'status_changed' => "Ticket Status Updated: #{$this->ticket->ticket_number}",
            'assigned' => "Ticket Assigned: #{$this->ticket->ticket_number}",
            'comment_added' => "New Comment: #{$this->ticket->ticket_number}",
            'escalated' => "Ticket Escalated: #{$this->ticket->ticket_number}",
            'resolved' => "Ticket Resolved: #{$this->ticket->ticket_number}",
            'closed' => "Ticket Closed: #{$this->ticket->ticket_number}",
            default => "Ticket Updated: #{$this->ticket->ticket_number}",
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.support.ticket-updated',
            with: [
                'ticket' => $this->ticket,
                'updateType' => $this->updateType,
                'changes' => $this->changes,
                'recipientType' => $this->recipientType,
                'ticketUrl' => $this->recipientType === 'customer' 
                    ? route('customer.tickets.show', $this->ticket->id)
                    : route('support.tickets.show', $this->ticket->id),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
