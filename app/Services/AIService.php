<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    /**
     * Get the default AI service configuration.
     */
    public function getDefaultService(): ?array
    {
        // Check for enabled AI services in order of preference
        $services = ['mistral', 'openai', 'anthropic'];

        foreach ($services as $service) {
            if (Setting::get("integration.{$service}.enabled", false)) {
                $config = $this->getServiceConfig($service);
                if (!empty($config['api_key'])) {
                    return array_merge($config, ['service' => $service]);
                }
            }
        }

        return null;
    }

    /**
     * Get configuration for a specific AI service.
     */
    public function getServiceConfig(string $service): array
    {
        return [
            'enabled' => Setting::get("integration.{$service}.enabled", false),
            'api_key' => Setting::get("integration.{$service}.api_key", ''),
            'model' => Setting::get("integration.{$service}.model", $this->getDefaultModel($service)),
            'max_tokens' => Setting::get("integration.{$service}.max_tokens", 4096),
            'temperature' => Setting::get("integration.{$service}.temperature", 0.7),
            'organization' => Setting::get("integration.{$service}.organization", ''), // For OpenAI
        ];
    }

    /**
     * Get default model for a service.
     */
    private function getDefaultModel(string $service): string
    {
        return match($service) {
            'mistral' => 'mistral-large-latest',
            'openai' => 'gpt-4',
            'anthropic' => 'claude-3-sonnet-20240229',
            default => 'mistral-large-latest',
        };
    }

    /**
     * Generate AI response for guest chat.
     */
    public function generateGuestChatResponse(string $guestMessage, array $conversationHistory = []): ?array
    {
        $serviceConfig = $this->getDefaultService();

        if (!$serviceConfig) {
            Log::warning('No AI service configured for guest chat auto-response');
            return null;
        }

        try {
            $response = $this->callAIService(
                $serviceConfig,
                $this->buildGuestChatPrompt($guestMessage, $conversationHistory)
            );

            if ($response) {
                return [
                    'message' => $response,
                    'service' => $serviceConfig['service'],
                    'model' => $serviceConfig['model'],
                ];
            }
        } catch (\Exception $e) {
            Log::error('AI service error for guest chat: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Categorize transaction based on description and vendor.
     */
    public function categorizeTransaction(string $description, ?string $vendor = null, array $existingCategories = []): ?array
    {
        $serviceConfig = $this->getDefaultService();

        if (!$serviceConfig) {
            return null;
        }

        try {
            $prompt = $this->buildTransactionCategorizationPrompt($description, $vendor, $existingCategories);
            $response = $this->callAIService($serviceConfig, $prompt);

            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE && isset($result['category'])) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for transaction categorization: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Enhance transaction description.
     */
    public function enhanceTransactionDescription(string $description, ?string $vendor = null, float $amount = 0): ?string
    {
        $serviceConfig = $this->getDefaultService();

        if (!$serviceConfig) {
            return null;
        }

        try {
            $prompt = $this->buildDescriptionEnhancementPrompt($description, $vendor, $amount);
            $response = $this->callAIService($serviceConfig, $prompt);

            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE && isset($result['enhanced_description'])) {
                    return $result['enhanced_description'];
                }
                // Fallback to raw response if not JSON
                return trim($response, '"');
            }
        } catch (\Exception $e) {
            Log::error('AI service error for description enhancement: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Detect potential duplicate transactions.
     */
    public function detectDuplicateTransactions(array $newTransaction, array $recentTransactions): ?array
    {
        $serviceConfig = $this->getDefaultService();

        if (!$serviceConfig) {
            return null;
        }

        try {
            $prompt = $this->buildDuplicateDetectionPrompt($newTransaction, $recentTransactions);
            $response = $this->callAIService($serviceConfig, $prompt);

            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for duplicate detection: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Generate expense suggestions from receipt text.
     */
    public function processReceiptText(string $receiptText): ?array
    {
        $serviceConfig = $this->getDefaultService();

        if (!$serviceConfig) {
            return null;
        }

        try {
            $prompt = $this->buildReceiptProcessingPrompt($receiptText);
            $response = $this->callAIService($serviceConfig, $prompt);

            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for receipt processing: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Score and qualify a lead based on provided information.
     */
    public function scoreAndQualifyLead(array $leadData): ?array
    {
        $serviceConfig = $this->getDefaultService();

        if (!$serviceConfig) {
            return null;
        }

        try {
            $prompt = $this->buildLeadScoringPrompt($leadData);
            $response = $this->callAIService($serviceConfig, $prompt);

            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for lead scoring: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Enrich company information from basic details.
     */
    public function enrichCompanyInfo(string $companyName, ?string $website = null, ?string $industry = null): ?array
    {
        $serviceConfig = $this->getDefaultService();

        if (!$serviceConfig) {
            return null;
        }

        try {
            $prompt = $this->buildCompanyEnrichmentPrompt($companyName, $website, $industry);
            $response = $this->callAIService($serviceConfig, $prompt);

            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for company enrichment: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Generate email template based on context.
     */
    public function generateEmailTemplate(string $purpose, array $context = []): ?array
    {
        $serviceConfig = $this->getDefaultService();

        if (!$serviceConfig) {
            return null;
        }

        try {
            $prompt = $this->buildEmailTemplatePrompt($purpose, $context);
            $response = $this->callAIService($serviceConfig, $prompt);

            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for email template generation: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Analyze communication sentiment and provide insights.
     */
    public function analyzeCommunicationSentiment(string $content, string $type = 'general'): ?array
    {
        $serviceConfig = $this->getDefaultService();

        if (!$serviceConfig) {
            return null;
        }

        try {
            $prompt = $this->buildSentimentAnalysisPrompt($content, $type);
            $response = $this->callAIService($serviceConfig, $prompt);

            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for sentiment analysis: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Build prompt for guest chat AI response.
     */
    private function buildGuestChatPrompt(string $guestMessage, array $conversationHistory = []): string
    {
        $systemPrompt = "You are TekRem AI Assistant, a helpful customer service AI for Technology Remedies Innovations (TekRem), a technology solutions company based in Lusaka, Zambia.

Your role:
- Provide helpful, professional, and friendly customer support
- Answer questions about TekRem's services (web development, mobile apps, ERP systems, IT consulting)
- Collect basic information from customers when needed
- Always mention that a human agent will be available soon for more detailed assistance
- Keep responses concise but informative
- Be polite and professional at all times

Company Information:
- Company: Technology Remedies Innovations (TekRem)
- Services: Web Development, Mobile Applications, ERP Systems, IT Consulting, Digital Solutions
- Location: Lusaka, Zambia
- Contact: tekremsolutions@gmail.com, +260 976607840

Guidelines:
- If asked about pricing, mention that a human agent will provide detailed quotes
- For technical support, gather basic information and assure human assistance
- For general inquiries, provide helpful information about TekRem's services
- Always end with an offer to connect them with a human agent";

        $conversationContext = '';
        if (!empty($conversationHistory)) {
            $conversationContext = "\n\nConversation History:\n";
            foreach ($conversationHistory as $msg) {
                $sender = $msg['is_ai'] ?? false ? 'AI Assistant' : ($msg['is_guest'] ?? true ? 'Customer' : 'Agent');
                $conversationContext .= "{$sender}: {$msg['message']}\n";
            }
        }

        return $systemPrompt . $conversationContext . "\n\nCustomer: {$guestMessage}\n\nAI Assistant:";
    }

    /**
     * Build prompt for transaction categorization.
     */
    private function buildTransactionCategorizationPrompt(string $description, ?string $vendor, array $existingCategories): string
    {
        $prompt = "You are a financial AI assistant. Analyze the following transaction and suggest the most appropriate category.\n\n";
        $prompt .= "Transaction Details:\n";
        $prompt .= "Description: {$description}\n";
        if ($vendor) {
            $prompt .= "Vendor: {$vendor}\n";
        }

        if (!empty($existingCategories)) {
            $prompt .= "\nExisting Categories:\n";
            foreach ($existingCategories as $category) {
                $prompt .= "- {$category['name']}: {$category['description']}\n";
            }
        }

        $prompt .= "\nPlease respond with a JSON object containing:\n";
        $prompt .= "{\n";
        $prompt .= '  "category": "suggested category name",'."\n";
        $prompt .= '  "confidence": 0.95,'."\n";
        $prompt .= '  "reasoning": "explanation for the categorization"'."\n";
        $prompt .= "}\n";
        $prompt .= "\nIf none of the existing categories fit well, suggest a new category name.";

        return $prompt;
    }

    /**
     * Build prompt for description enhancement.
     */
    private function buildDescriptionEnhancementPrompt(string $description, ?string $vendor, float $amount): string
    {
        $prompt = "You are a financial AI assistant. Enhance the following transaction description to be more clear and professional.\n\n";
        $prompt .= "Current Description: {$description}\n";
        if ($vendor) {
            $prompt .= "Vendor: {$vendor}\n";
        }
        if ($amount > 0) {
            $prompt .= "Amount: $" . number_format($amount, 2) . "\n";
        }

        $prompt .= "\nPlease provide an enhanced description that is:\n";
        $prompt .= "- Clear and professional\n";
        $prompt .= "- Includes relevant business context\n";
        $prompt .= "- Maintains the original meaning\n";
        $prompt .= "- Is concise (under 100 characters)\n\n";

        $prompt .= "Respond with a JSON object:\n";
        $prompt .= "{\n";
        $prompt .= '  "enhanced_description": "your enhanced description here"'."\n";
        $prompt .= "}\n";

        return $prompt;
    }

    /**
     * Build prompt for duplicate detection.
     */
    private function buildDuplicateDetectionPrompt(array $newTransaction, array $recentTransactions): string
    {
        $prompt = "You are a financial AI assistant. Analyze if the new transaction is a potential duplicate of any recent transactions.\n\n";

        $prompt .= "New Transaction:\n";
        $prompt .= "Description: {$newTransaction['description']}\n";
        $prompt .= "Amount: $" . number_format($newTransaction['amount'], 2) . "\n";
        $prompt .= "Date: {$newTransaction['date']}\n";
        if (isset($newTransaction['vendor'])) {
            $prompt .= "Vendor: {$newTransaction['vendor']}\n";
        }

        $prompt .= "\nRecent Transactions (last 30 days):\n";
        foreach ($recentTransactions as $index => $transaction) {
            $prompt .= ($index + 1) . ". Description: {$transaction['description']}, ";
            $prompt .= "Amount: $" . number_format($transaction['amount'], 2) . ", ";
            $prompt .= "Date: {$transaction['date']}\n";
        }

        $prompt .= "\nAnalyze for potential duplicates considering:\n";
        $prompt .= "- Similar amounts (within 5%)\n";
        $prompt .= "- Similar descriptions or vendors\n";
        $prompt .= "- Dates within a few days\n";
        $prompt .= "- Common duplicate patterns\n\n";

        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "is_duplicate": true/false,'."\n";
        $prompt .= '  "confidence": 0.95,'."\n";
        $prompt .= '  "similar_transactions": [array of transaction indices],'."\n";
        $prompt .= '  "reasoning": "explanation of the analysis"'."\n";
        $prompt .= "}\n";

        return $prompt;
    }

    /**
     * Build prompt for receipt processing.
     */
    private function buildReceiptProcessingPrompt(string $receiptText): string
    {
        $prompt = "You are a financial AI assistant. Extract expense information from the following receipt text.\n\n";
        $prompt .= "Receipt Text:\n{$receiptText}\n\n";

        $prompt .= "Extract the following information and respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "vendor": "business name",'."\n";
        $prompt .= '  "amount": 0.00,'."\n";
        $prompt .= '  "date": "YYYY-MM-DD",'."\n";
        $prompt .= '  "description": "brief description of expense",'."\n";
        $prompt .= '  "category": "suggested expense category",'."\n";
        $prompt .= '  "items": ['."\n";
        $prompt .= '    {"description": "item name", "amount": 0.00}'."\n";
        $prompt .= '  ],'."\n";
        $prompt .= '  "confidence": 0.95,'."\n";
        $prompt .= '  "tax_amount": 0.00'."\n";
        $prompt .= "}\n\n";

        $prompt .= "If any information is unclear or missing, use null for that field.";

        return $prompt;
    }

    /**
     * Build prompt for lead scoring and qualification.
     */
    private function buildLeadScoringPrompt(array $leadData): string
    {
        $prompt = "You are a CRM AI assistant specialized in lead scoring and qualification. Analyze the following lead information and provide a comprehensive assessment.\n\n";

        $prompt .= "Lead Information:\n";
        $prompt .= "Name: {$leadData['name']}\n";
        $prompt .= "Company: " . ($leadData['company'] ?? 'Not provided') . "\n";
        $prompt .= "Position: " . ($leadData['position'] ?? 'Not provided') . "\n";
        $prompt .= "Email: " . ($leadData['email'] ?? 'Not provided') . "\n";
        $prompt .= "Phone: " . ($leadData['phone'] ?? 'Not provided') . "\n";
        $prompt .= "Source: " . ($leadData['source'] ?? 'Not provided') . "\n";
        $prompt .= "Notes: " . ($leadData['notes'] ?? 'Not provided') . "\n";

        $prompt .= "\nAnalyze this lead based on:\n";
        $prompt .= "- Contact information completeness\n";
        $prompt .= "- Company size and industry indicators\n";
        $prompt .= "- Position/title authority level\n";
        $prompt .= "- Lead source quality\n";
        $prompt .= "- Engagement potential\n";
        $prompt .= "- Conversion likelihood\n\n";

        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "score": 85,'."\n";
        $prompt .= '  "grade": "A|B|C|D",'."\n";
        $prompt .= '  "qualification": "hot|warm|cold",'."\n";
        $prompt .= '  "conversion_probability": 0.75,'."\n";
        $prompt .= '  "strengths": ["strength 1", "strength 2"],'."\n";
        $prompt .= '  "weaknesses": ["weakness 1", "weakness 2"],'."\n";
        $prompt .= '  "recommendations": ["action 1", "action 2"],'."\n";
        $prompt .= '  "next_steps": ["step 1", "step 2"],'."\n";
        $prompt .= '  "priority": "high|medium|low",'."\n";
        $prompt .= '  "reasoning": "detailed explanation of the scoring"'."\n";
        $prompt .= "}\n";

        return $prompt;
    }

    /**
     * Build prompt for company enrichment.
     */
    private function buildCompanyEnrichmentPrompt(string $companyName, ?string $website, ?string $industry): string
    {
        $prompt = "You are a business intelligence AI assistant. Provide enriched information about the following company based on publicly available knowledge.\n\n";

        $prompt .= "Company Details:\n";
        $prompt .= "Name: {$companyName}\n";
        if ($website) {
            $prompt .= "Website: {$website}\n";
        }
        if ($industry) {
            $prompt .= "Industry: {$industry}\n";
        }

        $prompt .= "\nProvide enriched information including:\n";
        $prompt .= "- Industry classification\n";
        $prompt .= "- Estimated company size\n";
        $prompt .= "- Business model\n";
        $prompt .= "- Key services/products\n";
        $prompt .= "- Market position\n";
        $prompt .= "- Potential pain points\n";
        $prompt .= "- Technology stack (if known)\n\n";

        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "industry": "specific industry",'."\n";
        $prompt .= '  "sub_industry": "sub-category",'."\n";
        $prompt .= '  "company_size": "startup|small|medium|large|enterprise",'."\n";
        $prompt .= '  "employee_range": "1-10|11-50|51-200|201-1000|1000+",'."\n";
        $prompt .= '  "business_model": "B2B|B2C|B2B2C|marketplace|etc",'."\n";
        $prompt .= '  "key_services": ["service 1", "service 2"],'."\n";
        $prompt .= '  "technologies": ["tech 1", "tech 2"],'."\n";
        $prompt .= '  "pain_points": ["pain point 1", "pain point 2"],'."\n";
        $prompt .= '  "opportunities": ["opportunity 1", "opportunity 2"],'."\n";
        $prompt .= '  "decision_makers": ["typical roles"],'."\n";
        $prompt .= '  "sales_approach": "recommended approach",'."\n";
        $prompt .= '  "confidence": 0.85'."\n";
        $prompt .= "}\n\n";

        $prompt .= "Note: Only provide information you're confident about. Use 'unknown' for uncertain fields.";

        return $prompt;
    }

    /**
     * Build prompt for email template generation.
     */
    private function buildEmailTemplatePrompt(string $purpose, array $context): string
    {
        $prompt = "You are a professional email writing AI assistant. Generate an email template for the specified purpose.\n\n";

        $prompt .= "Email Purpose: {$purpose}\n\n";

        if (!empty($context)) {
            $prompt .= "Context Information:\n";
            foreach ($context as $key => $value) {
                $prompt .= "- {$key}: {$value}\n";
            }
            $prompt .= "\n";
        }

        $prompt .= "Generate a professional email template that is:\n";
        $prompt .= "- Personalized and engaging\n";
        $prompt .= "- Clear and concise\n";
        $prompt .= "- Action-oriented\n";
        $prompt .= "- Professional in tone\n";
        $prompt .= "- Includes placeholders for customization\n\n";

        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "subject": "email subject line",'."\n";
        $prompt .= '  "body": "email body with placeholders like {{name}}, {{company}}",'."\n";
        $prompt .= '  "tone": "professional|friendly|formal|casual",'."\n";
        $prompt .= '  "call_to_action": "main CTA",'."\n";
        $prompt .= '  "placeholders": ["{{name}}", "{{company}}", "{{position}}"],'."\n";
        $prompt .= '  "follow_up_suggestions": ["suggestion 1", "suggestion 2"],'."\n";
        $prompt .= '  "best_send_time": "recommended sending time"'."\n";
        $prompt .= "}\n";

        return $prompt;
    }

    /**
     * Build prompt for sentiment analysis.
     */
    private function buildSentimentAnalysisPrompt(string $content, string $type): string
    {
        $prompt = "You are a communication analysis AI assistant. Analyze the sentiment and tone of the following {$type} communication.\n\n";

        $prompt .= "Communication Content:\n{$content}\n\n";

        $prompt .= "Analyze for:\n";
        $prompt .= "- Overall sentiment (positive, negative, neutral)\n";
        $prompt .= "- Emotional tone\n";
        $prompt .= "- Urgency level\n";
        $prompt .= "- Customer satisfaction indicators\n";
        $prompt .= "- Key concerns or interests\n";
        $prompt .= "- Buying signals\n";
        $prompt .= "- Risk indicators\n\n";

        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "sentiment": "positive|negative|neutral",'."\n";
        $prompt .= '  "sentiment_score": 0.75,'."\n";
        $prompt .= '  "tone": "friendly|professional|frustrated|excited|concerned",'."\n";
        $prompt .= '  "urgency": "high|medium|low",'."\n";
        $prompt .= '  "satisfaction": "satisfied|neutral|dissatisfied",'."\n";
        $prompt .= '  "key_emotions": ["emotion 1", "emotion 2"],'."\n";
        $prompt .= '  "concerns": ["concern 1", "concern 2"],'."\n";
        $prompt .= '  "interests": ["interest 1", "interest 2"],'."\n";
        $prompt .= '  "buying_signals": ["signal 1", "signal 2"],'."\n";
        $prompt .= '  "risk_indicators": ["risk 1", "risk 2"],'."\n";
        $prompt .= '  "recommended_response": "suggested response approach",'."\n";
        $prompt .= '  "priority": "high|medium|low",'."\n";
        $prompt .= '  "confidence": 0.90'."\n";
        $prompt .= "}\n";

        return $prompt;
    }

    /**
     * Call the AI service API.
     */
    private function callAIService(array $config, string $prompt): ?string
    {
        $service = $config['service'];

        return match($service) {
            'mistral' => $this->callMistralAPI($config, $prompt),
            'openai' => $this->callOpenAIAPI($config, $prompt),
            'anthropic' => $this->callAnthropicAPI($config, $prompt),
            default => null,
        };
    }

    /**
     * Call Mistral AI API.
     */
    private function callMistralAPI(array $config, string $prompt): ?string
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $config['api_key'],
            'Content-Type' => 'application/json',
        ])->timeout(30)->post('https://api.mistral.ai/v1/chat/completions', [
            'model' => $config['model'],
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ],
            'max_tokens' => $config['max_tokens'],
            'temperature' => $config['temperature'],
        ]);

        if ($response->successful()) {
            $data = $response->json();
            return $data['choices'][0]['message']['content'] ?? null;
        }

        Log::error('Mistral API error: ' . $response->body());
        return null;
    }

    /**
     * Call OpenAI API.
     */
    private function callOpenAIAPI(array $config, string $prompt): ?string
    {
        $headers = [
            'Authorization' => 'Bearer ' . $config['api_key'],
            'Content-Type' => 'application/json',
        ];

        if (!empty($config['organization'])) {
            $headers['OpenAI-Organization'] = $config['organization'];
        }

        $response = Http::withHeaders($headers)->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
            'model' => $config['model'],
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ],
            'max_tokens' => $config['max_tokens'],
            'temperature' => $config['temperature'],
        ]);

        if ($response->successful()) {
            $data = $response->json();
            return $data['choices'][0]['message']['content'] ?? null;
        }

        Log::error('OpenAI API error: ' . $response->body());
        return null;
    }

    /**
     * Call Anthropic API.
     */
    private function callAnthropicAPI(array $config, string $prompt): ?string
    {
        $response = Http::withHeaders([
            'x-api-key' => $config['api_key'],
            'Content-Type' => 'application/json',
            'anthropic-version' => '2023-06-01',
        ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
            'model' => $config['model'],
            'max_tokens' => $config['max_tokens'],
            'temperature' => $config['temperature'],
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ],
        ]);

        if ($response->successful()) {
            $data = $response->json();
            return $data['content'][0]['text'] ?? null;
        }

        Log::error('Anthropic API error: ' . $response->body());
        return null;
    }

    /**
     * Check if AI auto-response is enabled and configured.
     */
    public function isAutoResponseEnabled(): bool
    {
        return $this->getDefaultService() !== null;
    }

    /**
     * Test AI service connection.
     */
    public function testConnection(string $service): array
    {
        $config = $this->getServiceConfig($service);

        if (!$config['enabled'] || empty($config['api_key'])) {
            return ['status' => 'error', 'message' => 'Service not configured'];
        }

        try {
            $testPrompt = "Hello, this is a test message. Please respond with 'Test successful'.";
            $response = $this->callAIService(array_merge($config, ['service' => $service]), $testPrompt);

            if ($response) {
                return ['status' => 'success', 'message' => 'Connection successful', 'response' => $response];
            } else {
                return ['status' => 'error', 'message' => 'No response received'];
            }
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}
