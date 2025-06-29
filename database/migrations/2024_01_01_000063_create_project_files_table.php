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
        Schema::create('project_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('milestone_id')->nullable()->constrained('project_milestones')->onDelete('set null');
            
            // File information
            $table->string('name');
            $table->string('original_name');
            $table->string('file_path');
            $table->string('file_url')->nullable(); // CDN URL
            $table->string('mime_type');
            $table->bigInteger('file_size'); // in bytes
            
            // File categorization
            $table->enum('category', ['document', 'image', 'contract', 'design', 'other'])->default('document');
            $table->text('description')->nullable();
            
            // Version control
            $table->integer('version')->default(1);
            $table->boolean('is_latest_version')->default(true);
            
            // Access control
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->enum('access_level', ['public', 'team', 'managers', 'private'])->default('team');
            
            // Metadata
            $table->json('metadata')->nullable(); // Additional file data (dimensions, etc.)
            
            $table->timestamps();
            
            // Indexes
            $table->index(['project_id', 'category']);
            $table->index(['project_id', 'is_latest_version']);
            $table->index(['milestone_id', 'category']);
            $table->index(['uploaded_by', 'access_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_files');
    }
};
