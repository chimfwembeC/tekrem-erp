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
        Schema::create('hr_employee_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('hr_employees')->onDelete('cascade');
            $table->foreignId('skill_id')->constrained('hr_skills')->onDelete('cascade');
            $table->integer('proficiency_level')->default(1); // 1-5 or based on skill configuration
            $table->date('acquired_date')->nullable();
            $table->date('last_assessed_date')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_certified')->default(false);
            $table->date('certification_date')->nullable();
            $table->date('certification_expiry')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'skill_id']);
            $table->index(['employee_id']);
            $table->index(['skill_id']);
            $table->index(['proficiency_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_employee_skills');
    }
};
