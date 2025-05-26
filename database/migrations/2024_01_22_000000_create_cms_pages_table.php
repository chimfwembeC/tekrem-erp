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
        Schema::create('cms_pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->json('content_blocks')->nullable(); // For page builder
            $table->string('template')->default('default');
            $table->string('layout')->default('default');
            
            // SEO fields
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('meta_keywords')->nullable();
            $table->string('og_title')->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image')->nullable();
            $table->string('canonical_url')->nullable();
            
            // Publishing
            $table->enum('status', ['draft', 'published', 'scheduled', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            
            // Hierarchy
            $table->foreignId('parent_id')->nullable()->constrained('cms_pages')->onDelete('cascade');
            $table->integer('sort_order')->default(0);
            
            // Permissions and workflow
            $table->foreignId('author_id')->constrained('users');
            $table->foreignId('editor_id')->nullable()->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            
            // Multi-language support
            $table->string('language', 5)->default('en');
            $table->foreignId('translation_group_id')->nullable();
            
            // Settings
            $table->boolean('is_homepage')->default(false);
            $table->boolean('show_in_menu')->default(true);
            $table->boolean('require_auth')->default(false);
            $table->json('permissions')->nullable(); // Role-based permissions
            $table->json('settings')->nullable(); // Custom page settings
            
            // Analytics
            $table->integer('view_count')->default(0);
            $table->timestamp('last_viewed_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['status', 'published_at']);
            $table->index(['parent_id', 'sort_order']);
            $table->index(['language', 'translation_group_id']);
            $table->index(['slug', 'status']);
            $table->index(['author_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cms_pages');
    }
};
