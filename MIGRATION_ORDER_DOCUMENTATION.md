# TekRem ERP Database Migration Order Documentation

## Overview
This document outlines the final migration order for the TekRem ERP system, organized to prevent foreign key constraint errors during `php artisan migrate:fresh --seed`.

## Migration Dependency Levels

### Level 0: Foundation Tables (000001-000013)
Core Laravel and authentication tables that have no dependencies:
- `2024_01_01_000001_create_users_table.php` - Base user authentication
- `2024_01_01_000002_create_cache_table.php` - Laravel cache system
- `2024_01_01_000003_create_jobs_table.php` - Queue system
- `2024_01_01_000004_create_personal_access_tokens_table.php` - API tokens
- `2024_01_01_000005_add_two_factor_columns_to_users_table.php` - 2FA enhancement
- `2024_01_01_000006_create_settings_table.php` - System settings
- `2024_01_01_000010_create_permission_tables.php` - Spatie permissions
- `2024_01_01_000011_create_role_user_table.php` - User-role relationships
- `2024_01_01_000012_create_permission_user.php` - User permissions
- `2024_01_01_000013_add_description_to_roles_and_permissions_tables.php` - RBAC enhancements

### Level 1: Business Foundation Tables (000020-000025)
Basic business entities with minimal dependencies:
- `2024_01_01_000020_create_tags_table.php` - Global tagging system
- `2024_01_01_000021_create_categories_table.php` - General categories
- `2024_01_01_000022_create_accounts_table.php` - Financial accounts
- `2024_01_01_000023_create_hr_departments_table.php` - HR departments
- `2024_01_01_000024_create_hr_leave_types_table.php` - Leave types
- `2024_01_01_000025_create_hr_skills_table.php` - Skills catalog

### Level 2: CRM Module (000030-000036)
Customer relationship management tables:
- `2024_01_01_000030_create_clients_table.php` - Client records
- `2024_01_01_000032_create_communications_table.php` - Communication logs
- `2024_01_01_000035_create_leads_table.php` - Lead management
- `2024_01_01_000036_add_crm_foreign_keys.php` - Cross-references between leads/clients

### Level 3: Finance Module (000040-000051)
Financial management system:
- `2024_01_01_000040_create_transactions_table.php` - Financial transactions
- `2024_01_01_000041_create_invoices_table.php` - Invoice management
- `2024_01_01_000042_create_invoice_items_table.php` - Invoice line items
- `2024_01_01_000043_create_payments_table.php` - Payment tracking
- `2024_01_01_000044_create_expenses_table.php` - Expense management
- `2024_01_01_000045_create_budgets_table.php` - Budget planning
- `2024_01_01_000046_update_budgets_table_add_account_id_and_rename_period.php` - Budget enhancements
- `2024_01_01_000047_add_foreign_keys_to_transactions_table.php` - Transaction relationships
- `2024_01_01_000048_create_quotations_table.php` - Quote management
- `2024_01_01_000049_create_quotation_items_table.php` - Quote line items
- `2024_01_01_000050_create_finance_templates_table.php` - Financial templates
- `2024_01_01_000051_create_approval_workflows_table.php` - Approval processes

### Level 4: Projects Module (000060-000067)
Project management system:
- `2024_01_01_000060_create_projects_table.php` - Project records
- `2024_01_01_000061_create_project_templates_table.php` - Project templates
- `2024_01_01_000062_create_project_milestones_table.php` - Project milestones
- `2024_01_01_000063_create_project_files_table.php` - File attachments
- `2024_01_01_000064_create_project_team_members_table.php` - Team assignments
- `2024_01_01_000065_create_project_tags_table.php` - Project tagging
- `2024_01_01_000066_create_project_tasks_table.php` - Task management
- `2024_01_01_000067_create_project_time_logs_table.php` - Time tracking

### Level 5: HR Module (000070-000076)
Human resources management:
- `2024_01_01_000070_create_hr_employees_table.php` - Employee records
- `2024_01_01_000071_create_hr_leaves_table.php` - Leave management
- `2024_01_01_000072_create_hr_performances_table.php` - Performance reviews
- `2024_01_01_000073_create_hr_attendances_table.php` - Attendance tracking
- `2024_01_01_000074_create_hr_trainings_table.php` - Training programs
- `2024_01_01_000075_create_hr_employee_skills_table.php` - Employee skills mapping
- `2024_01_01_000076_create_hr_training_enrollments_table.php` - Training enrollments

### Level 6: Support Module (000080-000083)
Customer support and knowledge base:
- `2024_01_01_000080_create_support_tables.php` - Support tickets and SLAs
- `2024_01_01_000081_create_knowledge_base_and_faq_tables.php` - Knowledge base
- `2024_01_01_000082_add_ai_fields_to_tickets_table.php` - AI integration for tickets
- `2024_01_01_000083_add_ai_fields_to_ticket_comments_table.php` - AI for comments

