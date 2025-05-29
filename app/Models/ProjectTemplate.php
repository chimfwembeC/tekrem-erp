<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectTemplate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'category',
        'template_data',
        'is_active',
        'created_by',
        'usage_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'template_data' => 'array',
        'is_active' => 'boolean',
        'usage_count' => 'integer',
    ];

    /**
     * Get the user who created the template.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the projects created from this template.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'template_id');
    }

    /**
     * Create a project from this template.
     */
    public function createProject(array $projectData): Project
    {
        $templateData = $this->template_data;
        
        // Merge template data with provided project data
        $mergedData = array_merge([
            'name' => $projectData['name'],
            'description' => $projectData['description'] ?? $this->description,
            'category' => $projectData['category'] ?? $this->category,
            'budget' => $projectData['budget'] ?? $templateData['default_budget'] ?? null,
            'manager_id' => $projectData['manager_id'],
            'client_id' => $projectData['client_id'] ?? null,
            'start_date' => $projectData['start_date'] ?? now(),
            'end_date' => $projectData['end_date'] ?? null,
            'deadline' => $projectData['deadline'] ?? null,
            'team_members' => $projectData['team_members'] ?? [],
            'tags' => $projectData['tags'] ?? [],
            'metadata' => array_merge($templateData, $projectData['metadata'] ?? []),
        ], $projectData);

        // Create the project
        $project = Project::create($mergedData);

        // Create milestones from template
        if (isset($templateData['milestones'])) {
            foreach ($templateData['milestones'] as $index => $milestoneData) {
                ProjectMilestone::create([
                    'project_id' => $project->id,
                    'name' => $milestoneData['name'],
                    'description' => $milestoneData['description'] ?? null,
                    'due_date' => $milestoneData['due_date'] ?? null,
                    'priority' => $milestoneData['priority'] ?? 'medium',
                    'assigned_to' => $milestoneData['assigned_to'] ?? null,
                    'order' => $index + 1,
                    'dependencies' => $milestoneData['dependencies'] ?? null,
                    'metadata' => $milestoneData['metadata'] ?? [],
                ]);
            }
        }

        // Increment usage count
        $this->increment('usage_count');

        return $project;
    }

    /**
     * Scope a query to only include active templates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include templates of a specific category.
     */
    public function scopeOfCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Get the most used templates.
     */
    public function scopeMostUsed($query, $limit = 10)
    {
        return $query->orderBy('usage_count', 'desc')->limit($limit);
    }
}
