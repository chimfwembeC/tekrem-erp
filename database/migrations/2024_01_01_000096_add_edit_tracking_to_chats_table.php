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
            // Add edit tracking columns
            $table->boolean('is_edited')->default(false)->after('is_pinned');
            $table->timestamp('edited_at')->nullable()->after('is_edited');
            $table->text('original_message')->nullable()->after('edited_at');
            $table->json('edit_history')->nullable()->after('original_message');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->dropColumn(['is_edited', 'edited_at', 'original_message', 'edit_history']);
        });
    }
};
