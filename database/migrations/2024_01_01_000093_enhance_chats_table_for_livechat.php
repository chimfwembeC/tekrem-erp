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
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('chats', 'message_type')) {
                $table->string('message_type')->default('text')->after('message');
            }
            if (!Schema::hasColumn('chats', 'attachments')) {
                $table->json('attachments')->nullable()->after('message_type');
            }
            if (!Schema::hasColumn('chats', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('is_read');
            }
            if (!Schema::hasColumn('chats', 'read_at')) {
                $table->timestamp('read_at')->nullable()->after('delivered_at');
            }
            if (!Schema::hasColumn('chats', 'status')) {
                $table->string('status')->default('sent')->after('read_at');
            }
            if (!Schema::hasColumn('chats', 'reply_to_id')) {
                $table->unsignedBigInteger('reply_to_id')->nullable()->after('status');
            }
            if (!Schema::hasColumn('chats', 'is_internal_note')) {
                $table->boolean('is_internal_note')->default(false)->after('reply_to_id');
            }
            if (!Schema::hasColumn('chats', 'metadata')) {
                $table->json('metadata')->nullable()->after('is_internal_note');
            }
        });

        // Note: Foreign key for reply_to_id will be added later if needed
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            // Skip foreign key drop for now

            $columnsToRemove = [
                'message_type',
                'attachments',
                'delivered_at',
                'read_at',
                'status',
                'reply_to_id',
                'is_internal_note',
                'metadata'
            ];

            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('chats', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
