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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2);
            $table->date('expense_date');
            $table->string('vendor')->nullable();
            $table->string('receipt_number')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected, paid
            $table->boolean('is_billable')->default(false);
            $table->boolean('is_reimbursable')->default(false);
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('account_id')->nullable()->constrained()->onDelete('set null');
            $table->nullableMorphs('expensable'); // For client or project
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('attachments')->nullable(); // For receipt images/files
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
