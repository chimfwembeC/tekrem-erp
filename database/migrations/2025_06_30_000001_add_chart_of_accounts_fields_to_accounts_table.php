<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            // Chart of Accounts specific fields
            $table->string('account_code', 20)->nullable()->after('name');
            $table->string('account_category')->nullable()->after('type'); // assets, liabilities, equity, income, expenses
            $table->string('account_subcategory')->nullable()->after('account_category'); // current_assets, fixed_assets, etc.
            $table->foreignId('parent_account_id')->nullable()->after('account_subcategory')->constrained('accounts')->onDelete('set null');
            $table->integer('level')->default(0)->after('parent_account_id'); // Hierarchy level (0 = root)
            $table->string('normal_balance')->default('debit')->after('level'); // debit or credit
            $table->boolean('is_system_account')->default(false)->after('normal_balance'); // System-generated accounts
            $table->boolean('allow_manual_entries')->default(true)->after('is_system_account'); // Allow manual journal entries
            $table->json('account_settings')->nullable()->after('allow_manual_entries'); // Additional settings
            
            // Indexing for performance
            $table->index(['account_code']);
            $table->index(['account_category', 'account_subcategory']);
            $table->index(['parent_account_id', 'level']);
            $table->index(['is_active', 'account_category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['account_code']);
            $table->dropIndex(['account_category', 'account_subcategory']);
            $table->dropIndex(['parent_account_id', 'level']);
            $table->dropIndex(['is_active', 'account_category']);
            
            // Drop foreign key constraint
            $table->dropForeign(['parent_account_id']);
            
            // Drop columns
            $table->dropColumn([
                'account_code',
                'account_category',
                'account_subcategory',
                'parent_account_id',
                'level',
                'normal_balance',
                'is_system_account',
                'allow_manual_entries',
                'account_settings'
            ]);
        });
    }
};
