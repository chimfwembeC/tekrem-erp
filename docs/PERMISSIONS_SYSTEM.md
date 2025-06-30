# TekRem ERP - Permissions System Documentation

## Overview

The TekRem ERP permissions system implements a comprehensive Role-Based Access Control (RBAC) system with four primary roles and granular permissions for all modules. This system ensures secure access control across the entire application.

## System Architecture

### Core Components

1. **Roles**: Four primary roles with hierarchical permissions
2. **Permissions**: Granular CRUD permissions for each module
3. **Users**: User accounts with assigned roles
4. **Middleware**: Route protection and access control

### Role Hierarchy

```
Admin (Full Access)
├── Manager (Management Access)
│   ├── Staff (Operational Access)
│   │   └── Customer (Limited Access)
```

## Roles and Permissions

### 1. Admin Role
- **Full system access** including user management, system settings, and all modules
- **User Management**: Create, edit, delete users and assign roles
- **Permission Management**: Modify roles and permissions
- **System Settings**: Access to all system configurations
- **All Module Access**: Full CRUD operations on all modules

### 2. Manager Role
- **Management-level access** to most modules with some restrictions
- **Limited User Management**: Can manage staff and customer users
- **Module Access**: Full access to CRM, Finance, Projects, HR, Support
- **Reporting**: Access to all reports and analytics
- **Settings**: Limited access to operational settings

### 3. Staff Role
- **Operational access** to day-to-day modules
- **Module Access**: CRM, Finance (limited), Projects, HR (limited), Support
- **Customer Interaction**: Can interact with customers and manage tickets
- **Data Entry**: Can create and edit records within assigned modules

### 4. Customer Role
- **Limited access** to customer-facing features
- **Support Portal**: Can create and view own support tickets
- **Profile Management**: Can update own profile information
- **Project Access**: Can view assigned projects (read-only)

## Permission Structure

### Permission Naming Convention
Permissions follow the pattern: `{action}_{module}_{entity}`

Examples:
- `view_crm_leads`
- `create_finance_invoices`
- `edit_projects_tasks`
- `delete_hr_employees`

### Module Permissions

#### CRM Module
- `view_crm_leads`, `create_crm_leads`, `edit_crm_leads`, `delete_crm_leads`
- `view_crm_contacts`, `create_crm_contacts`, `edit_crm_contacts`, `delete_crm_contacts`
- `view_crm_companies`, `create_crm_companies`, `edit_crm_companies`, `delete_crm_companies`
- `view_crm_opportunities`, `create_crm_opportunities`, `edit_crm_opportunities`, `delete_crm_opportunities`
- `view_crm_livechat`, `create_crm_livechat`, `edit_crm_livechat`, `delete_crm_livechat`

#### Finance Module
- `view_finance_invoices`, `create_finance_invoices`, `edit_finance_invoices`, `delete_finance_invoices`
- `view_finance_quotations`, `create_finance_quotations`, `edit_finance_quotations`, `delete_finance_quotations`
- `view_finance_transactions`, `create_finance_transactions`, `edit_finance_transactions`, `delete_finance_transactions`
- `view_finance_reports`, `create_finance_reports`, `edit_finance_reports`, `delete_finance_reports`

#### Projects Module
- `view_projects`, `create_projects`, `edit_projects`, `delete_projects`
- `view_projects_tasks`, `create_projects_tasks`, `edit_projects_tasks`, `delete_projects_tasks`
- `view_projects_milestones`, `create_projects_milestones`, `edit_projects_milestones`, `delete_projects_milestones`
- `view_projects_files`, `create_projects_files`, `edit_projects_files`, `delete_projects_files`

#### HR Module
- `view_hr_employees`, `create_hr_employees`, `edit_hr_employees`, `delete_hr_employees`
- `view_hr_departments`, `create_hr_departments`, `edit_hr_departments`, `delete_hr_departments`
- `view_hr_training`, `create_hr_training`, `edit_hr_training`, `delete_hr_training`
- `view_hr_payroll`, `create_hr_payroll`, `edit_hr_payroll`, `delete_hr_payroll`

#### Support Module
- `view_support_tickets`, `create_support_tickets`, `edit_support_tickets`, `delete_support_tickets`
- `view_support_knowledge`, `create_support_knowledge`, `edit_support_knowledge`, `delete_support_knowledge`
- `view_support_reports`, `create_support_reports`, `edit_support_reports`, `delete_support_reports`

#### CMS Module
- `view_cms_pages`, `create_cms_pages`, `edit_cms_pages`, `delete_cms_pages`
- `view_cms_posts`, `create_cms_posts`, `edit_cms_posts`, `delete_cms_posts`
- `view_cms_media`, `create_cms_media`, `edit_cms_media`, `delete_cms_media`
- `view_cms_menus`, `create_cms_menus`, `edit_cms_menus`, `delete_cms_menus`

