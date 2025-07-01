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
        Schema::create('bank_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->foreignId('bank_statement_id')->constrained()->onDelete('cascade');
            $table->string('reconciliation_number')->unique();
            $table->date('reconciliation_date');
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('statement_opening_balance', 15, 2);
            $table->decimal('statement_closing_balance', 15, 2);
            $table->decimal('book_opening_balance', 15, 2);
            $table->decimal('book_closing_balance', 15, 2);
            $table->decimal('difference', 15, 2)->default(0);
            $table->string('status')->default('in_progress'); // in_progress, completed, reviewed, approved
            $table->integer('matched_transactions_count')->default(0);
            $table->integer('unmatched_bank_transactions_count')->default(0);
            $table->integer('unmatched_book_transactions_count')->default(0);
            $table->decimal('matched_amount', 15, 2)->default(0);
            $table->decimal('unmatched_bank_amount', 15, 2)->default(0);
            $table->decimal('unmatched_book_amount', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->json('reconciliation_summary')->nullable(); // Summary data for reporting
            $table->foreignId('reconciled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reconciled_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            // Indexes
            $table->index(['account_id', 'reconciliation_date']);
            $table->index(['status']);
            $table->index(['period_start', 'period_end']);
            $table->index(['reconciliation_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_reconciliations');
    }
};
