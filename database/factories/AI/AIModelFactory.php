<?php

namespace Database\Factories\AI;

use App\Models\AI\AIModel;
use App\Models\AI\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AI\AIModel>
 */
class AIModelFactory extends Factory
{
    protected $model = AIModel::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['chat', 'completion', 'embedding', 'image', 'audio'];
        $type = $this->faker->randomElement($types);
        
        return [
            'ai_service_id' => Service::factory(),
            'name' => $this->faker->words(2, true) . ' Model',
            'slug' => $this->faker->unique()->slug,
            'model_identifier' => $this->faker->slug . '-' . $this->faker->randomNumber(3),
            'type' => $type,
            'description' => $this->faker->sentence,
            'is_enabled' => $this->faker->boolean(80), // 80% chance of being enabled
            'is_default' => false, // Will be set explicitly when needed
            'capabilities' => $this->getCapabilities($type),
            'max_tokens' => $this->faker->numberBetween(1000, 8000),
            'temperature' => $this->faker->randomFloat(2, 0, 2),
            'top_p' => $this->faker->randomFloat(2, 0, 1),
            'frequency_penalty' => $this->faker->numberBetween(-2, 2),
            'presence_penalty' => $this->faker->numberBetween(-2, 2),
            'cost_per_input_token' => $this->faker->randomFloat(8, 0.00001, 0.001),
            'cost_per_output_token' => $this->faker->randomFloat(8, 0.00001, 0.001),
            'configuration' => [
                'timeout' => $this->faker->numberBetween(10, 60),
                'max_retries' => $this->faker->numberBetween(1, 5),
            ],
        ];
    }

    /**
     * Get capabilities based on model type.
     */
    private function getCapabilities(string $type): array
    {
        $baseCapabilities = ['text-generation'];
        
        return match($type) {
            'chat' => [...$baseCapabilities, 'conversation', 'context-awareness'],
            'completion' => [...$baseCapabilities, 'text-completion', 'code-completion'],
            'embedding' => ['text-embedding', 'similarity-search', 'semantic-search'],
            'image' => ['image-generation', 'image-editing', 'image-analysis'],
            'audio' => ['speech-to-text', 'text-to-speech', 'audio-analysis'],
            default => $baseCapabilities,
        };
    }

    /**
     * Indicate that the model is enabled.
     */
    public function enabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_enabled' => true,
        ]);
    }

    /**
     * Indicate that the model is disabled.
     */
    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_enabled' => false,
        ]);
    }

    /**
     * Indicate that the model is the default for its type.
     */
    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
            'is_enabled' => true,
        ]);
    }

    /**
     * Create a chat model.
     */
    public function chat(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'chat',
            'capabilities' => ['text-generation', 'conversation', 'context-awareness'],
            'max_tokens' => 4000,
        ]);
    }

    /**
     * Create a completion model.
     */
    public function completion(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'completion',
            'capabilities' => ['text-generation', 'text-completion', 'code-completion'],
            'max_tokens' => 2000,
        ]);
    }

    /**
     * Create an embedding model.
     */
    public function embedding(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'embedding',
            'capabilities' => ['text-embedding', 'similarity-search', 'semantic-search'],
            'max_tokens' => 512,
            'temperature' => 0, // Embeddings don't use temperature
        ]);
    }

    /**
     * Create an image model.
     */
    public function image(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'image',
            'capabilities' => ['image-generation', 'image-editing', 'image-analysis'],
            'max_tokens' => 1000,
        ]);
    }

    /**
     * Create an audio model.
     */
    public function audio(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'audio',
            'capabilities' => ['speech-to-text', 'text-to-speech', 'audio-analysis'],
            'max_tokens' => 1000,
        ]);
    }

    /**
     * Create a high-performance model.
     */
    public function highPerformance(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_tokens' => 8000,
            'cost_per_input_token' => 0.001,
            'cost_per_output_token' => 0.002,
        ]);
    }

    /**
     * Create a low-cost model.
     */
    public function lowCost(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_tokens' => 2000,
            'cost_per_input_token' => 0.00001,
            'cost_per_output_token' => 0.00002,
        ]);
    }
}
