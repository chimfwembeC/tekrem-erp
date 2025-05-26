<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the permissions and roles seeder first
        $this->call(RolesAndPermissionsSeeder::class);

        // Then run the user seeder
        $this->call(UserSeeder::class);

        // Run the settings seeder
        $this->call(SettingsSeeder::class);

        // Run the CRM seeder
        $this->call(CrmSeeder::class);

        // Run the CMS seeder
        $this->call(CMSSeeder::class);
    }
}
