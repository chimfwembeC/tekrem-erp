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
        Schema::create('hr_training_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_id')->constrained('hr_trainings')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('hr_employees')->onDelete('cascade');
            $table->timestamp('enrolled_at');
            $table->string('status')->default('enrolled'); // enrolled, in_progress, completed, dropped, failed
            $table->integer('progress_percentage')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->decimal('score', 5, 2)->nullable(); // 0.00 to 100.00
            $table->boolean('passed')->nullable();
            $table->text('feedback')->nullable();
            $table->json('assessments')->nullable();
            $table->boolean('certificate_issued')->default(false);
            $table->string('certificate_number')->nullable();
            $table->date('certificate_expiry')->nullable();
            $table->timestamps();

            $table->unique(['training_id', 'employee_id']);
            $table->index(['training_id']);
            $table->index(['employee_id']);
            $table->index(['status']);
            $table->index(['completed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_training_enrollments');
    }
};
