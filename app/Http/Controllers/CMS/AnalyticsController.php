<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\CMS\Page;
use App\Models\CMS\Media;
use App\Models\CMS\Redirect;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Display CMS analytics dashboard.
     */
    public function index(Request $request): Response
    {
        $dateRange = $this->getDateRange($request);
        
        $analytics = [
            'overview' => $this->getOverviewStats($dateRange),
            'content' => $this->getContentAnalytics($dateRange),
            'performance' => $this->getPerformanceAnalytics($dateRange),
            'seo' => $this->getSEOAnalytics(),
            'traffic' => $this->getTrafficAnalytics($dateRange),
            'media' => $this->getMediaAnalytics(),
        ];

        return Inertia::render('CMS/Analytics/Index', [
            'analytics' => $analytics,
            'dateRange' => $dateRange,
        ]);
    }

    /**
     * Get date range from request.
     */
    private function getDateRange(Request $request): array
    {
        $period = $request->get('period', '30d');
        
        switch ($period) {
            case '7d':
                $startDate = now()->subDays(7);
                break;
            case '30d':
                $startDate = now()->subDays(30);
                break;
            case '90d':
                $startDate = now()->subDays(90);
                break;
            case '1y':
                $startDate = now()->subYear();
                break;
            default:
                $startDate = now()->subDays(30);
        }

        return [
            'start' => $startDate,
            'end' => now(),
            'period' => $period,
        ];
    }

    /**
     * Get overview statistics.
     */
    private function getOverviewStats(array $dateRange): array
    {
        return [
            'total_pages' => Page::count(),
            'published_pages' => Page::published()->count(),
            'total_views' => Page::sum('view_count'),
            'total_media' => Media::count(),
            'media_size' => Media::sum('file_size'),
            'active_redirects' => Redirect::active()->count(),
            'redirect_hits' => Redirect::sum('hit_count'),
            'new_pages' => Page::where('created_at', '>=', $dateRange['start'])->count(),
            'updated_pages' => Page::where('updated_at', '>=', $dateRange['start'])
                ->where('updated_at', '!=', DB::raw('created_at'))
                ->count(),
        ];
    }

    /**
     * Get content analytics.
     */
    private function getContentAnalytics(array $dateRange): array
    {
        // Content by status
        $contentByStatus = [
            'published' => Page::published()->count(),
            'draft' => Page::draft()->count(),
            'scheduled' => Page::scheduled()->count(),
            'archived' => Page::where('status', 'archived')->count(),
        ];

        // Content by template
        $contentByTemplate = Page::select('template', DB::raw('count(*) as count'))
            ->groupBy('template')
            ->orderBy('count', 'desc')
            ->get()
            ->pluck('count', 'template')
            ->toArray();

        // Content by language
        $contentByLanguage = Page::select('language', DB::raw('count(*) as count'))
            ->groupBy('language')
            ->orderBy('count', 'desc')
            ->get()
            ->pluck('count', 'language')
            ->toArray();

        // Content creation over time
        $contentCreation = Page::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', $dateRange['start'])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count,
                ];
            });

        return [
            'by_status' => $contentByStatus,
            'by_template' => $contentByTemplate,
            'by_language' => $contentByLanguage,
            'creation_timeline' => $contentCreation,
        ];
    }

    /**
     * Get performance analytics.
     */
    private function getPerformanceAnalytics(array $dateRange): array
    {
        // Top pages by views
        $topPages = Page::published()
            ->orderBy('view_count', 'desc')
            ->limit(10)
            ->get(['id', 'title', 'slug', 'view_count', 'updated_at'])
            ->map(function ($page) {
                return [
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'views' => $page->view_count,
                    'last_updated' => $page->updated_at->toDateString(),
                ];
            });

        // Pages with no views
        $pagesWithoutViews = Page::published()
            ->where('view_count', 0)
            ->count();

        // Average content length
        $avgContentLength = Page::published()
            ->get()
            ->map(function ($page) {
                return strlen(strip_tags($page->content));
            })
            ->average();

        // Page load performance (simulated - would integrate with real analytics)
        $pageLoadTimes = [
            'average' => 1.2, // seconds
            'median' => 0.9,
            'p95' => 2.1,
            'p99' => 3.5,
        ];

        return [
            'top_pages' => $topPages,
            'pages_without_views' => $pagesWithoutViews,
            'avg_content_length' => round($avgContentLength),
            'page_load_times' => $pageLoadTimes,
        ];
    }

    /**
     * Get SEO analytics.
     */
    private function getSEOAnalytics(): array
    {
        $pages = Page::published()->get();
        
        $seoIssues = [
            'missing_meta_title' => 0,
            'missing_meta_description' => 0,
            'title_too_long' => 0,
            'title_too_short' => 0,
            'description_too_long' => 0,
            'description_too_short' => 0,
            'duplicate_titles' => 0,
            'duplicate_descriptions' => 0,
        ];

        $seoScores = [];
        $titles = [];
        $descriptions = [];

        foreach ($pages as $page) {
            // Check meta title
            if (empty($page->meta_title)) {
                $seoIssues['missing_meta_title']++;
            } else {
                $titleLength = strlen($page->meta_title);
                if ($titleLength > 60) {
                    $seoIssues['title_too_long']++;
                } elseif ($titleLength < 30) {
                    $seoIssues['title_too_short']++;
                }
                $titles[] = $page->meta_title;
            }

            // Check meta description
            if (empty($page->meta_description)) {
                $seoIssues['missing_meta_description']++;
            } else {
                $descLength = strlen($page->meta_description);
                if ($descLength > 160) {
                    $seoIssues['description_too_long']++;
                } elseif ($descLength < 120) {
                    $seoIssues['description_too_short']++;
                }
                $descriptions[] = $page->meta_description;
            }

            // Calculate SEO score
            $score = 0;
            if (!empty($page->meta_title) && strlen($page->meta_title) >= 30 && strlen($page->meta_title) <= 60) {
                $score += 25;
            }
            if (!empty($page->meta_description) && strlen($page->meta_description) >= 120 && strlen($page->meta_description) <= 160) {
                $score += 25;
            }
            if (strlen(strip_tags($page->content)) >= 300) {
                $score += 25;
            }
            if (strlen($page->slug) <= 75) {
                $score += 25;
            }
            $seoScores[] = $score;
        }

        // Check for duplicates
        $seoIssues['duplicate_titles'] = count($titles) - count(array_unique($titles));
        $seoIssues['duplicate_descriptions'] = count($descriptions) - count(array_unique($descriptions));

        // SEO score distribution
        $scoreDistribution = [
            'excellent' => count(array_filter($seoScores, fn($s) => $s >= 80)),
            'good' => count(array_filter($seoScores, fn($s) => $s >= 60 && $s < 80)),
            'needs_improvement' => count(array_filter($seoScores, fn($s) => $s >= 40 && $s < 60)),
            'poor' => count(array_filter($seoScores, fn($s) => $s < 40)),
        ];

        return [
            'issues' => $seoIssues,
            'score_distribution' => $scoreDistribution,
            'average_score' => count($seoScores) > 0 ? round(array_sum($seoScores) / count($seoScores)) : 0,
        ];
    }

    /**
     * Get traffic analytics.
     */
    private function getTrafficAnalytics(array $dateRange): array
    {
        // Redirect analytics
        $redirectStats = [
            'total_redirects' => Redirect::count(),
            'active_redirects' => Redirect::active()->count(),
            'total_hits' => Redirect::sum('hit_count'),
            'top_redirects' => Redirect::withHits()
                ->orderBy('hit_count', 'desc')
                ->limit(10)
                ->get(['from_url', 'to_url', 'hit_count'])
                ->toArray(),
        ];

        // Traffic sources (simulated - would integrate with real analytics)
        $trafficSources = [
            'direct' => 45,
            'search' => 30,
            'social' => 15,
            'referral' => 10,
        ];

        return [
            'redirects' => $redirectStats,
            'sources' => $trafficSources,
        ];
    }

    /**
     * Get media analytics.
     */
    private function getMediaAnalytics(): array
    {
        $totalSize = Media::sum('file_size');
        
        // Media by type
        $mediaByType = [
            'images' => Media::images()->count(),
            'videos' => Media::videos()->count(),
            'documents' => Media::documents()->count(),
        ];

        // Storage usage
        $storageUsage = [
            'total_files' => Media::count(),
            'total_size' => $totalSize,
            'average_size' => Media::count() > 0 ? $totalSize / Media::count() : 0,
            'largest_files' => Media::orderBy('file_size', 'desc')
                ->limit(10)
                ->get(['name', 'file_size', 'mime_type'])
                ->toArray(),
        ];

        // Media usage
        $unusedMedia = Media::whereDoesntHave('pages')->count();

        return [
            'by_type' => $mediaByType,
            'storage' => $storageUsage,
            'unused_count' => $unusedMedia,
        ];
    }

    /**
     * Export analytics data.
     */
    public function export(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $dateRange = $this->getDateRange($request);
        $format = $request->get('format', 'csv');

        $filename = 'cms-analytics-' . date('Y-m-d-H-i-s') . '.' . $format;

        return response()->streamDownload(function () use ($dateRange, $format) {
            if ($format === 'csv') {
                $this->exportCSV($dateRange);
            } else {
                $this->exportJSON($dateRange);
            }
        }, $filename, [
            'Content-Type' => $format === 'csv' ? 'text/csv' : 'application/json',
        ]);
    }

    /**
     * Export analytics as CSV.
     */
    private function exportCSV(array $dateRange): void
    {
        $handle = fopen('php://output', 'w');
        
        // Page analytics
        fputcsv($handle, ['Page Analytics']);
        fputcsv($handle, ['Title', 'Slug', 'Status', 'Views', 'Created', 'Updated']);
        
        Page::chunk(1000, function ($pages) use ($handle) {
            foreach ($pages as $page) {
                fputcsv($handle, [
                    $page->title,
                    $page->slug,
                    $page->status,
                    $page->view_count,
                    $page->created_at->toDateString(),
                    $page->updated_at->toDateString(),
                ]);
            }
        });

        fclose($handle);
    }

    /**
     * Export analytics as JSON.
     */
    private function exportJSON(array $dateRange): void
    {
        $analytics = [
            'overview' => $this->getOverviewStats($dateRange),
            'content' => $this->getContentAnalytics($dateRange),
            'performance' => $this->getPerformanceAnalytics($dateRange),
            'seo' => $this->getSEOAnalytics(),
            'traffic' => $this->getTrafficAnalytics($dateRange),
            'media' => $this->getMediaAnalytics(),
            'exported_at' => now()->toISOString(),
            'date_range' => $dateRange,
        ];

        echo json_encode($analytics, JSON_PRETTY_PRINT);
    }
}
