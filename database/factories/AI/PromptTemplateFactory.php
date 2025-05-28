<?php

namespace Database\Factories\AI;

use App\Models\AI\PromptTemplate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AI\PromptTemplate>
 */
class PromptTemplateFactory extends Factory
{
    protected $model = PromptTemplate::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $category = $this->faker->randomElement(['crm', 'finance', 'support', 'general', 'marketing']);
        $templateData = $this->getTemplateData($category);
        
        return [
            'user_id' => User::factory(),
            'name' => $templateData['name'],
            'slug' => $this->faker->unique()->slug,
            'category' => $category,
            'description' => $templateData['description'],
            'template' => $templateData['template'],
            'variables' => $templateData['variables'],
            'example_data' => $templateData['example_data'],
            'is_public' => $this->faker->boolean(30), // 30% chance of being public
            'is_system' => false, // Will be set explicitly when needed
            'usage_count' => $this->faker->numberBetween(0, 100),
            'avg_rating' => $this->faker->optional(0.7)->randomFloat(2, 1, 5), // 70% chance of having a rating
            'tags' => $this->faker->randomElements(['ai', 'automation', 'template', 'productivity', 'analysis'], rand(1, 3)),
        ];
    }

    /**
     * Get template data based on category.
     */
    private function getTemplateData(string $category): array
    {
        return match($category) {
            'crm' => [
                'name' => 'Lead Qualification Template',
                'description' => 'Analyze and qualify leads based on provided information',
                'template' => 'Analyze the following lead: {{name}} from {{company}}. Their role is {{position}} and they showed interest in {{interest}}. Provide qualification score and next steps.',
                'variables' => ['name', 'company', 'position', 'interest'],
                'example_data' => [
                    'name' => 'John Smith',
                    'company' => 'Tech Corp',
                    'position' => 'CTO',
                    'interest' => 'AI solutions'
                ]
            ],
            'finance' => [
                'name' => 'Expense Analysis Template',
                'description' => 'Categorize and analyze financial expenses',
                'template' => 'Categorize this expense: {{description}} for {{amount}} from {{vendor}} on {{date}}. Suggest category and tax implications.',
                'variables' => ['description', 'amount', 'vendor', 'date'],
                'example_data' => [
                    'description' => 'Office supplies',
                    'amount' => '$150.00',
                    'vendor' => 'Office Depot',
                    'date' => '2024-01-15'
                ]
            ],
            'support' => [
                'name' => 'Ticket Triage Template',
                'description' => 'Analyze support tickets for priority and routing',
                'template' => 'Analyze this support ticket: "{{title}}" - {{description}}. Customer: {{customer}}. Suggest priority level and department routing.',
                'variables' => ['title', 'description', 'customer'],
                'example_data' => [
                    'title' => 'Login Issues',
                    'description' => 'Cannot access account after password reset',
                    'customer' => 'Jane Doe'
                ]
            ],
            'marketing' => [
                'name' => 'Content Generation Template',
                'description' => 'Generate marketing content for campaigns',
                'template' => 'Create {{content_type}} for {{product}} targeting {{audience}}. Key benefits: {{benefits}}. Tone: {{tone}}.',
                'variables' => ['content_type', 'product', 'audience', 'benefits', 'tone'],
                'example_data' => [
                    'content_type' => 'social media post',
                    'product' => 'CRM Software',
                    'audience' => 'small businesses',
                    'benefits' => 'increased sales, better organization',
                    'tone' => 'professional yet friendly'
                ]
            ],
            default => [
                'name' => 'General Analysis Template',
                'description' => 'General purpose analysis template',
                'template' => 'Analyze the following information: {{content}}. Provide insights and recommendations.',
                'variables' => ['content'],
                'example_data' => [
                    'content' => 'Sample content to analyze'
                ]
            ]
        };
    }

    /**
     * Indicate that the template is public.
     */
    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => true,
        ]);
    }

    /**
     * Indicate that the template is private.
     */
    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => false,
        ]);
    }

    /**
     * Indicate that the template is a system template.
     */
    public function system(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system' => true,
            'is_public' => true,
        ]);
    }

    /**
     * Create a popular template (high usage).
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'usage_count' => $this->faker->numberBetween(100, 1000),
            'avg_rating' => $this->faker->randomFloat(2, 4, 5),
        ]);
    }

    /**
     * Create a highly rated template.
     */
    public function highlyRated(): static
    {
        return $this->state(fn (array $attributes) => [
            'avg_rating' => $this->faker->randomFloat(2, 4.5, 5),
            'usage_count' => $this->faker->numberBetween(50, 200),
        ]);
    }

    /**
     * Create a CRM template.
     */
    public function crm(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'crm',
            'tags' => ['crm', 'sales', 'leads', 'qualification'],
        ]);
    }

    /**
     * Create a finance template.
     */
    public function finance(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'finance',
            'tags' => ['finance', 'accounting', 'expenses', 'analysis'],
        ]);
    }

    /**
     * Create a support template.
     */
    public function support(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'support',
            'tags' => ['support', 'tickets', 'customer-service', 'triage'],
        ]);
    }

    /**
     * Create a marketing template.
     */
    public function marketing(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'marketing',
            'tags' => ['marketing', 'content', 'campaigns', 'social-media'],
        ]);
    }

    /**
     * Create a template with many variables.
     */
    public function complex(): static
    {
        return $this->state(fn (array $attributes) => [
            'template' => 'Complex template with {{var1}}, {{var2}}, {{var3}}, {{var4}}, and {{var5}}. Analysis: {{analysis_type}}.',
            'variables' => ['var1', 'var2', 'var3', 'var4', 'var5', 'analysis_type'],
            'example_data' => [
                'var1' => 'value1',
                'var2' => 'value2',
                'var3' => 'value3',
                'var4' => 'value4',
                'var5' => 'value5',
                'analysis_type' => 'comprehensive'
            ]
        ]);
    }
}
