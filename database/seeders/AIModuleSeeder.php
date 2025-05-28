<?php

namespace Database\Seeders;

use App\Models\AI\Service;
use App\Models\AI\AIModel;
use App\Models\AI\PromptTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class AIModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create AI Services
        $mistralService = Service::create([
            'name' => 'Mistral AI',
            'slug' => 'mistral-ai',
            'provider' => 'mistral',
            'api_key' => null, // To be configured by admin
            'api_url' => 'https://api.mistral.ai/v1',
            'configuration' => [
                'timeout' => 30,
                'retry_attempts' => 3,
            ],
            'is_enabled' => true,
            'is_default' => true,
            'priority' => 1,
            'description' => 'Mistral AI service for advanced language processing',
            'supported_features' => ['chat', 'completion', 'embedding'],
            'cost_per_token' => 0.00002,
            'rate_limit_per_minute' => 100,
            'max_tokens_per_request' => 4000,
        ]);

        $openaiService = Service::create([
            'name' => 'OpenAI',
            'slug' => 'openai',
            'provider' => 'openai',
            'api_key' => null, // To be configured by admin
            'api_url' => 'https://api.openai.com/v1',
            'configuration' => [
                'timeout' => 30,
                'retry_attempts' => 3,
            ],
            'is_enabled' => false,
            'is_default' => false,
            'priority' => 2,
            'description' => 'OpenAI service for GPT models',
            'supported_features' => ['chat', 'completion', 'embedding', 'image', 'audio'],
            'cost_per_token' => 0.00003,
            'rate_limit_per_minute' => 60,
            'max_tokens_per_request' => 4000,
        ]);

        $anthropicService = Service::create([
            'name' => 'Anthropic Claude',
            'slug' => 'anthropic-claude',
            'provider' => 'anthropic',
            'api_key' => null, // To be configured by admin
            'api_url' => 'https://api.anthropic.com/v1',
            'configuration' => [
                'timeout' => 30,
                'retry_attempts' => 3,
            ],
            'is_enabled' => false,
            'is_default' => false,
            'priority' => 3,
            'description' => 'Anthropic Claude for safe and helpful AI assistance',
            'supported_features' => ['chat', 'completion', 'analysis'],
            'cost_per_token' => 0.00008,
            'rate_limit_per_minute' => 50,
            'max_tokens_per_request' => 4000,
        ]);

        // Create AI Models
        AIModel::create([
            'ai_service_id' => $mistralService->id,
            'name' => 'Mistral 7B',
            'slug' => 'mistral-7b',
            'model_identifier' => 'mistral-7b-instruct',
            'type' => 'chat',
            'description' => 'Mistral 7B instruction-tuned model for chat and completion',
            'is_enabled' => true,
            'is_default' => true,
            'capabilities' => ['chat', 'completion', 'instruction-following'],
            'max_tokens' => 4000,
            'temperature' => 0.7,
            'top_p' => 1.0,
            'cost_per_input_token' => 0.00002,
            'cost_per_output_token' => 0.00006,
        ]);

        AIModel::create([
            'ai_service_id' => $mistralService->id,
            'name' => 'Mistral Medium',
            'slug' => 'mistral-medium',
            'model_identifier' => 'mistral-medium',
            'type' => 'chat',
            'description' => 'Mistral Medium model for complex reasoning tasks',
            'is_enabled' => true,
            'is_default' => false,
            'capabilities' => ['chat', 'completion', 'reasoning', 'analysis'],
            'max_tokens' => 4000,
            'temperature' => 0.7,
            'top_p' => 1.0,
            'cost_per_input_token' => 0.0001,
            'cost_per_output_token' => 0.0003,
        ]);

        AIModel::create([
            'ai_service_id' => $openaiService->id,
            'name' => 'GPT-3.5 Turbo',
            'slug' => 'gpt-35-turbo',
            'model_identifier' => 'gpt-3.5-turbo',
            'type' => 'chat',
            'description' => 'OpenAI GPT-3.5 Turbo for fast and efficient conversations',
            'is_enabled' => false,
            'is_default' => false,
            'capabilities' => ['chat', 'completion', 'function-calling'],
            'max_tokens' => 4000,
            'temperature' => 0.7,
            'top_p' => 1.0,
            'cost_per_input_token' => 0.0015,
            'cost_per_output_token' => 0.002,
        ]);

        AIModel::create([
            'ai_service_id' => $anthropicService->id,
            'name' => 'Claude 3 Haiku',
            'slug' => 'claude-3-haiku',
            'model_identifier' => 'claude-3-haiku-20240307',
            'type' => 'chat',
            'description' => 'Anthropic Claude 3 Haiku for fast and efficient tasks',
            'is_enabled' => false,
            'is_default' => false,
            'capabilities' => ['chat', 'completion', 'analysis', 'safety'],
            'max_tokens' => 4000,
            'temperature' => 0.7,
            'top_p' => 1.0,
            'cost_per_input_token' => 0.00025,
            'cost_per_output_token' => 0.00125,
        ]);

        // Get the first admin user for prompt templates
        $adminUser = User::role('admin')->first();

        if ($adminUser) {
            // Create System Prompt Templates
            PromptTemplate::create([
                'user_id' => $adminUser->id,
                'name' => 'CRM Lead Qualification',
                'slug' => 'crm-lead-qualification',
                'category' => 'crm',
                'description' => 'Analyze and qualify leads based on provided information',
                'template' => 'Analyze the following lead information and provide a qualification score and recommendations:

Lead Information:
- Name: {{name}}
- Company: {{company}}
- Position: {{position}}
- Email: {{email}}
- Phone: {{phone}}
- Source: {{source}}
- Notes: {{notes}}

Please provide:
1. Qualification score (1-10)
2. Key strengths
3. Potential concerns
4. Recommended next actions
5. Priority level (High/Medium/Low)',
                'variables' => ['name', 'company', 'position', 'email', 'phone', 'source', 'notes'],
                'example_data' => [
                    'name' => 'John Smith',
                    'company' => 'Tech Corp',
                    'position' => 'CTO',
                    'email' => 'john@techcorp.com',
                    'phone' => '+1234567890',
                    'source' => 'Website',
                    'notes' => 'Interested in AI solutions'
                ],
                'is_public' => true,
                'is_system' => true,
                'tags' => ['crm', 'lead', 'qualification', 'sales'],
            ]);

            PromptTemplate::create([
                'user_id' => $adminUser->id,
                'name' => 'Support Ticket Analysis',
                'slug' => 'support-ticket-analysis',
                'category' => 'support',
                'description' => 'Analyze support tickets for priority, sentiment, and resolution suggestions',
                'template' => 'Analyze the following support ticket and provide insights:

Ticket Information:
- Title: {{title}}
- Description: {{description}}
- Category: {{category}}
- Customer: {{customer}}
- Priority: {{priority}}

Please provide:
1. Sentiment analysis (Positive/Neutral/Negative)
2. Urgency level (Low/Medium/High/Critical)
3. Suggested category (if different)
4. Estimated resolution time
5. Recommended actions
6. Similar issues or knowledge base articles',
                'variables' => ['title', 'description', 'category', 'customer', 'priority'],
                'example_data' => [
                    'title' => 'Login Issues',
                    'description' => 'Cannot access my account after password reset',
                    'category' => 'Authentication',
                    'customer' => 'Jane Doe',
                    'priority' => 'Medium'
                ],
                'is_public' => true,
                'is_system' => true,
                'tags' => ['support', 'ticket', 'analysis', 'customer-service'],
            ]);

            PromptTemplate::create([
                'user_id' => $adminUser->id,
                'name' => 'Financial Transaction Categorization',
                'slug' => 'financial-transaction-categorization',
                'category' => 'finance',
                'description' => 'Categorize and analyze financial transactions',
                'template' => 'Analyze and categorize the following financial transaction:

Transaction Details:
- Description: {{description}}
- Amount: {{amount}}
- Vendor: {{vendor}}
- Date: {{date}}
- Account: {{account}}

Please provide:
1. Suggested category
2. Transaction type (Income/Expense/Transfer)
3. Business purpose classification
4. Tax implications (if applicable)
5. Potential duplicate detection
6. Recommended tags or labels',
                'variables' => ['description', 'amount', 'vendor', 'date', 'account'],
                'example_data' => [
                    'description' => 'Office supplies purchase',
                    'amount' => '150.00',
                    'vendor' => 'Office Depot',
                    'date' => '2024-01-15',
                    'account' => 'Business Checking'
                ],
                'is_public' => true,
                'is_system' => true,
                'tags' => ['finance', 'transaction', 'categorization', 'accounting'],
            ]);

            PromptTemplate::create([
                'user_id' => $adminUser->id,
                'name' => 'Content SEO Optimization',
                'slug' => 'content-seo-optimization',
                'category' => 'cms',
                'description' => 'Analyze and optimize content for SEO',
                'template' => 'Analyze the following content for SEO optimization:

Content Information:
- Title: {{title}}
- Content: {{content}}
- Target Keywords: {{keywords}}
- Meta Description: {{meta_description}}

Please provide:
1. SEO score (1-100)
2. Title optimization suggestions
3. Content structure improvements
4. Keyword density analysis
5. Meta description recommendations
6. Internal linking suggestions
7. Readability assessment',
                'variables' => ['title', 'content', 'keywords', 'meta_description'],
                'example_data' => [
                    'title' => 'AI Solutions for Business',
                    'content' => 'Artificial intelligence is transforming businesses...',
                    'keywords' => 'AI, artificial intelligence, business automation',
                    'meta_description' => 'Learn how AI can transform your business'
                ],
                'is_public' => true,
                'is_system' => true,
                'tags' => ['cms', 'seo', 'content', 'optimization'],
            ]);
        }
    }
}
