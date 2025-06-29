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
        Schema::create('hr_performances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('hr_employees')->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade');
            $table->string('review_period'); // Q1 2024, Annual 2024, etc.
            $table->date('review_start_date');
            $table->date('review_end_date');
            $table->date('due_date');
            $table->string('status')->default('draft'); // draft, submitted, in_review, completed, cancelled
            $table->text('goals')->nullable();
            $table->text('achievements')->nullable();
            $table->text('areas_for_improvement')->nullable();
            $table->text('development_plan')->nullable();
            $table->decimal('overall_rating', 3, 2)->nullable(); // 0.00 to 5.00
            $table->json('ratings')->nullable(); // Individual category ratings
            $table->text('employee_comments')->nullable();
            $table->text('reviewer_comments')->nullable();
            $table->text('manager_comments')->nullable();
            $table->boolean('is_self_review')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();

            $table->index(['employee_id']);
            $table->index(['reviewer_id']);
            $table->index(['status']);
            $table->index(['review_start_date', 'review_end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_performances');
    }
};
