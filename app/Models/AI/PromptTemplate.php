<?php

namespace App\Models\AI;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PromptTemplate extends Model
{
    use HasFactory;

    protected $table = 'ai_prompt_templates';

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'category',
        'description',
        'template',
        'variables',
        'example_data',
        'is_public',
        'is_system',
        'usage_count',
        'avg_rating',
        'tags',
    ];

    protected $casts = [
        'variables' => 'array',
        'example_data' => 'array',
        'tags' => 'array',
        'is_public' => 'boolean',
        'is_system' => 'boolean',
        'avg_rating' => 'decimal:2',
    ];

    /**
     * Get the user that owns this template.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get usage logs for this template.
     */
    public function usageLogs(): HasMany
    {
        return $this->hasMany(UsageLog::class, 'ai_prompt_template_id');
    }

    /**
     * Scope to get public templates.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope to get system templates.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope to get templates by category.
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to get templates accessible by a user.
     */
    public function scopeAccessibleBy($query, $userId)
    {
        return $query->where(function ($query) use ($userId) {
            $query->where('user_id', $userId)
                  ->orWhere('is_public', true)
                  ->orWhere('is_system', true);
        });
    }

    /**
     * Scope to search templates.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('template', 'like', "%{$search}%");
        });
    }

    /**
     * Render the template with provided data.
     */
    public function render($data = [])
    {
        $template = $this->template;
        
        // Replace variables in the template
        foreach ($data as $key => $value) {
            $placeholder = "{{" . $key . "}}";
            $template = str_replace($placeholder, $value, $template);
        }
        
        return $template;
    }

    /**
     * Extract variables from the template.
     */
    public function extractVariables()
    {
        preg_match_all('/\{\{(\w+)\}\}/', $this->template, $matches);
        return array_unique($matches[1]);
    }

    /**
     * Validate that all required variables are provided.
     */
    public function validateData($data)
    {
        $requiredVars = $this->extractVariables();
        $providedVars = array_keys($data);
        $missingVars = array_diff($requiredVars, $providedVars);
        
        return [
            'valid' => empty($missingVars),
            'missing_variables' => $missingVars,
            'required_variables' => $requiredVars
        ];
    }

    /**
     * Increment usage count.
     */
    public function incrementUsage()
    {
        $this->increment('usage_count');
    }

    /**
     * Add a rating to this template.
     */
    public function addRating($rating)
    {
        // This is a simplified implementation
        // In a real app, you'd store individual ratings and calculate the average
        $currentRating = $this->avg_rating ?? 0;
        $usageCount = $this->usage_count;
        
        $newAverage = (($currentRating * $usageCount) + $rating) / ($usageCount + 1);
        
        $this->update(['avg_rating' => $newAverage]);
    }

    /**
     * Get popular templates.
     */
    public static function getPopular($limit = 10)
    {
        return static::orderBy('usage_count', 'desc')
                    ->limit($limit)
                    ->get();
    }

    /**
     * Get templates by tags.
     */
    public function scopeByTags($query, $tags)
    {
        if (is_string($tags)) {
            $tags = [$tags];
        }
        
        return $query->where(function ($query) use ($tags) {
            foreach ($tags as $tag) {
                $query->orWhereJsonContains('tags', $tag);
            }
        });
    }
}
