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
        Schema::create('approval_workflows', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // quotation, invoice, payment
            $table->text('description')->nullable();
            $table->json('conditions'); // Conditions for triggering this workflow
            $table->json('steps'); // Approval steps configuration
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['type', 'is_active']);
        });

        Schema::create('approval_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('approval_workflows')->onDelete('cascade');
            $table->morphs('approvable'); // The item being approved (quotation, invoice, etc.)
            $table->string('status')->default('pending'); // pending, approved, rejected, cancelled
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('requested_at');
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('current_step_data')->nullable();
            $table->timestamps();

            $table->index(['status', 'requested_at']);
            $table->index(['requested_by', 'status']);
        });

        Schema::create('approval_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('approval_requests')->onDelete('cascade');
            $table->integer('step_number');
            $table->string('step_name');
            $table->string('status')->default('pending'); // pending, approved, rejected, skipped
            $table->foreignId('approver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('comments')->nullable();
            $table->json('step_data')->nullable();
            $table->timestamps();

            $table->index(['request_id', 'step_number']);
            $table->index(['approver_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_steps');
        Schema::dropIfExists('approval_requests');
        Schema::dropIfExists('approval_workflows');
    }
};
