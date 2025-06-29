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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable(); // Conversation title
            $table->nullableMorphs('conversable'); // Client, Lead, or other entities
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->string('status')->default('active'); // active, archived, closed
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->json('participants')->nullable(); // Array of user IDs
            $table->json('tags')->nullable(); // Conversation tags
            $table->timestamp('last_message_at')->nullable();
            $table->unsignedInteger('unread_count')->default(0);
            $table->boolean('is_internal')->default(false); // Internal staff conversation
            $table->json('metadata')->nullable(); // Additional data
            $table->timestamps();

            // Indexes (morphs already creates the index)
            $table->index('status');
            $table->index('priority');
            $table->index('assigned_to');
            $table->index('last_message_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
