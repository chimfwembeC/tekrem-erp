<?php

namespace App\Models\HR;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use HasFactory;

    protected $table = 'hr_departments';

    protected $fillable = [
        'name',
        'code',
        'description',
        'manager_id',
        'parent_department_id',
        'location',
        'budget',
        'employee_count',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Get the manager of the department.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the parent department.
     */
    public function parentDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'parent_department_id');
    }

    /**
     * Get the child departments.
     */
    public function childDepartments(): HasMany
    {
        return $this->hasMany(Department::class, 'parent_department_id');
    }

    /**
     * Get all employees in this department.
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'department_id');
    }

    /**
     * Scope to get only active departments.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get root departments (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_department_id');
    }

    /**
     * Get the full department hierarchy path.
     */
    public function getHierarchyPathAttribute(): string
    {
        $path = [$this->name];
        $parent = $this->parentDepartment;

        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parentDepartment;
        }

        return implode(' > ', $path);
    }

    /**
     * Update employee count for this department.
     */
    public function updateEmployeeCount(): void
    {
        $this->update([
            'employee_count' => $this->employees()->where('employment_status', 'active')->count()
        ]);
    }

    /**
     * Get all descendants (child departments recursively).
     */
    public function getAllDescendants()
    {
        $descendants = collect();
        
        foreach ($this->childDepartments as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->getAllDescendants());
        }

        return $descendants;
    }

    /**
     * Get total budget including child departments.
     */
    public function getTotalBudgetAttribute(): float
    {
        $total = $this->budget ?? 0;
        
        foreach ($this->childDepartments as $child) {
            $total += $child->total_budget;
        }

        return $total;
    }
}
