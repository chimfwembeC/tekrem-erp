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
        Schema::table('leads', function (Blueprint $table) {
            $table->string('facebook_lead_id')->nullable()->unique();
            $table->string('facebook_ad_id')->nullable();
            $table->string('facebook_campaign_id')->nullable();
            $table->string('facebook_form_id')->nullable();
            $table->timestamp('facebook_created_time')->nullable();

            $table->index('facebook_lead_id');
            $table->index('facebook_campaign_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['facebook_lead_id']);
            $table->dropIndex(['facebook_campaign_id']);
            $table->dropColumn([
                'facebook_lead_id',
                'facebook_ad_id',
                'facebook_campaign_id',
                'facebook_form_id',
                'facebook_created_time'
            ]);
        });
    }
};
