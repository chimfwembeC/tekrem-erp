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
        Schema::create('instagram_media', function (Blueprint $table) {
            $table->id();
            $table->string('instagram_media_id')->unique();
            $table->string('account_id'); // Instagram account ID
            $table->enum('media_type', ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']);
            $table->text('media_url')->nullable();
            $table->text('thumbnail_url')->nullable();
            $table->text('caption')->nullable();
            $table->string('permalink');
            $table->timestamp('timestamp');
            $table->integer('like_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->integer('impressions')->nullable();
            $table->integer('reach')->nullable();
            $table->integer('engagement')->nullable();
            $table->integer('saves')->nullable();
            $table->integer('profile_visits')->nullable();
            $table->integer('website_clicks')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();

            $table->index('instagram_media_id');
            $table->index('account_id');
            $table->index('media_type');
            $table->index('timestamp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instagram_media');
    }
};
