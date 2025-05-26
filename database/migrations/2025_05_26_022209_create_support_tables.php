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
        // SLA Policies
        Schema::create('s_l_a_s', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('response_time_hours')->default(24);
            $table->integer('resolution_time_hours')->default(72);
            $table->integer('escalation_time_hours')->default(48);
            $table->boolean('business_hours_only')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->json('priority_levels')->nullable();
            $table->json('conditions')->nullable();
            $table->timestamps();
        });

        // Knowledge Base Categories
        Schema::create('knowledge_base_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('color', 7)->default('#6B7280');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->foreignId('parent_id')->nullable()->constrained('knowledge_base_categories')->onDelete('cascade');
            $table->timestamps();
        });

        // Ticket Categories
        Schema::create('ticket_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color', 7)->default('#6B7280');
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->enum('default_priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->foreignId('default_sla_policy_id')->nullable()->constrained('s_l_a_s')->onDelete('set null');
            $table->foreignId('auto_assign_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('email_template_id')->nullable();
            $table->timestamps();
        });

        // Tickets
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->string('title');
            $table->longText('description');
            $table->enum('status', ['open', 'in_progress', 'pending', 'resolved', 'closed'])->default('open');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->foreignId('category_id')->nullable()->constrained('ticket_categories')->onDelete('set null');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->string('requester_type')->nullable(); // App\Models\Client, App\Models\Lead, App\Models\User
            $table->unsignedBigInteger('requester_id')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->tinyInteger('satisfaction_rating')->nullable(); // 1-5 scale
            $table->text('satisfaction_feedback')->nullable();
            $table->json('tags')->nullable();
            $table->json('metadata')->nullable();
            $table->foreignId('sla_policy_id')->nullable()->constrained('s_l_a_s')->onDelete('set null');
            $table->integer('escalation_level')->default(0);
            $table->timestamp('escalated_at')->nullable();
            $table->timestamp('first_response_at')->nullable();
            $table->integer('resolution_time_minutes')->nullable();
            $table->integer('response_time_minutes')->nullable();
            $table->timestamps();

            $table->index(['requester_type', 'requester_id']);
            $table->index(['status', 'priority']);
            $table->index(['assigned_to', 'status']);
            $table->index(['due_date']);
        });

        // Ticket Comments
        Schema::create('ticket_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->longText('content');
            $table->boolean('is_internal')->default(false);
            $table->boolean('is_solution')->default(false);
            $table->json('attachments')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('time_spent_minutes')->nullable();
            $table->timestamps();
        });

        // Ticket Escalations
        Schema::create('ticket_escalations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
            $table->foreignId('escalated_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('escalated_to')->constrained('users')->onDelete('cascade');
            $table->integer('escalation_level');
            $table->string('reason');
            $table->text('notes')->nullable();
            $table->timestamp('escalated_at');
            $table->timestamp('resolved_at')->nullable();
            $table->enum('status', ['active', 'resolved', 'cancelled'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_escalations');
        Schema::dropIfExists('ticket_comments');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('ticket_categories');
        Schema::dropIfExists('knowledge_base_categories');
        Schema::dropIfExists('s_l_a_s');
    }
};
