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
        Schema::create('guest_inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->string('type')->default('general'); // general, sales, partnership, other
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('position')->nullable();
            $table->string('subject');
            $table->text('message');
            $table->string('preferred_contact_method')->default('email'); // email, phone, both
            $table->string('urgency')->default('normal'); // low, normal, high, urgent
            $table->string('status')->default('new'); // new, in_progress, resolved, closed
            $table->string('source')->default('website'); // website, social, referral, other
            $table->json('metadata')->nullable(); // Additional data like UTM params, page source
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->text('internal_notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['status', 'type']);
            $table->index(['email', 'created_at']);
            $table->index('reference_number');
            $table->index('assigned_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_inquiries');
    }
};
