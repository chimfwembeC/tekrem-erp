<?php

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinanceTemplate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'description',
        'template_data',
        'is_default',
        'is_active',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'template_data' => 'array',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the template.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include active templates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include templates of a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include default templates.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Get the default template for a specific type and user.
     */
    public static function getDefaultTemplate($type, $userId)
    {
        return static::where('type', $type)
            ->where('user_id', $userId)
            ->where('is_default', true)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Create a quotation from this template.
     */
    public function createQuotation($leadId, $additionalData = [])
    {
        if ($this->type !== 'quotation') {
            throw new \Exception('This template is not for quotations');
        }

        $templateData = $this->template_data;
        
        $quotationData = array_merge([
            'lead_id' => $leadId,
            'issue_date' => now()->toDateString(),
            'expiry_date' => now()->addDays($templateData['default_expiry_days'] ?? 30)->toDateString(),
            'currency' => $templateData['default_currency'] ?? 'USD',
            'status' => 'draft',
            'notes' => $templateData['default_notes'] ?? '',
            'terms' => $templateData['default_terms'] ?? '',
            'tax_rate' => $templateData['default_tax_rate'] ?? 0,
            'discount_amount' => 0,
            'user_id' => $this->user_id,
        ], $additionalData);

        $quotation = Quotation::create($quotationData);

        // Add template items
        if (isset($templateData['items']) && is_array($templateData['items'])) {
            foreach ($templateData['items'] as $itemData) {
                $quotation->items()->create([
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'] ?? 1,
                    'unit_price' => $itemData['unit_price'] ?? 0,
                    'total_price' => ($itemData['quantity'] ?? 1) * ($itemData['unit_price'] ?? 0),
                ]);
            }
        }

        // Recalculate totals
        $quotation->calculateTotals();

        return $quotation;
    }

    /**
     * Create an invoice from this template.
     */
    public function createInvoice($billableType, $billableId, $additionalData = [])
    {
        if ($this->type !== 'invoice') {
            throw new \Exception('This template is not for invoices');
        }

        $templateData = $this->template_data;
        
        $invoiceData = array_merge([
            'billable_type' => $billableType,
            'billable_id' => $billableId,
            'issue_date' => now()->toDateString(),
            'due_date' => now()->addDays($templateData['default_due_days'] ?? 30)->toDateString(),
            'currency' => $templateData['default_currency'] ?? 'USD',
            'status' => 'draft',
            'notes' => $templateData['default_notes'] ?? '',
            'terms' => $templateData['default_terms'] ?? '',
            'tax_rate' => $templateData['default_tax_rate'] ?? 0,
            'discount_amount' => 0,
            'user_id' => $this->user_id,
        ], $additionalData);

        $invoice = Invoice::create($invoiceData);

        // Add template items
        if (isset($templateData['items']) && is_array($templateData['items'])) {
            foreach ($templateData['items'] as $itemData) {
                $invoice->items()->create([
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'] ?? 1,
                    'unit_price' => $itemData['unit_price'] ?? 0,
                    'total_price' => ($itemData['quantity'] ?? 1) * ($itemData['unit_price'] ?? 0),
                ]);
            }
        }

        // Recalculate totals
        $invoice->calculateTotals();

        return $invoice;
    }

    /**
     * Set this template as default for its type.
     */
    public function setAsDefault()
    {
        // Remove default flag from other templates of the same type for this user
        static::where('type', $this->type)
            ->where('user_id', $this->user_id)
            ->where('id', '!=', $this->id)
            ->update(['is_default' => false]);

        // Set this template as default
        $this->update(['is_default' => true]);
    }

    /**
     * Get template preview data.
     */
    public function getPreviewData()
    {
        $templateData = $this->template_data;
        
        return [
            'name' => $this->name,
            'type' => $this->type,
            'description' => $this->description,
            'currency' => $templateData['default_currency'] ?? 'USD',
            'tax_rate' => $templateData['default_tax_rate'] ?? 0,
            'items_count' => count($templateData['items'] ?? []),
            'estimated_total' => $this->calculateEstimatedTotal(),
            'default_terms' => $templateData['default_terms'] ?? '',
            'default_notes' => $templateData['default_notes'] ?? '',
        ];
    }

    /**
     * Calculate estimated total from template items.
     */
    private function calculateEstimatedTotal()
    {
        $templateData = $this->template_data;
        $subtotal = 0;

        if (isset($templateData['items']) && is_array($templateData['items'])) {
            foreach ($templateData['items'] as $item) {
                $quantity = $item['quantity'] ?? 1;
                $unitPrice = $item['unit_price'] ?? 0;
                $subtotal += $quantity * $unitPrice;
            }
        }

        $taxRate = $templateData['default_tax_rate'] ?? 0;
        $taxAmount = ($subtotal * $taxRate) / 100;

        return $subtotal + $taxAmount;
    }

    /**
     * Duplicate this template.
     */
    public function duplicate($newName = null)
    {
        $newTemplate = $this->replicate();
        $newTemplate->name = $newName ?: $this->name . ' (Copy)';
        $newTemplate->is_default = false;
        $newTemplate->save();

        return $newTemplate;
    }
}
