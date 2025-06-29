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
        Schema::create('project_time_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('milestone_id')->nullable()->constrained('project_milestones')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Time tracking
            $table->text('description')->nullable();
            $table->decimal('hours', 8, 2); // Hours worked
            $table->date('log_date');
            
            // Billing information
            $table->boolean('is_billable')->default(true);
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->enum('status', ['draft', 'submitted', 'approved', 'invoiced'])->default('draft');
            
            // Metadata
            $table->json('metadata')->nullable(); // Additional time log data
            
            $table->timestamps();
            
            // Indexes
            $table->index(['project_id', 'user_id']);
            $table->index(['project_id', 'log_date']);
            $table->index(['user_id', 'log_date']);
            $table->index(['status', 'is_billable']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_time_logs');
    }
};
