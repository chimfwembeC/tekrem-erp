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
        Schema::create('bank_statement_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_statement_id')->constrained()->onDelete('cascade');
            $table->date('transaction_date');
            $table->string('transaction_type'); // debit, credit
            $table->decimal('amount', 15, 2);
            $table->text('description');
            $table->string('reference_number')->nullable();
            $table->string('check_number')->nullable();
            $table->decimal('running_balance', 15, 2)->nullable();
            $table->string('transaction_code')->nullable(); // Bank transaction code
            $table->json('raw_data')->nullable(); // Original data from import
            $table->timestamps();

            // Indexes
            $table->index(['bank_statement_id', 'transaction_date']);
            $table->index(['transaction_date']);
            $table->index(['reference_number']);
            $table->index(['amount']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_statement_transactions');
    }
};
