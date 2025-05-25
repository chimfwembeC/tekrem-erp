<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Remove chat messages that are not part of any conversation
        // This cleans up old chat data that was created before the LiveChat system
        DB::table('chats')
            ->whereNull('conversation_id')
            ->delete();
            
        // Note: We keep the chats table structure as it's now used by LiveChat
        // The old ChatController and frontend pages have been removed
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not reversible as we're cleaning up data
        // If you need to restore old chat data, restore from backup
    }
};
