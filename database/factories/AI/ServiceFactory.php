<?php

namespace Database\Factories\AI;

use App\Models\AI\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AI\Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $providers = ['mistral', 'openai', 'anthropic'];
        $provider = $this->faker->randomElement($providers);
        
        return [
            'name' => $this->faker->company . ' AI Service',
            'slug' => $this->faker->unique()->slug,
            'provider' => $provider,
            'api_key' => $this->faker->uuid,
            'api_url' => $this->getApiUrl($provider),
            'configuration' => [
                'timeout' => $this->faker->numberBetween(10, 60),
                'retry_attempts' => $this->faker->numberBetween(1, 5),
            ],
            'is_enabled' => $this->faker->boolean(80), // 80% chance of being enabled
            'is_default' => false, // Will be set explicitly when needed
            'priority' => $this->faker->numberBetween(0, 10),
            'description' => $this->faker->sentence,
            'supported_features' => $this->getSupportedFeatures($provider),
            'cost_per_token' => $this->faker->randomFloat(8, 0.00001, 0.001),
            'rate_limit_per_minute' => $this->faker->numberBetween(10, 1000),
            'max_tokens_per_request' => $this->faker->numberBetween(1000, 8000),
        ];
    }

    /**
     * Get API URL based on provider.
     */
    private function getApiUrl(string $provider): string
    {
        return match($provider) {
            'mistral' => 'https://api.mistral.ai/v1',
            'openai' => 'https://api.openai.com/v1',
            'anthropic' => 'https://api.anthropic.com/v1',
            default => 'https://api.example.com/v1',
        };
    }

    /**
     * Get supported features based on provider.
     */
    private function getSupportedFeatures(string $provider): array
    {
        $baseFeatures = ['chat', 'completion'];
        
        return match($provider) {
            'openai' => [...$baseFeatures, 'embedding', 'image', 'audio'],
            'anthropic' => [...$baseFeatures, 'analysis'],
            'mistral' => [...$baseFeatures, 'embedding'],
            default => $baseFeatures,
        };
    }

    /**
     * Indicate that the service is enabled.
     */
    public function enabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_enabled' => true,
        ]);
    }

    /**
     * Indicate that the service is disabled.
     */
    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_enabled' => false,
        ]);
    }

    /**
     * Indicate that the service is the default.
     */
    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
            'is_enabled' => true,
        ]);
    }

    /**
     * Create a Mistral AI service.
     */
    public function mistral(): static
    {
        return $this->state(fn (array $attributes) => [
            'provider' => 'mistral',
            'api_url' => 'https://api.mistral.ai/v1',
            'supported_features' => ['chat', 'completion', 'embedding'],
        ]);
    }

    /**
     * Create an OpenAI service.
     */
    public function openai(): static
    {
        return $this->state(fn (array $attributes) => [
            'provider' => 'openai',
            'api_url' => 'https://api.openai.com/v1',
            'supported_features' => ['chat', 'completion', 'embedding', 'image', 'audio'],
        ]);
    }

    /**
     * Create an Anthropic service.
     */
    public function anthropic(): static
    {
        return $this->state(fn (array $attributes) => [
            'provider' => 'anthropic',
            'api_url' => 'https://api.anthropic.com/v1',
            'supported_features' => ['chat', 'completion', 'analysis'],
        ]);
    }
}
