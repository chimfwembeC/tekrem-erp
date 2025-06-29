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
            // Check if metadata column exists before adding it
            if (!Schema::hasColumn('tickets', 'metadata')) {
                $table->json('metadata')->nullable()->after('tags');
            }

            // Add AI processing flags
            if (!Schema::hasColumn('tickets', 'ai_processed')) {
                $table->boolean('ai_processed')->default(false)->after('metadata');
            }
            if (!Schema::hasColumn('tickets', 'ai_processed_at')) {
                $table->timestamp('ai_processed_at')->nullable()->after('ai_processed');
            }

            // Add AI confidence scores
            if (!Schema::hasColumn('tickets', 'ai_category_confidence')) {
                $table->integer('ai_category_confidence')->nullable()->after('ai_processed_at');
            }
            if (!Schema::hasColumn('tickets', 'ai_priority_confidence')) {
                $table->integer('ai_priority_confidence')->nullable()->after('ai_category_confidence');
            }

            // Add AI predictions
            if (!Schema::hasColumn('tickets', 'ai_predicted_resolution_minutes')) {
                $table->integer('ai_predicted_resolution_minutes')->nullable()->after('ai_priority_confidence');
            }
            if (!Schema::hasColumn('tickets', 'ai_sentiment')) {
                $table->string('ai_sentiment')->nullable()->after('ai_predicted_resolution_minutes');
            }
            if (!Schema::hasColumn('tickets', 'ai_urgency_level')) {
                $table->string('ai_urgency_level')->nullable()->after('ai_sentiment');
            }

            // Add escalation risk
            if (!Schema::hasColumn('tickets', 'ai_escalation_risk')) {
                $table->string('ai_escalation_risk')->nullable()->after('ai_urgency_level');
            }

            // Add auto-response flag
            if (!Schema::hasColumn('tickets', 'ai_auto_responded')) {
                $table->boolean('ai_auto_responded')->default(false)->after('ai_escalation_risk');
            }
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
            // Drop indexes if they exist
            try {
                $table->dropIndex(['ai_processed', 'created_at']);
            } catch (\Exception $e) {
                // Index might not exist
            }
            try {
                $table->dropIndex(['ai_sentiment', 'ai_urgency_level']);
            } catch (\Exception $e) {
                // Index might not exist
            }
            try {
                $table->dropIndex(['ai_escalation_risk']);
            } catch (\Exception $e) {
                // Index might not exist
            }

            // Drop columns that were added by this migration
            $columnsToCheck = [
                'ai_processed',
                'ai_processed_at',
                'ai_category_confidence',
                'ai_priority_confidence',
                'ai_predicted_resolution_minutes',
                'ai_sentiment',
                'ai_urgency_level',
                'ai_escalation_risk',
                'ai_auto_responded',
            ];

            foreach ($columnsToCheck as $column) {
                if (Schema::hasColumn('tickets', $column)) {
                    $table->dropColumn($column);
                }
            }

            // Note: We don't drop 'metadata' column as it might have been created by another migration
        });
    }
};
