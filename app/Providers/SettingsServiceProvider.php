<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class SettingsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton('settings', function ($app) {
            return new Setting();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        try {
            // Check if the settings table exists before attempting to load settings
            if (Schema::hasTable('settings')) {
                // Load settings from cache or database
                if (Cache::has('settings')) {
                    $settings = Cache::get('settings');
                } else {
                    $settings = Setting::all();
                    Cache::put('settings', $settings, now()->addDay());
                }

                // Set settings as config values
                foreach ($settings as $setting) {
                    Config::set('settings.' . $setting->key, $setting->value);
                }

                // Share settings with all views
                view()->share('settings', $settings);

                // Share public settings with Inertia
                $publicSettings = $settings->where('is_public', true)->pluck('value', 'key')->toArray();

                if (class_exists('Inertia\Inertia')) {
                    \Inertia\Inertia::share('settings', $publicSettings);
                }
            }
        } catch (\Exception $e) {
            // Silently fail during migrations or when DB isn't ready
            // This prevents errors during artisan commands
        }
    }
}
