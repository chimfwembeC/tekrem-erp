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
        Schema::create('facebook_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->onDelete('cascade');
            $table->string('facebook_lead_id')->unique();
            $table->string('page_id')->nullable();
            $table->string('ad_id')->nullable();
            $table->string('ad_name')->nullable();
            $table->string('adset_id')->nullable();
            $table->string('adset_name')->nullable();
            $table->string('campaign_id')->nullable();
            $table->string('campaign_name')->nullable();
            $table->string('form_id')->nullable();
            $table->json('field_data');
            $table->timestamp('created_time');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['facebook_lead_id', 'page_id']);
            $table->index(['campaign_id', 'ad_id']);
            $table->index('processed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facebook_leads');
    }
};
