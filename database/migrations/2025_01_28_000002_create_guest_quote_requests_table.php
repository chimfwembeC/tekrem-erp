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
        Schema::create('guest_quote_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('position')->nullable();
            $table->string('service_type'); // web_development, mobile_app, ai_solution, custom
            $table->text('project_description');
            $table->string('budget_range')->nullable(); // under_5k, 5k_10k, 10k_25k, 25k_50k, 50k_plus
            $table->string('timeline')->nullable(); // asap, 1_month, 3_months, 6_months, flexible
            $table->json('requirements')->nullable(); // Specific requirements array
            $table->json('features')->nullable(); // Requested features array
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->string('status')->default('new'); // new, reviewing, quoted, accepted, rejected
            $table->decimal('quoted_amount', 10, 2)->nullable();
            $table->string('quoted_currency', 3)->default('USD');
            $table->text('quote_notes')->nullable();
            $table->timestamp('quoted_at')->nullable();
            $table->timestamp('quote_expires_at')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('quotation_id')->nullable()->constrained('quotations')->onDelete('set null');
            $table->string('source')->default('website');
            $table->json('metadata')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['status', 'service_type']);
            $table->index(['email', 'created_at']);
            $table->index('reference_number');
            $table->index('assigned_to');
            $table->index('quotation_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_quote_requests');
    }
};
