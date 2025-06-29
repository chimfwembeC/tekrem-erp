<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the customer profile.
     */
    public function show(): Response
    {
        $user = Auth::user();
        
        return Inertia::render('Customer/Profile/Show', [
            'user' => $user->load(['roles', 'permissions']),
            'sessions' => $this->getActiveSessions(),
            'twoFactorEnabled' => !is_null($user->two_factor_secret),
        ]);
    }

    /**
     * Show the profile edit form.
     */
    public function edit(): Response
    {
        $user = Auth::user();
        
        return Inertia::render('Customer/Profile/Edit', [
            'user' => $user,
            'timezones' => $this->getTimezones(),
            'languages' => $this->getLanguages(),
        ]);
    }

    /**
     * Update the customer's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'company' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'language' => ['nullable', 'string', 'max:10'],
            'bio' => ['nullable', 'string', 'max:1000'],
        ]);

        $user->update($validated);

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Profile updated successfully!'
        ]);

        return redirect()->route('customer.profile.show');
    }

    /**
     * Update the customer's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        Auth::user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Password updated successfully!'
        ]);

        return redirect()->route('customer.profile.show');
    }

    /**
     * Update the customer's notification preferences.
     */
    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email_notifications' => ['boolean'],
            'sms_notifications' => ['boolean'],
            'push_notifications' => ['boolean'],
            'marketing_emails' => ['boolean'],
            'ticket_updates' => ['boolean'],
            'project_updates' => ['boolean'],
            'invoice_notifications' => ['boolean'],
            'payment_confirmations' => ['boolean'],
        ]);

        $user = Auth::user();
        
        // Store notification preferences in user meta or settings table
        foreach ($validated as $key => $value) {
            $user->setMeta("notification_preferences.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Notification preferences updated successfully!'
        ]);

        return redirect()->route('customer.profile.show');
    }

    /**
     * Upload and update profile photo.
     */
    public function updatePhoto(Request $request): RedirectResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'max:2048'], // 2MB max
        ]);

        $user = Auth::user();
        
        if ($request->hasFile('photo')) {
            $user->updateProfilePhoto($request->file('photo'));
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Profile photo updated successfully!'
        ]);

        return redirect()->route('customer.profile.show');
    }

    /**
     * Delete the customer's profile photo.
     */
    public function deletePhoto(): RedirectResponse
    {
        Auth::user()->deleteProfilePhoto();

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Profile photo deleted successfully!'
        ]);

        return redirect()->route('customer.profile.show');
    }

    /**
     * Show account deletion confirmation.
     */
    public function deleteAccount(): Response
    {
        return Inertia::render('Customer/Profile/DeleteAccount');
    }

    /**
     * Delete the customer's account.
     */
    public function destroyAccount(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
            'confirmation' => ['required', 'in:DELETE'],
        ]);

        $user = Auth::user();
        
        // Log out the user
        Auth::logout();
        
        // Soft delete or anonymize the user account
        $user->update([
            'email' => 'deleted_' . $user->id . '@deleted.local',
            'name' => 'Deleted User',
            'deleted_at' => now(),
        ]);

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Your account has been successfully deleted.'
        ]);

        return redirect()->route('welcome');
    }

    /**
     * Get active sessions for the user.
     */
    private function getActiveSessions(): array
    {
        // This would typically integrate with session storage
        // For now, return mock data
        return [
            [
                'id' => session()->getId(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'last_activity' => now(),
                'is_current' => true,
            ]
        ];
    }

    /**
     * Get available timezones.
     */
    private function getTimezones(): array
    {
        return [
            'UTC' => 'UTC',
            'America/New_York' => 'Eastern Time',
            'America/Chicago' => 'Central Time',
            'America/Denver' => 'Mountain Time',
            'America/Los_Angeles' => 'Pacific Time',
            'Europe/London' => 'London',
            'Europe/Paris' => 'Paris',
            'Asia/Tokyo' => 'Tokyo',
            'Asia/Shanghai' => 'Shanghai',
            'Australia/Sydney' => 'Sydney',
        ];
    }

    /**
     * Get available languages.
     */
    private function getLanguages(): array
    {
        return [
            'en' => 'English',
            'es' => 'Spanish',
            'fr' => 'French',
            'de' => 'German',
            'it' => 'Italian',
            'pt' => 'Portuguese',
            'ru' => 'Russian',
            'ja' => 'Japanese',
            'ko' => 'Korean',
            'zh' => 'Chinese',
        ];
    }
}
