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
        Schema::create('ai_services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('provider'); // mistral, openai, anthropic
            $table->string('api_key')->nullable();
            $table->string('api_url')->nullable();
            $table->json('configuration')->nullable(); // Additional config options
            $table->boolean('is_enabled')->default(true);
            $table->boolean('is_default')->default(false);
            $table->integer('priority')->default(0); // For ordering
            $table->text('description')->nullable();
            $table->json('supported_features')->nullable(); // chat, completion, embedding, etc.
            $table->decimal('cost_per_token', 10, 8)->nullable();
            $table->integer('rate_limit_per_minute')->nullable();
            $table->integer('max_tokens_per_request')->nullable();
            $table->timestamps();
            
            $table->index(['provider', 'is_enabled']);
            $table->index(['is_default', 'is_enabled']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_services');
    }
};
