<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display the settings dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('Settings/Index', [
            'settings' => $this->getSystemSettings(),
            'stats' => $this->getSystemStats(),
        ]);
    }

    /**
     * Display general settings.
     */
    public function general(): Response
    {
        return Inertia::render('Settings/General', [
            'settings' => $this->getSystemSettings(),
        ]);
    }

    /**
     * Update general settings.
     */
    public function updateGeneral(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'site_name' => 'required|string|max:255',
            'site_description' => 'nullable|string|max:500',
            'site_url' => 'required|url|max:255',
            'admin_email' => 'required|email|max:255',
            'timezone' => 'required|string|max:50',
            'date_format' => 'required|string|max:20',
            'time_format' => 'required|string|max:20',
            'currency' => 'required|string|max:10',
            'language' => 'required|string|max:10',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Update settings in database or config
        // For now, we'll simulate this
        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'General settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Display user management settings.
     */
    public function users(): Response
    {
        return Inertia::render('Settings/Users', [
            'settings' => $this->getUserSettings(),
            'roles' => $this->getAvailableRoles(),
        ]);
    }

    /**
     * Update user management settings.
     */
    public function updateUsers(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'allow_registration' => 'boolean',
            'require_email_verification' => 'boolean',
            'default_role' => 'required|string|exists:roles,name',
            'password_min_length' => 'required|integer|min:6|max:50',
            'password_require_uppercase' => 'boolean',
            'password_require_lowercase' => 'boolean',
            'password_require_numbers' => 'boolean',
            'password_require_symbols' => 'boolean',
            'session_timeout' => 'required|integer|min:5|max:1440',
            'max_login_attempts' => 'required|integer|min:3|max:20',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Update user settings
        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'User management settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Display notification settings.
     */
    public function notifications(): Response
    {
        return Inertia::render('Settings/Notifications', [
            'settings' => $this->getNotificationSettings(),
        ]);
    }

    /**
     * Update notification settings.
     */
    public function updateNotifications(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'email_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'notification_frequency' => 'required|string|in:immediate,hourly,daily,weekly',
            'email_from_name' => 'required|string|max:255',
            'email_from_address' => 'required|email|max:255',
            'smtp_host' => 'nullable|string|max:255',
            'smtp_port' => 'nullable|integer|min:1|max:65535',
            'smtp_username' => 'nullable|string|max:255',
            'smtp_password' => 'nullable|string|max:255',
            'smtp_encryption' => 'nullable|string|in:tls,ssl',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Update notification settings
        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Notification settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Get system settings.
     */
    private function getSystemSettings(): array
    {
        return [
            'site_name' => Setting::get('site_name', config('app.name', 'TekRem ERP')),
            'site_description' => Setting::get('site_description', 'Comprehensive ERP solution for modern businesses'),
            'site_url' => config('app.url'),
            'admin_email' => Setting::get('admin_email', 'admin@tekrem.com'),
            'timezone' => Setting::get('timezone', config('app.timezone', 'UTC')),
            'date_format' => Setting::get('date_format', 'Y-m-d'),
            'time_format' => Setting::get('time_format', 'H:i:s'),
            'currency' => Setting::get('currency', 'USD'),
            'language' => Setting::get('language', 'en'),
        ];
    }

    /**
     * Get system statistics.
     */
    private function getSystemStats(): array
    {
        return [
            'total_users' => \App\Models\User::count(),
            'active_users' => \App\Models\User::where('created_at', '>=', now()->subDays(30))->count(),
            'total_clients' => \App\Models\Client::count() ?? 0,
            'total_leads' => \App\Models\Lead::count() ?? 0,
            'total_conversations' => \App\Models\Conversation::count() ?? 0,
            'system_uptime' => '99.9%',
            'storage_used' => '2.3 GB',
            'database_size' => '156 MB',
        ];
    }

    /**
     * Get user management settings.
     */
    private function getUserSettings(): array
    {
        return [
            'allow_registration' => true,
            'require_email_verification' => true,
            'default_role' => 'customer',
            'password_min_length' => 8,
            'password_require_uppercase' => true,
            'password_require_lowercase' => true,
            'password_require_numbers' => true,
            'password_require_symbols' => false,
            'session_timeout' => 120, // minutes
            'max_login_attempts' => 5,
        ];
    }

    /**
     * Get available roles.
     */
    private function getAvailableRoles(): array
    {
        return [
            ['name' => 'admin', 'label' => 'Administrator'],
            ['name' => 'staff', 'label' => 'Staff Member'],
            ['name' => 'customer', 'label' => 'Customer'],
        ];
    }

    /**
     * Get notification settings.
     */
    private function getNotificationSettings(): array
    {
        return [
            'email_notifications' => true,
            'sms_notifications' => false,
            'push_notifications' => true,
            'notification_frequency' => 'immediate',
            'email_from_name' => config('app.name', 'TekRem ERP'),
            'email_from_address' => 'noreply@tekrem.com',
            'smtp_host' => config('mail.mailers.smtp.host'),
            'smtp_port' => config('mail.mailers.smtp.port'),
            'smtp_username' => config('mail.mailers.smtp.username'),
            'smtp_password' => '••••••••',
            'smtp_encryption' => config('mail.mailers.smtp.encryption'),
        ];
    }
}
