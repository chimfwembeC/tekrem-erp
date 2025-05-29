<?php

namespace App\Models\HR;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'hr_employees';

    protected $fillable = [
        'user_id',
        'employee_id',
        'department_id',
        'job_title',
        'employment_type',
        'employment_status',
        'hire_date',
        'probation_end_date',
        'termination_date',
        'termination_reason',
        'salary',
        'salary_currency',
        'pay_frequency',
        'manager_id',
        'work_location',
        'phone',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'date_of_birth',
        'gender',
        'marital_status',
        'address',
        'national_id',
        'passport_number',
        'tax_id',
        'skills',
        'certifications',
        'documents',
        'metadata',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'probation_end_date' => 'date',
        'termination_date' => 'date',
        'date_of_birth' => 'date',
        'salary' => 'decimal:2',
        'skills' => 'array',
        'certifications' => 'array',
        'documents' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Get the user associated with the employee.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the department of the employee.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Get the manager of the employee.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    /**
     * Get the employees managed by this employee.
     */
    public function subordinates(): HasMany
    {
        return $this->hasMany(Employee::class, 'manager_id');
    }

    /**
     * Get the leave records for this employee.
     */
    public function leaves(): HasMany
    {
        return $this->hasMany(Leave::class, 'employee_id');
    }

    /**
     * Get the performance reviews for this employee.
     */
    public function performances(): HasMany
    {
        return $this->hasMany(Performance::class, 'employee_id');
    }

    /**
     * Get the attendance records for this employee.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'employee_id');
    }

    /**
     * Get the training enrollments for this employee.
     */
    public function trainingEnrollments(): HasMany
    {
        return $this->hasMany(TrainingEnrollment::class, 'employee_id');
    }

    /**
     * Get the skills associated with this employee.
     */
    public function employeeSkills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'hr_employee_skills', 'employee_id', 'skill_id')
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
     * Scope to get only active employees.
     */
    public function scopeActive($query)
    {
        return $query->where('employment_status', 'active');
    }

    /**
     * Scope to get employees by department.
     */
    public function scopeInDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope to get employees by employment type.
     */
    public function scopeByEmploymentType($query, $type)
    {
        return $query->where('employment_type', $type);
    }

    /**
     * Get the full name of the employee.
     */
    public function getFullNameAttribute(): string
    {
        return $this->user->name ?? '';
    }

    /**
     * Get the email of the employee.
     */
    public function getEmailAttribute(): string
    {
        return $this->user->email ?? '';
    }

    /**
     * Check if employee is on probation.
     */
    public function getIsOnProbationAttribute(): bool
    {
        return $this->probation_end_date && $this->probation_end_date->isFuture();
    }

    /**
     * Get years of service.
     */
    public function getYearsOfServiceAttribute(): float
    {
        return $this->hire_date->diffInYears(now());
    }

    /**
     * Get current age.
     */
    public function getAgeAttribute(): ?int
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    /**
     * Generate unique employee ID.
     */
    public static function generateEmployeeId(): string
    {
        $year = date('Y');
        $lastEmployee = static::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastEmployee ? (int) substr($lastEmployee->employee_id, -4) + 1 : 1;

        return 'EMP' . $year . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($employee) {
            if (!$employee->employee_id) {
                $employee->employee_id = static::generateEmployeeId();
            }
        });

        static::saved(function ($employee) {
            // Update department employee count
            if ($employee->department) {
                $employee->department->updateEmployeeCount();
            }
        });
    }
}
