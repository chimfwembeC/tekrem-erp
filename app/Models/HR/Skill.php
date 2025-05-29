<?php

namespace App\Models\HR;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    use HasFactory;

    protected $table = 'hr_skills';

    protected $fillable = [
        'name',
        'description',
        'category',
        'type',
        'proficiency_levels',
        'level_descriptions',
        'is_active',
    ];

    protected $casts = [
        'level_descriptions' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the employees that have this skill.
     */
    public function employees(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'hr_employee_skills', 'skill_id', 'employee_id')
            ->withPivot([
                'proficiency_level',
                'acquired_date',
                'last_assessed_date',
                'notes',
                'is_certified',
                'certification_date',
                'certification_expiry'
            ])
            ->withTimestamps();
    }

    /**
     * Scope to get only active skills.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get skills by category.
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to get skills by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get technical skills.
     */
    public function scopeTechnical($query)
    {
        return $query->where('type', 'technical');
    }

    /**
     * Scope to get soft skills.
     */
    public function scopeSoft($query)
    {
        return $query->where('type', 'soft');
    }

    /**
     * Scope to get language skills.
     */
    public function scopeLanguage($query)
    {
        return $query->where('type', 'language');
    }

    /**
     * Scope to get certification skills.
     */
    public function scopeCertification($query)
    {
        return $query->where('type', 'certification');
    }

    /**
     * Get proficiency level description.
     */
    public function getProficiencyDescription(int $level): ?string
    {
        if (!$this->level_descriptions || !isset($this->level_descriptions[$level - 1])) {
            return $this->getDefaultProficiencyDescription($level);
        }

        return $this->level_descriptions[$level - 1];
    }

    /**
     * Get default proficiency level description.
     */
    private function getDefaultProficiencyDescription(int $level): string
    {
        $descriptions = [
            1 => 'Beginner',
            2 => 'Basic',
            3 => 'Intermediate',
            4 => 'Advanced',
            5 => 'Expert'
        ];

        return $descriptions[$level] ?? 'Unknown';
    }

    /**
     * Get all proficiency levels with descriptions.
     */
    public function getProficiencyLevelsWithDescriptions(): array
    {
        $levels = [];

        for ($i = 1; $i <= $this->proficiency_levels; $i++) {
            $levels[$i] = $this->getProficiencyDescription($i);
        }

        return $levels;
    }

    /**
     * Get employees count by proficiency level.
     */
    public function getEmployeeCountByLevel(): array
    {
        $counts = [];

        for ($i = 1; $i <= $this->proficiency_levels; $i++) {
            $counts[$i] = $this->employees()
                ->wherePivot('proficiency_level', $i)
                ->count();
        }

        return $counts;
    }

    /**
     * Get average proficiency level.
     */
    public function getAverageProficiencyLevel(): float
    {
        $average = $this->employees()
            ->avg('hr_employee_skills.proficiency_level');

        return round($average ?? 0, 2);
    }

    /**
     * Get total employees with this skill.
     */
    public function getTotalEmployeesAttribute(): int
    {
        return $this->employees()->count();
    }

    /**
     * Get certified employees count.
     */
    public function getCertifiedEmployeesCountAttribute(): int
    {
        return $this->employees()
            ->wherePivot('is_certified', true)
            ->count();
    }

    /**
     * Get skill demand score (based on how many employees have it).
     */
    public function getDemandScoreAttribute(): string
    {
        $count = $this->total_employees;

        if ($count >= 20) return 'High';
        if ($count >= 10) return 'Medium';
        if ($count >= 5) return 'Low';

        return 'Very Low';
    }

    /**
     * Get skill rarity score.
     */
    public function getRarityScoreAttribute(): string
    {
        $count = $this->total_employees;

        if ($count <= 2) return 'Very Rare';
        if ($count <= 5) return 'Rare';
        if ($count <= 10) return 'Common';

        return 'Very Common';
    }

    /**
     * Check if skill requires certification.
     */
    public function requiresCertification(): bool
    {
        return $this->type === 'certification';
    }

    /**
     * Get employees with expired certifications.
     */
    public function getEmployeesWithExpiredCertifications()
    {
        return $this->employees()
            ->wherePivot('is_certified', true)
            ->wherePivot('certification_expiry', '<', now())
            ->get();
    }

    /**
     * Get employees with certifications expiring soon (within 30 days).
     */
    public function getEmployeesWithExpiringSoonCertifications()
    {
        return $this->employees()
            ->wherePivot('is_certified', true)
            ->wherePivot('certification_expiry', '>', now())
            ->wherePivot('certification_expiry', '<=', now()->addDays(30))
            ->get();
    }

    /**
     * Get skill gap analysis.
     */
    public function getSkillGapAnalysis(): array
    {
        $levelCounts = $this->getEmployeeCountByLevel();
        $total = array_sum($levelCounts);

        if ($total === 0) {
            return [
                'gap_level' => 'Critical',
                'recommendation' => 'No employees have this skill. Consider training or hiring.',
                'priority' => 'High'
            ];
        }

        $advancedCount = ($levelCounts[4] ?? 0) + ($levelCounts[5] ?? 0);
        $advancedPercentage = ($advancedCount / $total) * 100;

        if ($advancedPercentage >= 50) {
            return [
                'gap_level' => 'Low',
                'recommendation' => 'Good skill coverage. Focus on knowledge sharing.',
                'priority' => 'Low'
            ];
        } elseif ($advancedPercentage >= 25) {
            return [
                'gap_level' => 'Medium',
                'recommendation' => 'Consider advanced training for intermediate employees.',
                'priority' => 'Medium'
            ];
        } else {
            return [
                'gap_level' => 'High',
                'recommendation' => 'Significant skill gap. Prioritize training and development.',
                'priority' => 'High'
            ];
        }
    }

    /**
     * Get related skills (same category).
     */
    public function getRelatedSkills()
    {
        return static::where('category', $this->category)
            ->where('id', '!=', $this->id)
            ->where('is_active', true)
            ->get();
    }
}
