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
        Schema::create('cms_media', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('original_name');
            $table->string('file_path');
            $table->string('file_url')->nullable(); // CDN URL
            $table->string('mime_type');
            $table->bigInteger('file_size'); // in bytes
            $table->json('dimensions')->nullable(); // width, height for images
            $table->string('alt_text')->nullable();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // EXIF, etc.
            
            // Organization
            $table->foreignId('folder_id')->nullable()->constrained('cms_media_folders')->onDelete('set null');
            $table->json('tags')->nullable();
            
            // Optimization
            $table->boolean('is_optimized')->default(false);
            $table->json('variants')->nullable(); // Different sizes/formats
            
            // Usage tracking
            $table->integer('usage_count')->default(0);
            $table->timestamp('last_used_at')->nullable();
            
            // Permissions
            $table->foreignId('uploaded_by')->constrained('users');
            $table->boolean('is_public')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['mime_type']);
            $table->index(['folder_id']);
            $table->index(['uploaded_by']);
            $table->index(['is_public']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cms_media');
    }
};
