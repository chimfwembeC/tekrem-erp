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
        Schema::create('facebook_pages', function (Blueprint $table) {
            $table->id();
            $table->string('facebook_page_id')->unique();
            $table->string('name');
            $table->string('category')->nullable();
            $table->text('access_token');
            $table->string('picture_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('webhook_subscribed')->default(false);
            $table->timestamp('last_sync_at')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->index(['facebook_page_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facebook_pages');
    }
};
