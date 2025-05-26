<?php

namespace App\Services;

use App\Models\Finance\Category;
use App\Models\Finance\Transaction;
use App\Models\Finance\Expense;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class FinanceAIService
{
    private AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Get AI suggestions for transaction creation.
     */
    public function getTransactionSuggestions(array $transactionData): array
    {
        $suggestions = [];

        // Get category suggestions
        $categories = Category::where('is_active', true)->get(['id', 'name', 'description'])->toArray();
        $categorySuggestion = $this->aiService->categorizeTransaction(
            $transactionData['description'],
            $transactionData['vendor'] ?? null,
            $categories
        );

        if ($categorySuggestion) {
            $suggestions['category'] = $categorySuggestion;
        }

        // Get enhanced description
        $enhancedDescription = $this->aiService->enhanceTransactionDescription(
            $transactionData['description'],
            $transactionData['vendor'] ?? null,
            $transactionData['amount'] ?? 0
        );

        if ($enhancedDescription) {
            $suggestions['enhanced_description'] = $enhancedDescription;
        }

        // Check for duplicates
        $recentTransactions = Transaction::where('user_id', auth()->id())
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->get(['description', 'amount', 'transaction_date'])
            ->map(function ($transaction) {
                return [
                    'description' => $transaction->description,
                    'amount' => $transaction->amount,
                    'date' => $transaction->transaction_date->format('Y-m-d'),
                ];
            })
            ->toArray();

        $duplicateCheck = $this->aiService->detectDuplicateTransactions(
            [
                'description' => $transactionData['description'],
                'amount' => $transactionData['amount'] ?? 0,
                'date' => $transactionData['date'] ?? Carbon::now()->format('Y-m-d'),
                'vendor' => $transactionData['vendor'] ?? null,
            ],
            $recentTransactions
        );

        if ($duplicateCheck) {
            $suggestions['duplicate_check'] = $duplicateCheck;
        }

        return $suggestions;
    }

    /**
     * Process receipt text and extract expense data.
     */
    public function processReceiptForExpense(string $receiptText): ?array
    {
        $result = $this->aiService->processReceiptText($receiptText);

        if ($result && isset($result['vendor'])) {
            // Map to expense form structure
            return [
                'title' => $result['description'] ?? 'Expense from receipt',
                'description' => $result['description'] ?? '',
                'amount' => $result['amount'] ?? 0,
                'vendor' => $result['vendor'] ?? '',
                'expense_date' => $result['date'] ?? Carbon::now()->format('Y-m-d'),
                'suggested_category' => $result['category'] ?? null,
                'items' => $result['items'] ?? [],
                'tax_amount' => $result['tax_amount'] ?? 0,
                'confidence' => $result['confidence'] ?? 0,
            ];
        }

        return null;
    }

    /**
     * Generate financial insights for dashboard.
     */
    public function generateFinancialInsights(array $financialData): ?array
    {
        $serviceConfig = $this->aiService->getDefaultService();
        
        if (!$serviceConfig) {
            return null;
        }

        try {
            $prompt = $this->buildFinancialInsightsPrompt($financialData);
            $response = $this->aiService->callAIService($serviceConfig, $prompt);
            
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for financial insights: ' . $e->getMessage());
        }
        
        return null;
    }

    /**
     * Generate smart invoice line items.
     */
    public function generateInvoiceItems(string $projectDescription, ?float $estimatedValue = null): ?array
    {
        $serviceConfig = $this->aiService->getDefaultService();
        
        if (!$serviceConfig) {
            return null;
        }

        try {
            $prompt = $this->buildInvoiceItemsPrompt($projectDescription, $estimatedValue);
            $response = $this->aiService->callAIService($serviceConfig, $prompt);
            
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE && isset($result['items'])) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for invoice items generation: ' . $e->getMessage());
        }
        
        return null;
    }

    /**
     * Analyze spending patterns.
     */
    public function analyzeSpendingPatterns(array $transactions): ?array
    {
        $serviceConfig = $this->aiService->getDefaultService();
        
        if (!$serviceConfig) {
            return null;
        }

        try {
            $prompt = $this->buildSpendingAnalysisPrompt($transactions);
            $response = $this->aiService->callAIService($serviceConfig, $prompt);
            
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for spending analysis: ' . $e->getMessage());
        }
        
        return null;
    }

    /**
     * Build prompt for financial insights.
     */
    private function buildFinancialInsightsPrompt(array $financialData): string
    {
        $prompt = "You are a financial AI assistant. Analyze the following financial data and provide actionable insights.\n\n";
        
        $prompt .= "Financial Summary:\n";
        $prompt .= "Total Balance: $" . number_format($financialData['total_balance'] ?? 0, 2) . "\n";
        $prompt .= "Monthly Income: $" . number_format($financialData['monthly_income'] ?? 0, 2) . "\n";
        $prompt .= "Monthly Expenses: $" . number_format($financialData['monthly_expenses'] ?? 0, 2) . "\n";
        $prompt .= "Net Income: $" . number_format($financialData['net_income'] ?? 0, 2) . "\n";
        
        if (isset($financialData['recent_transactions'])) {
            $prompt .= "\nRecent Transactions:\n";
            foreach (array_slice($financialData['recent_transactions'], 0, 10) as $transaction) {
                $prompt .= "- {$transaction['description']}: $" . number_format($transaction['amount'], 2) . " ({$transaction['type']})\n";
            }
        }
        
        $prompt .= "\nProvide insights in JSON format:\n";
        $prompt .= "{\n";
        $prompt .= '  "insights": ['."\n";
        $prompt .= '    {"type": "warning|info|success", "title": "Insight Title", "message": "Detailed insight"}'."\n";
        $prompt .= '  ],'."\n";
        $prompt .= '  "recommendations": ['."\n";
        $prompt .= '    {"action": "specific action", "impact": "expected impact", "priority": "high|medium|low"}'."\n";
        $prompt .= '  ],'."\n";
        $prompt .= '  "trends": {'."\n";
        $prompt .= '    "spending_trend": "increasing|decreasing|stable",'."\n";
        $prompt .= '    "income_trend": "increasing|decreasing|stable",'."\n";
        $prompt .= '    "cash_flow_health": "excellent|good|concerning|poor"'."\n";
        $prompt .= '  }'."\n";
        $prompt .= "}\n";
        
        return $prompt;
    }

    /**
     * Build prompt for invoice items generation.
     */
    private function buildInvoiceItemsPrompt(string $projectDescription, ?float $estimatedValue): string
    {
        $prompt = "You are a financial AI assistant. Generate professional invoice line items for the following project.\n\n";
        $prompt .= "Project Description: {$projectDescription}\n";
        
        if ($estimatedValue) {
            $prompt .= "Estimated Total Value: $" . number_format($estimatedValue, 2) . "\n";
        }
        
        $prompt .= "\nGenerate appropriate line items with descriptions, quantities, and unit prices.\n";
        $prompt .= "Consider typical business services like:\n";
        $prompt .= "- Consultation and planning\n";
        $prompt .= "- Development/implementation\n";
        $prompt .= "- Testing and quality assurance\n";
        $prompt .= "- Training and support\n";
        $prompt .= "- Project management\n\n";
        
        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "items": ['."\n";
        $prompt .= '    {'."\n";
        $prompt .= '      "description": "Service description",'."\n";
        $prompt .= '      "quantity": 1,'."\n";
        $prompt .= '      "unit_price": 0.00'."\n";
        $prompt .= '    }'."\n";
        $prompt .= '  ],'."\n";
        $prompt .= '  "notes": "Additional notes or terms",'."\n";
        $prompt .= '  "total_estimated": 0.00'."\n";
        $prompt .= "}\n";
        
        return $prompt;
    }

    /**
     * Build prompt for spending analysis.
     */
    private function buildSpendingAnalysisPrompt(array $transactions): string
    {
        $prompt = "You are a financial AI assistant. Analyze the following spending patterns and identify trends.\n\n";
        
        $prompt .= "Transactions (last 30 days):\n";
        foreach ($transactions as $transaction) {
            $prompt .= "- {$transaction['description']}: $" . number_format($transaction['amount'], 2);
            $prompt .= " ({$transaction['category']}) on {$transaction['date']}\n";
        }
        
        $prompt .= "\nAnalyze for:\n";
        $prompt .= "- Spending patterns and trends\n";
        $prompt .= "- Unusual or irregular expenses\n";
        $prompt .= "- Category-wise spending distribution\n";
        $prompt .= "- Potential cost-saving opportunities\n";
        $prompt .= "- Budget recommendations\n\n";
        
        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "patterns": ['."\n";
        $prompt .= '    {"pattern": "description", "frequency": "daily|weekly|monthly", "amount_range": "low|medium|high"}'."\n";
        $prompt .= '  ],'."\n";
        $prompt .= '  "anomalies": ['."\n";
        $prompt .= '    {"description": "unusual expense", "amount": 0.00, "reason": "why it\'s unusual"}'."\n";
        $prompt .= '  ],'."\n";
        $prompt .= '  "category_analysis": {'."\n";
        $prompt .= '    "highest_category": "category name",'."\n";
        $prompt .= '    "fastest_growing": "category name",'."\n";
        $prompt .= '    "recommendations": ["suggestion 1", "suggestion 2"]'."\n";
        $prompt .= '  },'."\n";
        $prompt .= '  "savings_opportunities": ['."\n";
        $prompt .= '    {"area": "expense area", "potential_savings": 0.00, "action": "recommended action"}'."\n";
        $prompt .= '  ]'."\n";
        $prompt .= "}\n";
        
        return $prompt;
    }
}
