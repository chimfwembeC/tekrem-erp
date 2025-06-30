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
        Schema::create('linked_in_companies', function (Blueprint $table) {
            $table->id();
            $table->string('linkedin_company_id')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('logo_url')->nullable();
            $table->string('website_url')->nullable();
            $table->json('industries')->nullable();
            $table->json('specialties')->nullable();
            $table->date('founded_on')->nullable();
            $table->json('locations')->nullable();
            $table->integer('follower_count')->default(0);
            $table->integer('employee_count')->default(0);
            $table->text('access_token')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();

            $table->index('linkedin_company_id');
            $table->index('name');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('linked_in_companies');
    }
};
