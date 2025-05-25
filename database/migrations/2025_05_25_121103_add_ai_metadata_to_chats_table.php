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
        Schema::table('chats', function (Blueprint $table) {
            // Add index for AI response queries
            $table->index(['conversation_id', 'created_at']);

            // Add index for metadata queries (if not already exists)
            if (!Schema::hasColumn('chats', 'metadata')) {
                $table->json('metadata')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            // Drop the indexes
            $table->dropIndex(['conversation_id', 'created_at']);
        });
    }
};
