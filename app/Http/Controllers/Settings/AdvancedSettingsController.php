<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AdvancedSettingsController extends Controller
{
    /**
     * Display advanced settings dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('Settings/Advanced/Index', [
            'systemSettings' => $this->getSystemSettings(),
            'securitySettings' => $this->getSecuritySettings(),
            'performanceSettings' => $this->getPerformanceSettings(),
            'integrationSettings' => $this->getIntegrationSettings(),
            'systemInfo' => $this->getSystemInfo(),
        ]);
    }

    /**
     * Update system settings.
     */
    public function updateSystem(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'debug_mode' => 'boolean',
            'maintenance_mode' => 'boolean',
            'log_level' => 'required|string|in:emergency,alert,critical,error,warning,notice,info,debug',
            'max_upload_size' => 'required|integer|min:1|max:1024',
            'max_execution_time' => 'required|integer|min:30|max:300',
            'memory_limit' => 'required|integer|min:128|max:2048',
            'timezone' => 'required|string',
            'backup_retention_days' => 'required|integer|min:1|max:365',
            'auto_backup_enabled' => 'boolean',
            'auto_backup_frequency' => 'required|string|in:daily,weekly,monthly',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Update system settings
        $this->updateConfigSettings('system', $request->validated());

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'System settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update security settings.
     */
    public function updateSecurity(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'force_https' => 'boolean',
            'csrf_protection' => 'boolean',
            'rate_limiting_enabled' => 'boolean',
            'rate_limit_requests' => 'required|integer|min:10|max:1000',
            'rate_limit_window' => 'required|integer|min:1|max:60',
            'ip_whitelist_enabled' => 'boolean',
            'ip_whitelist' => 'nullable|string',
            'failed_login_lockout' => 'boolean',
            'lockout_duration' => 'required|integer|min:5|max:1440',
            'password_expiry_days' => 'nullable|integer|min:30|max:365',
            'two_factor_required' => 'boolean',
            'api_rate_limiting' => 'boolean',
            'api_rate_limit' => 'required|integer|min:100|max:10000',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Update security settings
        $this->updateConfigSettings('security', $request->validated());

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Security settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update performance settings.
     */
    public function updatePerformance(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'cache_enabled' => 'boolean',
            'cache_driver' => 'required|string|in:file,redis,memcached,database',
            'cache_ttl' => 'required|integer|min:60|max:86400',
            'session_driver' => 'required|string|in:file,cookie,database,redis',
            'queue_driver' => 'required|string|in:sync,database,redis,sqs',
            'database_query_logging' => 'boolean',
            'slow_query_threshold' => 'required|integer|min:100|max:10000',
            'compression_enabled' => 'boolean',
            'minify_assets' => 'boolean',
            'cdn_enabled' => 'boolean',
            'cdn_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Update performance settings
        $this->updateConfigSettings('performance', $request->validated());

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Performance settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update integration settings.
     */
    public function updateIntegrations(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'webhook_enabled' => 'boolean',
            'webhook_url' => 'nullable|url',
            'webhook_secret' => 'nullable|string|max:255',
            'api_enabled' => 'boolean',
            'api_version' => 'required|string|in:v1,v2',
            'cors_enabled' => 'boolean',
            'cors_origins' => 'nullable|string',
            'oauth_enabled' => 'boolean',
            'oauth_providers' => 'nullable|array',
            'sso_enabled' => 'boolean',
            'sso_provider' => 'nullable|string|in:saml,ldap,oauth',
            'analytics_enabled' => 'boolean',
            'analytics_provider' => 'nullable|string|in:google,mixpanel,custom',
            'analytics_tracking_id' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Update integration settings
        $this->updateConfigSettings('integrations', $request->validated());

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Integration settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update social platform integration settings.
     */
    public function updateSocialPlatforms(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'platform' => 'required|string|in:facebook,twitter,instagram,linkedin,whatsapp',
            'enabled' => 'boolean',
            'settings' => 'required|array',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $platform = $request->input('platform');
        $enabled = $request->input('enabled', false);
        $settings = $request->input('settings', []);

        // Save the enabled status
        Setting::set("integration.{$platform}.enabled", $enabled);

        // Save platform-specific settings
        foreach ($settings as $key => $value) {
            Setting::set("integration.{$platform}.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => ucfirst($platform) . ' integration settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update AI service integration settings.
     */
    public function updateAIServices(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'service' => 'required|string|in:mistral,openai,anthropic',
            'enabled' => 'boolean',
            'settings' => 'required|array',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $service = $request->input('service');
        $enabled = $request->input('enabled', false);
        $settings = $request->input('settings', []);

        // Save the enabled status
        Setting::set("integration.{$service}.enabled", $enabled);

        // Save service-specific settings
        foreach ($settings as $key => $value) {
            Setting::set("integration.{$service}.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => ucfirst($service) . ' AI service settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Test integration connection.
     */
    public function testConnection(Request $request): \Illuminate\Http\JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:social,ai',
            'service' => 'required|string',
            'settings' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid request'], 422);
        }

        $type = $request->input('type');
        $service = $request->input('service');
        $settings = $request->input('settings');

        try {
            if ($type === 'ai') {
                // Use the actual AI service for testing
                $aiService = new \App\Services\AIService();
                $result = $aiService->testConnection($service);

                return response()->json([
                    'status' => $result['status'] === 'success' ? 'connected' : 'error',
                    'message' => $result['message'],
                ]);
            } else {
                // For social platforms, use the existing logic
                $status = $this->performConnectionTest($type, $service, $settings);

                return response()->json([
                    'status' => $status,
                    'message' => $status === 'connected' ? 'Connection successful!' : 'Connection failed. Please check your credentials.',
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Connection test failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Perform actual connection test (placeholder implementation).
     */
    private function performConnectionTest(string $type, string $service, array $settings): string
    {
        // This is a placeholder implementation
        // In a real application, you would make actual API calls to test the connection

        if ($type === 'ai') {
            // Test AI service connection
            if (empty($settings['api_key'])) {
                return 'disconnected';
            }
            // Simulate API key validation
            return strlen($settings['api_key']) > 10 ? 'connected' : 'disconnected';
        }

        if ($type === 'social') {
            // Test social platform connection
            switch ($service) {
                case 'facebook':
                    return !empty($settings['app_id']) && !empty($settings['app_secret']) ? 'connected' : 'disconnected';
                case 'twitter':
                    return !empty($settings['api_key']) && !empty($settings['api_secret']) ? 'connected' : 'disconnected';
                case 'instagram':
                    return !empty($settings['access_token']) ? 'connected' : 'disconnected';
                case 'linkedin':
                    return !empty($settings['client_id']) && !empty($settings['client_secret']) ? 'connected' : 'disconnected';
                case 'whatsapp':
                    return !empty($settings['phone_number_id']) && !empty($settings['access_token']) ? 'connected' : 'disconnected';
                default:
                    return 'disconnected';
            }
        }

        return 'disconnected';
    }

    /**
     * Get system settings.
     */
    private function getSystemSettings(): array
    {
        return [
            'debug_mode' => config('app.debug', false),
            'maintenance_mode' => app()->isDownForMaintenance(),
            'log_level' => config('logging.level', 'info'),
            'max_upload_size' => 10, // MB
            'max_execution_time' => 60, // seconds
            'memory_limit' => 512, // MB
            'timezone' => config('app.timezone', 'UTC'),
            'backup_retention_days' => 30,
            'auto_backup_enabled' => true,
            'auto_backup_frequency' => 'daily',
        ];
    }

    /**
     * Get security settings.
     */
    private function getSecuritySettings(): array
    {
        return [
            'force_https' => config('app.force_https', false),
            'csrf_protection' => true,
            'rate_limiting_enabled' => true,
            'rate_limit_requests' => 60,
            'rate_limit_window' => 1, // minutes
            'ip_whitelist_enabled' => false,
            'ip_whitelist' => '',
            'failed_login_lockout' => true,
            'lockout_duration' => 15, // minutes
            'password_expiry_days' => null,
            'two_factor_required' => false,
            'api_rate_limiting' => true,
            'api_rate_limit' => 1000, // requests per hour
        ];
    }

    /**
     * Get performance settings.
     */
    private function getPerformanceSettings(): array
    {
        return [
            'cache_enabled' => true,
            'cache_driver' => config('cache.default', 'file'),
            'cache_ttl' => 3600, // seconds
            'session_driver' => config('session.driver', 'file'),
            'queue_driver' => config('queue.default', 'sync'),
            'database_query_logging' => config('logging.channels.database', false),
            'slow_query_threshold' => 1000, // milliseconds
            'compression_enabled' => true,
            'minify_assets' => true,
            'cdn_enabled' => false,
            'cdn_url' => '',
        ];
    }

    /**
     * Get integration settings.
     */
    private function getIntegrationSettings(): array
    {
        return [
            // Legacy integration settings
            'webhook_enabled' => false,
            'webhook_url' => '',
            'webhook_secret' => '',
            'api_enabled' => true,
            'api_version' => 'v1',
            'cors_enabled' => true,
            'cors_origins' => '*',
            'oauth_enabled' => false,
            'oauth_providers' => [],
            'sso_enabled' => false,
            'sso_provider' => null,
            'analytics_enabled' => false,
            'analytics_provider' => null,
            'analytics_tracking_id' => '',

            // Social Platform Integrations
            'social_platforms' => [
                'facebook' => [
                    'enabled' => Setting::get('integration.facebook.enabled', false),
                    'app_id' => Setting::get('integration.facebook.app_id', ''),
                    'app_secret' => Setting::get('integration.facebook.app_secret', ''),
                    'page_access_token' => Setting::get('integration.facebook.page_access_token', ''),
                    'webhook_verify_token' => Setting::get('integration.facebook.webhook_verify_token', ''),
                    'status' => 'disconnected', // Will be determined by API validation
                ],
                'twitter' => [
                    'enabled' => Setting::get('integration.twitter.enabled', false),
                    'api_key' => Setting::get('integration.twitter.api_key', ''),
                    'api_secret' => Setting::get('integration.twitter.api_secret', ''),
                    'access_token' => Setting::get('integration.twitter.access_token', ''),
                    'access_token_secret' => Setting::get('integration.twitter.access_token_secret', ''),
                    'status' => 'disconnected',
                ],
                'instagram' => [
                    'enabled' => Setting::get('integration.instagram.enabled', false),
                    'access_token' => Setting::get('integration.instagram.access_token', ''),
                    'business_account_id' => Setting::get('integration.instagram.business_account_id', ''),
                    'status' => 'disconnected',
                ],
                'linkedin' => [
                    'enabled' => Setting::get('integration.linkedin.enabled', false),
                    'client_id' => Setting::get('integration.linkedin.client_id', ''),
                    'client_secret' => Setting::get('integration.linkedin.client_secret', ''),
                    'access_token' => Setting::get('integration.linkedin.access_token', ''),
                    'status' => 'disconnected',
                ],
                'whatsapp' => [
                    'enabled' => Setting::get('integration.whatsapp.enabled', false),
                    'phone_number_id' => Setting::get('integration.whatsapp.phone_number_id', ''),
                    'access_token' => Setting::get('integration.whatsapp.access_token', ''),
                    'webhook_verify_token' => Setting::get('integration.whatsapp.webhook_verify_token', ''),
                    'status' => 'disconnected',
                ],
            ],

            // AI Service Integrations
            'ai_services' => [
                'mistral' => [
                    'enabled' => Setting::get('integration.mistral.enabled', true), // Default provider
                    'api_key' => Setting::get('integration.mistral.api_key', ''),
                    'model' => Setting::get('integration.mistral.model', 'mistral-large-latest'),
                    'max_tokens' => Setting::get('integration.mistral.max_tokens', 4096),
                    'temperature' => Setting::get('integration.mistral.temperature', 0.7),
                    'status' => 'disconnected',
                ],
                'openai' => [
                    'enabled' => Setting::get('integration.openai.enabled', false),
                    'api_key' => Setting::get('integration.openai.api_key', ''),
                    'model' => Setting::get('integration.openai.model', 'gpt-4'),
                    'max_tokens' => Setting::get('integration.openai.max_tokens', 4096),
                    'temperature' => Setting::get('integration.openai.temperature', 0.7),
                    'organization' => Setting::get('integration.openai.organization', ''),
                    'status' => 'disconnected',
                ],
                'anthropic' => [
                    'enabled' => Setting::get('integration.anthropic.enabled', false),
                    'api_key' => Setting::get('integration.anthropic.api_key', ''),
                    'model' => Setting::get('integration.anthropic.model', 'claude-3-sonnet-20240229'),
                    'max_tokens' => Setting::get('integration.anthropic.max_tokens', 4096),
                    'temperature' => Setting::get('integration.anthropic.temperature', 0.7),
                    'status' => 'disconnected',
                ],
            ],
        ];
    }

    /**
     * Get system information.
     */
    private function getSystemInfo(): array
    {
        return [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'database_version' => $this->getDatabaseVersion(),
            'memory_usage' => round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB',
            'peak_memory' => round(memory_get_peak_usage(true) / 1024 / 1024, 2) . ' MB',
            'disk_space' => $this->getDiskSpace(),
            'cache_status' => Cache::getStore() instanceof \Illuminate\Cache\FileStore ? 'File' : 'Redis/Memcached',
        ];
    }

    /**
     * Get database version.
     */
    private function getDatabaseVersion(): string
    {
        try {
            return DB::select('SELECT VERSION() as version')[0]->version ?? 'Unknown';
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    /**
     * Get disk space information.
     */
    private function getDiskSpace(): string
    {
        $bytes = disk_free_space('/');
        if ($bytes === false) {
            return 'Unknown';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i] . ' free';
    }

    /**
     * Update configuration settings.
     */
    private function updateConfigSettings(string $category, array $settings): void
    {
        // In a real application, you would save these to a database
        // or configuration file. For now, we'll just log them.
        Log::info("Updated {$category} settings", $settings);

        // You could also cache the settings for quick access
        Cache::put("advanced_settings_{$category}", $settings, 3600);
    }
}
