<?php

/**
 * TekRem ERP Migration Reordering Script
 * 
 * This script reorders Laravel migrations in the correct dependency order
 * to prevent foreign key constraint errors.
 */

// Define the correct migration order based on dependencies
$migrationOrder = [
    // Level 0: Core Foundation (No Dependencies)
    '2024_01_01_000001' => '0001_01_01_000000_create_users_table.php',
    '2024_01_01_000002' => '0001_01_01_000001_create_cache_table.php',
    '2024_01_01_000003' => '0001_01_01_000002_create_jobs_table.php',
    '2024_01_01_000004' => '2025_05_23_105656_create_personal_access_tokens_table.php',
    '2024_01_01_000005' => '2025_05_23_105618_add_two_factor_columns_to_users_table.php',
    '2024_01_01_000006' => '2025_05_23_112018_create_settings_table.php',

    // Level 1: Permission System (Depends on users)
    '2024_01_01_000010' => '2025_05_23_110928_create_permission_tables.php',
    '2024_01_01_000011' => '2025_05_23_152215_create_role_user_table.php',
    '2024_01_01_000012' => '2025_05_23_152451_create_permission_user.php',
    '2024_01_01_000013' => '2025_05_29_213919_add_description_to_roles_and_permissions_tables.php',

    // Level 2: Core Business Tables
    '2024_01_01_000020' => '2025_01_27_000016_create_tags_table.php',
    '2024_01_01_000021' => '2025_05_25_141640_create_categories_table.php',
    '2024_01_01_000022' => '2025_05_25_141650_create_accounts_table.php',
    '2024_01_01_000023' => '2025_05_29_163506_create_hr_departments_table.php',
    '2024_01_01_000024' => '2025_05_29_163516_create_hr_leave_types_table.php',
    '2024_01_01_000025' => '2025_05_29_163544_create_hr_skills_table.php',

    // Level 3: CRM Module
    '2024_01_01_000030' => '2024_01_26_133715_create_leads_table.php',
    '2024_01_01_000031' => '2025_01_27_000009_create_clients_table.php',
    '2024_01_01_000032' => '2025_05_23_133724_create_communications_table.php',

    // Level 4: Finance Module
    '2024_01_01_000040' => '2025_05_25_141660_create_transactions_table.php',
    '2024_01_01_000041' => '2025_05_25_141708_create_invoices_table.php',
    '2024_01_01_000042' => '2025_05_25_141720_create_invoice_items_table.php',
    '2024_01_01_000043' => '2025_05_25_141731_create_payments_table.php',
    '2024_01_01_000044' => '2025_05_25_141741_create_expenses_table.php',
    '2024_01_01_000045' => '2025_05_25_141752_create_budgets_table.php',
    '2024_01_01_000046' => '2025_05_26_014201_update_budgets_table_add_account_id_and_rename_period.php',
    '2024_01_01_000047' => '2025_05_25_143609_add_foreign_keys_to_transactions_table.php',
    '2024_01_01_000048' => '2025_05_26_022329_create_quotations_table.php',
    '2024_01_01_000049' => '2025_05_26_022330_create_quotation_items_table.php',
    '2024_01_01_000050' => '2025_01_27_000003_create_finance_templates_table.php',
    '2024_01_01_000051' => '2025_01_27_000004_create_approval_workflows_table.php',

    // Level 4: Projects Module
    '2024_01_01_000060' => '2025_01_27_000010_create_projects_table.php',
    '2024_01_01_000061' => '2025_01_27_000013_create_project_templates_table.php',
    '2024_01_01_000062' => '2025_01_27_000011_create_project_milestones_table.php',
    '2024_01_01_000063' => '2025_01_27_000012_create_project_files_table.php',
    '2024_01_01_000064' => '2025_01_27_000015_create_project_team_members_table.php',
    '2024_01_01_000065' => '2025_01_27_000017_create_project_tags_table.php',
    '2024_01_01_000066' => '2025_01_27_000018_create_project_tasks_table.php',
    '2024_01_01_000067' => '2025_01_27_000014_create_project_time_logs_table.php',

    // Level 4: HR Module
    '2024_01_01_000070' => '2025_05_29_163511_create_hr_employees_table.php',
    '2024_01_01_000071' => '2025_05_29_163520_create_hr_leaves_table.php',
    '2024_01_01_000072' => '2025_05_29_163526_create_hr_performances_table.php',
    '2024_01_01_000073' => '2025_05_29_163532_create_hr_attendances_table.php',
    '2024_01_01_000074' => '2025_05_29_163538_create_hr_trainings_table.php',
    '2024_01_01_000075' => '2025_05_29_163755_create_hr_employee_skills_table.php',
    '2024_01_01_000076' => '2025_05_29_163802_create_hr_training_enrollments_table.php',

    // Level 4: Support Module
    '2024_01_01_000080' => '2025_05_26_022209_create_support_tables.php',
    '2024_01_01_000081' => '2025_05_26_022328_create_knowledge_base_and_faq_tables.php',
    '2024_01_01_000082' => '2025_05_26_022210_add_ai_fields_to_tickets_table.php',
    '2024_01_01_000083' => '2025_05_26_022211_add_ai_fields_to_ticket_comments_table.php',

    // Level 5: Communication System
    '2024_01_01_000090' => '2025_05_24_120001_create_conversations_table.php',
    '2024_01_01_000091' => '2025_05_23_133735_create_chats_table.php',
    '2024_01_01_000092' => '2025_05_24_120002_add_conversation_id_to_chats_table.php',
    '2024_01_01_000093' => '2025_05_24_120000_enhance_chats_table_for_livechat.php',
    '2024_01_01_000094' => '2025_05_24_161832_add_reactions_comments_pinning_to_chats_table.php',
    '2024_01_01_000095' => '2025_05_24_162308_create_message_comments_table.php',
    '2024_01_01_000096' => '2025_05_25_071249_add_edit_tracking_to_chats_table.php',
    '2024_01_01_000097' => '2025_05_25_084532_make_created_by_nullable_in_conversations_table.php',
    '2024_01_01_000098' => '2025_05_25_084634_make_user_id_nullable_in_chats_table.php',
    '2024_01_01_000099' => '2025_05_25_121103_add_ai_metadata_to_chats_table.php',
    '2024_01_01_000100' => '2025_05_24_130000_cleanup_old_chat_data.php',
    '2024_01_01_000101' => '2025_05_23_141323_create_notifications_table.php',
    '2024_01_01_000102' => '2025_05_25_095130_create_user_notification_preferences_table.php',

    // Level 5: AI Module
    '2024_01_01_000110' => '2024_01_25_000001_create_ai_services_table.php',
    '2024_01_01_000111' => '2024_01_25_000002_create_ai_models_table.php',
    '2024_01_01_000112' => '2024_01_25_000003_create_ai_conversations_table.php',
    '2024_01_01_000113' => '2024_01_25_000004_create_ai_prompt_templates_table.php',
    '2024_01_01_000114' => '2024_01_25_000005_create_ai_usage_logs_table.php',

    // Level 5: CMS Module
    '2024_01_01_000120' => '2024_01_22_000002_create_cms_templates_table.php',
    '2024_01_01_000121' => '2024_01_22_000003_create_cms_media_folders_table.php',
    '2024_01_01_000122' => '2024_01_22_000000_create_cms_pages_table.php',
    '2024_01_01_000123' => '2024_01_22_000001_create_cms_page_revisions_table.php',
    '2024_01_01_000124' => '2024_01_22_000004_create_cms_menus_table.php',
    '2024_01_01_000125' => '2024_01_22_000005_create_cms_media_table.php',
    '2024_01_01_000126' => '2024_01_22_000006_create_cms_redirects_table.php',

    // Level 6: Guest/Public Module
    '2024_01_01_000130' => '2025_01_27_000001_create_guest_sessions_table.php',
    '2024_01_01_000131' => '2025_01_28_000001_create_guest_inquiries_table.php',
    '2024_01_01_000132' => '2025_01_28_000002_create_guest_quote_requests_table.php',
    '2024_01_01_000133' => '2025_01_28_000003_create_guest_support_tickets_table.php',
    '2024_01_01_000134' => '2025_01_28_000004_create_guest_project_inquiries_table.php',

    // Level 7: Automation and Enhancement
    '2024_01_01_000140' => '2024_01_20_000000_create_automation_rules_table.php',
];

