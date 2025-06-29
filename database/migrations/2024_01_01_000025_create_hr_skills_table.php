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
        Schema::create('hr_skills', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('type')->default('technical'); // technical, soft, language, certification
            $table->integer('proficiency_levels')->default(5); // Number of proficiency levels (1-5, 1-10, etc.)
            $table->json('level_descriptions')->nullable(); // Descriptions for each level
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category']);
            $table->index(['type']);
            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_skills');
    }
};
