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
        Schema::create('hr_employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('employee_id')->unique();
            $table->foreignId('department_id')->nullable()->constrained('hr_departments')->onDelete('set null');
            $table->string('job_title');
            $table->string('employment_type')->default('full_time'); // full_time, part_time, contract, intern
            $table->string('employment_status')->default('active'); // active, inactive, terminated, on_leave
            $table->date('hire_date');
            $table->date('probation_end_date')->nullable();
            $table->date('termination_date')->nullable();
            $table->text('termination_reason')->nullable();
            $table->decimal('salary', 12, 2)->nullable();
            $table->string('salary_currency', 3)->default('USD');
            $table->string('pay_frequency')->default('monthly'); // weekly, bi_weekly, monthly, annually
            $table->foreignId('manager_id')->nullable()->constrained('hr_employees')->onDelete('set null');
            $table->string('work_location')->nullable();
            $table->string('phone')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->string('marital_status')->nullable();
            $table->text('address')->nullable();
            $table->string('national_id')->nullable();
            $table->string('passport_number')->nullable();
            $table->string('tax_id')->nullable();
            $table->json('skills')->nullable();
            $table->json('certifications')->nullable();
            $table->json('documents')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['employment_status']);
            $table->index(['department_id']);
            $table->index(['manager_id']);
            $table->index(['hire_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_employees');
    }
};
