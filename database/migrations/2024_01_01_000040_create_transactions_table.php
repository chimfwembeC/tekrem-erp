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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // income, expense, transfer
            $table->decimal('amount', 15, 2);
            $table->text('description');
            $table->date('transaction_date');
            $table->string('reference_number')->nullable();
            $table->string('status')->default('completed'); // pending, completed, cancelled
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('transfer_to_account_id')->nullable()->constrained('accounts')->onDelete('set null');
            $table->unsignedBigInteger('invoice_id')->nullable();
            $table->unsignedBigInteger('expense_id')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('metadata')->nullable(); // For additional data
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
