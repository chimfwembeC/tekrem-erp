<?php

namespace App\Services\CMS;

use App\Models\CMS\Page;
use App\Models\CMS\Template;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PageService
{
    /**
     * Create a new page.
     */
    public function createPage(array $data, User $user): Page
    {
        DB::beginTransaction();

        try {
            // Generate slug if not provided
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['title']);
            }

            // Ensure slug is unique
            $data['slug'] = $this->generateUniqueSlug($data['slug']);

            // Set author
            $data['author_id'] = $user->id;

            // Create translation group if this is a new page
            if (empty($data['translation_group_id'])) {
                $data['translation_group_id'] = time() . rand(1000, 9999);
            }

            $page = Page::create($data);

            // Create initial revision
            $page->createRevision($data, $user, 'Initial version');

            // Clear cache
            $this->clearPageCache($page);

            DB::commit();
            return $page;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing page.
     */
    public function updatePage(Page $page, array $data, User $user, string $revisionNotes = null): Page
    {
        DB::beginTransaction();

        try {
            // Generate slug if changed
            if (isset($data['title']) && $data['title'] !== $page->title && empty($data['slug'])) {
                $data['slug'] = $this->generateUniqueSlug(Str::slug($data['title']), $page->id);
            }

            // Set editor
            $data['editor_id'] = $user->id;

            // Create revision before updating
            $page->createRevision($data, $user, $revisionNotes);

            // Update page
            $page->update($data);

            // Clear cache
            $this->clearPageCache($page);

            DB::commit();
            return $page;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Publish a page.
     */
    public function publishPage(Page $page, User $user): bool
    {
        $result = $page->publish($user);
        
        if ($result) {
            $this->clearPageCache($page);
            $this->generateSitemap();
        }

        return $result;
    }

    /**
     * Schedule a page for publishing.
     */
    public function schedulePage(Page $page, \DateTime $scheduledAt): bool
    {
        $result = $page->schedule($scheduledAt);
        
        if ($result) {
            $this->clearPageCache($page);
        }

        return $result;
    }

    /**
     * Unpublish a page.
     */
    public function unpublishPage(Page $page): bool
    {
        $result = $page->unpublish();
        
        if ($result) {
            $this->clearPageCache($page);
            $this->generateSitemap();
        }

        return $result;
    }

    /**
     * Delete a page.
     */
    public function deletePage(Page $page): bool
    {
        DB::beginTransaction();

        try {
            // Delete child pages first
            foreach ($page->children as $child) {
                $this->deletePage($child);
            }

            // Clear cache
            $this->clearPageCache($page);

            // Delete the page
            $page->delete();

            // Regenerate sitemap
            $this->generateSitemap();

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Duplicate a page.
     */
    public function duplicatePage(Page $page, User $user, array $overrides = []): Page
    {
        $data = $page->toArray();
        
        // Remove unique fields
        unset($data['id'], $data['created_at'], $data['updated_at'], $data['deleted_at']);
        
        // Apply overrides
        $data = array_merge($data, $overrides);
        
        // Modify title and slug
        $data['title'] = ($overrides['title'] ?? $data['title']) . ' (Copy)';
        $data['slug'] = $this->generateUniqueSlug($data['slug'] . '-copy');
        $data['status'] = 'draft';
        $data['published_at'] = null;
        $data['scheduled_at'] = null;

        return $this->createPage($data, $user);
    }

    /**
     * Get page by slug with caching.
     */
    public function getPageBySlug(string $slug, string $language = 'en'): ?Page
    {
        $cacheKey = "cms.page.{$slug}.{$language}";

        return Cache::remember($cacheKey, 3600, function () use ($slug, $language) {
            return Page::published()
                ->byLanguage($language)
                ->where('slug', $slug)
                ->with(['author', 'parent', 'children'])
                ->first();
        });
    }

    /**
     * Get homepage.
     */
    public function getHomepage(string $language = 'en'): ?Page
    {
        $cacheKey = "cms.homepage.{$language}";

        return Cache::remember($cacheKey, 3600, function () use ($language) {
            return Page::published()
                ->byLanguage($language)
                ->where('is_homepage', true)
                ->with(['author'])
                ->first();
        });
    }

    /**
     * Get page hierarchy for navigation.
     */
    public function getPageHierarchy(string $language = 'en'): array
    {
        $cacheKey = "cms.hierarchy.{$language}";

        return Cache::remember($cacheKey, 1800, function () use ($language) {
            $pages = Page::published()
                ->byLanguage($language)
                ->inMenu()
                ->with(['children' => function ($query) {
                    $query->published()->inMenu()->orderBy('sort_order');
                }])
                ->root()
                ->orderBy('sort_order')
                ->get();

            return $this->buildHierarchyArray($pages);
        });
    }

    /**
     * Search pages.
     */
    public function searchPages(string $query, string $language = 'en', int $limit = 10): array
    {
        return Page::published()
            ->byLanguage($language)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('excerpt', 'like', "%{$query}%")
                  ->orWhere('content', 'like', "%{$query}%");
            })
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get related pages.
     */
    public function getRelatedPages(Page $page, int $limit = 5): array
    {
        $cacheKey = "cms.related.{$page->id}.{$limit}";

        return Cache::remember($cacheKey, 1800, function () use ($page, $limit) {
            return Page::published()
                ->byLanguage($page->language)
                ->where('id', '!=', $page->id)
                ->where(function ($query) use ($page) {
                    // Same parent or same template
                    $query->where('parent_id', $page->parent_id)
                          ->orWhere('template', $page->template);
                })
                ->limit($limit)
                ->get()
                ->toArray();
        });
    }

    /**
     * Process scheduled pages.
     */
    public function processScheduledPages(): int
    {
        $scheduledPages = Page::scheduled()
            ->where('scheduled_at', '<=', now())
            ->get();

        $processed = 0;

        foreach ($scheduledPages as $page) {
            if ($page->publish()) {
                $this->clearPageCache($page);
                $processed++;
            }
        }

        if ($processed > 0) {
            $this->generateSitemap();
        }

        return $processed;
    }

    /**
     * Generate unique slug.
     */
    private function generateUniqueSlug(string $slug, int $excludeId = null): string
    {
        $originalSlug = $slug;
        $counter = 1;

        while (Page::where('slug', $slug)
            ->when($excludeId, function ($query) use ($excludeId) {
                $query->where('id', '!=', $excludeId);
            })
            ->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Build hierarchy array from pages.
     */
    private function buildHierarchyArray($pages): array
    {
        $hierarchy = [];

        foreach ($pages as $page) {
            $pageData = [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'url' => $page->url,
                'children' => [],
            ];

            if ($page->children->isNotEmpty()) {
                $pageData['children'] = $this->buildHierarchyArray($page->children);
            }

            $hierarchy[] = $pageData;
        }

        return $hierarchy;
    }

    /**
     * Clear page cache.
     */
    private function clearPageCache(Page $page): void
    {
        $patterns = [
            "cms.page.{$page->slug}.*",
            "cms.hierarchy.*",
            "cms.sitemap",
        ];

        if ($page->is_homepage) {
            $patterns[] = "cms.homepage.*";
        }

        foreach ($patterns as $pattern) {
            Cache::forget($pattern);
        }
    }

    /**
     * Generate sitemap.
     */
    private function generateSitemap(): void
    {
        $pages = Page::published()
            ->select(['slug', 'updated_at', 'language'])
            ->get();

        $sitemap = [];

        foreach ($pages as $page) {
            $sitemap[] = [
                'url' => $page->url,
                'lastmod' => $page->updated_at->toISOString(),
                'changefreq' => 'weekly',
                'priority' => $page->is_homepage ? '1.0' : '0.8',
            ];
        }

        Cache::put('cms.sitemap', $sitemap, 86400); // 24 hours
    }

    /**
     * Get page analytics.
     */
    public function getPageAnalytics(Page $page): array
    {
        return [
            'views' => $page->view_count,
            'last_viewed' => $page->last_viewed_at,
            'revisions' => $page->revisions()->count(),
            'children' => $page->children()->count(),
            'translations' => $page->translations()->count(),
            'status' => $page->status,
            'published_at' => $page->published_at,
        ];
    }

    /**
     * Get SEO analysis for a page.
     */
    public function getSEOAnalysis(Page $page): array
    {
        $analysis = [
            'score' => 0,
            'issues' => [],
            'recommendations' => [],
        ];

        $score = 0;

        // Title analysis
        if (empty($page->meta_title)) {
            $analysis['issues'][] = 'Missing meta title';
            $analysis['recommendations'][] = 'Add a meta title (50-60 characters)';
        } else {
            $titleLength = strlen($page->meta_title);
            if ($titleLength < 30) {
                $analysis['issues'][] = 'Meta title too short';
                $analysis['recommendations'][] = 'Increase meta title length (50-60 characters)';
            } elseif ($titleLength > 60) {
                $analysis['issues'][] = 'Meta title too long';
                $analysis['recommendations'][] = 'Reduce meta title length (50-60 characters)';
            } else {
                $score += 20;
            }
        }

        // Description analysis
        if (empty($page->meta_description)) {
            $analysis['issues'][] = 'Missing meta description';
            $analysis['recommendations'][] = 'Add a meta description (150-160 characters)';
        } else {
            $descLength = strlen($page->meta_description);
            if ($descLength < 120) {
                $analysis['issues'][] = 'Meta description too short';
                $analysis['recommendations'][] = 'Increase meta description length (150-160 characters)';
            } elseif ($descLength > 160) {
                $analysis['issues'][] = 'Meta description too long';
                $analysis['recommendations'][] = 'Reduce meta description length (150-160 characters)';
            } else {
                $score += 20;
            }
        }

        // Content analysis
        $contentLength = strlen(strip_tags($page->content));
        if ($contentLength < 300) {
            $analysis['issues'][] = 'Content too short';
            $analysis['recommendations'][] = 'Add more content (minimum 300 words)';
        } else {
            $score += 20;
        }

        // Slug analysis
        if (strlen($page->slug) > 75) {
            $analysis['issues'][] = 'URL slug too long';
            $analysis['recommendations'][] = 'Shorten URL slug';
        } else {
            $score += 10;
        }

        // Keywords analysis
        if (empty($page->meta_keywords)) {
            $analysis['recommendations'][] = 'Consider adding meta keywords';
        } else {
            $score += 10;
        }

        // Images analysis
        $imageCount = substr_count($page->content, '<img');
        if ($imageCount > 0) {
            $score += 10;
        } else {
            $analysis['recommendations'][] = 'Consider adding images to improve engagement';
        }

        // Internal links analysis
        $linkCount = substr_count($page->content, '<a');
        if ($linkCount > 0) {
            $score += 10;
        } else {
            $analysis['recommendations'][] = 'Consider adding internal links';
        }

        $analysis['score'] = $score;

        return $analysis;
    }
}
