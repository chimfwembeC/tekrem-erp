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
        Schema::create('project_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('milestone_id')->nullable()->constrained('project_milestones')->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['task', 'issue', 'bug', 'feature', 'improvement'])->default('task');
            $table->enum('status', ['todo', 'in-progress', 'review', 'testing', 'done', 'cancelled'])->default('todo');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            
            // Assignment
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            
            // Dates
            $table->date('due_date')->nullable();
            $table->date('start_date')->nullable();
            $table->date('completed_date')->nullable();
            
            // Progress and estimation
            $table->integer('progress')->default(0); // 0-100 percentage
            $table->decimal('estimated_hours', 8, 2)->nullable();
            $table->decimal('actual_hours', 8, 2)->default(0);
            
            // Dependencies and relationships
            $table->json('dependencies')->nullable(); // Array of task IDs that must be completed first
            $table->foreignId('parent_task_id')->nullable()->constrained('project_tasks')->onDelete('set null');
            
            // Additional fields
            $table->integer('order')->default(0);
            $table->json('metadata')->nullable(); // Additional task data
            
            $table->timestamps();
            
            // Indexes
            $table->index(['project_id', 'status']);
            $table->index(['project_id', 'type']);
            $table->index(['assigned_to', 'status']);
            $table->index(['milestone_id', 'status']);
            $table->index(['created_by', 'status']);
            $table->index('due_date');
            $table->index(['project_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_tasks');
    }
};
