<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\HR\Department;
use App\Models\HR\Employee;
use App\Models\HR\LeaveType;
use App\Models\HR\Skill;
use App\Models\User;

class HRSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Departments
        $departments = [
            [
                'name' => 'Human Resources',
                'code' => 'HR',
                'description' => 'Manages employee relations, recruitment, and organizational development',
                'location' => 'Main Office',
                'budget' => 500000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Information Technology',
                'code' => 'IT',
                'description' => 'Manages technology infrastructure and software development',
                'location' => 'Tech Hub',
                'budget' => 1200000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Finance',
                'code' => 'FIN',
                'description' => 'Manages financial operations and accounting',
                'location' => 'Main Office',
                'budget' => 800000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Marketing',
                'code' => 'MKT',
                'description' => 'Manages marketing campaigns and brand development',
                'location' => 'Creative Center',
                'budget' => 600000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Sales',
                'code' => 'SALES',
                'description' => 'Manages sales operations and customer relationships',
                'location' => 'Sales Floor',
                'budget' => 900000.00,
                'is_active' => true,
            ],
        ];

        foreach ($departments as $deptData) {
            Department::create($deptData);
        }

        // Create Leave Types
        $leaveTypes = [
            [
                'name' => 'Annual Leave',
                'code' => 'AL',
                'description' => 'Yearly vacation leave',
                'days_per_year' => 25,
                'is_paid' => true,
                'requires_approval' => true,
                'max_consecutive_days' => 15,
                'min_notice_days' => 7,
                'carry_forward' => true,
                'max_carry_forward_days' => 5,
                'color' => '#3B82F6',
                'is_active' => true,
            ],
            [
                'name' => 'Sick Leave',
                'code' => 'SL',
                'description' => 'Medical leave for illness',
                'days_per_year' => 10,
                'is_paid' => true,
                'requires_approval' => false,
                'max_consecutive_days' => 5,
                'min_notice_days' => 0,
                'carry_forward' => false,
                'color' => '#EF4444',
                'is_active' => true,
            ],
            [
                'name' => 'Personal Leave',
                'code' => 'PL',
                'description' => 'Personal time off',
                'days_per_year' => 5,
                'is_paid' => false,
                'requires_approval' => true,
                'max_consecutive_days' => 3,
                'min_notice_days' => 3,
                'carry_forward' => false,
                'color' => '#F59E0B',
                'is_active' => true,
            ],
            [
                'name' => 'Maternity Leave',
                'code' => 'ML',
                'description' => 'Maternity leave for new mothers',
                'days_per_year' => 90,
                'is_paid' => true,
                'requires_approval' => true,
                'max_consecutive_days' => 90,
                'min_notice_days' => 30,
                'carry_forward' => false,
                'color' => '#EC4899',
                'is_active' => true,
            ],
            [
                'name' => 'Paternity Leave',
                'code' => 'PTL',
                'description' => 'Paternity leave for new fathers',
                'days_per_year' => 14,
                'is_paid' => true,
                'requires_approval' => true,
                'max_consecutive_days' => 14,
                'min_notice_days' => 14,
                'carry_forward' => false,
                'color' => '#8B5CF6',
                'is_active' => true,
            ],
        ];

        foreach ($leaveTypes as $leaveTypeData) {
            LeaveType::create($leaveTypeData);
        }

        // Create Skills
        $skills = [
            // Technical Skills
            [
                'name' => 'PHP Development',
                'description' => 'Server-side web development using PHP',
                'category' => 'Web Development',
                'type' => 'technical',
                'proficiency_levels' => 5,
                'level_descriptions' => ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
                'is_active' => true,
            ],
            [
                'name' => 'JavaScript',
                'description' => 'Client-side and server-side JavaScript development',
                'category' => 'Web Development',
                'type' => 'technical',
                'proficiency_levels' => 5,
                'level_descriptions' => ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
                'is_active' => true,
            ],
            [
                'name' => 'React',
                'description' => 'Frontend development using React framework',
                'category' => 'Frontend Development',
                'type' => 'technical',
                'proficiency_levels' => 5,
                'level_descriptions' => ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
                'is_active' => true,
            ],
            [
                'name' => 'Laravel',
                'description' => 'Backend development using Laravel framework',
                'category' => 'Backend Development',
                'type' => 'technical',
                'proficiency_levels' => 5,
                'level_descriptions' => ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
                'is_active' => true,
            ],
            [
                'name' => 'Database Management',
                'description' => 'Database design and management',
                'category' => 'Database',
                'type' => 'technical',
                'proficiency_levels' => 5,
                'level_descriptions' => ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
                'is_active' => true,
            ],
            // Soft Skills
            [
                'name' => 'Communication',
                'description' => 'Effective verbal and written communication',
                'category' => 'Interpersonal',
                'type' => 'soft',
                'proficiency_levels' => 5,
                'level_descriptions' => ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
                'is_active' => true,
            ],
            [
                'name' => 'Leadership',
                'description' => 'Team leadership and management skills',
                'category' => 'Management',
                'type' => 'soft',
                'proficiency_levels' => 5,
                'level_descriptions' => ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
                'is_active' => true,
            ],
            [
                'name' => 'Problem Solving',
                'description' => 'Analytical and creative problem-solving abilities',
                'category' => 'Analytical',
                'type' => 'soft',
                'proficiency_levels' => 5,
                'level_descriptions' => ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
                'is_active' => true,
            ],
            // Language Skills
            [
                'name' => 'English',
                'description' => 'English language proficiency',
                'category' => 'Languages',
                'type' => 'language',
                'proficiency_levels' => 5,
                'level_descriptions' => ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'],
                'is_active' => true,
            ],
            [
                'name' => 'Spanish',
                'description' => 'Spanish language proficiency',
                'category' => 'Languages',
                'type' => 'language',
                'proficiency_levels' => 5,
                'level_descriptions' => ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'],
                'is_active' => true,
            ],
        ];

        foreach ($skills as $skillData) {
            Skill::create($skillData);
        }

        $this->command->info('HR seed data created successfully!');
    }
}