$migrationsPath = __DIR__ . '/database/migrations/';

echo "🔄 Starting TekRem ERP Migration Reordering...\n";
echo "📁 Migration path: {$migrationsPath}\n";
echo "📊 Total migrations to reorder: " . count($migrationOrder) . "\n\n";

// Create backup directory
$backupPath = $migrationsPath . 'backup_' . date('Y_m_d_H_i_s') . '/';
if (!is_dir($backupPath)) {
    mkdir($backupPath, 0755, true);
    echo "📦 Created backup directory: {$backupPath}\n";
}

$renamed = 0;
$errors = 0;

foreach ($migrationOrder as $newTimestamp => $originalFile) {
    $originalPath = $migrationsPath . $originalFile;
    
    if (!file_exists($originalPath)) {
        echo "❌ File not found: {$originalFile}\n";
        $errors++;
        continue;
    }
    
    // Create backup
    copy($originalPath, $backupPath . $originalFile);
    
    // Generate new filename - extract everything after the first underscore following the timestamp
    $parts = explode('_', $originalFile);
    if (count($parts) >= 4) {
        // Remove first 4 parts (YYYY_MM_DD_HHMMSS) and rejoin
        $suffix = implode('_', array_slice($parts, 4));
        $newFilename = $newTimestamp . '_' . $suffix;
    } else {
        // Fallback for unusual naming patterns
        $newFilename = $newTimestamp . '_' . substr($originalFile, strpos($originalFile, '_', 11) + 1);
    }
    $newPath = $migrationsPath . $newFilename;
    
    // Rename file
    if (rename($originalPath, $newPath)) {
        echo "✅ Renamed: {$originalFile} → {$newFilename}\n";
        $renamed++;
    } else {
        echo "❌ Failed to rename: {$originalFile}\n";
        $errors++;
    }
}

echo "\n🎉 Migration reordering completed!\n";
echo "✅ Successfully renamed: {$renamed} files\n";
echo "❌ Errors: {$errors} files\n";
echo "📦 Backup created at: {$backupPath}\n";

if ($errors === 0) {
    echo "\n🚀 All migrations are now in the correct dependency order!\n";
    echo "💡 You can now run: php artisan migrate:fresh --seed\n";
} else {
    echo "\n⚠️  Some files had errors. Please check the output above.\n";
}
