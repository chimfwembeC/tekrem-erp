<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SetupController extends Controller
{
    /**
     * Display the Support module setup page.
     */
    public function index(): Response
    {
        $this->authorize('manage-support-settings');

        return Inertia::render('Support/Setup/Index', [
            'ticketSettings' => $this->getTicketSettings(),
            'slaSettings' => $this->getSLASettings(),
            'knowledgeBaseSettings' => $this->getKnowledgeBaseSettings(),
            'chatbotSettings' => $this->getChatbotSettings(),
            'automationSettings' => $this->getAutomationSettings(),
            'notificationSettings' => $this->getNotificationSettings(),
        ]);
    }

    /**
     * Update ticket settings.
     */
    public function updateTickets(Request $request)
    {
        $this->authorize('manage-support-settings');

        $validated = $request->validate([
            'ticket_id_format' => 'required|string|max:50',
            'ticket_prefix' => 'nullable|string|max:10',
            'auto_assign_tickets' => 'boolean',
            'assignment_method' => 'required|in:round_robin,manual,skill_based,workload_based',
            'enable_ticket_priorities' => 'boolean',
            'enable_ticket_categories' => 'boolean',
            'enable_ticket_tags' => 'boolean',
            'enable_customer_portal' => 'boolean',
            'allow_guest_tickets' => 'boolean',
            'require_registration' => 'boolean',
            'enable_ticket_merging' => 'boolean',
            'enable_ticket_escalation' => 'boolean',
            'default_ticket_status' => 'required|string|max:50',
            'default_priority' => 'required|string|max:20',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("support.tickets.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Ticket settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update SLA settings.
     */
    public function updateSLA(Request $request)
    {
        $this->authorize('manage-support-settings');

        $validated = $request->validate([
            'enable_sla' => 'boolean',
            'enable_sla_escalation' => 'boolean',
            'enable_sla_notifications' => 'boolean',
            'sla_warning_threshold' => 'nullable|integer|min:1|max:100',
            'business_hours_enabled' => 'boolean',
            'business_start_time' => 'nullable|string',
            'business_end_time' => 'nullable|string',
            'business_days' => 'nullable|array',
            'exclude_weekends' => 'boolean',
            'exclude_holidays' => 'boolean',
            'auto_pause_sla' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("support.sla.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'SLA settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update knowledge base settings.
     */
    public function updateKnowledgeBase(Request $request)
    {
        $this->authorize('manage-support-settings');

        $validated = $request->validate([
            'enable_knowledge_base' => 'boolean',
            'enable_public_kb' => 'boolean',
            'enable_article_rating' => 'boolean',
            'enable_article_comments' => 'boolean',
            'enable_article_search' => 'boolean',
            'enable_article_suggestions' => 'boolean',
            'auto_suggest_articles' => 'boolean',
            'enable_article_analytics' => 'boolean',
            'require_approval' => 'boolean',
            'enable_versioning' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("support.knowledge_base.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Knowledge base settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update chatbot settings.
     */
    public function updateChatbot(Request $request)
    {
        $this->authorize('manage-support-settings');

        $validated = $request->validate([
            'enable_chatbot' => 'boolean',
            'enable_ai_responses' => 'boolean',
            'enable_human_handoff' => 'boolean',
            'auto_handoff_threshold' => 'nullable|integer|min:1|max:10',
            'enable_sentiment_analysis' => 'boolean',
            'enable_conversation_logging' => 'boolean',
            'chatbot_greeting' => 'nullable|string|max:500',
            'handoff_message' => 'nullable|string|max:500',
            'enable_proactive_chat' => 'boolean',
            'proactive_delay_seconds' => 'nullable|integer|min:5|max:300',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("support.chatbot.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Chatbot settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update automation settings.
     */
    public function updateAutomation(Request $request)
    {
        $this->authorize('manage-support-settings');

        $validated = $request->validate([
            'enable_auto_responses' => 'boolean',
            'enable_workflow_automation' => 'boolean',
            'enable_ticket_routing' => 'boolean',
            'enable_auto_categorization' => 'boolean',
            'enable_auto_tagging' => 'boolean',
            'enable_auto_escalation' => 'boolean',
            'enable_auto_closure' => 'boolean',
            'auto_closure_days' => 'nullable|integer|min:1|max:365',
            'enable_satisfaction_surveys' => 'boolean',
            'survey_delay_hours' => 'nullable|integer|min:1|max:168',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("support.automation.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Automation settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update notification settings.
     */
    public function updateNotifications(Request $request)
    {
        $this->authorize('manage-support-settings');

        $validated = $request->validate([
            'enable_email_notifications' => 'boolean',
            'enable_sms_notifications' => 'boolean',
            'enable_push_notifications' => 'boolean',
            'notify_on_new_ticket' => 'boolean',
            'notify_on_status_change' => 'boolean',
            'notify_on_assignment' => 'boolean',
            'notify_on_escalation' => 'boolean',
            'notify_customer_updates' => 'boolean',
            'notify_agent_updates' => 'boolean',
            'notification_frequency' => 'required|in:immediate,hourly,daily',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("support.notifications.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Notification settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Get ticket settings.
     */
    private function getTicketSettings(): array
    {
        return [
            'ticket_id_format' => Setting::get('support.tickets.ticket_id_format', 'TKT-{YYYY}-{####}'),
            'ticket_prefix' => Setting::get('support.tickets.ticket_prefix', 'TKT'),
            'auto_assign_tickets' => Setting::get('support.tickets.auto_assign_tickets', true),
            'assignment_method' => Setting::get('support.tickets.assignment_method', 'round_robin'),
            'enable_ticket_priorities' => Setting::get('support.tickets.enable_ticket_priorities', true),
            'enable_ticket_categories' => Setting::get('support.tickets.enable_ticket_categories', true),
            'enable_ticket_tags' => Setting::get('support.tickets.enable_ticket_tags', true),
            'enable_customer_portal' => Setting::get('support.tickets.enable_customer_portal', true),
            'allow_guest_tickets' => Setting::get('support.tickets.allow_guest_tickets', true),
            'require_registration' => Setting::get('support.tickets.require_registration', false),
            'enable_ticket_merging' => Setting::get('support.tickets.enable_ticket_merging', true),
            'enable_ticket_escalation' => Setting::get('support.tickets.enable_ticket_escalation', true),
            'default_ticket_status' => Setting::get('support.tickets.default_ticket_status', 'open'),
            'default_priority' => Setting::get('support.tickets.default_priority', 'medium'),
        ];
    }

    /**
     * Get SLA settings.
     */
    private function getSLASettings(): array
    {
        return [
            'enable_sla' => Setting::get('support.sla.enable_sla', true),
            'enable_sla_escalation' => Setting::get('support.sla.enable_sla_escalation', true),
            'enable_sla_notifications' => Setting::get('support.sla.enable_sla_notifications', true),
            'sla_warning_threshold' => Setting::get('support.sla.sla_warning_threshold', 80),
            'business_hours_enabled' => Setting::get('support.sla.business_hours_enabled', true),
            'business_start_time' => Setting::get('support.sla.business_start_time', '09:00'),
            'business_end_time' => Setting::get('support.sla.business_end_time', '17:00'),
            'business_days' => Setting::get('support.sla.business_days', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
            'exclude_weekends' => Setting::get('support.sla.exclude_weekends', true),
            'exclude_holidays' => Setting::get('support.sla.exclude_holidays', true),
            'auto_pause_sla' => Setting::get('support.sla.auto_pause_sla', true),
        ];
    }

    /**
     * Get knowledge base settings.
     */
    private function getKnowledgeBaseSettings(): array
    {
        return [
            'enable_knowledge_base' => Setting::get('support.knowledge_base.enable_knowledge_base', true),
            'enable_public_kb' => Setting::get('support.knowledge_base.enable_public_kb', true),
            'enable_article_rating' => Setting::get('support.knowledge_base.enable_article_rating', true),
            'enable_article_comments' => Setting::get('support.knowledge_base.enable_article_comments', false),
            'enable_article_search' => Setting::get('support.knowledge_base.enable_article_search', true),
            'enable_article_suggestions' => Setting::get('support.knowledge_base.enable_article_suggestions', true),
            'auto_suggest_articles' => Setting::get('support.knowledge_base.auto_suggest_articles', true),
            'enable_article_analytics' => Setting::get('support.knowledge_base.enable_article_analytics', true),
            'require_approval' => Setting::get('support.knowledge_base.require_approval', true),
            'enable_versioning' => Setting::get('support.knowledge_base.enable_versioning', true),
        ];
    }

    /**
     * Get chatbot settings.
     */
    private function getChatbotSettings(): array
    {
        return [
            'enable_chatbot' => Setting::get('support.chatbot.enable_chatbot', true),
            'enable_ai_responses' => Setting::get('support.chatbot.enable_ai_responses', true),
            'enable_human_handoff' => Setting::get('support.chatbot.enable_human_handoff', true),
            'auto_handoff_threshold' => Setting::get('support.chatbot.auto_handoff_threshold', 3),
            'enable_sentiment_analysis' => Setting::get('support.chatbot.enable_sentiment_analysis', true),
            'enable_conversation_logging' => Setting::get('support.chatbot.enable_conversation_logging', true),
            'chatbot_greeting' => Setting::get('support.chatbot.chatbot_greeting', 'Hello! How can I help you today?'),
            'handoff_message' => Setting::get('support.chatbot.handoff_message', 'Let me connect you with a human agent.'),
            'enable_proactive_chat' => Setting::get('support.chatbot.enable_proactive_chat', false),
            'proactive_delay_seconds' => Setting::get('support.chatbot.proactive_delay_seconds', 30),
        ];
    }

    /**
     * Get automation settings.
     */
    private function getAutomationSettings(): array
    {
        return [
            'enable_auto_responses' => Setting::get('support.automation.enable_auto_responses', true),
            'enable_workflow_automation' => Setting::get('support.automation.enable_workflow_automation', true),
            'enable_ticket_routing' => Setting::get('support.automation.enable_ticket_routing', true),
            'enable_auto_categorization' => Setting::get('support.automation.enable_auto_categorization', true),
            'enable_auto_tagging' => Setting::get('support.automation.enable_auto_tagging', true),
            'enable_auto_escalation' => Setting::get('support.automation.enable_auto_escalation', true),
            'enable_auto_closure' => Setting::get('support.automation.enable_auto_closure', false),
            'auto_closure_days' => Setting::get('support.automation.auto_closure_days', 30),
            'enable_satisfaction_surveys' => Setting::get('support.automation.enable_satisfaction_surveys', true),
            'survey_delay_hours' => Setting::get('support.automation.survey_delay_hours', 24),
        ];
    }

    /**
     * Get notification settings.
     */
    private function getNotificationSettings(): array
    {
        return [
            'enable_email_notifications' => Setting::get('support.notifications.enable_email_notifications', true),
            'enable_sms_notifications' => Setting::get('support.notifications.enable_sms_notifications', false),
            'enable_push_notifications' => Setting::get('support.notifications.enable_push_notifications', true),
            'notify_on_new_ticket' => Setting::get('support.notifications.notify_on_new_ticket', true),
            'notify_on_status_change' => Setting::get('support.notifications.notify_on_status_change', true),
            'notify_on_assignment' => Setting::get('support.notifications.notify_on_assignment', true),
            'notify_on_escalation' => Setting::get('support.notifications.notify_on_escalation', true),
            'notify_customer_updates' => Setting::get('support.notifications.notify_customer_updates', true),
            'notify_agent_updates' => Setting::get('support.notifications.notify_agent_updates', false),
            'notification_frequency' => Setting::get('support.notifications.notification_frequency', 'immediate'),
        ];
    }
}
