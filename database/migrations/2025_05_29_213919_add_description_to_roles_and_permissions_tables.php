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
        // Add description column to roles table
        Schema::table('roles', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
        });

        // Add description column to permissions table
        Schema::table('permissions', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove description column from roles table
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('description');
        });

        // Remove description column from permissions table
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn('description');
        });
    }
};
