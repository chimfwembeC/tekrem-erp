<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@tekrem.com',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole('admin');

        // Create staff user
        $staff = User::create([
            'name' => 'Staff User',
            'email' => 'staff@tekrem.com',
            'password' => Hash::make('password'),
        ]);
        $staff->assignRole('staff');

        // Create customer user
        $customer = User::create([
            'name' => 'Customer User',
            'email' => 'customer@tekrem.com',
            'password' => Hash::make('password'),
        ]);
        $customer->assignRole('customer');
    }
}
