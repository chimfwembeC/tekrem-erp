<?php

namespace Database\Factories\AI;

use App\Models\AI\Conversation;
use App\Models\AI\AIModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AI\Conversation>
 */
class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $messageCount = $this->faker->numberBetween(1, 10);
        $messages = $this->generateMessages($messageCount);
        
        return [
            'user_id' => User::factory(),
            'ai_model_id' => AIModel::factory(),
            'title' => $this->faker->sentence(4),
            'context_type' => $this->faker->randomElement(['crm', 'finance', 'support', 'general']),
            'context_id' => $this->faker->optional()->randomNumber(5),
            'messages' => $messages,
            'metadata' => [
                'source' => $this->faker->randomElement(['dashboard', 'api', 'widget']),
                'user_agent' => $this->faker->userAgent,
                'ip_address' => $this->faker->ipv4,
            ],
            'total_tokens' => $this->faker->numberBetween(100, 5000),
            'total_cost' => $this->faker->randomFloat(4, 0.01, 10),
            'message_count' => $messageCount,
            'last_message_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'is_archived' => $this->faker->boolean(20), // 20% chance of being archived
        ];
    }

    /**
     * Generate realistic conversation messages.
     */
    private function generateMessages(int $count): array
    {
        $messages = [];
        $timestamp = now()->subHours($count);
        
        for ($i = 0; $i < $count; $i++) {
            $role = $i % 2 === 0 ? 'user' : 'assistant';
            
            $messages[] = [
                'role' => $role,
                'content' => $this->getMessageContent($role),
                'timestamp' => $timestamp->addMinutes(rand(1, 30))->toISOString(),
                'metadata' => [
                    'tokens' => rand(10, 200),
                    'response_time_ms' => $role === 'assistant' ? rand(500, 3000) : null,
                ]
            ];
        }
        
        return $messages;
    }

    /**
     * Get realistic message content based on role.
     */
    private function getMessageContent(string $role): string
    {
        if ($role === 'user') {
            return $this->faker->randomElement([
                'Can you help me analyze this customer data?',
                'What are the best practices for lead qualification?',
                'How can I improve our sales conversion rate?',
                'Generate a follow-up email for this prospect',
                'Summarize the key points from this meeting',
                'What should I prioritize in my sales pipeline?',
                'Help me categorize these support tickets',
                'Create a proposal template for this client',
            ]);
        }
        
        return $this->faker->randomElement([
            'I\'d be happy to help you analyze that customer data. Let me break down the key insights...',
            'Here are the best practices for lead qualification that I recommend...',
            'To improve your sales conversion rate, consider these strategies...',
            'I\'ve generated a personalized follow-up email based on your prospect\'s profile...',
            'Here\'s a summary of the key points from your meeting...',
            'Based on your current pipeline, I recommend prioritizing these opportunities...',
            'I\'ve categorized your support tickets by priority and type...',
            'I\'ve created a customized proposal template for your client...',
        ]);
    }

    /**
     * Indicate that the conversation is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_archived' => false,
            'last_message_at' => now()->subMinutes(rand(1, 60)),
        ]);
    }

    /**
     * Indicate that the conversation is archived.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_archived' => true,
            'last_message_at' => now()->subDays(rand(7, 30)),
        ]);
    }

    /**
     * Create a conversation with specific context.
     */
    public function withContext(string $type, ?int $id = null): static
    {
        return $this->state(fn (array $attributes) => [
            'context_type' => $type,
            'context_id' => $id ?? $this->faker->randomNumber(5),
        ]);
    }

    /**
     * Create a CRM-related conversation.
     */
    public function crm(): static
    {
        return $this->withContext('crm');
    }

    /**
     * Create a finance-related conversation.
     */
    public function finance(): static
    {
        return $this->withContext('finance');
    }

    /**
     * Create a support-related conversation.
     */
    public function support(): static
    {
        return $this->withContext('support');
    }

    /**
     * Create a conversation with many messages.
     */
    public function lengthy(): static
    {
        return $this->state(function (array $attributes) {
            $messageCount = $this->faker->numberBetween(15, 30);
            return [
                'messages' => $this->generateMessages($messageCount),
                'message_count' => $messageCount,
                'total_tokens' => $this->faker->numberBetween(2000, 10000),
                'total_cost' => $this->faker->randomFloat(4, 5, 50),
            ];
        });
    }

    /**
     * Create a recent conversation.
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => now()->subHours(rand(1, 24)),
            'last_message_at' => now()->subMinutes(rand(1, 60)),
        ]);
    }

    /**
     * Create an expensive conversation (high token usage).
     */
    public function expensive(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_tokens' => $this->faker->numberBetween(5000, 20000),
            'total_cost' => $this->faker->randomFloat(4, 20, 100),
        ]);
    }
}
