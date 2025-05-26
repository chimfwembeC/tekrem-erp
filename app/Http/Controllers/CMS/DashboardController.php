<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\CMS\Page;
use App\Models\CMS\Media;
use App\Models\CMS\Template;
use App\Models\CMS\Redirect;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the CMS dashboard.
     */
    public function index(Request $request): Response
    {
        // Get overview statistics
        $stats = $this->getOverviewStats();
        
        // Get recent activity
        $recentActivity = $this->getRecentActivity();
        
        // Get content analytics
        $analytics = $this->getContentAnalytics();
        
        // Get quick actions
        $quickActions = $this->getQuickActions();

        return Inertia::render('CMS/Dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'analytics' => $analytics,
            'quickActions' => $quickActions,
        ]);
    }

    /**
     * Get overview statistics.
     */
    private function getOverviewStats(): array
    {
        return [
            'pages' => [
                'total' => Page::count(),
                'published' => Page::published()->count(),
                'draft' => Page::draft()->count(),
                'scheduled' => Page::scheduled()->count(),
            ],
            'media' => [
                'total' => Media::count(),
                'total_size' => Media::sum('file_size'),
                'images' => Media::images()->count(),
                'documents' => Media::documents()->count(),
            ],
            'templates' => [
                'total' => Template::count(),
                'active' => Template::active()->count(),
            ],
            'redirects' => [
                'total' => Redirect::count(),
                'active' => Redirect::active()->count(),
                'total_hits' => Redirect::sum('hit_count'),
            ],
        ];
    }

    /**
     * Get recent activity.
     */
    private function getRecentActivity(): array
    {
        $recentPages = Page::with(['author'])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($page) {
                return [
                    'type' => 'page',
                    'action' => $page->wasRecentlyCreated ? 'created' : 'updated',
                    'title' => $page->title,
                    'url' => route('cms.pages.show', $page),
                    'user' => $page->author->name,
                    'timestamp' => $page->updated_at,
                ];
            });

        $recentMedia = Media::with(['uploadedBy'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($media) {
                return [
                    'type' => 'media',
                    'action' => 'uploaded',
                    'title' => $media->name,
                    'url' => route('cms.media.show', $media),
                    'user' => $media->uploadedBy->name,
                    'timestamp' => $media->created_at,
                ];
            });

        return $recentPages->concat($recentMedia)
            ->sortByDesc('timestamp')
            ->take(15)
            ->values()
            ->toArray();
    }

    /**
     * Get content analytics.
     */
    private function getContentAnalytics(): array
    {
        // Page views over time (last 30 days)
        $pageViews = Page::select(
                DB::raw('DATE(updated_at) as date'),
                DB::raw('SUM(view_count) as views')
            )
            ->where('updated_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'views' => $item->views,
                ];
            });

        // Top performing pages
        $topPages = Page::published()
            ->orderBy('view_count', 'desc')
            ->limit(10)
            ->get(['id', 'title', 'slug', 'view_count'])
            ->map(function ($page) {
                return [
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'views' => $page->view_count,
                    'url' => route('cms.pages.show', $page),
                ];
            });

        // Content by status
        $contentByStatus = [
            'published' => Page::published()->count(),
            'draft' => Page::draft()->count(),
            'scheduled' => Page::scheduled()->count(),
            'archived' => Page::where('status', 'archived')->count(),
        ];

        // SEO scores distribution
        $seoScores = Page::whereNotNull('meta_title')
            ->get()
            ->map(function ($page) {
                // Calculate basic SEO score
                $score = 0;
                if ($page->meta_title && strlen($page->meta_title) >= 30 && strlen($page->meta_title) <= 60) {
                    $score += 25;
                }
                if ($page->meta_description && strlen($page->meta_description) >= 120 && strlen($page->meta_description) <= 160) {
                    $score += 25;
                }
                if (strlen(strip_tags($page->content)) >= 300) {
                    $score += 25;
                }
                if (strlen($page->slug) <= 75) {
                    $score += 25;
                }
                return $score;
            })
            ->groupBy(function ($score) {
                if ($score >= 80) return 'excellent';
                if ($score >= 60) return 'good';
                if ($score >= 40) return 'needs_improvement';
                return 'poor';
            })
            ->map(function ($group) {
                return $group->count();
            });

        return [
            'pageViews' => $pageViews,
            'topPages' => $topPages,
            'contentByStatus' => $contentByStatus,
            'seoScores' => $seoScores,
        ];
    }

    /**
     * Get quick actions.
     */
    private function getQuickActions(): array
    {
        return [
            [
                'title' => 'Create New Page',
                'description' => 'Start creating a new page',
                'icon' => 'FileEdit',
                'url' => route('cms.pages.create'),
                'color' => 'blue',
            ],
            [
                'title' => 'Upload Media',
                'description' => 'Add new media files',
                'icon' => 'Image',
                'url' => route('cms.media.index'),
                'color' => 'green',
            ],
            [
                'title' => 'Manage Templates',
                'description' => 'Create or edit templates',
                'icon' => 'Layout',
                'url' => route('cms.templates.index'),
                'color' => 'purple',
            ],
            [
                'title' => 'View Analytics',
                'description' => 'Check content performance',
                'icon' => 'BarChart3',
                'url' => route('cms.analytics'),
                'color' => 'orange',
            ],
            [
                'title' => 'Manage Menus',
                'description' => 'Update site navigation',
                'icon' => 'Navigation',
                'url' => route('cms.menus.index'),
                'color' => 'indigo',
            ],
            [
                'title' => 'SEO Settings',
                'description' => 'Optimize for search engines',
                'icon' => 'Search',
                'url' => route('cms.pages.index', ['filter' => 'seo']),
                'color' => 'red',
            ],
        ];
    }

    /**
     * Get system health status.
     */
    public function health(): array
    {
        $health = [
            'status' => 'healthy',
            'checks' => [],
        ];

        // Check storage space
        $storageUsed = Media::sum('file_size');
        $storageLimit = 1024 * 1024 * 1024 * 10; // 10GB limit
        $storagePercentage = ($storageUsed / $storageLimit) * 100;

        $health['checks']['storage'] = [
            'status' => $storagePercentage > 90 ? 'warning' : 'healthy',
            'message' => "Storage usage: " . round($storagePercentage, 1) . "%",
            'used' => $storageUsed,
            'limit' => $storageLimit,
        ];

        // Check for pages without SEO
        $pagesWithoutSEO = Page::published()
            ->where(function ($query) {
                $query->whereNull('meta_title')
                      ->orWhereNull('meta_description');
            })
            ->count();

        $health['checks']['seo'] = [
            'status' => $pagesWithoutSEO > 0 ? 'warning' : 'healthy',
            'message' => $pagesWithoutSEO > 0 
                ? "{$pagesWithoutSEO} pages missing SEO data"
                : "All pages have SEO data",
            'count' => $pagesWithoutSEO,
        ];

        // Check for broken redirects
        $brokenRedirects = Redirect::active()
            ->where('hit_count', 0)
            ->where('created_at', '<', now()->subDays(30))
            ->count();

        $health['checks']['redirects'] = [
            'status' => $brokenRedirects > 0 ? 'warning' : 'healthy',
            'message' => $brokenRedirects > 0 
                ? "{$brokenRedirects} unused redirects"
                : "All redirects are being used",
            'count' => $brokenRedirects,
        ];

        // Check for large media files
        $largeMediaFiles = Media::where('file_size', '>', 5 * 1024 * 1024)->count(); // > 5MB

        $health['checks']['media'] = [
            'status' => $largeMediaFiles > 10 ? 'warning' : 'healthy',
            'message' => $largeMediaFiles > 0 
                ? "{$largeMediaFiles} large media files (>5MB)"
                : "Media files are optimized",
            'count' => $largeMediaFiles,
        ];

        // Overall status
        $warningCount = collect($health['checks'])->where('status', 'warning')->count();
        if ($warningCount > 0) {
            $health['status'] = 'warning';
        }

        return $health;
    }
}
