<?php

use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\WebsiteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Website Routes
Route::get('/',[WebsiteController::class, 'index'])->name('home');

Route::get('/about', [WebsiteController::class, 'about'])->name('about');

Route::get('/services', [WebsiteController::class, 'services'])->name('services');

// Individual Service Detail Pages
Route::get('/services/web-development', [WebsiteController::class, 'webDevelopment'])->name('services.web-development');
Route::get('/services/mobile-apps', [WebsiteController::class, 'mobileApps'])->name('services.mobile-apps');
Route::get('/services/ai-solutions', [WebsiteController::class, 'aiSolutions'])->name('services.ai-solutions');
Route::get('/services/cloud-services', [WebsiteController::class, 'cloudServices'])->name('services.cloud-services');

Route::get('/portfolio', [WebsiteController::class, 'portfolio'])->name('portfolio');

Route::get('/contact', [WebsiteController::class, 'contact'])->name('contact');

// Guest Chat Routes (no authentication required)
Route::prefix('guest-chat')->name('guest-chat.')->group(function () {
    Route::post('/initialize', [App\Http\Controllers\GuestChatController::class, 'initializeSession'])->name('initialize');
    Route::post('/update-info', [App\Http\Controllers\GuestChatController::class, 'updateGuestInfo'])->name('update-info');
    Route::post('/send', [App\Http\Controllers\GuestChatController::class, 'sendMessage'])->name('send');
    Route::get('/messages', [App\Http\Controllers\GuestChatController::class, 'getMessages'])->name('messages');
});

// AI Service Test Route (for development/testing)
Route::post('/test-ai-service', function(\Illuminate\Http\Request $request) {
    $aiService = new \App\Services\AIService();
    $response = $aiService->generateGuestChatResponse(
        $request->input('message', 'Hello, I need help with web development services.'),
        []
    );
    return response()->json(['response' => $response]);
})->name('test-ai-service');

