<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationPreference extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'email_notifications',
        'push_notifications',
        'sms_notifications',
        'security_alerts',
        'chat_notifications',
        'task_reminders',
        'calendar_reminders',
        'marketing_emails',
        'lead_notifications',
        'client_notifications',
        'communication_notifications',
        'frequency',
        'quiet_hours_enabled',
        'quiet_hours_start',
        'quiet_hours_end',
        'custom_preferences',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
        'security_alerts' => 'boolean',
        'chat_notifications' => 'boolean',
        'task_reminders' => 'boolean',
        'calendar_reminders' => 'boolean',
        'marketing_emails' => 'boolean',
        'lead_notifications' => 'boolean',
        'client_notifications' => 'boolean',
        'communication_notifications' => 'boolean',
        'quiet_hours_enabled' => 'boolean',
        'quiet_hours_start' => 'datetime:H:i',
        'quiet_hours_end' => 'datetime:H:i',
        'custom_preferences' => 'array',
    ];

    /**
     * Get the user that owns the notification preferences.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create notification preferences for a user.
     *
     * @param int $userId
     * @return UserNotificationPreference
     */
    public static function getOrCreateForUser(int $userId): UserNotificationPreference
    {
        return static::firstOrCreate(
            ['user_id' => $userId],
            [
                'email_notifications' => true,
                'push_notifications' => true,
                'sms_notifications' => false,
                'security_alerts' => true,
                'chat_notifications' => true,
                'task_reminders' => true,
                'calendar_reminders' => true,
                'marketing_emails' => false,
                'lead_notifications' => true,
                'client_notifications' => true,
                'communication_notifications' => true,
                'frequency' => 'immediate',
                'quiet_hours_enabled' => false,
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '08:00',
            ]
        );
    }

    /**
     * Check if user should receive notifications of a specific type.
     *
     * @param string $type
     * @return bool
     */
    public function shouldReceive(string $type): bool
    {
        // Map notification types to preference fields
        $typeMap = [
            'chat' => 'chat_notifications',
            'new_chat_message' => 'chat_notifications',
            'lead' => 'lead_notifications',
            'client' => 'client_notifications',
            'communication' => 'communication_notifications',
            'task' => 'task_reminders',
            'calendar' => 'calendar_reminders',
            'security' => 'security_alerts',
            'marketing' => 'marketing_emails',
        ];

        $field = $typeMap[$type] ?? null;
        
        if (!$field) {
            return true; // Default to true for unknown types
        }

        return $this->{$field};
    }

    /**
     * Check if user should receive notifications via a specific method.
     *
     * @param string $method
     * @return bool
     */
    public function shouldReceiveVia(string $method): bool
    {
        $methodMap = [
            'email' => 'email_notifications',
            'push' => 'push_notifications',
            'sms' => 'sms_notifications',
        ];

        $field = $methodMap[$method] ?? null;
        
        if (!$field) {
            return false;
        }

        return $this->{$field};
    }

    /**
     * Check if current time is within quiet hours.
     *
     * @return bool
     */
    public function isQuietHours(): bool
    {
        if (!$this->quiet_hours_enabled) {
            return false;
        }

        $now = now()->format('H:i');
        $start = $this->quiet_hours_start;
        $end = $this->quiet_hours_end;

        // Handle overnight quiet hours (e.g., 22:00 to 08:00)
        if ($start > $end) {
            return $now >= $start || $now <= $end;
        }

        // Handle same-day quiet hours (e.g., 12:00 to 14:00)
        return $now >= $start && $now <= $end;
    }
}
