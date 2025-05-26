@component('mail::message')
# Ticket Created Successfully

@if($recipientType === 'customer')
Hello,

Your support ticket has been created successfully. Our team will review your request and respond as soon as possible.
@else
Hello,

A new support ticket has been created and requires attention.
@endif

## Ticket Details

**Ticket Number:** #{{ $ticket->ticket_number }}  
**Title:** {{ $ticket->title }}  
**Priority:** {{ ucfirst($ticket->priority) }}  
**Status:** {{ ucfirst(str_replace('_', ' ', $ticket->status)) }}  
@if($ticket->category)
**Category:** {{ $ticket->category->name }}  
@endif
**Created:** {{ $ticket->created_at->format('M j, Y \a\t g:i A') }}

## Description

{{ $ticket->description }}

@if($ticket->sla_policy)
## Service Level Agreement

**Response Time:** {{ $ticket->sla_policy->response_time_hours }} hours  
**Resolution Time:** {{ $ticket->sla_policy->resolution_time_hours }} hours
@endif

@component('mail::button', ['url' => $ticketUrl])
View Ticket
@endcomponent

@if($recipientType === 'customer')
You can track the progress of your ticket and add additional information by clicking the button above.

If you have any questions, please don't hesitate to contact our support team.
@else
Please review this ticket and take appropriate action based on its priority and category.
@endif

Thanks,<br>
{{ config('app.name') }} Support Team
@endcomponent
