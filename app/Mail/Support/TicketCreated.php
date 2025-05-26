<?php

namespace App\Mail\Support;

use App\Models\Support\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketCreated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Ticket $ticket,
        public string $recipientType = 'customer' // 'customer' or 'staff'
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Ticket Created: #{$this->ticket->ticket_number} - {$this->ticket->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.support.ticket-created',
            with: [
                'ticket' => $this->ticket,
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
