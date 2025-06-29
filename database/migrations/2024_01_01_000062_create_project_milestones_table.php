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
        Schema::create('project_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            
            // Dates
            $table->date('due_date')->nullable();
            $table->date('completion_date')->nullable();
            
            // Progress and status
            $table->integer('progress')->default(0); // 0-100 percentage
            $table->enum('status', ['pending', 'in-progress', 'completed', 'overdue'])->default('pending');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            
            // Assignment and dependencies
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->json('dependencies')->nullable(); // Array of milestone IDs that must be completed first
            $table->integer('order')->default(0); // Order within the project
            
            // Metadata
            $table->json('metadata')->nullable(); // Additional milestone data
            
            $table->timestamps();
            
            // Indexes
            $table->index(['project_id', 'status']);
            $table->index(['project_id', 'order']);
            $table->index(['assigned_to', 'status']);
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_milestones');
    }
};
