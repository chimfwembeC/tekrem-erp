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
        Schema::table('transactions', function (Blueprint $table) {
            // Reconciliation tracking fields
            $table->boolean('is_reconciled')->default(false)->after('metadata');
            $table->foreignId('reconciliation_id')->nullable()->after('is_reconciled')->constrained('bank_reconciliations')->onDelete('set null');
            $table->date('reconciled_date')->nullable()->after('reconciliation_id');
            $table->foreignId('reconciled_by')->nullable()->after('reconciled_date')->constrained('users')->onDelete('set null');
            $table->text('reconciliation_notes')->nullable()->after('reconciled_by');
            
            // Chart of Accounts integration
            $table->string('debit_account_code')->nullable()->after('reconciliation_notes');
            $table->string('credit_account_code')->nullable()->after('debit_account_code');
            
            // Indexes for reconciliation queries
            $table->index(['is_reconciled', 'account_id']);
            $table->index(['reconciliation_id']);
            $table->index(['reconciled_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['is_reconciled', 'account_id']);
            $table->dropIndex(['reconciliation_id']);
            $table->dropIndex(['reconciled_date']);
            
            // Drop foreign key constraints
            $table->dropForeign(['reconciliation_id']);
            $table->dropForeign(['reconciled_by']);
            
            // Drop columns
            $table->dropColumn([
                'is_reconciled',
                'reconciliation_id',
                'reconciled_date',
                'reconciled_by',
                'reconciliation_notes',
                'debit_account_code',
                'credit_account_code'
            ]);
        });
    }
};
