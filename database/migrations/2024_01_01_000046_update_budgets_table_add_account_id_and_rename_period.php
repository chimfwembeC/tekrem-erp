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
        Schema::table('budgets', function (Blueprint $table) {
            // Add account_id foreign key
            $table->foreignId('account_id')->nullable()->after('user_id')->constrained()->onDelete('cascade');

            // Rename period column to period_type
            $table->renameColumn('period', 'period_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            // Drop account_id foreign key
            $table->dropForeign(['account_id']);
            $table->dropColumn('account_id');

            // Rename period_type back to period
            $table->renameColumn('period_type', 'period');
        });
    }
};