### Level 7: Communication Module (000090-000102)
Real-time messaging and notifications:
- `2024_01_01_000090_create_conversations_table.php` - Conversation threads
- `2024_01_01_000091_create_chats_table.php` - Chat messages
- `2024_01_01_000092_add_conversation_id_to_chats_table.php` - Chat-conversation linking
- `2024_01_01_000093_enhance_chats_table_for_livechat.php` - LiveChat features
- `2024_01_01_000094_add_reactions_comments_pinning_to_chats_table.php` - Message interactions
- `2024_01_01_000095_create_message_comments_table.php` - Message comments
- `2024_01_01_000096_add_edit_tracking_to_chats_table.php` - Edit history
- `2024_01_01_000097_make_created_by_nullable_in_conversations_table.php` - Guest support
- `2024_01_01_000098_make_user_id_nullable_in_chats_table.php` - Anonymous messaging
- `2024_01_01_000099_add_ai_metadata_to_chats_table.php` - AI integration
- `2024_01_01_000100_cleanup_old_chat_data.php` - Data cleanup
- `2024_01_01_000101_create_notifications_table.php` - Notification system
- `2024_01_01_000102_create_user_notification_preferences_table.php` - User preferences

### Level 8: AI Module (000110-000114)
Artificial intelligence integration:
- `2024_01_01_000110_create_ai_services_table.php` - AI service providers
- `2024_01_01_000111_create_ai_models_table.php` - AI model configurations
- `2024_01_01_000112_create_ai_conversations_table.php` - AI conversation logs
- `2024_01_01_000113_create_ai_prompt_templates_table.php` - Prompt templates
- `2024_01_01_000114_create_ai_usage_logs_table.php` - Usage tracking

### Level 9: CMS Module (000120-000126)
Content management system:
- `2024_01_01_000120_create_cms_templates_table.php` - Page templates
- `2024_01_01_000121_create_cms_media_folders_table.php` - Media organization
- `2024_01_01_000122_create_cms_pages_table.php` - Web pages
- `2024_01_01_000123_create_cms_page_revisions_table.php` - Version control
- `2024_01_01_000124_create_cms_menus_table.php` - Navigation menus
- `2024_01_01_000125_create_cms_media_table.php` - Media files
- `2024_01_01_000126_create_cms_redirects_table.php` - URL redirects

### Level 10: Guest Module (000130-000134)
Public-facing features:
- `2024_01_01_000130_create_guest_sessions_table.php` - Guest sessions
- `2024_01_01_000131_create_guest_inquiries_table.php` - Contact inquiries
- `2024_01_01_000132_create_guest_quote_requests_table.php` - Quote requests
- `2024_01_01_000133_create_guest_support_tickets_table.php` - Guest support
- `2024_01_01_000134_create_guest_project_inquiries_table.php` - Project inquiries

### Level 11: Automation (000140)
Business process automation:
- `2024_01_01_000140_create_automation_rules_table.php` - Automation rules

## Key Fixes Applied

### 1. CRM Circular Dependency Resolution
**Problem**: Leads table referenced clients table, but clients table also referenced leads table.
**Solution**:
- Created clients table first (000030)
- Created leads table second (000035)
- Added foreign key constraints in separate migration (000036)

### 2. Recaptcha Environment Configuration
**Enhancement**: Modified recaptcha system to be disabled in development environments:
- Updated `RecaptchaMiddleware` to skip validation in local/development/dev environments
- Modified `RecaptchaController::verify()` to return success in development
- Updated `HandleInertiaRequests` to disable recaptcha frontend in development

### 3. Migration Timestamp Standardization
**Process**: All 81 migration files were renamed with sequential timestamps (2024_01_01_000XXX) to ensure proper ordering.

## Seeder Order
The DatabaseSeeder.php runs seeders in the following dependency order:
1. RolesAndPermissionsSeeder - RBAC foundation
2. UserSeeder - User accounts
3. SettingsSeeder - System configuration
4. FinanceCategoriesSeeder - Financial categories
5. TagSeeder - Global tags
6. CrmSeeder - CRM sample data
7. HRSeeder - HR sample data
8. ProjectSeeder - Project sample data
9. SupportModuleSeeder - Support tickets
10. CommunicationSeeder - Communication logs
11. LiveChatSeeder - Chat conversations
12. NotificationSeeder - Basic notifications
13. EnhancedNotificationSeeder - Advanced notifications
14. AIModuleSeeder - AI configurations
15. CMSSeeder - Content management

## Verification Results
✅ **Migration Test**: `php artisan migrate:fresh --seed` completed successfully
✅ **All 81 migrations** executed without foreign key constraint errors
✅ **All seeders** completed successfully with sample data
✅ **Recaptcha** properly configured for environment-based activation

## Maintenance Notes
- When adding new migrations, follow the established numbering scheme
- Ensure new tables with foreign keys are placed after their referenced tables
- Test migration order with `php artisan migrate:fresh --seed` before deployment
- Update this documentation when significant changes are made to the migration structure
