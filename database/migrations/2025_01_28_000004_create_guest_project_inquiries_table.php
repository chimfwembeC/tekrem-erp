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
        Schema::create('guest_project_inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('position')->nullable();
            $table->string('project_type'); // web_development, mobile_app, ai_solution, consulting, custom
            $table->string('project_category')->nullable(); // e-commerce, corporate, portfolio, etc.
            $table->string('project_title');
            $table->text('project_description');
            $table->json('project_goals')->nullable(); // Array of project goals
            $table->json('target_audience')->nullable(); // Target audience details
            $table->json('features_required')->nullable(); // Required features
            $table->json('features_nice_to_have')->nullable(); // Optional features
            $table->string('budget_range')->nullable(); // under_5k, 5k_10k, 10k_25k, 25k_50k, 50k_plus
            $table->string('timeline')->nullable(); // asap, 1_month, 3_months, 6_months, flexible
            $table->date('preferred_start_date')->nullable();
            $table->date('required_completion_date')->nullable();
            $table->boolean('has_existing_system')->default(false);
            $table->text('existing_system_details')->nullable();
            $table->boolean('requires_maintenance')->default(false);
            $table->boolean('requires_hosting')->default(false);
            $table->boolean('requires_training')->default(false);
            $table->json('technology_preferences')->nullable(); // Preferred technologies
            $table->json('design_preferences')->nullable(); // Design style preferences
            $table->json('reference_websites')->nullable(); // Reference sites/apps
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->string('status')->default('new'); // new, reviewing, proposal_sent, accepted, rejected
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('project_id')->nullable()->constrained('projects')->onDelete('set null');
            $table->timestamp('proposal_sent_at')->nullable();
            $table->string('source')->default('website');
            $table->json('metadata')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['status', 'project_type']);
            $table->index(['email', 'created_at']);
            $table->index('reference_number');
            $table->index('assigned_to');
            $table->index('project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_project_inquiries');
    }
};
