<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User management
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Role management
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',

            // Permission management
            'view permissions',
            'create permissions',
            'edit permissions',
            'delete permissions',

            // Settings management
            'view settings',
            'edit settings',

            // CRM module
            'view clients',
            'create clients',
            'edit clients',
            'delete clients',
            'view leads',
            'create leads',
            'edit leads',
            'delete leads',

            // Finance module
            'view invoices',
            'create invoices',
            'edit invoices',
            'delete invoices',
            'view payments',
            'create payments',
            'edit payments',
            'delete payments',

            // HR module
            'view employees',
            'create employees',
            'edit employees',
            'delete employees',
            'view leave',
            'create leave',
            'edit leave',
            'delete leave',

            // Projects module
            'view projects',
            'create projects',
            'edit projects',
            'delete projects',
            'view tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',

            // Support module
            'view tickets',
            'create tickets',
            'edit tickets',
            'delete tickets',
            'view knowledge',
            'create knowledge',
            'edit knowledge',
            'delete knowledge',

            // Analytics module
            'view reports',
            'create reports',
            'edit reports',
            'delete reports',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        $staffRole = Role::firstOrCreate(['name' => 'staff']);
        $staffRole->givePermissionTo([
            'view users',
            'view clients',
            'create clients',
            'edit clients',
            'view leads',
            'create leads',
            'edit leads',
            'view invoices',
            'create invoices',
            'edit invoices',
            'view payments',
            'create payments',
            'view employees',
            'view leave',
            'create leave',
            'view projects',
            'create projects',
            'edit projects',
            'view tasks',
            'create tasks',
            'edit tasks',
            'view tickets',
            'create tickets',
            'edit tickets',
            'view knowledge',
            'view reports',
        ]);

        $customerRole = Role::firstOrCreate(['name' => 'customer']);
        $customerRole->givePermissionTo([
            'view tickets',
            'create tickets',
            'edit tickets',
        ]);
    }
}
