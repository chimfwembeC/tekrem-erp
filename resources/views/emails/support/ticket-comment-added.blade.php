@component('mail::message')
# New Comment Added

@if($recipientType === 'customer')
Hello,

A new comment has been added to your support ticket by our team.
@else
Hello,

A new comment has been added to ticket #{{ $ticket->ticket_number }}.
@endif

## Ticket Details

**Ticket Number:** #{{ $ticket->ticket_number }}  
**Title:** {{ $ticket->title }}  
**Status:** {{ ucfirst(str_replace('_', ' ', $ticket->status)) }}  
**Comment Added:** {{ $comment->created_at->format('M j, Y \a\t g:i A') }}

## Comment

**From:** {{ $comment->user->name }}  
@if($comment->is_internal && $recipientType !== 'customer')
**Type:** Internal Comment  
@endif
@if($comment->is_solution)
**Type:** Solution  
@endif

{{ $comment->content }}

@if($comment->attachments && count($comment->attachments) > 0)
## Attachments

@foreach($comment->attachments as $attachment)
- {{ $attachment['name'] }} ({{ number_format($attachment['size'] / 1024 / 1024, 2) }} MB)
@endforeach
@endif

@if($comment->time_spent_minutes)
**Time Spent:** {{ $comment->time_spent_minutes }} minutes
@endif

@component('mail::button', ['url' => $ticketUrl])
View Full Conversation
@endcomponent

@if($recipientType === 'customer')
You can reply to this comment and view the full conversation by clicking the button above.
@else
Please review the comment and respond if necessary.
@endif

Thanks,<br>
{{ config('app.name') }} Support Team
@endcomponent
