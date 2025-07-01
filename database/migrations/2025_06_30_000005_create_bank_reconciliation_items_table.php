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
        Schema::create('bank_reconciliation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_reconciliation_id')->constrained()->onDelete('cascade');
            $table->foreignId('bank_statement_transaction_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('transaction_id')->nullable()->constrained()->onDelete('cascade'); // Link to internal transaction
            $table->string('match_type'); // matched, unmatched_bank, unmatched_book, manual_adjustment
            $table->string('match_method')->nullable(); // auto, manual, suggested
            $table->decimal('match_confidence', 5, 2)->nullable(); // Confidence score for auto-matching (0-100)
            $table->decimal('amount_difference', 15, 2)->default(0); // Difference if amounts don't match exactly
            $table->text('match_notes')->nullable(); // Notes about the match
            $table->json('match_criteria')->nullable(); // Criteria used for matching (date, amount, reference, etc.)
            $table->boolean('is_cleared')->default(false); // Whether this item is cleared/reconciled
            $table->foreignId('matched_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('matched_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['bank_reconciliation_id', 'match_type']);
            $table->index(['bank_statement_transaction_id']);
            $table->index(['transaction_id']);
            $table->index(['match_type', 'is_cleared']);
            $table->index(['match_confidence']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_reconciliation_items');
    }
};
