<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\Client;
use App\Models\Communication;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CRMAIService
{
    private AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Get AI-powered lead scoring and recommendations.
     */
    public function getLeadInsights(array $leadData): array
    {
        $insights = [];

        // Get lead scoring
        $leadScore = $this->aiService->scoreAndQualifyLead($leadData);
        if ($leadScore) {
            $insights['scoring'] = $leadScore;
        }

        // Get company enrichment if company name is provided
        if (!empty($leadData['company'])) {
            $companyInfo = $this->aiService->enrichCompanyInfo(
                $leadData['company'],
                $leadData['website'] ?? null,
                $leadData['industry'] ?? null
            );
            if ($companyInfo) {
                $insights['company_enrichment'] = $companyInfo;
            }
        }

        return $insights;
    }

    /**
     * Generate email template for lead communication.
     */
    public function generateLeadEmail(string $purpose, array $leadData, array $context = []): ?array
    {
        $emailContext = array_merge([
            'lead_name' => $leadData['name'] ?? '',
            'company' => $leadData['company'] ?? '',
            'position' => $leadData['position'] ?? '',
            'source' => $leadData['source'] ?? '',
            'status' => $leadData['status'] ?? '',
        ], $context);

        return $this->aiService->generateEmailTemplate($purpose, $emailContext);
    }

    /**
     * Analyze communication sentiment and provide insights.
     */
    public function analyzeCommunication(string $content, string $type = 'general'): ?array
    {
        return $this->aiService->analyzeCommunicationSentiment($content, $type);
    }

    /**
     * Get follow-up recommendations for a lead.
     */
    public function getFollowUpRecommendations(Lead $lead): ?array
    {
        $serviceConfig = $this->aiService->getDefaultService();
        
        if (!$serviceConfig) {
            return null;
        }

        try {
            // Get recent communications
            $recentCommunications = $lead->communications()
                ->latest()
                ->take(5)
                ->get(['type', 'content', 'communication_date', 'direction'])
                ->toArray();

            $prompt = $this->buildFollowUpPrompt($lead->toArray(), $recentCommunications);
            $response = $this->aiService->callAIService($serviceConfig, $prompt);
            
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for follow-up recommendations: ' . $e->getMessage());
        }
        
        return null;
    }

    /**
     * Predict lead conversion probability.
     */
    public function predictConversion(Lead $lead): ?array
    {
        $serviceConfig = $this->aiService->getDefaultService();
        
        if (!$serviceConfig) {
            return null;
        }

        try {
            // Get lead data with communications
            $leadData = $lead->toArray();
            $communications = $lead->communications()->get(['type', 'content', 'communication_date'])->toArray();
            
            $prompt = $this->buildConversionPredictionPrompt($leadData, $communications);
            $response = $this->aiService->callAIService($serviceConfig, $prompt);
            
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for conversion prediction: ' . $e->getMessage());
        }
        
        return null;
    }

    /**
     * Analyze client health and satisfaction.
     */
    public function analyzeClientHealth(Client $client): ?array
    {
        $serviceConfig = $this->aiService->getDefaultService();
        
        if (!$serviceConfig) {
            return null;
        }

        try {
            // Get client data with recent communications
            $clientData = $client->toArray();
            $recentCommunications = $client->communications()
                ->where('communication_date', '>=', Carbon::now()->subMonths(3))
                ->get(['type', 'content', 'communication_date', 'direction'])
                ->toArray();

            $prompt = $this->buildClientHealthPrompt($clientData, $recentCommunications);
            $response = $this->aiService->callAIService($serviceConfig, $prompt);
            
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for client health analysis: ' . $e->getMessage());
        }
        
        return null;
    }

    /**
     * Generate CRM insights and recommendations.
     */
    public function generateCRMInsights(array $crmData): ?array
    {
        $serviceConfig = $this->aiService->getDefaultService();
        
        if (!$serviceConfig) {
            return null;
        }

        try {
            $prompt = $this->buildCRMInsightsPrompt($crmData);
            $response = $this->aiService->callAIService($serviceConfig, $prompt);
            
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for CRM insights: ' . $e->getMessage());
        }
        
        return null;
    }

    /**
     * Build prompt for follow-up recommendations.
     */
    private function buildFollowUpPrompt(array $leadData, array $communications): string
    {
        $prompt = "You are a CRM AI assistant. Analyze the lead information and communication history to provide follow-up recommendations.\n\n";
        
        $prompt .= "Lead Information:\n";
        $prompt .= "Name: {$leadData['name']}\n";
        $prompt .= "Company: " . ($leadData['company'] ?? 'Not provided') . "\n";
        $prompt .= "Status: {$leadData['status']}\n";
        $prompt .= "Source: " . ($leadData['source'] ?? 'Not provided') . "\n";
        $prompt .= "Created: {$leadData['created_at']}\n";
        
        if (!empty($communications)) {
            $prompt .= "\nRecent Communications:\n";
            foreach ($communications as $comm) {
                $prompt .= "- {$comm['type']} ({$comm['direction']}) on {$comm['communication_date']}: " . substr($comm['content'], 0, 100) . "...\n";
            }
        }
        
        $prompt .= "\nProvide follow-up recommendations including:\n";
        $prompt .= "- Next best action\n";
        $prompt .= "- Optimal timing\n";
        $prompt .= "- Communication channel\n";
        $prompt .= "- Message suggestions\n";
        $prompt .= "- Priority level\n\n";
        
        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "next_action": "specific action to take",'."\n";
        $prompt .= '  "timing": "when to follow up",'."\n";
        $prompt .= '  "channel": "email|call|meeting|social",'."\n";
        $prompt .= '  "message_suggestions": ["suggestion 1", "suggestion 2"],'."\n";
        $prompt .= '  "priority": "high|medium|low",'."\n";
        $prompt .= '  "reasoning": "explanation for recommendations",'."\n";
        $prompt .= '  "success_probability": 0.75,'."\n";
        $prompt .= '  "alternative_actions": ["alternative 1", "alternative 2"]'."\n";
        $prompt .= "}\n";
        
        return $prompt;
    }

    /**
     * Build prompt for conversion prediction.
     */
    private function buildConversionPredictionPrompt(array $leadData, array $communications): string
    {
        $prompt = "You are a CRM AI assistant specialized in conversion prediction. Analyze the lead data and predict conversion likelihood.\n\n";
        
        $prompt .= "Lead Information:\n";
        foreach ($leadData as $key => $value) {
            if (!is_null($value) && $key !== 'id') {
                $prompt .= "{$key}: {$value}\n";
            }
        }
        
        $prompt .= "\nCommunication History:\n";
        foreach ($communications as $comm) {
            $prompt .= "- {$comm['type']} on {$comm['communication_date']}: " . substr($comm['content'], 0, 150) . "...\n";
        }
        
        $prompt .= "\nAnalyze conversion probability based on:\n";
        $prompt .= "- Lead engagement level\n";
        $prompt .= "- Communication frequency and quality\n";
        $prompt .= "- Time since last contact\n";
        $prompt .= "- Lead source quality\n";
        $prompt .= "- Company fit indicators\n\n";
        
        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "conversion_probability": 0.75,'."\n";
        $prompt .= '  "confidence": 0.85,'."\n";
        $prompt .= '  "timeline": "expected conversion timeframe",'."\n";
        $prompt .= '  "key_factors": ["factor 1", "factor 2"],'."\n";
        $prompt .= '  "risk_factors": ["risk 1", "risk 2"],'."\n";
        $prompt .= '  "recommendations": ["action 1", "action 2"],'."\n";
        $prompt .= '  "stage": "awareness|interest|consideration|decision",'."\n";
        $prompt .= '  "next_milestone": "next expected milestone"'."\n";
        $prompt .= "}\n";
        
        return $prompt;
    }

    /**
     * Build prompt for client health analysis.
     */
    private function buildClientHealthPrompt(array $clientData, array $communications): string
    {
        $prompt = "You are a CRM AI assistant specialized in client relationship analysis. Assess the client's health and satisfaction.\n\n";
        
        $prompt .= "Client Information:\n";
        $prompt .= "Name: {$clientData['name']}\n";
        $prompt .= "Company: " . ($clientData['company'] ?? 'Not provided') . "\n";
        $prompt .= "Status: {$clientData['status']}\n";
        $prompt .= "Client Since: {$clientData['created_at']}\n";
        
        $prompt .= "\nRecent Communications (Last 3 months):\n";
        foreach ($communications as $comm) {
            $prompt .= "- {$comm['type']} ({$comm['direction']}) on {$comm['communication_date']}: " . substr($comm['content'], 0, 100) . "...\n";
        }
        
        $prompt .= "\nAnalyze client health based on:\n";
        $prompt .= "- Communication frequency and tone\n";
        $prompt .= "- Response times and engagement\n";
        $prompt .= "- Issue resolution patterns\n";
        $prompt .= "- Satisfaction indicators\n";
        $prompt .= "- Churn risk factors\n\n";
        
        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "health_score": 85,'."\n";
        $prompt .= '  "satisfaction": "high|medium|low",'."\n";
        $prompt .= '  "churn_risk": "low|medium|high",'."\n";
        $prompt .= '  "engagement_level": "high|medium|low",'."\n";
        $prompt .= '  "positive_indicators": ["indicator 1", "indicator 2"],'."\n";
        $prompt .= '  "warning_signs": ["warning 1", "warning 2"],'."\n";
        $prompt .= '  "recommendations": ["action 1", "action 2"],'."\n";
        $prompt .= '  "upsell_opportunities": ["opportunity 1", "opportunity 2"],'."\n";
        $prompt .= '  "retention_actions": ["action 1", "action 2"]'."\n";
        $prompt .= "}\n";
        
        return $prompt;
    }

    /**
     * Build prompt for CRM insights.
     */
    private function buildCRMInsightsPrompt(array $crmData): string
    {
        $prompt = "You are a CRM AI assistant. Analyze the CRM data and provide actionable business insights.\n\n";
        
        $prompt .= "CRM Summary:\n";
        $prompt .= "Total Leads: " . ($crmData['total_leads'] ?? 0) . "\n";
        $prompt .= "Total Clients: " . ($crmData['total_clients'] ?? 0) . "\n";
        $prompt .= "Conversion Rate: " . ($crmData['conversion_rate'] ?? 0) . "%\n";
        $prompt .= "Average Deal Size: $" . number_format($crmData['avg_deal_size'] ?? 0, 2) . "\n";
        
        if (isset($crmData['lead_sources'])) {
            $prompt .= "\nLead Sources Performance:\n";
            foreach ($crmData['lead_sources'] as $source => $count) {
                $prompt .= "- {$source}: {$count} leads\n";
            }
        }
        
        if (isset($crmData['recent_trends'])) {
            $prompt .= "\nRecent Trends:\n";
            foreach ($crmData['recent_trends'] as $trend) {
                $prompt .= "- {$trend}\n";
            }
        }
        
        $prompt .= "\nProvide insights on:\n";
        $prompt .= "- Performance trends\n";
        $prompt .= "- Optimization opportunities\n";
        $prompt .= "- Resource allocation\n";
        $prompt .= "- Process improvements\n";
        $prompt .= "- Revenue growth strategies\n\n";
        
        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "insights": ['."\n";
        $prompt .= '    {"type": "trend|opportunity|warning", "title": "Insight Title", "description": "Detailed insight"}';
        $prompt .= '  ],'."\n";
        $prompt .= '  "recommendations": ['."\n";
        $prompt .= '    {"priority": "high|medium|low", "action": "specific action", "impact": "expected impact"}';
        $prompt .= '  ],'."\n";
        $prompt .= '  "kpi_analysis": {'."\n";
        $prompt .= '    "conversion_rate": "analysis of conversion rate",'."\n";
        $prompt .= '    "lead_quality": "assessment of lead quality",'."\n";
        $prompt .= '    "sales_velocity": "analysis of sales speed"'."\n";
        $prompt .= '  },'."\n";
        $prompt .= '  "growth_opportunities": ["opportunity 1", "opportunity 2"]'."\n";
        $prompt .= "}\n";
        
        return $prompt;
    }
}
