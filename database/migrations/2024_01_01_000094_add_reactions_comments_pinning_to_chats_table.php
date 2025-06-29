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
            // Add reactions column (JSON array of reactions)
            $table->json('reactions')->nullable()->after('attachments');

            // Add pinned status
            $table->boolean('is_pinned')->default(false)->after('is_internal_note');
            $table->timestamp('pinned_at')->nullable()->after('is_pinned');
            $table->unsignedBigInteger('pinned_by')->nullable()->after('pinned_at');

            // Add foreign key for pinned_by
            $table->foreign('pinned_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->dropForeign(['pinned_by']);
            $table->dropColumn(['reactions', 'is_pinned', 'pinned_at', 'pinned_by']);
        });
    }
};
