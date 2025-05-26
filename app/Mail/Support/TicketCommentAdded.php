<?php

namespace App\Mail\Support;

use App\Models\Support\Ticket;
use App\Models\Support\TicketComment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketCommentAdded extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Ticket $ticket,
        public TicketComment $comment,
        public string $recipientType = 'customer'
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New Comment on Ticket #{$this->ticket->ticket_number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.support.ticket-comment-added',
            with: [
                'ticket' => $this->ticket,
                'comment' => $this->comment,
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
