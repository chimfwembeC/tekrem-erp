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
        Schema::create('instagram_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('instagram_account_id')->unique();
            $table->string('username');
            $table->string('name');
            $table->text('profile_picture_url')->nullable();
            $table->integer('followers_count')->default(0);
            $table->integer('follows_count')->default(0);
            $table->integer('media_count')->default(0);
            $table->text('biography')->nullable();
            $table->string('website')->nullable();
            $table->text('access_token')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();

            $table->index('instagram_account_id');
            $table->index('username');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instagram_accounts');
    }
};
