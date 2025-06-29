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
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('ai_model_id')->constrained()->onDelete('cascade');
            $table->string('title')->nullable();
            $table->string('context_type')->nullable(); // crm, finance, support, etc.
            $table->unsignedBigInteger('context_id')->nullable(); // ID of related record
            $table->json('messages'); // Array of conversation messages
            $table->json('metadata')->nullable(); // Additional conversation data
            $table->integer('total_tokens')->default(0);
            $table->decimal('total_cost', 10, 4)->default(0);
            $table->integer('message_count')->default(0);
            $table->timestamp('last_message_at')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
            
            $table->index(['user_id', 'created_at']);
            $table->index(['context_type', 'context_id']);
            $table->index(['ai_model_id', 'created_at']);
            $table->index(['is_archived', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_conversations');
    }
};
