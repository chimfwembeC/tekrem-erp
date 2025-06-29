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
        Schema::table('ticket_comments', function (Blueprint $table) {
            // Add AI-generated flag
            $table->boolean('is_ai_generated')->default(false)->after('is_solution');
            
            // Add AI confidence score for generated responses
            $table->integer('ai_confidence')->nullable()->after('is_ai_generated');
            
            // Add AI intent detection
            $table->string('ai_detected_intent')->nullable()->after('ai_confidence');
            
            // Add AI sentiment analysis for customer comments
            $table->string('ai_sentiment')->nullable()->after('ai_detected_intent');
            
            // Add AI helpfulness score
            $table->integer('ai_helpfulness_score')->nullable()->after('ai_sentiment');
        });

        // Add indexes for AI fields
        Schema::table('ticket_comments', function (Blueprint $table) {
            $table->index(['is_ai_generated']);
            $table->index(['ai_sentiment']);
            $table->index(['ai_detected_intent']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ticket_comments', function (Blueprint $table) {
            $table->dropIndex(['is_ai_generated']);
            $table->dropIndex(['ai_sentiment']);
            $table->dropIndex(['ai_detected_intent']);
            
            $table->dropColumn([
                'is_ai_generated',
                'ai_confidence',
                'ai_detected_intent',
                'ai_sentiment',
                'ai_helpfulness_score',
            ]);
        });
    }
};
