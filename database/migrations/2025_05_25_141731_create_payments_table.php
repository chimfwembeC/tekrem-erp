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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique();
            $table->decimal('amount', 15, 2);
            $table->date('payment_date');
            $table->string('payment_method'); // cash, bank_transfer, credit_card, check, etc.
            $table->string('status')->default('completed'); // pending, completed, failed, refunded
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->nullableMorphs('payable'); // For client or lead
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('metadata')->nullable(); // For payment gateway data
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
