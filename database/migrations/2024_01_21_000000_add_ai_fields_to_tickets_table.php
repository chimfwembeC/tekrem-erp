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
        Schema::table('tickets', function (Blueprint $table) {
            // Add metadata column for AI analysis results
            $table->json('metadata')->nullable()->after('tags');
            
            // Add AI processing flags
            $table->boolean('ai_processed')->default(false)->after('metadata');
            $table->timestamp('ai_processed_at')->nullable()->after('ai_processed');
            
            // Add AI confidence scores
            $table->integer('ai_category_confidence')->nullable()->after('ai_processed_at');
            $table->integer('ai_priority_confidence')->nullable()->after('ai_category_confidence');
            
            // Add AI predictions
            $table->integer('ai_predicted_resolution_minutes')->nullable()->after('ai_priority_confidence');
            $table->string('ai_sentiment')->nullable()->after('ai_predicted_resolution_minutes');
            $table->string('ai_urgency_level')->nullable()->after('ai_sentiment');
            
            // Add escalation risk
            $table->string('ai_escalation_risk')->nullable()->after('ai_urgency_level');
            
            // Add auto-response flag
            $table->boolean('ai_auto_responded')->default(false)->after('ai_escalation_risk');
        });

        // Add index for AI processing
        Schema::table('tickets', function (Blueprint $table) {
            $table->index(['ai_processed', 'created_at']);
            $table->index(['ai_sentiment', 'ai_urgency_level']);
            $table->index(['ai_escalation_risk']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['ai_processed', 'created_at']);
            $table->dropIndex(['ai_sentiment', 'ai_urgency_level']);
            $table->dropIndex(['ai_escalation_risk']);
            
            $table->dropColumn([
                'metadata',
                'ai_processed',
                'ai_processed_at',
                'ai_category_confidence',
                'ai_priority_confidence',
                'ai_predicted_resolution_minutes',
                'ai_sentiment',
                'ai_urgency_level',
                'ai_escalation_risk',
                'ai_auto_responded',
            ]);
        });
    }
};
