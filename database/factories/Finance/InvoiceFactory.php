<?php

namespace Database\Factories\Finance;

use App\Models\Finance\Invoice;
use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 100, 5000);
        $taxRate = $this->faker->randomFloat(2, 0, 25);
        $taxAmount = $subtotal * ($taxRate / 100);
        $discountAmount = $this->faker->randomFloat(2, 0, $subtotal * 0.2);
        $totalAmount = $subtotal + $taxAmount - $discountAmount;
        
        $statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
        $currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
        
        $issueDate = $this->faker->dateTimeBetween('-6 months', 'now');
        $dueDate = (clone $issueDate)->modify('+30 days');

        return [
            'invoice_number' => 'INV-' . $this->faker->unique()->numerify('######'),
            'status' => $this->faker->randomElement($statuses),
            'issue_date' => $issueDate,
            'due_date' => $dueDate,
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
            'paid_amount' => 0.00,
            'currency' => $this->faker->randomElement($currencies),
            'notes' => $this->faker->optional()->paragraph(),
            'terms' => $this->faker->optional()->sentence(),
            'billable_type' => $this->faker->randomElement(['App\\Models\\Client', 'App\\Models\\Lead']),
            'billable_id' => function (array $attributes) {
                return $attributes['billable_type'] === 'App\\Models\\Client' 
                    ? Client::factory()->create()->id
                    : Lead::factory()->create()->id;
            },
            'user_id' => User::factory(),
        ];
    }

    /**
     * Create a draft invoice.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'paid_amount' => 0.00,
        ]);
    }

    /**
     * Create a sent invoice.
     */
    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'sent',
            'paid_amount' => 0.00,
        ]);
    }

    /**
     * Create a paid invoice.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'paid_amount' => $attributes['total_amount'],
        ]);
    }

    /**
     * Create a partially paid invoice.
     */
    public function partiallyPaid(): static
    {
        return $this->state(function (array $attributes) {
            $partialAmount = $attributes['total_amount'] * $this->faker->randomFloat(2, 0.1, 0.9);
            return [
                'status' => 'sent',
                'paid_amount' => $partialAmount,
            ];
        });
    }

    /**
     * Create an overdue invoice.
     */
    public function overdue(): static
    {
        $pastDate = $this->faker->dateTimeBetween('-6 months', '-1 month');
        $overdueDueDate = (clone $pastDate)->modify('+15 days');

        return $this->state(fn (array $attributes) => [
            'status' => 'overdue',
            'issue_date' => $pastDate,
            'due_date' => $overdueDueDate,
            'paid_amount' => 0.00,
        ]);
    }

    /**
     * Create a cancelled invoice.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'paid_amount' => 0.00,
        ]);
    }

    /**
     * Create an invoice for a specific client.
     */
    public function forClient(Client $client): static
    {
        return $this->state(fn (array $attributes) => [
            'billable_type' => 'App\\Models\\Client',
            'billable_id' => $client->id,
        ]);
    }

    /**
     * Create an invoice for a specific lead.
     */
    public function forLead(Lead $lead): static
    {
        return $this->state(fn (array $attributes) => [
            'billable_type' => 'App\\Models\\Lead',
            'billable_id' => $lead->id,
        ]);
    }

    /**
     * Create an invoice for a specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Create an invoice with a specific amount.
     */
    public function withAmount(float $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'subtotal' => $amount,
            'tax_amount' => $amount * 0.1, // 10% tax
            'discount_amount' => 0.00,
            'total_amount' => $amount * 1.1,
        ]);
    }

    /**
     * Create an invoice with a specific currency.
     */
    public function withCurrency(string $currency): static
    {
        return $this->state(fn (array $attributes) => [
            'currency' => $currency,
        ]);
    }

    /**
     * Create an invoice due in a specific number of days.
     */
    public function dueInDays(int $days): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => now()->addDays($days),
        ]);
    }

    /**
     * Create a recent invoice (within last 30 days).
     */
    public function recent(): static
    {
        $issueDate = $this->faker->dateTimeBetween('-30 days', 'now');
        $dueDate = (clone $issueDate)->modify('+30 days');

        return $this->state(fn (array $attributes) => [
            'issue_date' => $issueDate,
            'due_date' => $dueDate,
        ]);
    }
}
