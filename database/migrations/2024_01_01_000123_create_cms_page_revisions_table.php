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
        Schema::create('cms_page_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained('cms_pages')->onDelete('cascade');
            $table->integer('revision_number');
            $table->string('title');
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->json('content_blocks')->nullable();
            $table->string('template');
            $table->string('layout');
            
            // SEO fields snapshot
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('meta_keywords')->nullable();
            $table->string('og_title')->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image')->nullable();
            
            // Revision metadata
            $table->foreignId('created_by')->constrained('users');
            $table->text('revision_notes')->nullable();
            $table->boolean('is_current')->default(false);
            $table->boolean('is_published')->default(false);
            
            $table->timestamps();
            
            // Indexes
            $table->index(['page_id', 'revision_number']);
            $table->index(['page_id', 'is_current']);
            $table->index(['created_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cms_page_revisions');
    }
};
