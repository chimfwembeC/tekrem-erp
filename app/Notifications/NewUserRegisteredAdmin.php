<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class NewUserRegisteredAdmin extends Notification implements ShouldQueue
{
    use Queueable;

    protected $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New User Registration')
            ->greeting("Hello Admin!")
            ->line("A new user has registered:")
            ->line("Name: {$this->user->name}")
            ->line("Email: {$this->user->email}")
            ->action('View User', url("/admin/users/{$this->user->id}"))
            ->line('Keep an eye on new registrations for onboarding.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'admin_new_user_registered',
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'user_email' => $this->user->email,
            'registered_at' => $this->user->created_at,
        ];
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'type' => 'admin_new_user_registered',
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'user_email' => $this->user->email,
            'registered_at' => $this->user->created_at,
        ];
    }

    public function databaseType(object $notifiable): string
    {
        return 'admin_new_user_registered';
    }
}
