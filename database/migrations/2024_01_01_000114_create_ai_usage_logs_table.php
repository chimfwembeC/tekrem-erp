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
        Schema::create('ai_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('ai_model_id')->constrained()->onDelete('cascade');
            $table->foreignId('ai_conversation_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('ai_prompt_template_id')->nullable()->constrained()->onDelete('set null');
            $table->string('operation_type'); // chat, completion, embedding, etc.
            $table->string('context_type')->nullable(); // crm, finance, support, etc.
            $table->unsignedBigInteger('context_id')->nullable();
            $table->longText('prompt');
            $table->longText('response')->nullable();
            $table->integer('input_tokens')->default(0);
            $table->integer('output_tokens')->default(0);
            $table->integer('total_tokens')->default(0);
            $table->decimal('cost', 10, 4)->default(0);
            $table->integer('response_time_ms')->nullable(); // Response time in milliseconds
            $table->string('status'); // success, error, timeout
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable(); // Additional logging data
            $table->timestamps();
            
            $table->index(['user_id', 'created_at']);
            $table->index(['ai_model_id', 'created_at']);
            $table->index(['operation_type', 'created_at']);
            $table->index(['context_type', 'context_id']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_usage_logs');
    }
};
