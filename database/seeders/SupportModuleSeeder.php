<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Support\SLA;
use App\Models\Support\TicketCategory;
use App\Models\Support\KnowledgeBaseCategory;
use App\Models\Support\KnowledgeBaseArticle;
use App\Models\Support\FAQ;
use App\Models\Support\Ticket;
use App\Models\User;
use App\Models\Client;

class SupportModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create SLA Policies
        $defaultSLA = SLA::create([
            'name' => 'Standard SLA',
            'description' => 'Standard service level agreement for general support',
            'response_time_hours' => 24,
            'resolution_time_hours' => 72,
            'escalation_time_hours' => 48,
            'business_hours_only' => false,
            'is_active' => true,
            'is_default' => true,
        ]);

        $premiumSLA = SLA::create([
            'name' => 'Premium SLA',
            'description' => 'Premium service level agreement for priority customers',
            'response_time_hours' => 4,
            'resolution_time_hours' => 24,
            'escalation_time_hours' => 12,
            'business_hours_only' => true,
            'is_active' => true,
            'is_default' => false,
        ]);

        // Create Knowledge Base Categories
        $generalCategory = KnowledgeBaseCategory::create([
            'name' => 'General',
            'slug' => 'general',
            'description' => 'General information and guides',
            'icon' => 'info',
            'color' => '#6B7280',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $technicalCategory = KnowledgeBaseCategory::create([
            'name' => 'Technical Support',
            'slug' => 'technical-support',
            'description' => 'Technical guides and troubleshooting',
            'icon' => 'wrench',
            'color' => '#3B82F6',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $billingCategory = KnowledgeBaseCategory::create([
            'name' => 'Billing & Payments',
            'slug' => 'billing-payments',
            'description' => 'Billing and payment related information',
            'icon' => 'credit-card',
            'color' => '#10B981',
            'is_active' => true,
            'sort_order' => 3,
        ]);

        // Create Ticket Categories
        $bugCategory = TicketCategory::create([
            'name' => 'Bug Report',
            'description' => 'Software bugs and issues',
            'color' => '#EF4444',
            'icon' => 'bug',
            'is_active' => true,
            'sort_order' => 1,
            'default_priority' => 'high',
            'default_sla_policy_id' => $premiumSLA->id,
        ]);

        $featureCategory = TicketCategory::create([
            'name' => 'Feature Request',
            'description' => 'New feature requests and enhancements',
            'color' => '#8B5CF6',
            'icon' => 'lightbulb',
            'is_active' => true,
            'sort_order' => 2,
            'default_priority' => 'medium',
            'default_sla_policy_id' => $defaultSLA->id,
        ]);

        $supportCategory = TicketCategory::create([
            'name' => 'General Support',
            'description' => 'General support and questions',
            'color' => '#06B6D4',
            'icon' => 'help-circle',
            'is_active' => true,
            'sort_order' => 3,
            'default_priority' => 'medium',
            'default_sla_policy_id' => $defaultSLA->id,
        ]);

        $billingTicketCategory = TicketCategory::create([
            'name' => 'Billing Issue',
            'description' => 'Billing and payment related issues',
            'color' => '#F59E0B',
            'icon' => 'dollar-sign',
            'is_active' => true,
            'sort_order' => 4,
            'default_priority' => 'high',
            'default_sla_policy_id' => $premiumSLA->id,
        ]);

        // Get admin user for creating content
        $adminUser = User::where('email', 'admin@tekrem.com')->first();

        if ($adminUser) {
            // Create Knowledge Base Articles
            KnowledgeBaseArticle::create([
                'title' => 'Getting Started with TekRem ERP',
                'slug' => 'getting-started-with-tekrem-erp',
                'content' => '<h2>Welcome to TekRem ERP</h2><p>This guide will help you get started with our comprehensive ERP system...</p>',
                'excerpt' => 'Learn the basics of using TekRem ERP system',
                'category_id' => $generalCategory->id,
                'author_id' => $adminUser->id,
                'status' => 'published',
                'is_featured' => true,
                'published_at' => now(),
                'sort_order' => 1,
            ]);

            KnowledgeBaseArticle::create([
                'title' => 'How to Reset Your Password',
                'slug' => 'how-to-reset-your-password',
                'content' => '<h2>Password Reset Process</h2><p>Follow these steps to reset your password...</p>',
                'excerpt' => 'Step-by-step guide to reset your account password',
                'category_id' => $technicalCategory->id,
                'author_id' => $adminUser->id,
                'status' => 'published',
                'is_featured' => false,
                'published_at' => now(),
                'sort_order' => 2,
            ]);

            // Create FAQs
            FAQ::create([
                'question' => 'How do I create a new support ticket?',
                'answer' => 'To create a new support ticket, navigate to the Support section and click on "Create Ticket". Fill in the required information and submit.',
                'category_id' => $generalCategory->id,
                'author_id' => $adminUser->id,
                'is_published' => true,
                'is_featured' => true,
                'sort_order' => 1,
            ]);

            FAQ::create([
                'question' => 'What are the different priority levels?',
                'answer' => 'We have four priority levels: Low (non-urgent), Medium (standard), High (important), and Urgent (critical issues requiring immediate attention).',
                'category_id' => $generalCategory->id,
                'author_id' => $adminUser->id,
                'is_published' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ]);

            // Create sample tickets
            $client = Client::first();

            if ($client) {
                Ticket::create([
                    'title' => 'Unable to access dashboard',
                    'description' => 'I am unable to access my dashboard after the recent update. Getting a 500 error.',
                    'status' => 'open',
                    'priority' => 'high',
                    'category_id' => $bugCategory->id,
                    'created_by' => $adminUser->id,
                    'requester_type' => 'App\\Models\\Client',
                    'requester_id' => $client->id,
                    'sla_policy_id' => $premiumSLA->id,
                    'due_date' => now()->addHours(24),
                ]);

                Ticket::create([
                    'title' => 'Request for new reporting feature',
                    'description' => 'We would like to request a new reporting feature that allows us to export data in Excel format.',
                    'status' => 'open',
                    'priority' => 'medium',
                    'category_id' => $featureCategory->id,
                    'created_by' => $adminUser->id,
                    'requester_type' => 'App\\Models\\Client',
                    'requester_id' => $client->id,
                    'sla_policy_id' => $defaultSLA->id,
                    'due_date' => now()->addHours(72),
                ]);
            }
        }
    }
}
