<?php

namespace App\Models\CMS;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Template extends Model
{
    use HasFactory;

    protected $table = 'cms_templates';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'content',
        'fields',
        'settings',
        'preview_image',
        'category',
        'is_active',
        'is_default',
        'created_by',
    ];

    protected $casts = [
        'fields' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    /**
     * Get the user who created this template.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get pages using this template.
     */
    public function pages(): HasMany
    {
        return $this->hasMany(Page::class, 'template', 'slug');
    }

    /**
     * Scope for active templates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for default template.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope by category.
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Generate a unique slug for the template.
     */
    public function generateSlug(): string
    {
        $slug = Str::slug($this->name);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->where('id', '!=', $this->id)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Set as default template.
     */
    public function setAsDefault(): bool
    {
        // Remove default from other templates
        static::where('is_default', true)->update(['is_default' => false]);
        
        // Set this template as default
        $this->update(['is_default' => true]);

        return true;
    }

    /**
     * Get template fields with default values.
     */
    public function getFieldsWithDefaults(): array
    {
        $fields = $this->fields ?? [];
        $fieldsWithDefaults = [];

        foreach ($fields as $field) {
            $fieldsWithDefaults[$field['name']] = [
                'type' => $field['type'],
                'label' => $field['label'],
                'default' => $field['default'] ?? null,
                'required' => $field['required'] ?? false,
                'options' => $field['options'] ?? null,
                'validation' => $field['validation'] ?? null,
            ];
        }

        return $fieldsWithDefaults;
    }

    /**
     * Validate field data against template fields.
     */
    public function validateFieldData(array $data): array
    {
        $errors = [];
        $fields = $this->getFieldsWithDefaults();

        foreach ($fields as $fieldName => $fieldConfig) {
            $value = $data[$fieldName] ?? null;

            // Check required fields
            if ($fieldConfig['required'] && empty($value)) {
                $errors[$fieldName] = "The {$fieldConfig['label']} field is required.";
                continue;
            }

            // Type validation
            if (!empty($value)) {
                switch ($fieldConfig['type']) {
                    case 'email':
                        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $errors[$fieldName] = "The {$fieldConfig['label']} must be a valid email address.";
                        }
                        break;
                    case 'url':
                        if (!filter_var($value, FILTER_VALIDATE_URL)) {
                            $errors[$fieldName] = "The {$fieldConfig['label']} must be a valid URL.";
                        }
                        break;
                    case 'number':
                        if (!is_numeric($value)) {
                            $errors[$fieldName] = "The {$fieldConfig['label']} must be a number.";
                        }
                        break;
                    case 'select':
                        if (!empty($fieldConfig['options']) && !in_array($value, array_keys($fieldConfig['options']))) {
                            $errors[$fieldName] = "The selected {$fieldConfig['label']} is invalid.";
                        }
                        break;
                }
            }

            // Custom validation rules
            if (!empty($fieldConfig['validation']) && !empty($value)) {
                $rules = explode('|', $fieldConfig['validation']);
                foreach ($rules as $rule) {
                    if (strpos($rule, 'min:') === 0) {
                        $min = (int) substr($rule, 4);
                        if (strlen($value) < $min) {
                            $errors[$fieldName] = "The {$fieldConfig['label']} must be at least {$min} characters.";
                        }
                    } elseif (strpos($rule, 'max:') === 0) {
                        $max = (int) substr($rule, 4);
                        if (strlen($value) > $max) {
                            $errors[$fieldName] = "The {$fieldConfig['label']} may not be greater than {$max} characters.";
                        }
                    }
                }
            }
        }

        return $errors;
    }

    /**
     * Render template with data.
     */
    public function render(array $data = []): string
    {
        $content = $this->content;
        
        // Replace template variables
        foreach ($data as $key => $value) {
            $content = str_replace("{{$key}}", $value, $content);
        }

        // Replace any remaining variables with empty strings
        $content = preg_replace('/\{\{[^}]+\}\}/', '', $content);

        return $content;
    }

    /**
     * Get available template categories.
     */
    public static function getCategories(): array
    {
        return [
            'general' => 'General',
            'landing' => 'Landing Pages',
            'blog' => 'Blog',
            'portfolio' => 'Portfolio',
            'ecommerce' => 'E-commerce',
            'corporate' => 'Corporate',
            'personal' => 'Personal',
            'custom' => 'Custom',
        ];
    }

    /**
     * Get usage statistics.
     */
    public function getUsageStats(): array
    {
        $pagesCount = $this->pages()->count();
        $publishedPagesCount = $this->pages()->published()->count();

        return [
            'total_pages' => $pagesCount,
            'published_pages' => $publishedPagesCount,
            'draft_pages' => $pagesCount - $publishedPagesCount,
            'last_used' => $this->pages()->latest('updated_at')->first()?->updated_at,
        ];
    }
}
