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
        Schema::create('communications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // email, call, meeting, note
            $table->text('content');
            $table->string('subject')->nullable();
            $table->timestamp('communication_date');
            $table->string('direction')->nullable(); // inbound, outbound
            $table->string('status')->nullable(); // completed, scheduled, etc.
            $table->nullableMorphs('communicable'); // For client or lead
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communications');
    }
};
