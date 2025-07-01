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
        Schema::create('bank_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->string('statement_number')->nullable();
            $table->date('statement_date');
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('opening_balance', 15, 2);
            $table->decimal('closing_balance', 15, 2);
            $table->decimal('total_debits', 15, 2)->default(0);
            $table->decimal('total_credits', 15, 2)->default(0);
            $table->integer('transaction_count')->default(0);
            $table->string('import_method')->default('manual'); // manual, csv, excel, api
            $table->string('file_path')->nullable(); // Path to uploaded file
            $table->string('file_name')->nullable(); // Original file name
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->json('import_metadata')->nullable(); // Additional import information
            $table->foreignId('imported_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('imported_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            // Indexes
            $table->index(['account_id', 'statement_date']);
            $table->index(['status']);
            $table->index(['period_start', 'period_end']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_statements');
    }
};
