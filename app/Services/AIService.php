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
