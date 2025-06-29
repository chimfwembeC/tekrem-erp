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
        Schema::create('cms_menus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('location')->default('header'); // header, footer, sidebar
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('cms_menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained('cms_menus')->onDelete('cascade');
            $table->string('title');
            $table->string('url')->nullable();
            $table->foreignId('page_id')->nullable()->constrained('cms_pages')->onDelete('cascade');
            $table->string('target')->default('_self'); // _self, _blank
            $table->string('icon')->nullable();
            $table->json('attributes')->nullable(); // CSS classes, data attributes
            
            // Hierarchy
            $table->foreignId('parent_id')->nullable()->constrained('cms_menu_items')->onDelete('cascade');
            $table->integer('sort_order')->default(0);
            
            // Permissions
            $table->json('permissions')->nullable(); // Role-based visibility
            $table->boolean('require_auth')->default(false);
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['menu_id', 'parent_id', 'sort_order']);
            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cms_menu_items');
        Schema::dropIfExists('cms_menus');
    }
};
