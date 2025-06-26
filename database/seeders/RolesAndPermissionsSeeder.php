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

        // Create comprehensive permissions
        $permissions = [
            // ========== SYSTEM ADMINISTRATION ==========
            // User Management
            'view users',
            'create users',
            'edit users',
            'delete users',
            'manage user roles',
            'manage user permissions',
            'impersonate users',
            'view user activity',

            // Role & Permission Management
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'assign roles',
            'view permissions',
            'create permissions',
            'edit permissions',
            'delete permissions',
            'assign permissions',

            // Settings Management
            'view settings',
            'edit settings',
            'view advanced settings',
            'edit advanced settings',
            'manage system maintenance',
            'view system logs',
            'manage backups',

            // ========== CRM MODULE ==========
            // Clients
            'view clients',
            'create clients',
            'edit clients',
            'delete clients',
            'view all clients',
            'export clients',
            'import clients',
            'view client analytics',

            // Leads
            'view leads',
            'create leads',
            'edit leads',
            'delete leads',
            'view all leads',
            'convert leads',
            'assign leads',
            'export leads',
            'import leads',
            'view lead analytics',

            // Communications
            'view communications',
            'create communications',
            'edit communications',
            'delete communications',
            'view all communications',
            'export communications',

            // LiveChat
            'view livechat',
            'participate livechat',
            'manage livechat',
            'view livechat analytics',
            'export livechat data',

            // ========== FINANCE MODULE ==========
            // Accounts
            'view accounts',
            'create accounts',
            'edit accounts',
            'delete accounts',
            'manage account types',

            // Transactions
            'view transactions',
            'create transactions',
            'edit transactions',
            'delete transactions',
            'approve transactions',
            'view all transactions',
            'export transactions',
            'import transactions',

            // Invoices
            'view invoices',
            'create invoices',
            'edit invoices',
            'delete invoices',
            'send invoices',
            'approve invoices',
            'view all invoices',
            'export invoices',

            // Payments
            'view payments',
            'create payments',
            'edit payments',
            'delete payments',
            'approve payments',
            'view all payments',
            'export payments',

            // Quotations
            'view quotations',
            'create quotations',
            'edit quotations',
            'delete quotations',
            'send quotations',
            'approve quotations',
            'convert quotations',
            'view all quotations',

            // Expenses
            'view expenses',
            'create expenses',
            'edit expenses',
            'delete expenses',
            'approve expenses',
            'view all expenses',

            // Budgets
            'view budgets',
            'create budgets',
            'edit budgets',
            'delete budgets',
            'approve budgets',

            // Categories
            'view categories',
            'create categories',
            'edit categories',
            'delete categories',

            // Financial Reports
            'view financial reports',
            'create financial reports',
            'export financial reports',

            // ========== HR MODULE ==========
            // Employees
            'view employees',
            'create employees',
            'edit employees',
            'delete employees',
            'view all employees',
            'manage employee documents',
            'view employee analytics',

            // Departments
            'view departments',
            'create departments',
            'edit departments',
            'delete departments',
            'manage department hierarchy',

            // Leave Management
            'view leave',
            'create leave',
            'edit leave',
            'delete leave',
            'approve leave',
            'view all leave',
            'manage leave types',

            // Performance Management
            'view performance',
            'create performance',
            'edit performance',
            'delete performance',
            'approve performance',
            'view all performance',

            // Attendance
            'view attendance',
            'create attendance',
            'edit attendance',
            'delete attendance',
            'view all attendance',
            'manage attendance reports',

            // Training
            'view training',
            'create training',
            'edit training',
            'delete training',
            'enroll training',
            'manage training programs',

            // ========== PROJECTS MODULE ==========
            // Projects
            'view projects',
            'create projects',
            'edit projects',
            'delete projects',
            'view all projects',
            'manage project members',
            'view project analytics',

            // Project Milestones
            'view milestones',
            'create milestones',
            'edit milestones',
            'delete milestones',
            'manage project milestones',

            // Project Tasks
            'view tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',
            'assign tasks',
            'view all tasks',

            // Project Files
            'view project files',
            'upload project files',
            'edit project files',
            'delete project files',
            'download project files',

            // Time Tracking
            'view time logs',
            'create time logs',
            'edit time logs',
            'delete time logs',
            'approve time logs',
            'view all time logs',

            // Project Templates
            'view project templates',
            'create project templates',
            'edit project templates',
            'delete project templates',
            'use project templates',

            // ========== SUPPORT MODULE ==========
            // Tickets
            'view tickets',
            'create tickets',
            'edit tickets',
            'delete tickets',
            'assign tickets',
            'close tickets',
            'reopen tickets',
            'escalate tickets',
            'view all tickets',
            'view ticket analytics',

            // Knowledge Base
            'view knowledge base',
            'create knowledge base',
            'edit knowledge base',
            'delete knowledge base',
            'publish knowledge base',
            'view knowledge analytics',

            // FAQ
            'view faq',
            'create faq',
            'edit faq',
            'delete faq',
            'publish faq',

            // Support Categories
            'view support categories',
            'create support categories',
            'edit support categories',
            'delete support categories',

            // SLA Management
            'view sla',
            'create sla',
            'edit sla',
            'delete sla',
            'manage sla policies',

            // Automation Rules
            'view automation',
            'create automation',
            'edit automation',
            'delete automation',
            'manage automation rules',

            // ========== CMS MODULE ==========
            // Pages
            'view cms pages',
            'create cms pages',
            'edit cms pages',
            'delete cms pages',
            'publish cms pages',
            'manage cms pages',

            // Media
            'view cms media',
            'upload cms media',
            'edit cms media',
            'delete cms media',
            'manage cms media',

            // Templates
            'view cms templates',
            'create cms templates',
            'edit cms templates',
            'delete cms templates',
            'manage cms templates',

            // Menus
            'view cms menus',
            'create cms menus',
            'edit cms menus',
            'delete cms menus',
            'manage cms menus',

            // Redirects
            'view cms redirects',
            'create cms redirects',
            'edit cms redirects',
            'delete cms redirects',

            // ========== AI MODULE ==========
            // AI Services
            'view ai services',
            'create ai services',
            'edit ai services',
            'delete ai services',
            'manage ai services',
            'test ai connections',

            // AI Models
            'view ai models',
            'create ai models',
            'edit ai models',
            'delete ai models',
            'manage ai models',

            // AI Conversations
            'view ai conversations',
            'create ai conversations',
            'edit ai conversations',
            'delete ai conversations',
            'export ai conversations',

            // Prompt Templates
            'view prompt templates',
            'create prompt templates',
            'edit prompt templates',
            'delete prompt templates',
            'use prompt templates',

            // AI Analytics
            'view ai analytics',
            'export ai analytics',

            // ========== ANALYTICS & REPORTS ==========
            'view reports',
            'create reports',
            'edit reports',
            'delete reports',
            'export reports',
            'view analytics dashboard',
            'view system analytics',

            // ========== TAGS & GENERAL ==========
            'view tags',
            'create tags',
            'edit tags',
            'delete tags',
            'manage tags',

            // ========== NOTIFICATIONS ==========
            'view notifications',
            'manage notifications',
            'send notifications',
            'view notification analytics',

            // ========== CUSTOMER PORTAL ==========
            'access customer portal',
            'view own tickets',
            'create own tickets',
            'edit own tickets',
            'view own projects',
            'view own invoices',
            'view own payments',
            'view public knowledge base',
            'view public faq',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles with descriptions and assign permissions
        $this->command->info('Creating roles and assigning permissions...');

        // ========== ADMIN ROLE ==========
        $adminRole = Role::firstOrCreate([
            'name' => 'admin'
        ], [
            'description' => 'System Administrator with full access to all features and settings'
        ]);

        // Admin gets ALL permissions
        $adminRole->givePermissionTo(Permission::all());
        $this->command->info('✓ Admin role created with full permissions');

        // ========== MANAGER ROLE ==========
        $managerRole = Role::firstOrCreate([
            'name' => 'manager'
        ], [
            'description' => 'Department Manager with advanced access to most features'
        ]);

        $managerPermissions = [
            // User Management (limited)
            'view users',
            'view user activity',

            // CRM Module (full access)
            'view clients', 'create clients', 'edit clients', 'delete clients',
            'view all clients', 'export clients', 'import clients', 'view client analytics',
            'view leads', 'create leads', 'edit leads', 'delete leads',
            'view all leads', 'convert leads', 'assign leads', 'export leads', 'import leads', 'view lead analytics',
            'view communications', 'create communications', 'edit communications', 'delete communications',
            'view all communications', 'export communications',
            'view livechat', 'participate livechat', 'manage livechat', 'view livechat analytics',

            // Finance Module (most access, no deletion)
            'view accounts', 'create accounts', 'edit accounts',
            'view transactions', 'create transactions', 'edit transactions', 'approve transactions',
            'view all transactions', 'export transactions', 'import transactions',
            'view invoices', 'create invoices', 'edit invoices', 'send invoices', 'approve invoices',
            'view all invoices', 'export invoices',
            'view payments', 'create payments', 'edit payments', 'approve payments',
            'view all payments', 'export payments',
            'view quotations', 'create quotations', 'edit quotations', 'send quotations',
            'approve quotations', 'convert quotations', 'view all quotations',
            'view expenses', 'create expenses', 'edit expenses', 'approve expenses', 'view all expenses',
            'view budgets', 'create budgets', 'edit budgets', 'approve budgets',
            'view categories', 'create categories', 'edit categories',
            'view financial reports', 'create financial reports', 'export financial reports',

            // HR Module (full access)
            'view employees', 'create employees', 'edit employees', 'delete employees',
            'view all employees', 'manage employee documents', 'view employee analytics',
            'view departments', 'create departments', 'edit departments', 'delete departments',
            'view leave', 'create leave', 'edit leave', 'approve leave', 'view all leave', 'manage leave types',
            'view performance', 'create performance', 'edit performance', 'approve performance', 'view all performance',
            'view attendance', 'create attendance', 'edit attendance', 'view all attendance', 'manage attendance reports',
            'view training', 'create training', 'edit training', 'enroll training', 'manage training programs',

            // Projects Module (full access)
            'view projects', 'create projects', 'edit projects', 'delete projects',
            'view all projects', 'manage project members', 'view project analytics',
            'view milestones', 'create milestones', 'edit milestones', 'delete milestones', 'manage project milestones',
            'view tasks', 'create tasks', 'edit tasks', 'delete tasks', 'assign tasks', 'view all tasks',
            'view project files', 'upload project files', 'edit project files', 'delete project files', 'download project files',
            'view time logs', 'create time logs', 'edit time logs', 'approve time logs', 'view all time logs',
            'view project templates', 'create project templates', 'edit project templates', 'use project templates',

            // Support Module (full access)
            'view tickets', 'create tickets', 'edit tickets', 'delete tickets',
            'assign tickets', 'close tickets', 'reopen tickets', 'escalate tickets', 'view all tickets', 'view ticket analytics',
            'view knowledge base', 'create knowledge base', 'edit knowledge base', 'publish knowledge base', 'view knowledge analytics',
            'view faq', 'create faq', 'edit faq', 'publish faq',
            'view support categories', 'create support categories', 'edit support categories',
            'view sla', 'create sla', 'edit sla', 'manage sla policies',

            // AI Module (limited access)
            'view ai conversations', 'create ai conversations', 'edit ai conversations',
            'view prompt templates', 'create prompt templates', 'edit prompt templates', 'use prompt templates',
            'view ai analytics',

            // Analytics & Reports
            'view reports', 'create reports', 'edit reports', 'export reports',
            'view analytics dashboard', 'view system analytics',

            // Tags & General
            'view tags', 'create tags', 'edit tags', 'manage tags',

            // Notifications
            'view notifications', 'manage notifications', 'send notifications', 'view notification analytics',
        ];

        $managerRole->givePermissionTo($managerPermissions);
        $this->command->info('✓ Manager role created with advanced permissions');

        // ========== STAFF ROLE ==========
        $staffRole = Role::firstOrCreate([
            'name' => 'staff'
        ], [
            'description' => 'Staff member with access to daily operational features'
        ]);

        $staffPermissions = [
            // User Management (view only)
            'view users',

            // CRM Module (most access, limited deletion)
            'view clients', 'create clients', 'edit clients', 'view client analytics',
            'view leads', 'create leads', 'edit leads', 'convert leads', 'view lead analytics',
            'view communications', 'create communications', 'edit communications',
            'view livechat', 'participate livechat',

            // Finance Module (limited access)
            'view accounts',
            'view transactions', 'create transactions', 'edit transactions', 'export transactions',
            'view invoices', 'create invoices', 'edit invoices', 'send invoices', 'export invoices',
            'view payments', 'create payments', 'edit payments', 'export payments',
            'view quotations', 'create quotations', 'edit quotations', 'send quotations',
            'view expenses', 'create expenses', 'edit expenses',
            'view budgets',
            'view categories',
            'view financial reports',

            // HR Module (limited access)
            'view employees', 'view employee analytics',
            'view departments',
            'view leave', 'create leave', 'edit leave',
            'view performance', 'create performance', 'edit performance',
            'view attendance', 'create attendance', 'edit attendance',
            'view training', 'enroll training',

            // Projects Module (good access)
            'view projects', 'create projects', 'edit projects', 'view project analytics',
            'view milestones', 'create milestones', 'edit milestones',
            'view tasks', 'create tasks', 'edit tasks', 'assign tasks',
            'view project files', 'upload project files', 'edit project files', 'download project files',
            'view time logs', 'create time logs', 'edit time logs',
            'view project templates', 'use project templates',

            // Support Module (good access)
            'view tickets', 'create tickets', 'edit tickets', 'assign tickets', 'close tickets', 'reopen tickets',
            'view knowledge base', 'create knowledge base', 'edit knowledge base',
            'view faq', 'create faq', 'edit faq',
            'view support categories',

            // AI Module (basic access)
            'view ai conversations', 'create ai conversations',
            'view prompt templates', 'use prompt templates',

            // Analytics & Reports (view only)
            'view reports', 'view analytics dashboard',

            // Tags & General
            'view tags', 'create tags', 'edit tags',

            // Notifications
            'view notifications',
        ];

        $staffRole->givePermissionTo($staffPermissions);
        $this->command->info('✓ Staff role created with operational permissions');

        // ========== CUSTOMER ROLE ==========
        $customerRole = Role::firstOrCreate([
            'name' => 'customer'
        ], [
            'description' => 'Customer with access to customer portal and own data'
        ]);

        $customerPermissions = [
            // Customer Portal Access
            'access customer portal',

            // Own Tickets
            'view own tickets',
            'create own tickets',
            'edit own tickets',

            // Own Projects (view only)
            'view own projects',

            // Own Financial Data (view only)
            'view own invoices',
            'view own payments',

            // Public Knowledge Resources
            'view public knowledge base',
            'view public faq',

            // Basic Notifications
            'view notifications',
        ];

        $customerRole->givePermissionTo($customerPermissions);
        $this->command->info('✓ Customer role created with portal permissions');

        $this->command->info('');
        $this->command->info('🎉 RBAC System Setup Complete!');
        $this->command->info('📊 Created ' . Permission::count() . ' permissions');
        $this->command->info('👥 Created 4 roles: admin, manager, staff, customer');
        $this->command->info('🔐 All permissions properly assigned to roles');
    }
}
