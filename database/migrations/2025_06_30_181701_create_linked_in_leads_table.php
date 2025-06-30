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
        Schema::create('linked_in_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->onDelete('cascade');
            $table->string('linkedin_profile_id')->unique();
            $table->string('company_id')->nullable(); // LinkedIn company ID
            $table->string('first_name');
            $table->string('last_name');
            $table->string('headline')->nullable();
            $table->text('profile_url')->nullable();
            $table->text('profile_picture_url')->nullable();
            $table->string('current_company')->nullable();
            $table->string('current_position')->nullable();
            $table->string('location')->nullable();
            $table->string('industry')->nullable();
            $table->integer('connections_count')->default(0);
            $table->text('summary')->nullable();
            $table->json('skills')->nullable();
            $table->json('experience')->nullable();
            $table->json('education')->nullable();
            $table->json('contact_info')->nullable();
            $table->enum('lead_source', ['search', 'connection', 'message', 'post_engagement', 'company_page'])->default('search');
            $table->integer('lead_score')->default(0);
            $table->enum('engagement_level', ['low', 'medium', 'high'])->default('low');
            $table->timestamp('last_activity_at')->nullable();
            $table->boolean('is_processed')->default(false);
            $table->timestamps();

            $table->index('linkedin_profile_id');
            $table->index('company_id');
            $table->index('lead_score');
            $table->index('engagement_level');
            $table->index('is_processed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('linked_in_leads');
    }
};
