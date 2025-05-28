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
        Schema::create('ai_prompt_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category'); // crm, finance, support, general, etc.
            $table->text('description')->nullable();
            $table->longText('template'); // The prompt template with placeholders
            $table->json('variables')->nullable(); // Available variables/placeholders
            $table->json('example_data')->nullable(); // Example data for testing
            $table->boolean('is_public')->default(false); // Can be used by other users
            $table->boolean('is_system')->default(false); // System-provided template
            $table->integer('usage_count')->default(0);
            $table->decimal('avg_rating', 3, 2)->nullable();
            $table->json('tags')->nullable(); // For categorization and search
            $table->timestamps();
            
            $table->index(['category', 'is_public']);
            $table->index(['user_id', 'created_at']);
            $table->index(['is_system', 'is_public']);
            $table->index(['usage_count']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_prompt_templates');
    }
};
