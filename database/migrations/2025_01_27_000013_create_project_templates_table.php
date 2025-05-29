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
        Schema::create('project_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            
            // Template configuration
            $table->json('template_data'); // Milestones, team roles, budget, etc.
            $table->boolean('is_active')->default(true);
            
            // Usage tracking
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->integer('usage_count')->default(0);
            
            $table->timestamps();
            
            // Indexes
            $table->index(['category', 'is_active']);
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_templates');
    }
};
