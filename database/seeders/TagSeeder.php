<?php

namespace Database\Seeders;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->first();

        if (!$adminUser) {
            $this->command->warn('No admin user found. Skipping tag seeding.');
            return;
        }

        $tags = [
            // Project Tags
            [
                'name' => 'High Priority',
                'color' => '#EF4444',
                'type' => 'project',
                'description' => 'Projects that require immediate attention',
            ],
            [
                'name' => 'Client Work',
                'color' => '#3B82F6',
                'type' => 'project',
                'description' => 'Projects for external clients',
            ],
            [
                'name' => 'Internal',
                'color' => '#10B981',
                'type' => 'project',
                'description' => 'Internal company projects',
            ],
            [
                'name' => 'Research',
                'color' => '#8B5CF6',
                'type' => 'project',
                'description' => 'Research and development projects',
            ],
            [
                'name' => 'Maintenance',
                'color' => '#F59E0B',
                'type' => 'project',
                'description' => 'Maintenance and support projects',
            ],

            // Task Tags
            [
                'name' => 'Bug',
                'color' => '#DC2626',
                'type' => 'task',
                'description' => 'Bug fixes and issues',
            ],
            [
                'name' => 'Feature',
                'color' => '#059669',
                'type' => 'task',
                'description' => 'New feature development',
            ],
            [
                'name' => 'Documentation',
                'color' => '#7C3AED',
                'type' => 'task',
                'description' => 'Documentation tasks',
            ],
            [
                'name' => 'Testing',
                'color' => '#DB2777',
                'type' => 'task',
                'description' => 'Testing and QA tasks',
            ],
            [
                'name' => 'Review',
                'color' => '#0891B2',
                'type' => 'task',
                'description' => 'Code review and approval tasks',
            ],
            [
                'name' => 'Frontend',
                'color' => '#EA580C',
                'type' => 'task',
                'description' => 'Frontend development tasks',
            ],
            [
                'name' => 'Backend',
                'color' => '#65A30D',
                'type' => 'task',
                'description' => 'Backend development tasks',
            ],

            // General Tags
            [
                'name' => 'Urgent',
                'color' => '#B91C1C',
                'type' => 'general',
                'description' => 'Urgent items requiring immediate action',
            ],
            [
                'name' => 'Planning',
                'color' => '#1D4ED8',
                'type' => 'general',
                'description' => 'Planning and strategy items',
            ],
            [
                'name' => 'Meeting',
                'color' => '#7C2D12',
                'type' => 'general',
                'description' => 'Meeting-related items',
            ],
        ];

        foreach ($tags as $tagData) {
            Tag::create([
                'name' => $tagData['name'],
                'color' => $tagData['color'],
                'type' => $tagData['type'],
                'description' => $tagData['description'],
                'created_by' => $adminUser->id,
                'is_active' => true,
            ]);
        }

        $this->command->info('Tags seeded successfully!');
    }
}
