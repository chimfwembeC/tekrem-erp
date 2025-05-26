<?php

namespace App\Services;

use App\Models\Finance\Quotation;
use App\Models\Finance\Invoice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiEmailService
{
    private $apiKey;
    private $apiUrl;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key') ?? config('services.mistral.api_key');
        $this->apiUrl = config('services.openai.api_url', 'https://api.openai.com/v1/chat/completions');
    }

    /**
     * Generate email content for quotation
     */
    public function generateQuotationEmail(Quotation $quotation, $type = 'send')
    {
        $prompt = $this->buildQuotationPrompt($quotation, $type);
        
        return $this->generateEmailContent($prompt, [
            'quotation_id' => $quotation->id,
            'type' => $type,
            'lead_name' => $quotation->lead->name,
            'company' => $quotation->lead->company,
        ]);
    }

    /**
     * Generate email content for invoice
     */
    public function generateInvoiceEmail(Invoice $invoice, $type = 'send')
    {
        $prompt = $this->buildInvoicePrompt($invoice, $type);
        
        return $this->generateEmailContent($prompt, [
            'invoice_id' => $invoice->id,
            'type' => $type,
            'client_name' => $invoice->billable->name ?? 'Valued Client',
        ]);
    }

    /**
     * Generate follow-up email for overdue invoices
     */
    public function generateFollowUpEmail(Invoice $invoice, $followUpNumber = 1)
    {
        $prompt = $this->buildFollowUpPrompt($invoice, $followUpNumber);
        
        return $this->generateEmailContent($prompt, [
            'invoice_id' => $invoice->id,
            'type' => 'follow_up',
            'follow_up_number' => $followUpNumber,
            'client_name' => $invoice->billable->name ?? 'Valued Client',
        ]);
    }

    /**
     * Generate thank you email for payments
     */
    public function generatePaymentThankYouEmail(Invoice $invoice)
    {
        $prompt = $this->buildPaymentThankYouPrompt($invoice);
        
        return $this->generateEmailContent($prompt, [
            'invoice_id' => $invoice->id,
            'type' => 'payment_thank_you',
            'client_name' => $invoice->billable->name ?? 'Valued Client',
        ]);
    }

    /**
     * Build quotation email prompt
     */
    private function buildQuotationPrompt(Quotation $quotation, $type)
    {
        $companyName = config('app.name', 'TekRem ERP');
        $leadName = $quotation->lead->name;
        $company = $quotation->lead->company;
        $amount = number_format($quotation->total_amount, 2) . ' ' . $quotation->currency;
        $expiryDate = $quotation->expiry_date->format('M d, Y');
        
        $basePrompt = "You are a professional business communication AI. Generate a professional, friendly, and persuasive email for the following scenario:\n\n";
        
        switch ($type) {
            case 'send':
                return $basePrompt . "
                Context: Sending a quotation to a potential client
                Company: {$companyName}
                Recipient: {$leadName}" . ($company ? " from {$company}" : "") . "
                Quotation Number: {$quotation->quotation_number}
                Amount: {$amount}
                Expiry Date: {$expiryDate}
                
                Requirements:
                - Professional and friendly tone
                - Express enthusiasm about the potential partnership
                - Highlight key benefits and value proposition
                - Include clear call-to-action
                - Mention quotation expiry date
                - Keep it concise but engaging
                - Include subject line
                
                Format the response as JSON with 'subject' and 'body' fields.
                ";
                
            case 'reminder':
                $daysLeft = $quotation->days_until_expiry;
                return $basePrompt . "
                Context: Reminder email for quotation expiring soon
                Company: {$companyName}
                Recipient: {$leadName}" . ($company ? " from {$company}" : "") . "
                Quotation Number: {$quotation->quotation_number}
                Amount: {$amount}
                Days until expiry: {$daysLeft}
                
                Requirements:
                - Gentle reminder tone
                - Create urgency without being pushy
                - Offer assistance or clarification
                - Include clear call-to-action
                - Professional and helpful
                - Include subject line
                
                Format the response as JSON with 'subject' and 'body' fields.
                ";
                
            default:
                return $basePrompt . "Generate a professional quotation email.";
        }
    }

    /**
     * Build invoice email prompt
     */
    private function buildInvoicePrompt(Invoice $invoice, $type)
    {
        $companyName = config('app.name', 'TekRem ERP');
        $clientName = $invoice->billable->name ?? 'Valued Client';
        $amount = number_format($invoice->total_amount, 2) . ' ' . $invoice->currency;
        $dueDate = $invoice->due_date->format('M d, Y');
        
        $basePrompt = "You are a professional business communication AI. Generate a professional and clear email for the following scenario:\n\n";
        
        switch ($type) {
            case 'send':
                return $basePrompt . "
                Context: Sending an invoice to a client
                Company: {$companyName}
                Recipient: {$clientName}
                Invoice Number: {$invoice->invoice_number}
                Amount: {$amount}
                Due Date: {$dueDate}
                
                Requirements:
                - Professional and clear tone
                - Thank them for their business
                - Clearly state payment terms
                - Include payment instructions
                - Provide contact information for questions
                - Include subject line
                
                Format the response as JSON with 'subject' and 'body' fields.
                ";
                
            default:
                return $basePrompt . "Generate a professional invoice email.";
        }
    }

    /**
     * Build follow-up email prompt
     */
    private function buildFollowUpPrompt(Invoice $invoice, $followUpNumber)
    {
        $companyName = config('app.name', 'TekRem ERP');
        $clientName = $invoice->billable->name ?? 'Valued Client';
        $amount = number_format($invoice->total_amount, 2) . ' ' . $invoice->currency;
        $dueDate = $invoice->due_date->format('M d, Y');
        $daysOverdue = now()->diffInDays($invoice->due_date);
        
        $tone = $followUpNumber === 1 ? 'gentle and understanding' : 
                ($followUpNumber === 2 ? 'firm but professional' : 'urgent but respectful');
        
        $basePrompt = "You are a professional business communication AI. Generate a follow-up email for an overdue invoice:\n\n";
        
        return $basePrompt . "
        Context: Follow-up #{$followUpNumber} for overdue invoice
        Company: {$companyName}
        Recipient: {$clientName}
        Invoice Number: {$invoice->invoice_number}
        Amount: {$amount}
        Original Due Date: {$dueDate}
        Days Overdue: {$daysOverdue}
        
        Requirements:
        - Tone: {$tone}
        - Acknowledge the oversight professionally
        - Clearly state the overdue amount
        - Provide payment options
        - Offer to discuss if there are issues
        - Include consequences if appropriate for follow-up level
        - Include subject line
        
        Format the response as JSON with 'subject' and 'body' fields.
        ";
    }

    /**
     * Build payment thank you prompt
     */
    private function buildPaymentThankYouPrompt(Invoice $invoice)
    {
        $companyName = config('app.name', 'TekRem ERP');
        $clientName = $invoice->billable->name ?? 'Valued Client';
        $amount = number_format($invoice->total_amount, 2) . ' ' . $invoice->currency;
        
        $basePrompt = "You are a professional business communication AI. Generate a thank you email for payment received:\n\n";
        
        return $basePrompt . "
        Context: Thank you email for payment received
        Company: {$companyName}
        Recipient: {$clientName}
        Invoice Number: {$invoice->invoice_number}
        Amount Paid: {$amount}
        
        Requirements:
        - Warm and appreciative tone
        - Thank them for prompt payment
        - Confirm payment received
        - Express value for the business relationship
        - Invite future business
        - Include subject line
        
        Format the response as JSON with 'subject' and 'body' fields.
        ";
    }

    /**
     * Generate email content using AI
     */
    private function generateEmailContent($prompt, $metadata = [])
    {
        try {
            // Try OpenAI first, then fallback to Mistral
            $response = $this->callOpenAI($prompt);
            
            if (!$response) {
                $response = $this->callMistral($prompt);
            }
            
            if (!$response) {
                return $this->getFallbackContent($metadata);
            }
            
            // Parse JSON response
            $content = json_decode($response, true);
            
            if (!$content || !isset($content['subject']) || !isset($content['body'])) {
                return $this->getFallbackContent($metadata);
            }
            
            return [
                'subject' => $content['subject'],
                'body' => $content['body'],
                'generated_by' => 'ai',
                'metadata' => $metadata,
            ];
            
        } catch (\Exception $e) {
            Log::error('AI Email Generation Error: ' . $e->getMessage());
            return $this->getFallbackContent($metadata);
        }
    }

    /**
     * Call OpenAI API
     */
    private function callOpenAI($prompt)
    {
        if (!config('services.openai.api_key')) {
            return null;
        }
        
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openai.api_key'),
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional business email writer. Always respond with valid JSON containing subject and body fields.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 1000,
                'temperature' => 0.7,
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? null;
            }
            
        } catch (\Exception $e) {
            Log::error('OpenAI API Error: ' . $e->getMessage());
        }
        
        return null;
    }

    /**
     * Call Mistral API
     */
    private function callMistral($prompt)
    {
        if (!config('services.mistral.api_key')) {
            return null;
        }
        
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.mistral.api_key'),
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.mistral.ai/v1/chat/completions', [
                'model' => 'mistral-small',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional business email writer. Always respond with valid JSON containing subject and body fields.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 1000,
                'temperature' => 0.7,
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? null;
            }
            
        } catch (\Exception $e) {
            Log::error('Mistral API Error: ' . $e->getMessage());
        }
        
        return null;
    }

    /**
     * Get fallback content when AI fails
     */
    private function getFallbackContent($metadata)
    {
        $type = $metadata['type'] ?? 'general';
        
        switch ($type) {
            case 'send':
                if (isset($metadata['quotation_id'])) {
                    return [
                        'subject' => 'Quotation for Your Review',
                        'body' => "Dear {$metadata['lead_name']},\n\nI hope this email finds you well.\n\nPlease find attached our quotation for your review. We're excited about the opportunity to work with you and provide our services.\n\nIf you have any questions or need clarification on any aspect of the quotation, please don't hesitate to reach out.\n\nWe look forward to hearing from you.\n\nBest regards,\n" . config('app.name'),
                        'generated_by' => 'fallback',
                        'metadata' => $metadata,
                    ];
                } else {
                    return [
                        'subject' => 'Invoice for Your Review',
                        'body' => "Dear {$metadata['client_name']},\n\nThank you for your business.\n\nPlease find attached your invoice. Payment is due as per the terms specified.\n\nIf you have any questions, please contact us.\n\nBest regards,\n" . config('app.name'),
                        'generated_by' => 'fallback',
                        'metadata' => $metadata,
                    ];
                }
                
            default:
                return [
                    'subject' => 'Important Business Communication',
                    'body' => "Dear Valued Client,\n\nWe hope this message finds you well.\n\nPlease find the attached document for your review.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\n" . config('app.name'),
                    'generated_by' => 'fallback',
                    'metadata' => $metadata,
                ];
        }
    }
}
