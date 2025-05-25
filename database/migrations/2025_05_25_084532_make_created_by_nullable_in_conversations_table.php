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
        Schema::table('conversations', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['created_by']);

            // Modify the column to be nullable
            $table->unsignedBigInteger('created_by')->nullable()->change();

            // Re-add the foreign key constraint with nullable support
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['created_by']);

            // Make the column non-nullable again
            $table->unsignedBigInteger('created_by')->nullable(false)->change();

            // Re-add the foreign key constraint
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
