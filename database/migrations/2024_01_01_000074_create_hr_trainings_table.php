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
        Schema::create('hr_trainings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('type')->default('internal'); // internal, external, online, certification
            $table->string('category')->nullable();
            $table->foreignId('instructor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('provider')->nullable(); // External training provider
            $table->date('start_date');
            $table->date('end_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location')->nullable();
            $table->string('mode')->default('in_person'); // in_person, online, hybrid
            $table->integer('max_participants')->nullable();
            $table->integer('enrolled_count')->default(0);
            $table->decimal('cost_per_participant', 10, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->text('prerequisites')->nullable();
            $table->text('learning_objectives')->nullable();
            $table->json('materials')->nullable();
            $table->string('status')->default('scheduled'); // scheduled, ongoing, completed, cancelled
            $table->boolean('is_mandatory')->default(false);
            $table->boolean('requires_certification')->default(false);
            $table->integer('certification_validity_months')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();

            $table->index(['status']);
            $table->index(['start_date', 'end_date']);
            $table->index(['category']);
            $table->index(['is_mandatory']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_trainings');
    }
};
