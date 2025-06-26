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
        Schema::create('guest_support_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('category')->default('general'); // general, technical, billing, feature_request
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->string('subject');
            $table->text('description');
            $table->string('status')->default('open'); // open, in_progress, waiting_customer, resolved, closed
            $table->json('attachments')->nullable(); // File attachments
            $table->string('product_version')->nullable();
            $table->string('browser')->nullable();
            $table->string('operating_system')->nullable();
            $table->text('steps_to_reproduce')->nullable();
            $table->text('expected_behavior')->nullable();
            $table->text('actual_behavior')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('support_ticket_id')->nullable()->constrained('tickets')->onDelete('set null');
            $table->timestamp('first_response_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->integer('satisfaction_rating')->nullable(); // 1-5 rating
            $table->text('satisfaction_feedback')->nullable();
            $table->string('source')->default('website');
            $table->json('metadata')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['status', 'category']);
            $table->index(['email', 'created_at']);
            $table->index('ticket_number');
            $table->index('assigned_to');
            $table->index('support_ticket_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_support_tickets');
    }
};
