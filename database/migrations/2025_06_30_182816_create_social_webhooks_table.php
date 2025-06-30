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
        Schema::create('social_webhooks', function (Blueprint $table) {
            $table->id();
            $table->enum('platform', ['facebook', 'instagram', 'linkedin']);
            $table->string('event_type');
            $table->json('payload');
            $table->boolean('processed')->default(false);
            $table->timestamp('processed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['platform', 'event_type']);
            $table->index('processed');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_webhooks');
    }
};
