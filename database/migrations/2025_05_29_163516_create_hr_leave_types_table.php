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
        Schema::create('hr_leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->integer('days_per_year')->default(0);
            $table->boolean('is_paid')->default(true);
            $table->boolean('requires_approval')->default(true);
            $table->integer('max_consecutive_days')->nullable();
            $table->integer('min_notice_days')->default(0);
            $table->boolean('carry_forward')->default(false);
            $table->integer('max_carry_forward_days')->nullable();
            $table->string('color', 7)->default('#3B82F6'); // Hex color for calendar display
            $table->boolean('is_active')->default(true);
            $table->json('rules')->nullable(); // Additional rules and conditions
            $table->timestamps();

            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_leave_types');
    }
};
