<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SetupController extends Controller
{
    /**
     * Display the CMS module setup page.
     */
    public function index(): Response
    {
        $this->authorize('manage-cms-settings');

        return Inertia::render('CMS/Setup/Index', [
            'generalSettings' => $this->getGeneralSettings(),
            'contentSettings' => $this->getContentSettings(),
            'mediaSettings' => $this->getMediaSettings(),
            'seoSettings' => $this->getSEOSettings(),
            'templateSettings' => $this->getTemplateSettings(),
            'cacheSettings' => $this->getCacheSettings(),
        ]);
    }

    /**
     * Update general CMS settings.
     */
    public function updateGeneral(Request $request)
    {
        $this->authorize('manage-cms-settings');

        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'site_description' => 'nullable|string|max:500',
            'site_keywords' => 'nullable|string|max:500',
            'default_language' => 'required|string|max:5',
            'enable_multi_language' => 'boolean',
            'enable_versioning' => 'boolean',
            'enable_comments' => 'boolean',
            'enable_ratings' => 'boolean',
            'enable_social_sharing' => 'boolean',
            'enable_search' => 'boolean',
            'enable_analytics' => 'boolean',
            'maintenance_mode' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("cms.general.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'General CMS settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update content settings.
     */
    public function updateContent(Request $request)
    {
        $this->authorize('manage-cms-settings');

        $validated = $request->validate([
            'enable_rich_editor' => 'boolean',
            'enable_code_editor' => 'boolean',
            'enable_markdown' => 'boolean',
            'enable_auto_save' => 'boolean',
            'auto_save_interval' => 'nullable|integer|min:30|max:600',
            'enable_content_approval' => 'boolean',
            'enable_content_scheduling' => 'boolean',
            'enable_content_expiry' => 'boolean',
            'enable_content_templates' => 'boolean',
            'enable_content_categories' => 'boolean',
            'enable_content_tags' => 'boolean',
            'max_revisions' => 'nullable|integer|min:1|max:100',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("cms.content.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Content settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update media settings.
     */
    public function updateMedia(Request $request)
    {
        $this->authorize('manage-cms-settings');

        $validated = $request->validate([
            'enable_media_library' => 'boolean',
            'enable_image_optimization' => 'boolean',
            'enable_thumbnail_generation' => 'boolean',
            'enable_image_resizing' => 'boolean',
            'max_upload_size' => 'required|integer|min:1|max:100',
            'allowed_file_types' => 'nullable|array',
            'image_quality' => 'nullable|integer|min:1|max:100',
            'thumbnail_sizes' => 'nullable|array',
            'enable_cdn' => 'boolean',
            'cdn_url' => 'nullable|string|max:255',
            'enable_watermark' => 'boolean',
            'watermark_position' => 'nullable|string|max:20',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("cms.media.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Media settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update SEO settings.
     */
    public function updateSEO(Request $request)
    {
        $this->authorize('manage-cms-settings');

        $validated = $request->validate([
            'enable_seo_analysis' => 'boolean',
            'enable_meta_tags' => 'boolean',
            'enable_open_graph' => 'boolean',
            'enable_twitter_cards' => 'boolean',
            'enable_schema_markup' => 'boolean',
            'enable_sitemap' => 'boolean',
            'enable_robots_txt' => 'boolean',
            'auto_generate_meta' => 'boolean',
            'meta_title_format' => 'nullable|string|max:255',
            'meta_description_format' => 'nullable|string|max:500',
            'enable_breadcrumbs' => 'boolean',
            'enable_canonical_urls' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("cms.seo.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'SEO settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update template settings.
     */
    public function updateTemplate(Request $request)
    {
        $this->authorize('manage-cms-settings');

        $validated = $request->validate([
            'enable_custom_templates' => 'boolean',
            'enable_template_inheritance' => 'boolean',
            'enable_template_caching' => 'boolean',
            'enable_template_minification' => 'boolean',
            'default_template' => 'nullable|string|max:100',
            'enable_theme_customization' => 'boolean',
            'enable_css_customization' => 'boolean',
            'enable_js_customization' => 'boolean',
            'template_cache_duration' => 'nullable|integer|min:1|max:1440',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("cms.template.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Template settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update cache settings.
     */
    public function updateCache(Request $request)
    {
        $this->authorize('manage-cms-settings');

        $validated = $request->validate([
            'enable_page_caching' => 'boolean',
            'enable_database_caching' => 'boolean',
            'enable_asset_caching' => 'boolean',
            'cache_duration' => 'nullable|integer|min:1|max:1440',
            'enable_cache_compression' => 'boolean',
            'enable_browser_caching' => 'boolean',
            'browser_cache_duration' => 'nullable|integer|min:1|max:8760',
            'enable_cache_purging' => 'boolean',
            'auto_purge_on_update' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("cms.cache.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Cache settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Get general settings.
     */
    private function getGeneralSettings(): array
    {
        return [
            'site_name' => Setting::get('cms.general.site_name', 'TekRem ERP'),
            'site_description' => Setting::get('cms.general.site_description', 'Technology Remedies Innovations'),
            'site_keywords' => Setting::get('cms.general.site_keywords', 'ERP, Technology, Business Solutions'),
            'default_language' => Setting::get('cms.general.default_language', 'en'),
            'enable_multi_language' => Setting::get('cms.general.enable_multi_language', true),
            'enable_versioning' => Setting::get('cms.general.enable_versioning', true),
            'enable_comments' => Setting::get('cms.general.enable_comments', false),
            'enable_ratings' => Setting::get('cms.general.enable_ratings', false),
            'enable_social_sharing' => Setting::get('cms.general.enable_social_sharing', true),
            'enable_search' => Setting::get('cms.general.enable_search', true),
            'enable_analytics' => Setting::get('cms.general.enable_analytics', true),
            'maintenance_mode' => Setting::get('cms.general.maintenance_mode', false),
        ];
    }

    /**
     * Get content settings.
     */
    private function getContentSettings(): array
    {
        return [
            'enable_rich_editor' => Setting::get('cms.content.enable_rich_editor', true),
            'enable_code_editor' => Setting::get('cms.content.enable_code_editor', true),
            'enable_markdown' => Setting::get('cms.content.enable_markdown', true),
            'enable_auto_save' => Setting::get('cms.content.enable_auto_save', true),
            'auto_save_interval' => Setting::get('cms.content.auto_save_interval', 60),
            'enable_content_approval' => Setting::get('cms.content.enable_content_approval', false),
            'enable_content_scheduling' => Setting::get('cms.content.enable_content_scheduling', true),
            'enable_content_expiry' => Setting::get('cms.content.enable_content_expiry', false),
            'enable_content_templates' => Setting::get('cms.content.enable_content_templates', true),
            'enable_content_categories' => Setting::get('cms.content.enable_content_categories', true),
            'enable_content_tags' => Setting::get('cms.content.enable_content_tags', true),
            'max_revisions' => Setting::get('cms.content.max_revisions', 10),
        ];
    }

    /**
     * Get media settings.
     */
    private function getMediaSettings(): array
    {
        return [
            'enable_media_library' => Setting::get('cms.media.enable_media_library', true),
            'enable_image_optimization' => Setting::get('cms.media.enable_image_optimization', true),
            'enable_thumbnail_generation' => Setting::get('cms.media.enable_thumbnail_generation', true),
            'enable_image_resizing' => Setting::get('cms.media.enable_image_resizing', true),
            'max_upload_size' => Setting::get('cms.media.max_upload_size', 10),
            'allowed_file_types' => Setting::get('cms.media.allowed_file_types', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']),
            'image_quality' => Setting::get('cms.media.image_quality', 85),
            'thumbnail_sizes' => Setting::get('cms.media.thumbnail_sizes', ['150x150', '300x300', '600x400']),
            'enable_cdn' => Setting::get('cms.media.enable_cdn', false),
            'cdn_url' => Setting::get('cms.media.cdn_url', ''),
            'enable_watermark' => Setting::get('cms.media.enable_watermark', false),
            'watermark_position' => Setting::get('cms.media.watermark_position', 'bottom-right'),
        ];
    }

    /**
     * Get SEO settings.
     */
    private function getSEOSettings(): array
    {
        return [
            'enable_seo_analysis' => Setting::get('cms.seo.enable_seo_analysis', true),
            'enable_meta_tags' => Setting::get('cms.seo.enable_meta_tags', true),
            'enable_open_graph' => Setting::get('cms.seo.enable_open_graph', true),
            'enable_twitter_cards' => Setting::get('cms.seo.enable_twitter_cards', true),
            'enable_schema_markup' => Setting::get('cms.seo.enable_schema_markup', true),
            'enable_sitemap' => Setting::get('cms.seo.enable_sitemap', true),
            'enable_robots_txt' => Setting::get('cms.seo.enable_robots_txt', true),
            'auto_generate_meta' => Setting::get('cms.seo.auto_generate_meta', true),
            'meta_title_format' => Setting::get('cms.seo.meta_title_format', '{title} | {site_name}'),
            'meta_description_format' => Setting::get('cms.seo.meta_description_format', '{excerpt}'),
            'enable_breadcrumbs' => Setting::get('cms.seo.enable_breadcrumbs', true),
            'enable_canonical_urls' => Setting::get('cms.seo.enable_canonical_urls', true),
        ];
    }

    /**
     * Get template settings.
     */
    private function getTemplateSettings(): array
    {
        return [
            'enable_custom_templates' => Setting::get('cms.template.enable_custom_templates', true),
            'enable_template_inheritance' => Setting::get('cms.template.enable_template_inheritance', true),
            'enable_template_caching' => Setting::get('cms.template.enable_template_caching', true),
            'enable_template_minification' => Setting::get('cms.template.enable_template_minification', false),
            'default_template' => Setting::get('cms.template.default_template', 'default'),
            'enable_theme_customization' => Setting::get('cms.template.enable_theme_customization', true),
            'enable_css_customization' => Setting::get('cms.template.enable_css_customization', true),
            'enable_js_customization' => Setting::get('cms.template.enable_js_customization', true),
            'template_cache_duration' => Setting::get('cms.template.template_cache_duration', 60),
        ];
    }

    /**
     * Get cache settings.
     */
    private function getCacheSettings(): array
    {
        return [
            'enable_page_caching' => Setting::get('cms.cache.enable_page_caching', true),
            'enable_database_caching' => Setting::get('cms.cache.enable_database_caching', true),
            'enable_asset_caching' => Setting::get('cms.cache.enable_asset_caching', true),
            'cache_duration' => Setting::get('cms.cache.cache_duration', 60),
            'enable_cache_compression' => Setting::get('cms.cache.enable_cache_compression', true),
            'enable_browser_caching' => Setting::get('cms.cache.enable_browser_caching', true),
            'browser_cache_duration' => Setting::get('cms.cache.browser_cache_duration', 24),
            'enable_cache_purging' => Setting::get('cms.cache.enable_cache_purging', true),
            'auto_purge_on_update' => Setting::get('cms.cache.auto_purge_on_update', true),
        ];
    }
}