#### Social Media Module
- `view_social_media`, `create_social_media`, `edit_social_media`, `delete_social_media`

#### AI Module
- `view_ai`, `create_ai`, `edit_ai`, `delete_ai`

## Implementation Guide

### 1. Route Protection

All routes are protected using middleware:

```php
Route::middleware(['auth', 'permission:view_crm_leads'])->group(function () {
    Route::get('/crm/leads', [LeadController::class, 'index']);
});
```

### 2. Frontend Permission Checks

Use the `usePermissions` hook in React components:

```typescript
import { usePermissions } from '@/Hooks/usePermissions';

const MyComponent = () => {
    const { hasPermission } = usePermissions();
    
    return (
        <div>
            {hasPermission('create_crm_leads') && (
                <Button>Create Lead</Button>
            )}
        </div>
    );
};
```

### 3. Navigation Visibility

Navigation items are automatically hidden based on permissions:

```typescript
const navigationItems = [
    {
        name: 'CRM',
        href: '/crm',
        permission: 'view_crm_leads',
        children: [
            {
                name: 'Leads',
                href: '/crm/leads',
                permission: 'view_crm_leads'
            }
        ]
    }
];
```

### 4. Backend Permission Checks

Use Laravel's built-in permission checking:

```php
// In controllers
if (!auth()->user()->can('create_crm_leads')) {
    abort(403, 'Unauthorized');
}

// In blade templates
@can('create_crm_leads')
    <button>Create Lead</button>
@endcan

// In policies
public function create(User $user)
{
    return $user->can('create_crm_leads');
}
```

## Database Schema

### Roles Table
```sql
CREATE TABLE roles (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    guard_name VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Permissions Table
```sql
CREATE TABLE permissions (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    guard_name VARCHAR(255),
    module VARCHAR(255),
    action VARCHAR(255),
    entity VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Role Has Permissions Table
```sql
CREATE TABLE role_has_permissions (
    permission_id BIGINT,
    role_id BIGINT,
    PRIMARY KEY (permission_id, role_id)
);
```

### Model Has Roles Table
```sql
CREATE TABLE model_has_roles (
    role_id BIGINT,
    model_type VARCHAR(255),
    model_id BIGINT,
    PRIMARY KEY (role_id, model_id, model_type)
);
```

## Admin Interface

### Permission Management
- **Location**: `/admin/permissions`
- **Features**: 
  - View all permissions grouped by module
  - Create new permissions
  - Edit existing permissions
  - Delete unused permissions
  - Bulk operations
  - Search and filter

### Role Management
- **Location**: `/admin/roles`
- **Features**:
  - View all roles
  - Create new roles
  - Edit role permissions
  - Permission matrix view
  - User assignment
  - Role hierarchy protection

### User Management
- **Location**: `/admin/users`
- **Features**:
  - View all users
  - Assign roles to users
  - Bulk role assignment
  - User role history
  - Permission preview

## Security Considerations

### 1. System Role Protection
- Admin role cannot be deleted
- System roles have minimum permission requirements
- Role hierarchy is enforced

### 2. Permission Validation
- All routes require authentication
- Permissions are checked on both frontend and backend
- API endpoints validate permissions

### 3. Audit Trail
- User role changes are logged
- Permission modifications are tracked
- Access attempts are monitored

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check user role assignment
   - Verify permission exists
   - Ensure route middleware is correct

2. **Navigation Not Showing**
   - Check permission name spelling
   - Verify user has required permission
   - Clear browser cache

3. **Database Errors**
   - Run `php artisan migrate`
   - Seed permissions: `php artisan db:seed --class=RolesAndPermissionsSeeder`
   - Clear cache: `php artisan cache:clear`

### Useful Commands

```bash
# Seed roles and permissions
php artisan db:seed --class=RolesAndPermissionsSeeder

# Clear permission cache
php artisan permission:cache-reset

# List all permissions
php artisan permission:show

# Assign role to user
php artisan user:assign-role {user_id} {role_name}
```

## Best Practices

1. **Always check permissions** on both frontend and backend
2. **Use descriptive permission names** following the naming convention
3. **Group related permissions** by module for better organization
4. **Test permission changes** thoroughly before deployment
5. **Document custom permissions** when adding new features
6. **Regular permission audits** to remove unused permissions
7. **Follow the principle of least privilege** when assigning roles

## API Documentation

### Permission Check Endpoint
```
GET /api/permissions/check
Parameters: permission (string)
Response: { "hasPermission": boolean }
```

### User Permissions Endpoint
```
GET /api/user/permissions
Response: { "permissions": string[] }
```

### Role Permissions Endpoint
```
GET /api/roles/{role}/permissions
Response: { "permissions": Permission[] }
```
