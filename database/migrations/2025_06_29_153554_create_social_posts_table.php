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
        Schema::create('social_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('platform', ['facebook', 'instagram', 'linkedin', 'twitter']);
            $table->string('platform_page_id')->nullable();
            $table->string('platform_post_id')->nullable();
            $table->string('title')->nullable();
            $table->text('content');
            $table->json('media_urls')->nullable();
            $table->string('link_url')->nullable();
            $table->enum('status', ['draft', 'scheduled', 'published', 'failed'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->json('engagement_stats')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['platform', 'status']);
            $table->index(['user_id', 'platform']);
            $table->index('scheduled_at');
            $table->index('published_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_posts');
    }
};
