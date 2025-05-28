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
        Route::get('clients/{client}/health-analysis', [\App\Http\Controllers\CRM\ClientController::class, 'healthAnalysis'])->name('clients.health-analysis');

        // Leads
        Route::resource('leads', \App\Http\Controllers\CRM\LeadController::class);
        Route::post('leads/{lead}/convert', [\App\Http\Controllers\CRM\LeadController::class, 'convertToClient'])->name('leads.convert');
        Route::post('leads/ai-insights', [\App\Http\Controllers\CRM\LeadController::class, 'aiInsights'])->name('leads.ai-insights');
        Route::post('leads/generate-email', [\App\Http\Controllers\CRM\LeadController::class, 'generateEmail'])->name('leads.generate-email');
        Route::get('leads/{lead}/follow-up-recommendations', [\App\Http\Controllers\CRM\LeadController::class, 'followUpRecommendations'])->name('leads.follow-up-recommendations');
        Route::get('leads/{lead}/conversion-prediction', [\App\Http\Controllers\CRM\LeadController::class, 'conversionPrediction'])->name('leads.conversion-prediction');

        // Communications
        Route::resource('communications', \App\Http\Controllers\CRM\CommunicationController::class);
        Route::post('communications/analyze-sentiment', [\App\Http\Controllers\CRM\CommunicationController::class, 'analyzeSentiment'])->name('communications.analyze-sentiment');
        Route::post('communications/generate-email-template', [\App\Http\Controllers\CRM\CommunicationController::class, 'generateEmailTemplate'])->name('communications.generate-email-template');

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

    // Finance routes
    Route::prefix('finance')->name('finance.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Finance\DashboardController::class, 'index'])->name('dashboard');

        // Accounts
        Route::resource('accounts', \App\Http\Controllers\Finance\AccountController::class);

        // Transactions
        Route::resource('transactions', \App\Http\Controllers\Finance\TransactionController::class);
        Route::post('transactions/ai-suggestions', [\App\Http\Controllers\Finance\TransactionController::class, 'aiSuggestions'])->name('transactions.ai-suggestions');

        // Invoices
        Route::resource('invoices', \App\Http\Controllers\Finance\InvoiceController::class);
        Route::post('invoices/{invoice}/send', [\App\Http\Controllers\Finance\InvoiceController::class, 'send'])->name('invoices.send');
        Route::get('invoices/{invoice}/pdf', [\App\Http\Controllers\Finance\InvoiceController::class, 'pdf'])->name('invoices.pdf');
        Route::post('invoices/generate-items', [\App\Http\Controllers\Finance\InvoiceController::class, 'generateItems'])->name('invoices.generate-items');

        // Payments
        Route::resource('payments', \App\Http\Controllers\Finance\PaymentController::class);

        // Quotations
        Route::resource('quotations', \App\Http\Controllers\Finance\QuotationController::class);
        Route::post('quotations/{quotation}/send', [\App\Http\Controllers\Finance\QuotationController::class, 'send'])->name('quotations.send');
        Route::post('quotations/{quotation}/accept', [\App\Http\Controllers\Finance\QuotationController::class, 'accept'])->name('quotations.accept');
        Route::post('quotations/{quotation}/reject', [\App\Http\Controllers\Finance\QuotationController::class, 'reject'])->name('quotations.reject');
        Route::post('quotations/{quotation}/convert-to-invoice', [\App\Http\Controllers\Finance\QuotationController::class, 'convertToInvoice'])->name('quotations.convert-to-invoice');
        Route::get('quotations/{quotation}/pdf', [\App\Http\Controllers\Finance\QuotationController::class, 'pdf'])->name('quotations.pdf');

        // Analytics
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('dashboard', [\App\Http\Controllers\Finance\AnalyticsController::class, 'dashboard'])->name('dashboard');
            Route::get('quotations', [\App\Http\Controllers\Finance\AnalyticsController::class, 'quotations'])->name('quotations');
            Route::get('invoices', [\App\Http\Controllers\Finance\AnalyticsController::class, 'invoices'])->name('invoices');
            Route::get('revenue', [\App\Http\Controllers\Finance\AnalyticsController::class, 'revenue'])->name('revenue');
            Route::get('export', [\App\Http\Controllers\Finance\AnalyticsController::class, 'export'])->name('export');
        });

        // Templates (Commented out - Controller not implemented yet)
        // Route::resource('templates', \App\Http\Controllers\Finance\TemplateController::class);
        // Route::post('templates/{template}/duplicate', [\App\Http\Controllers\Finance\TemplateController::class, 'duplicate'])->name('templates.duplicate');
        // Route::post('templates/{template}/set-default', [\App\Http\Controllers\Finance\TemplateController::class, 'setDefault'])->name('templates.set-default');

        // Email Management (Commented out - Controller not implemented yet)
        // Route::prefix('emails')->name('emails.')->group(function () {
        //     Route::post('quotations/{quotation}/send', [\App\Http\Controllers\Finance\EmailController::class, 'sendQuotation'])->name('quotations.send');
        //     Route::post('quotations/{quotation}/reminder', [\App\Http\Controllers\Finance\EmailController::class, 'sendQuotationReminder'])->name('quotations.reminder');
        //     Route::post('invoices/{invoice}/send', [\App\Http\Controllers\Finance\EmailController::class, 'sendInvoice'])->name('invoices.send');
        //     Route::post('invoices/{invoice}/followup', [\App\Http\Controllers\Finance\EmailController::class, 'sendInvoiceFollowUp'])->name('invoices.followup');
        //     Route::get('preview/{type}/{id}', [\App\Http\Controllers\Finance\EmailController::class, 'preview'])->name('preview');
        // });

        // Approval Workflows (Commented out - Controllers not implemented yet)
        // Route::prefix('approvals')->name('approvals.')->group(function () {
        //     Route::resource('workflows', \App\Http\Controllers\Finance\ApprovalWorkflowController::class);
        //     Route::resource('requests', \App\Http\Controllers\Finance\ApprovalRequestController::class)->only(['index', 'show']);
        //     Route::post('requests/{request}/approve', [\App\Http\Controllers\Finance\ApprovalRequestController::class, 'approve'])->name('requests.approve');
        //     Route::post('requests/{request}/reject', [\App\Http\Controllers\Finance\ApprovalRequestController::class, 'reject'])->name('requests.reject');
        //     Route::post('requests/{request}/cancel', [\App\Http\Controllers\Finance\ApprovalRequestController::class, 'cancel'])->name('requests.cancel');
        // });

        // Expenses
        Route::resource('expenses', \App\Http\Controllers\Finance\ExpenseController::class);
        Route::post('expenses/{expense}/approve', [\App\Http\Controllers\Finance\ExpenseController::class, 'approve'])->name('expenses.approve');
        Route::post('expenses/{expense}/reject', [\App\Http\Controllers\Finance\ExpenseController::class, 'reject'])->name('expenses.reject');
        Route::post('expenses/process-receipt', [\App\Http\Controllers\Finance\ExpenseController::class, 'processReceipt'])->name('expenses.process-receipt');

        // Budgets
        Route::resource('budgets', \App\Http\Controllers\Finance\BudgetController::class);

        // Categories
        Route::resource('categories', \App\Http\Controllers\Finance\CategoryController::class);

        // Reports
        Route::resource('reports', \App\Http\Controllers\Finance\ReportController::class);
        Route::get('reports/{report}/download', [\App\Http\Controllers\Finance\ReportController::class, 'download'])->name('reports.download');
    });

    // Support routes
    Route::prefix('support')->name('support.')->group(function () {
        // Dashboard
        Route::get('/', [\App\Http\Controllers\Support\DashboardController::class, 'index'])->name('dashboard');

        // Tickets
        Route::resource('tickets', \App\Http\Controllers\Support\TicketController::class);
        Route::post('tickets/{ticket}/assign', [\App\Http\Controllers\Support\TicketController::class, 'assign'])->name('tickets.assign');
        Route::post('tickets/{ticket}/escalate', [\App\Http\Controllers\Support\TicketController::class, 'escalate'])->name('tickets.escalate');
        Route::post('tickets/{ticket}/close', [\App\Http\Controllers\Support\TicketController::class, 'close'])->name('tickets.close');
        Route::post('tickets/{ticket}/reopen', [\App\Http\Controllers\Support\TicketController::class, 'reopen'])->name('tickets.reopen');
        Route::post('tickets/{ticket}/comments', [\App\Http\Controllers\Support\TicketController::class, 'addComment'])->name('tickets.comments.store');
        Route::post('tickets/ai-suggestions', [\App\Http\Controllers\Support\TicketController::class, 'aiSuggestions'])->name('tickets.ai-suggestions');

        // Knowledge Base
        Route::resource('knowledge-base', \App\Http\Controllers\Support\KnowledgeBaseController::class);
        Route::post('knowledge-base/{article}/publish', [\App\Http\Controllers\Support\KnowledgeBaseController::class, 'publish'])->name('knowledge-base.publish');
        Route::post('knowledge-base/{article}/unpublish', [\App\Http\Controllers\Support\KnowledgeBaseController::class, 'unpublish'])->name('knowledge-base.unpublish');
        Route::post('knowledge-base/{article}/helpful', [\App\Http\Controllers\Support\KnowledgeBaseController::class, 'markHelpful'])->name('knowledge-base.helpful');
        Route::post('knowledge-base/{article}/not-helpful', [\App\Http\Controllers\Support\KnowledgeBaseController::class, 'markNotHelpful'])->name('knowledge-base.not-helpful');

        // FAQ
        Route::resource('faq', \App\Http\Controllers\Support\FAQController::class);
        Route::post('faq/{faq}/publish', [\App\Http\Controllers\Support\FAQController::class, 'publish'])->name('faq.publish');
        Route::post('faq/{faq}/helpful', [\App\Http\Controllers\Support\FAQController::class, 'markHelpful'])->name('faq.helpful');
        Route::post('faq/{faq}/not-helpful', [\App\Http\Controllers\Support\FAQController::class, 'markNotHelpful'])->name('faq.not-helpful');

        // Categories
        Route::resource('categories', \App\Http\Controllers\Support\CategoryController::class);

        // Analytics
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Support\AnalyticsController::class, 'index'])->name('dashboard');
            Route::get('/reports', [\App\Http\Controllers\Support\AnalyticsController::class, 'reports'])->name('reports');
            Route::post('/export', [\App\Http\Controllers\Support\AnalyticsController::class, 'export'])->name('export');
        });

        // SLA Management (Admin only)
        Route::middleware(['role:admin'])->prefix('sla')->name('sla.')->group(function () {
            Route::resource('/', \App\Http\Controllers\Support\SLAController::class)->parameters(['' => 'sla']);
            Route::post('{sla}/activate', [\App\Http\Controllers\Support\SLAController::class, 'activate'])->name('activate');
        });

        // Automation Rules (Admin only)
        Route::middleware(['role:admin'])->prefix('automation')->name('automation.')->group(function () {
            Route::resource('/', \App\Http\Controllers\Support\AutomationController::class)->parameters(['' => 'automation']);
            Route::post('{automation}/toggle', [\App\Http\Controllers\Support\AutomationController::class, 'toggle'])->name('toggle');
            Route::post('{automation}/test', [\App\Http\Controllers\Support\AutomationController::class, 'test'])->name('test');
            Route::post('{automation}/duplicate', [\App\Http\Controllers\Support\AutomationController::class, 'duplicate'])->name('duplicate');
            Route::get('{automation}/logs', [\App\Http\Controllers\Support\AutomationController::class, 'logs'])->name('logs');
            Route::get('export', [\App\Http\Controllers\Support\AutomationController::class, 'export'])->name('export');
            Route::post('import', [\App\Http\Controllers\Support\AutomationController::class, 'import'])->name('import');
        });

        // AI Analysis Routes
        Route::prefix('ai')->name('ai.')->group(function () {
            Route::get('dashboard', [\App\Http\Controllers\Support\AIAnalysisController::class, 'getInsightsDashboard'])->name('dashboard');
            Route::get('tickets/{ticket}/suggestions', [\App\Http\Controllers\Support\AIAnalysisController::class, 'getTicketSuggestions'])->name('tickets.suggestions');
            Route::post('tickets/{ticket}/categorize', [\App\Http\Controllers\Support\AIAnalysisController::class, 'categorizeTicket'])->name('tickets.categorize');
            Route::post('tickets/{ticket}/priority', [\App\Http\Controllers\Support\AIAnalysisController::class, 'determinePriority'])->name('tickets.priority');
            Route::post('tickets/{ticket}/auto-response', [\App\Http\Controllers\Support\AIAnalysisController::class, 'generateAutoResponse'])->name('tickets.auto-response');
            Route::post('tickets/{ticket}/sentiment', [\App\Http\Controllers\Support\AIAnalysisController::class, 'analyzeSentiment'])->name('tickets.sentiment');
            Route::post('tickets/{ticket}/resolution-time', [\App\Http\Controllers\Support\AIAnalysisController::class, 'predictResolutionTime'])->name('tickets.resolution-time');
            Route::get('tickets/{ticket}/escalation', [\App\Http\Controllers\Support\AIAnalysisController::class, 'getEscalationRecommendations'])->name('tickets.escalation');
            Route::post('bulk-analyze', [\App\Http\Controllers\Support\AIAnalysisController::class, 'bulkAnalyze'])->name('bulk-analyze');
            Route::post('articles/suggestions', [\App\Http\Controllers\Support\AIAnalysisController::class, 'generateArticleSuggestions'])->name('articles.suggestions');
            Route::post('articles/{article}/improve', [\App\Http\Controllers\Support\AIAnalysisController::class, 'improveArticleContent'])->name('articles.improve');
            Route::post('faq/generate', [\App\Http\Controllers\Support\AIAnalysisController::class, 'generateFAQFromTickets'])->name('faq.generate');
            Route::post('search', [\App\Http\Controllers\Support\AIAnalysisController::class, 'smartSearch'])->name('search');
            Route::get('test', [\App\Http\Controllers\Support\AIAnalysisController::class, 'testAIService'])->name('test');
        });

        // AI Chatbot Routes
        Route::prefix('chatbot')->name('chatbot.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Support\ChatbotController::class, 'index'])->name('support.chatbot.index');
            Route::post('chat', [\App\Http\Controllers\Support\ChatbotController::class, 'chat'])->name('chat');
            Route::get('conversation', [\App\Http\Controllers\Support\ChatbotController::class, 'getConversation'])->name('conversation');
            Route::post('create-ticket', [\App\Http\Controllers\Support\ChatbotController::class, 'createTicketFromChat'])->name('create-ticket');
            Route::get('suggestions', [\App\Http\Controllers\Support\ChatbotController::class, 'getSuggestions'])->name('suggestions');
            Route::post('rate', [\App\Http\Controllers\Support\ChatbotController::class, 'rateResponse'])->name('rate');
            Route::post('escalate', [\App\Http\Controllers\Support\ChatbotController::class, 'escalateToHuman'])->name('escalate');
        });
    });

    // AI Module Routes
    Route::prefix('ai')->name('ai.')->middleware(['auth', 'verified', 'role:admin|staff'])->group(function () {
        // Dashboard
        Route::get('dashboard', [\App\Http\Controllers\AI\DashboardController::class, 'index'])->name('dashboard');
        Route::get('dashboard/service-status', [\App\Http\Controllers\AI\DashboardController::class, 'serviceStatus'])->name('dashboard.service-status');
        Route::get('dashboard/analytics', [\App\Http\Controllers\AI\DashboardController::class, 'analytics'])->name('dashboard.analytics');
        Route::get('dashboard/quick-stats', [\App\Http\Controllers\AI\DashboardController::class, 'quickStats'])->name('dashboard.quick-stats');
        Route::post('dashboard/test-connection', [\App\Http\Controllers\AI\DashboardController::class, 'testConnection'])->name('dashboard.test-connection');

        // Services Management
        Route::resource('services', \App\Http\Controllers\AI\ServiceController::class);
        Route::post('services/{service}/test-connection', [\App\Http\Controllers\AI\ServiceController::class, 'testConnection'])->name('services.test-connection');
        Route::post('services/{service}/set-default', [\App\Http\Controllers\AI\ServiceController::class, 'setDefault'])->name('services.set-default');
        Route::post('services/{service}/toggle-status', [\App\Http\Controllers\AI\ServiceController::class, 'toggleStatus'])->name('services.toggle-status');

        // Models Management
        Route::resource('models', \App\Http\Controllers\AI\ModelController::class);
        Route::post('models/{model}/set-default', [\App\Http\Controllers\AI\ModelController::class, 'setDefault'])->name('models.set-default');
        Route::post('models/{model}/toggle-status', [\App\Http\Controllers\AI\ModelController::class, 'toggleStatus'])->name('models.toggle-status');

        // Conversations Management
        Route::resource('conversations', \App\Http\Controllers\AI\ConversationController::class);
        Route::post('conversations/{conversation}/archive', [\App\Http\Controllers\AI\ConversationController::class, 'archive'])->name('conversations.archive');
        Route::post('conversations/{conversation}/unarchive', [\App\Http\Controllers\AI\ConversationController::class, 'unarchive'])->name('conversations.unarchive');
        Route::post('conversations/{conversation}/messages', [\App\Http\Controllers\AI\ConversationController::class, 'addMessage'])->name('conversations.messages.store');
        Route::get('conversations/export', [\App\Http\Controllers\AI\ConversationController::class, 'export'])->name('conversations.export');
        Route::get('conversations/statistics', [\App\Http\Controllers\AI\ConversationController::class, 'statistics'])->name('conversations.statistics');

        // Prompt Templates Management
        Route::resource('prompt-templates', \App\Http\Controllers\AI\PromptTemplateController::class);
        Route::post('prompt-templates/{template}/duplicate', [\App\Http\Controllers\AI\PromptTemplateController::class, 'duplicate'])->name('prompt-templates.duplicate');
        Route::post('prompt-templates/{template}/rate', [\App\Http\Controllers\AI\PromptTemplateController::class, 'rate'])->name('prompt-templates.rate');
        Route::post('prompt-templates/{template}/render', [\App\Http\Controllers\AI\PromptTemplateController::class, 'render'])->name('prompt-templates.render');

        // Analytics
        Route::get('analytics/dashboard', [\App\Http\Controllers\AI\AnalyticsController::class, 'dashboard'])->name('analytics.dashboard');
        Route::get('analytics/usage', [\App\Http\Controllers\AI\AnalyticsController::class, 'usage'])->name('analytics.usage');
        Route::get('analytics/costs', [\App\Http\Controllers\AI\AnalyticsController::class, 'costs'])->name('analytics.costs');
        Route::get('analytics/performance', [\App\Http\Controllers\AI\AnalyticsController::class, 'performance'])->name('analytics.performance');
        Route::get('analytics/export', [\App\Http\Controllers\AI\AnalyticsController::class, 'export'])->name('analytics.export');
    });

    // CMS Routes
    Route::prefix('cms')->name('cms.')->middleware(['auth', 'verified'])->group(function () {
        // Pages Management
        Route::resource('pages', \App\Http\Controllers\CMS\PageController::class);
        Route::post('pages/{page}/publish', [\App\Http\Controllers\CMS\PageController::class, 'publish'])->name('pages.publish');
        Route::post('pages/{page}/unpublish', [\App\Http\Controllers\CMS\PageController::class, 'unpublish'])->name('pages.unpublish');
        Route::post('pages/{page}/schedule', [\App\Http\Controllers\CMS\PageController::class, 'schedule'])->name('pages.schedule');
        Route::post('pages/{page}/duplicate', [\App\Http\Controllers\CMS\PageController::class, 'duplicate'])->name('pages.duplicate');
        Route::post('pages/{page}/restore-revision', [\App\Http\Controllers\CMS\PageController::class, 'restoreRevision'])->name('pages.restore-revision');
        Route::get('pages/{page}/preview', [\App\Http\Controllers\CMS\PageController::class, 'preview'])->name('pages.preview');
        Route::get('pages/{page}/seo-analysis', [\App\Http\Controllers\CMS\PageController::class, 'seoAnalysis'])->name('pages.seo-analysis');
        Route::get('pages/search', [\App\Http\Controllers\CMS\PageController::class, 'search'])->name('pages.search');
        Route::post('pages/bulk-action', [\App\Http\Controllers\CMS\PageController::class, 'bulkAction'])->name('pages.bulk-action');

        // Media Management
        Route::get('media', [\App\Http\Controllers\CMS\MediaController::class, 'index'])->name('media.index');
        Route::post('media/upload', [\App\Http\Controllers\CMS\MediaController::class, 'upload'])->name('media.upload');
        Route::get('media/search', [\App\Http\Controllers\CMS\MediaController::class, 'search'])->name('media.search');
        Route::get('media/picker', [\App\Http\Controllers\CMS\MediaController::class, 'picker'])->name('media.picker');
        Route::get('media/{media}', [\App\Http\Controllers\CMS\MediaController::class, 'show'])->name('media.show');
        Route::get('media/{media}/download', [\App\Http\Controllers\CMS\MediaController::class, 'download'])->name('media.download');
        Route::put('media/{media}', [\App\Http\Controllers\CMS\MediaController::class, 'update'])->name('media.update');
        Route::delete('media/{media}', [\App\Http\Controllers\CMS\MediaController::class, 'destroy'])->name('media.destroy');
        Route::post('media/bulk-action', [\App\Http\Controllers\CMS\MediaController::class, 'bulkAction'])->name('media.bulk-action');
        Route::post('media/{media}/variants', [\App\Http\Controllers\CMS\MediaController::class, 'generateVariants'])->name('media.variants');
        Route::post('media/cleanup', [\App\Http\Controllers\CMS\MediaController::class, 'cleanup'])->name('media.cleanup');

        // Media Folder Management
        Route::post('media/folders', [\App\Http\Controllers\CMS\MediaController::class, 'createFolder'])->name('media.folders.create');
        Route::put('media/folders/{folder}', [\App\Http\Controllers\CMS\MediaController::class, 'updateFolder'])->name('media.folders.update');
        Route::delete('media/folders/{folder}', [\App\Http\Controllers\CMS\MediaController::class, 'deleteFolder'])->name('media.folders.delete');

        // Templates Management
        Route::resource('templates', \App\Http\Controllers\CMS\TemplateController::class);
        Route::post('templates/{template}/set-default', [\App\Http\Controllers\CMS\TemplateController::class, 'setDefault'])->name('templates.set-default');
        Route::post('templates/{template}/duplicate', [\App\Http\Controllers\CMS\TemplateController::class, 'duplicate'])->name('templates.duplicate');

        // Menus Management
        Route::resource('menus', \App\Http\Controllers\CMS\MenuController::class);
        Route::resource('menus.items', \App\Http\Controllers\CMS\MenuItemController::class)->except(['index', 'show']);
        Route::post('menu-items/{item}/move', [\App\Http\Controllers\CMS\MenuItemController::class, 'move'])->name('menu-items.move');
        Route::post('menu-items/reorder', [\App\Http\Controllers\CMS\MenuItemController::class, 'reorder'])->name('menu-items.reorder');

        // Redirects Management
        Route::resource('redirects', \App\Http\Controllers\CMS\RedirectController::class);
        Route::post('redirects/bulk-action', [\App\Http\Controllers\CMS\RedirectController::class, 'bulkAction'])->name('redirects.bulk-action');
        Route::get('redirects/statistics', [\App\Http\Controllers\CMS\RedirectController::class, 'statistics'])->name('redirects.statistics');

        // CMS Dashboard
        Route::get('dashboard', [\App\Http\Controllers\CMS\DashboardController::class, 'index'])->name('dashboard');
        Route::get('analytics', [\App\Http\Controllers\CMS\AnalyticsController::class, 'index'])->name('analytics');
        Route::get('sitemap', [\App\Http\Controllers\CMS\SitemapController::class, 'index'])->name('sitemap');
        Route::post('sitemap/generate', [\App\Http\Controllers\CMS\SitemapController::class, 'generate'])->name('sitemap.generate');
    });

    // Customer Support Portal
    Route::prefix('customer/support')->name('customer.support.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Customer\SupportController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Customer\SupportController::class, 'create'])->name('create');
        Route::post('/store', [\App\Http\Controllers\Customer\SupportController::class, 'store'])->name('store');

        // Ticket management
        Route::prefix('tickets')->name('tickets.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Customer\SupportController::class, 'index'])->name('index');
            Route::get('{ticket}', [\App\Http\Controllers\Customer\SupportController::class, 'show'])->name('show');
            Route::post('{ticket}/comments', [\App\Http\Controllers\Customer\SupportController::class, 'addComment'])->name('comments.store');
            Route::post('{ticket}/close', [\App\Http\Controllers\Customer\SupportController::class, 'close'])->name('close');
            Route::post('{ticket}/reopen', [\App\Http\Controllers\Customer\SupportController::class, 'reopen'])->name('reopen');
        });

        // Knowledge Base
        Route::prefix('knowledge-base')->name('knowledge-base.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Customer\SupportController::class, 'searchKnowledgeBase'])->name('index');
            Route::get('{article}', [\App\Http\Controllers\Customer\SupportController::class, 'viewArticle'])->name('show');
            Route::post('{article}/helpful', [\App\Http\Controllers\Customer\SupportController::class, 'markArticleHelpful'])->name('helpful');
            Route::post('{article}/not-helpful', [\App\Http\Controllers\Customer\SupportController::class, 'markArticleNotHelpful'])->name('not-helpful');
        });

        // FAQ
        Route::get('/faq', [\App\Http\Controllers\Customer\SupportController::class, 'viewFAQ'])->name('faq');
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
