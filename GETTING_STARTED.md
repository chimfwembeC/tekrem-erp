# Getting Started with TekRem ERP

This guide will walk you through setting up the TekRem ERP system from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- PHP 8.2 or higher
- Composer
- Node.js and npm
- MySQL (or XAMPP)
- Git

## Step 1: Create a New Laravel Project

```bash
# Create a new Laravel project
composer create-project laravel/laravel .

# Navigate to the project directory (if not already there)
cd tekrem-erp
```

## Step 2: Install Jetstream with Inertia and React

```bash
# Install Jetstream
composer require laravel/jetstream

# Install Jetstream with Inertia + React
php artisan jetstream:install inertia
```

## Step 3: Install Frontend Dependencies

```bash
# Install npm dependencies
npm install

# Install TypeScript
npm install --save-dev typescript @types/react @types/node

# Install shadcn/ui
npx shadcn@latest init

# Install sonner for notifications
npm install sonner
```

## Step 4: Install Required Packages

```bash
# Install Spatie Permission package
composer require spatie/laravel-permission

# Install Spatie Activity Log
composer require spatie/laravel-activitylog

# Install Laravel Localization
composer require mcamara/laravel-localization
```

## Step 5: Publish Package Configurations

```bash
# Publish Spatie Permission configuration
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"

# Publish Laravel Localization configuration
php artisan vendor:publish --tag=laravel-localization

# Publish Activity Log configuration
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="config"
```

## Step 6: Configure Database

1. Open the `.env` file and update the database connection details:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tekrem_erp
DB_USERNAME=root
DB_PASSWORD=
```

2. Create a new database named `tekrem_erp` in your MySQL server.

## Step 7: Run Migrations and Seeders

```bash
# Run migrations
php artisan migrate

# Create seeders for users, roles, and permissions
php artisan make:seeder RolesAndPermissionsSeeder
php artisan make:seeder UserSeeder

# Edit the seeders (see below for content)

# Run seeders
php artisan db:seed
```

## Step 8: Set Up Frontend Structure

Create the following directory structure for the frontend:

```
resources/js/Pages/
├── Website/      # Public site (Landing, About, Services)
├── Admin/        # Admin panel
├── Customer/     # Customer dashboard, requests
├── CRM/          # Client management, leads, comms
├── Finance/      # Billing, invoices, payments
├── HR/           # Team, leave, roles
├── Projects/     # Tasks, timelines, PM
├── Support/      # Tickets, knowledge base
├── Analytics/    # Graphs, KPIs, reports
```

## Step 9: Set Up i18n

Create the following files for internationalization:

```
resources/js/i18n/
├── en.json       # English translations
├── bem.json      # Bemba translations
```

## Step 10: Start Development Servers

```bash
# Start Laravel development server
php artisan serve

# In a separate terminal, start the frontend development server
npm run dev
```

## Next Steps

After completing the initial setup, refer to the TODO.md file for the next implementation tasks.

## Seeder Content Examples

### RolesAndPermissionsSeeder.php

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
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
            
            // Add more permissions for each module...
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $role = Role::create(['name' => 'admin']);
        $role->givePermissionTo(Permission::all());

        $role = Role::create(['name' => 'staff']);
        $role->givePermissionTo([
            'view users',
            // Add more permissions for staff...
        ]);

        $role = Role::create(['name' => 'customer']);
        $role->givePermissionTo([
            // Add permissions for customers...
        ]);
    }
}
```

### UserSeeder.php

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
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
```
