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
        Schema::create('ai_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_service_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('model_identifier'); // The actual model name used in API calls
            $table->string('type'); // chat, completion, embedding, image, etc.
            $table->text('description')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->boolean('is_default')->default(false);
            $table->json('capabilities')->nullable(); // What this model can do
            $table->integer('max_tokens')->nullable();
            $table->decimal('temperature', 3, 2)->default(0.7);
            $table->decimal('top_p', 3, 2)->default(1.0);
            $table->integer('frequency_penalty')->default(0);
            $table->integer('presence_penalty')->default(0);
            $table->decimal('cost_per_input_token', 10, 8)->nullable();
            $table->decimal('cost_per_output_token', 10, 8)->nullable();
            $table->json('configuration')->nullable(); // Model-specific settings
            $table->timestamps();
            
            $table->index(['ai_service_id', 'is_enabled']);
            $table->index(['type', 'is_enabled']);
            $table->index(['is_default', 'is_enabled']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_models');
    }
};
