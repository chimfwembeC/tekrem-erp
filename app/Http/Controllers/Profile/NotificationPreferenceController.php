<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use App\Models\UserNotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPreferenceController extends Controller
{
    /**
     * Display the notification preferences.
     */
    public function show(): Response
    {
        $user = Auth::user();
        $preferences = $user->getNotificationPreferences();

        return Inertia::render('Profile/Partials/NotificationSettings', [
            'preferences' => $preferences,
        ]);
    }

    /**
     * Update the user's notification preferences.
     */
    public function update(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
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
            'frequency' => 'required|string|in:immediate,hourly,daily,weekly',
            'quiet_hours_enabled' => 'boolean',
            'quiet_hours_start' => 'required_if:quiet_hours_enabled,true|date_format:H:i',
            'quiet_hours_end' => 'required_if:quiet_hours_enabled,true|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $user = Auth::user();
        $preferences = $user->getNotificationPreferences();

        // Update preferences
        $preferences->update($validator->validated());

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Notification preferences updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Reset notification preferences to defaults.
     */
    public function reset(): RedirectResponse
    {
        $user = Auth::user();
        $preferences = $user->getNotificationPreferences();

        // Reset to default values
        $preferences->update([
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
        ]);

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Notification preferences reset to defaults!'
        ]);

        return redirect()->back();
    }

    /**
     * Get notification preferences as JSON (for API usage).
     */
    public function getPreferences()
    {
        $user = Auth::user();
        $preferences = $user->getNotificationPreferences();

        return response()->json([
            'preferences' => $preferences,
        ]);
    }
}
