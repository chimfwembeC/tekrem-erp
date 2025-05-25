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
        Schema::create('user_notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Notification Methods
            $table->boolean('email_notifications')->default(true);
            $table->boolean('push_notifications')->default(true);
            $table->boolean('sms_notifications')->default(false);
            $table->boolean('security_alerts')->default(true);

            // Activity Types
            $table->boolean('chat_notifications')->default(true);
            $table->boolean('task_reminders')->default(true);
            $table->boolean('calendar_reminders')->default(true);
            $table->boolean('marketing_emails')->default(false);
            $table->boolean('lead_notifications')->default(true);
            $table->boolean('client_notifications')->default(true);
            $table->boolean('communication_notifications')->default(true);

            // Frequency and Timing
            $table->enum('frequency', ['immediate', 'hourly', 'daily', 'weekly'])->default('immediate');
            $table->boolean('quiet_hours_enabled')->default(false);
            $table->time('quiet_hours_start')->default('22:00');
            $table->time('quiet_hours_end')->default('08:00');

            // Additional Settings
            $table->json('custom_preferences')->nullable(); // For future extensibility

            $table->timestamps();

            // Ensure one preference record per user
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_notification_preferences');
    }
};
