<?php

namespace Database\Factories\AI;

use App\Models\AI\UsageLog;
use App\Models\AI\AIModel;
use App\Models\AI\Conversation;
use App\Models\AI\PromptTemplate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AI\UsageLog>
 */
class UsageLogFactory extends Factory
{
    protected $model = UsageLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $operationType = $this->faker->randomElement(['chat', 'completion', 'embedding', 'analysis']);
        $status = $this->faker->randomElement(['success', 'error', 'timeout']);
        
        $inputTokens = $this->faker->numberBetween(10, 1000);
        $outputTokens = $status === 'success' ? $this->faker->numberBetween(10, 2000) : 0;
        $totalTokens = $inputTokens + $outputTokens;
        
        $costPerToken = $this->faker->randomFloat(8, 0.00001, 0.001);
        $cost = $totalTokens * $costPerToken;
        
        return [
            'user_id' => User::factory(),
            'ai_model_id' => AIModel::factory(),
            'ai_conversation_id' => $this->faker->optional(0.7)->randomElement([null, Conversation::factory()]),
            'ai_prompt_template_id' => $this->faker->optional(0.3)->randomElement([null, PromptTemplate::factory()]),
            'operation_type' => $operationType,
            'context_type' => $this->faker->optional()->randomElement(['crm', 'finance', 'support', 'general']),
            'context_id' => $this->faker->optional()->randomNumber(5),
            'prompt' => $this->getPromptForOperation($operationType),
            'response' => $status === 'success' ? $this->getResponseForOperation($operationType) : null,
            'input_tokens' => $inputTokens,
            'output_tokens' => $outputTokens,
            'total_tokens' => $totalTokens,
            'cost' => $cost,
            'response_time_ms' => $status === 'success' ? $this->faker->numberBetween(200, 5000) : null,
            'status' => $status,
            'error_message' => $status !== 'success' ? $this->getErrorMessage($status) : null,
            'metadata' => $this->getMetadata($operationType, $status),
        ];
    }

    /**
     * Get realistic prompt based on operation type.
     */
    private function getPromptForOperation(string $operationType): string
    {
        return match($operationType) {
            'chat' => $this->faker->randomElement([
                'Help me analyze this customer data and provide insights.',
                'What are the best practices for lead qualification?',
                'Can you summarize the key points from this meeting?',
                'Generate a follow-up email for this prospect.',
            ]),
            'completion' => $this->faker->randomElement([
                'Complete this sentence: The best way to improve sales conversion is',
                'Finish this email: Dear valued customer, we are writing to inform you',
                'Complete this analysis: Based on the quarterly data, we can conclude',
            ]),
            'embedding' => $this->faker->randomElement([
                'Customer feedback: "Great product, excellent support, would recommend"',
                'Product description: "Advanced CRM software for small businesses"',
                'Support ticket: "Unable to login after password reset"',
            ]),
            'analysis' => $this->faker->randomElement([
                'Analyze this sales data and identify trends and opportunities.',
                'Review this customer feedback and categorize the sentiment.',
                'Examine this financial report and highlight key insights.',
            ]),
            default => 'General AI request for processing.',
        };
    }

    /**
     * Get realistic response based on operation type.
     */
    private function getResponseForOperation(string $operationType): string
    {
        return match($operationType) {
            'chat' => $this->faker->randomElement([
                'Based on the customer data analysis, I can see several key insights...',
                'Here are the best practices for lead qualification that I recommend...',
                'The key points from your meeting include: 1) Budget approval, 2) Timeline...',
                'I\'ve generated a personalized follow-up email based on your conversation...',
            ]),
            'completion' => $this->faker->randomElement([
                'to focus on understanding customer needs and providing personalized solutions.',
                'about the upcoming changes to our service terms and conditions.',
                'that there has been significant growth in the enterprise segment.',
            ]),
            'embedding' => '[0.1234, -0.5678, 0.9012, ...]', // Simplified embedding representation
            'analysis' => $this->faker->randomElement([
                'Analysis complete. Key trends: 15% increase in Q4, strong performance in enterprise segment.',
                'Sentiment analysis: 78% positive, 15% neutral, 7% negative. Main themes: product quality, support.',
                'Financial insights: Revenue up 12%, expenses controlled, strong cash flow position.',
            ]),
            default => 'AI processing completed successfully.',
        };
    }

    /**
     * Get error message based on status.
     */
    private function getErrorMessage(string $status): string
    {
        return match($status) {
            'error' => $this->faker->randomElement([
                'API rate limit exceeded',
                'Invalid request format',
                'Model temporarily unavailable',
                'Authentication failed',
                'Token limit exceeded',
            ]),
            'timeout' => $this->faker->randomElement([
                'Request timeout after 30 seconds',
                'Model response timeout',
                'Network timeout',
                'Processing timeout',
            ]),
            default => 'Unknown error occurred',
        };
    }

    /**
     * Get metadata based on operation and status.
     */
    private function getMetadata(string $operationType, string $status): array
    {
        $metadata = [
            'operation_type' => $operationType,
            'model_version' => $this->faker->randomElement(['v1.0', 'v1.1', 'v2.0']),
            'request_id' => $this->faker->uuid,
        ];

        if ($status === 'success') {
            $metadata['confidence_score'] = $this->faker->randomFloat(2, 0.7, 1.0);
            $metadata['processing_time_breakdown'] = [
                'preprocessing' => $this->faker->numberBetween(10, 100),
                'inference' => $this->faker->numberBetween(100, 1000),
                'postprocessing' => $this->faker->numberBetween(5, 50),
            ];
        }

        return $metadata;
    }

    /**
     * Create a successful usage log.
     */
    public function successful(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'success',
            'error_message' => null,
            'response_time_ms' => $this->faker->numberBetween(200, 2000),
        ]);
    }

    /**
     * Create a failed usage log.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'error',
            'response' => null,
            'output_tokens' => 0,
            'response_time_ms' => null,
        ]);
    }

    /**
     * Create a timeout usage log.
     */
    public function timeout(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'timeout',
            'response' => null,
            'output_tokens' => 0,
            'response_time_ms' => null,
        ]);
    }

    /**
     * Create a chat operation log.
     */
    public function chat(): static
    {
        return $this->state(fn (array $attributes) => [
            'operation_type' => 'chat',
            'ai_conversation_id' => Conversation::factory(),
        ]);
    }

    /**
     * Create a completion operation log.
     */
    public function completion(): static
    {
        return $this->state(fn (array $attributes) => [
            'operation_type' => 'completion',
        ]);
    }

    /**
     * Create an embedding operation log.
     */
    public function embedding(): static
    {
        return $this->state(fn (array $attributes) => [
            'operation_type' => 'embedding',
            'output_tokens' => 0, // Embeddings don't have output tokens
        ]);
    }

    /**
     * Create a high-cost usage log.
     */
    public function expensive(): static
    {
        return $this->state(function (array $attributes) {
            $inputTokens = $this->faker->numberBetween(2000, 5000);
            $outputTokens = $this->faker->numberBetween(2000, 8000);
            $totalTokens = $inputTokens + $outputTokens;
            
            return [
                'input_tokens' => $inputTokens,
                'output_tokens' => $outputTokens,
                'total_tokens' => $totalTokens,
                'cost' => $this->faker->randomFloat(4, 5, 50),
            ];
        });
    }

    /**
     * Create a recent usage log.
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => now()->subMinutes(rand(1, 60)),
        ]);
    }

    /**
     * Create usage log with specific context.
     */
    public function withContext(string $type, ?int $id = null): static
    {
        return $this->state(fn (array $attributes) => [
            'context_type' => $type,
            'context_id' => $id ?? $this->faker->randomNumber(5),
        ]);
    }
}
