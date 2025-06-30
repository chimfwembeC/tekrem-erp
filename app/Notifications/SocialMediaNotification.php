<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class SocialMediaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected array $notificationData;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $data)
    {
        $this->notificationData = $data;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mailMessage = (new MailMessage)
            ->subject($this->notificationData['title'])
            ->greeting('Hello!')
            ->line($this->notificationData['message']);

        // Add action button based on notification type
        switch ($this->notificationData['type']) {
            case 'new_lead':
                $mailMessage->action('View Lead', url('/crm/leads/' . $this->notificationData['data']['lead_id']));
                break;
            case 'post_published':
            case 'post_edited':
                $mailMessage->action('View Social Media Dashboard', url('/social-media'));
                break;
            case 'new_message':
            case 'new_comment':
            case 'new_mention':
                $mailMessage->action('View Social Media Dashboard', url('/social-media'));
                break;
        }

        return $mailMessage->line('Thank you for using TekRem ERP!');
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): DatabaseMessage
    {
        return new DatabaseMessage([
            'type' => $this->notificationData['type'],
            'platform' => $this->notificationData['platform'],
            'title' => $this->notificationData['title'],
            'message' => $this->notificationData['message'],
            'data' => $this->notificationData['data'] ?? [],
            'icon' => $this->getIconForType($this->notificationData['type']),
            'color' => $this->getColorForPlatform($this->notificationData['platform']),
        ]);
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return $this->notificationData;
    }

    /**
     * Get icon for notification type.
     */
    private function getIconForType(string $type): string
    {
        return match($type) {
            'new_lead' => 'user-plus',
            'post_published' => 'send',
            'post_edited' => 'edit',
            'new_message' => 'message-circle',
            'new_comment' => 'message-square',
            'new_mention' => 'at-sign',
            default => 'bell'
        };
    }

    /**
     * Get color for platform.
     */
    private function getColorForPlatform(string $platform): string
    {
        return match($platform) {
            'facebook' => 'blue',
            'instagram' => 'pink',
            'linkedin' => 'indigo',
            default => 'gray'
        };
    }
}