// Authentication & Dashboard Routes
Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Notification routes
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('mark-as-read');
        Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-as-read');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
    });

    // Profile Notification Preferences Routes
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/notifications', [\App\Http\Controllers\Profile\NotificationPreferenceController::class, 'show'])->name('notifications.show');
        Route::put('/notifications', [\App\Http\Controllers\Profile\NotificationPreferenceController::class, 'update'])->name('notifications.update');
        Route::put('/notifications/reset', [\App\Http\Controllers\Profile\NotificationPreferenceController::class, 'reset'])->name('notifications.reset');
        Route::get('/notifications/api', [\App\Http\Controllers\Profile\NotificationPreferenceController::class, 'getPreferences'])->name('notifications.api');
    });

    // Admin routes
    Route::prefix('admin')->name('admin.')->middleware('role:admin')->group(function () {
        // Settings routes
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingsController::class, 'update'])->name('settings.update');
    });

    // CRM routes
    Route::prefix('crm')->name('crm.')->middleware('role:admin|staff')->group(function () {
        // Dashboard
        Route::get('/', [\App\Http\Controllers\CRM\DashboardController::class, 'index'])->name('dashboard');

        // Clients
        Route::resource('clients', \App\Http\Controllers\CRM\ClientController::class);

        // Leads
        Route::resource('leads', \App\Http\Controllers\CRM\LeadController::class);
        Route::post('leads/{lead}/convert', [\App\Http\Controllers\CRM\LeadController::class, 'convertToClient'])->name('leads.convert');

        // Communications
        Route::resource('communications', \App\Http\Controllers\CRM\CommunicationController::class);

        // TekRem LiveChat
        Route::prefix('livechat')->name('livechat.')->group(function () {
            Route::get('/', [\App\Http\Controllers\CRM\LiveChatController::class, 'index'])->name('index');
            Route::get('/conversations/{conversation}', [\App\Http\Controllers\CRM\LiveChatController::class, 'show'])->name('show');
            Route::post('/conversations', [\App\Http\Controllers\CRM\LiveChatController::class, 'store'])->name('store');
            Route::post('/find-or-create', [\App\Http\Controllers\CRM\LiveChatController::class, 'findOrCreateConversation'])->name('find-or-create');
            Route::post('/conversations/{conversation}/messages', [\App\Http\Controllers\CRM\LiveChatController::class, 'sendMessage'])->name('send-message');
            Route::post('/conversations/{conversation}/mark-as-read', [\App\Http\Controllers\CRM\LiveChatController::class, 'markAsRead'])->name('mark-as-read');
            Route::post('/conversations/{conversation}/typing', [\App\Http\Controllers\CRM\LiveChatController::class, 'typing'])->name('typing');
            Route::post('/conversations/{conversation}/archive', [\App\Http\Controllers\CRM\LiveChatController::class, 'archive'])->name('archive');
            Route::post('/conversations/{conversation}/restore', [\App\Http\Controllers\CRM\LiveChatController::class, 'restore'])->name('restore');

            // Message interactions
            Route::post('/messages/{message}/react', [\App\Http\Controllers\CRM\LiveChatController::class, 'addReaction'])->name('messages.react');
            Route::delete('/messages/{message}/react', [\App\Http\Controllers\CRM\LiveChatController::class, 'removeReaction'])->name('messages.unreact');
            Route::post('/messages/{message}/pin', [\App\Http\Controllers\CRM\LiveChatController::class, 'pinMessage'])->name('messages.pin');
            Route::delete('/messages/{message}/pin', [\App\Http\Controllers\CRM\LiveChatController::class, 'unpinMessage'])->name('messages.unpin');
            Route::post('/messages/reorder-pins', [\App\Http\Controllers\CRM\LiveChatController::class, 'reorderPinnedMessages'])->name('messages.reorder-pins');
            Route::put('/messages/{message}/edit', [\App\Http\Controllers\CRM\LiveChatController::class, 'editMessage'])->name('messages.edit');
            Route::get('/messages/{message}/edit-history', [\App\Http\Controllers\CRM\LiveChatController::class, 'getEditHistory'])->name('messages.edit-history');
            Route::post('/messages/{message}/comments', [\App\Http\Controllers\CRM\LiveChatController::class, 'addComment'])->name('messages.comments.store');
            Route::delete('/comments/{comment}', [\App\Http\Controllers\CRM\LiveChatController::class, 'deleteComment'])->name('comments.destroy');
        });

        // Analytics routes
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('/', [\App\Http\Controllers\CRM\AnalyticsController::class, 'index'])->name('dashboard');
            Route::get('/reports', [\App\Http\Controllers\CRM\AnalyticsController::class, 'reports'])->name('reports');
            Route::post('/export', [\App\Http\Controllers\CRM\AnalyticsController::class, 'export'])->name('export');
            Route::post('/generate-report', [\App\Http\Controllers\CRM\AnalyticsController::class, 'generateReport'])->name('generate-report');
        });

        // AI Conversation Export routes (Admin only)
        Route::prefix('ai-conversations')->name('ai-conversations.')->middleware('role:admin')->group(function () {
            Route::get('/export', function () {
                return \Inertia\Inertia::render('Settings/AIConversationExport');
            })->name('export.index');
            Route::post('/export', [\App\Http\Controllers\CRM\AIConversationExportController::class, 'export'])->name('export');
            Route::get('/statistics', [\App\Http\Controllers\CRM\AIConversationExportController::class, 'statistics'])->name('statistics');
            Route::post('/preview', [\App\Http\Controllers\CRM\AIConversationExportController::class, 'preview'])->name('preview');
        });
    });

    // Settings routes - Admin only
    Route::middleware(['role:admin'])->prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Settings\SettingsController::class, 'index'])->name('index');
        Route::get('/general', [\App\Http\Controllers\Settings\SettingsController::class, 'general'])->name('general');
        Route::put('/general', [\App\Http\Controllers\Settings\SettingsController::class, 'updateGeneral'])->name('general.update');
        Route::get('/users', [\App\Http\Controllers\Settings\SettingsController::class, 'users'])->name('users');
        Route::put('/users', [\App\Http\Controllers\Settings\SettingsController::class, 'updateUsers'])->name('users.update');
        Route::get('/notifications', [\App\Http\Controllers\Settings\SettingsController::class, 'notifications'])->name('notifications');
        Route::put('/notifications', [\App\Http\Controllers\Settings\SettingsController::class, 'updateNotifications'])->name('notifications.update');

        // Advanced Settings
        Route::get('/advanced', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'index'])->name('advanced');
        Route::put('/advanced/system', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'updateSystem'])->name('advanced.system.update');
        Route::put('/advanced/security', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'updateSecurity'])->name('advanced.security.update');
        Route::put('/advanced/performance', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'updatePerformance'])->name('advanced.performance.update');
        Route::put('/advanced/integrations', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'updateIntegrations'])->name('advanced.integrations.update');
        Route::put('/advanced/social-platforms', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'updateSocialPlatforms'])->name('advanced.social-platforms.update');
        Route::put('/advanced/ai-services', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'updateAIServices'])->name('advanced.ai-services.update');
        Route::post('/advanced/test-connection', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'testConnection'])->name('advanced.test-connection');

        // System Maintenance
        Route::post('/maintenance/cache-clear', [\App\Http\Controllers\Settings\MaintenanceController::class, 'clearCache'])->name('maintenance.cache.clear');
        Route::post('/maintenance/logs-clear', [\App\Http\Controllers\Settings\MaintenanceController::class, 'clearLogs'])->name('maintenance.logs.clear');
        Route::post('/maintenance/backup', [\App\Http\Controllers\Settings\MaintenanceController::class, 'createBackup'])->name('maintenance.backup');
        Route::get('/maintenance/system-info', [\App\Http\Controllers\Settings\MaintenanceController::class, 'systemInfo'])->name('maintenance.system-info');
    });
});
