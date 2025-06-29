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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'active', 'on-hold', 'completed', 'cancelled'])->default('draft');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('category')->nullable();
            
            // Dates
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('deadline')->nullable();
            
            // Budget and progress
            $table->decimal('budget', 15, 2)->nullable();
            $table->decimal('spent_amount', 15, 2)->default(0);
            $table->integer('progress')->default(0); // 0-100 percentage
            
            // Relationships
            $table->foreignId('client_id')->nullable()->constrained('clients')->onDelete('set null');
            $table->foreignId('manager_id')->constrained('users')->onDelete('cascade');
            
            // Team and metadata
            $table->json('team_members')->nullable(); // Array of user IDs
            $table->json('tags')->nullable(); // Project tags
            $table->json('metadata')->nullable(); // Additional project data
            
            $table->timestamps();
            
            // Indexes
            $table->index(['status', 'priority']);
            $table->index(['client_id', 'status']);
            $table->index(['manager_id', 'status']);
            $table->index('deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
