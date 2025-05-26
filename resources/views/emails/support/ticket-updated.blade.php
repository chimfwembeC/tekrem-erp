@component('mail::message')
# Ticket Updated

@if($recipientType === 'customer')
Hello,

Your support ticket has been updated. Please see the details below.
@else
Hello,

A support ticket has been updated and may require your attention.
@endif

## Ticket Details

**Ticket Number:** #{{ $ticket->ticket_number }}  
**Title:** {{ $ticket->title }}  
**Current Status:** {{ ucfirst(str_replace('_', ' ', $ticket->status)) }}  
**Priority:** {{ ucfirst($ticket->priority) }}  
**Updated:** {{ $ticket->updated_at->format('M j, Y \a\t g:i A') }}

@if($updateType === 'status_changed')
## Status Change

@if(isset($changes['status']))
The ticket status has been changed from **{{ ucfirst(str_replace('_', ' ', $changes['status']['from'])) }}** to **{{ ucfirst(str_replace('_', ' ', $changes['status']['to'])) }}**.
@endif

@elseif($updateType === 'assigned')
## Assignment

@if($ticket->assignedTo)
This ticket has been assigned to **{{ $ticket->assignedTo->name }}**.
@endif

@elseif($updateType === 'escalated')
## Escalation

This ticket has been escalated to level {{ $ticket->escalation_level }}.

@elseif($updateType === 'resolved')
## Resolution

@if($recipientType === 'customer')
Great news! Your ticket has been resolved. Please review the resolution and let us know if you need any further assistance.
@else
This ticket has been marked as resolved.
@endif

@elseif($updateType === 'closed')
## Closure

@if($recipientType === 'customer')
Your ticket has been closed. If you need further assistance with this issue, you can reopen the ticket or create a new one.
@else
This ticket has been closed.
@endif

@endif

@if(!empty($changes) && $updateType !== 'status_changed')
## Changes Made

@foreach($changes as $field => $change)
@if($field !== 'status')
**{{ ucfirst(str_replace('_', ' ', $field)) }}:** {{ $change['from'] ?? 'Not set' }} → {{ $change['to'] ?? 'Not set' }}  
@endif
@endforeach
@endif

@component('mail::button', ['url' => $ticketUrl])
View Ticket
@endcomponent

@if($recipientType === 'customer')
You can view the full ticket details and add comments by clicking the button above.
@else
Please review the updated ticket and take any necessary action.
@endif

Thanks,<br>
{{ config('app.name') }} Support Team
@endcomponent
