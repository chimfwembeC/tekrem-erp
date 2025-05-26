<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\CMS\Page;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SitemapController extends Controller
{
    /**
     * Display sitemap management interface.
     */
    public function index(): \Inertia\Response
    {
        $sitemapExists = Storage::disk('public')->exists('sitemap.xml');
        $lastGenerated = null;
        $pageCount = Page::published()->count();

        if ($sitemapExists) {
            $lastGenerated = Storage::disk('public')->lastModified('sitemap.xml');
            $lastGenerated = date('Y-m-d H:i:s', $lastGenerated);
        }

        $pages = Page::published()
            ->select('id', 'title', 'slug', 'updated_at', 'created_at')
            ->orderBy('updated_at', 'desc')
            ->limit(20)
            ->get();

        return Inertia::render('CMS/Sitemap/Index', [
            'sitemapExists' => $sitemapExists,
            'lastGenerated' => $lastGenerated,
            'pageCount' => $pageCount,
            'recentPages' => $pages,
            'sitemapUrl' => url('sitemap.xml'),
        ]);
    }

    /**
     * Generate XML sitemap.
     */
    public function generate(): \Illuminate\Http\JsonResponse
    {
        try {
            $xml = $this->generateSitemapXML();
            
            // Save to public storage
            Storage::disk('public')->put('sitemap.xml', $xml);
            
            // Also save to public directory for direct access
            file_put_contents(public_path('sitemap.xml'), $xml);

            $pageCount = Page::published()->count();

            return response()->json([
                'success' => true,
                'message' => "Sitemap generated successfully with {$pageCount} pages.",
                'url' => url('sitemap.xml'),
                'generated_at' => now()->toISOString(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate sitemap: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Serve XML sitemap.
     */
    public function xml(): Response
    {
        // Check if sitemap exists
        if (!Storage::disk('public')->exists('sitemap.xml')) {
            // Generate sitemap if it doesn't exist
            $xml = $this->generateSitemapXML();
            Storage::disk('public')->put('sitemap.xml', $xml);
        } else {
            $xml = Storage::disk('public')->get('sitemap.xml');
        }

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Cache-Control' => 'public, max-age=3600', // Cache for 1 hour
        ]);
    }

    /**
     * Generate sitemap XML content.
     */
    private function generateSitemapXML(): string
    {
        $pages = Page::published()
            ->select('slug', 'updated_at', 'created_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Add homepage
        $xml .= $this->generateUrlEntry('/', now(), 'daily', '1.0');

        // Add pages
        foreach ($pages as $page) {
            $url = $page->slug === 'home' ? '/' : '/' . $page->slug;
            $lastmod = $page->updated_at;
            $changefreq = $this->getChangeFrequency($page);
            $priority = $this->getPriority($page);

            $xml .= $this->generateUrlEntry($url, $lastmod, $changefreq, $priority);
        }

        // Add static routes
        $staticRoutes = $this->getStaticRoutes();
        foreach ($staticRoutes as $route) {
            $xml .= $this->generateUrlEntry(
                $route['url'],
                $route['lastmod'] ?? now(),
                $route['changefreq'] ?? 'monthly',
                $route['priority'] ?? '0.5'
            );
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Generate URL entry for sitemap.
     */
    private function generateUrlEntry(string $url, $lastmod, string $changefreq, string $priority): string
    {
        $fullUrl = url($url);
        $lastmodFormatted = $lastmod instanceof \Carbon\Carbon 
            ? $lastmod->toISOString() 
            : $lastmod;

        return "  <url>\n" .
               "    <loc>{$fullUrl}</loc>\n" .
               "    <lastmod>{$lastmodFormatted}</lastmod>\n" .
               "    <changefreq>{$changefreq}</changefreq>\n" .
               "    <priority>{$priority}</priority>\n" .
               "  </url>\n";
    }

    /**
     * Get change frequency for a page.
     */
    private function getChangeFrequency(Page $page): string
    {
        $daysSinceUpdate = $page->updated_at->diffInDays(now());

        if ($daysSinceUpdate <= 1) {
            return 'daily';
        } elseif ($daysSinceUpdate <= 7) {
            return 'weekly';
        } elseif ($daysSinceUpdate <= 30) {
            return 'monthly';
        } else {
            return 'yearly';
        }
    }

    /**
     * Get priority for a page.
     */
    private function getPriority(Page $page): string
    {
        // Homepage gets highest priority
        if ($page->slug === 'home' || $page->is_homepage) {
            return '1.0';
        }

        // High traffic pages get higher priority
        if ($page->view_count > 1000) {
            return '0.9';
        } elseif ($page->view_count > 500) {
            return '0.8';
        } elseif ($page->view_count > 100) {
            return '0.7';
        } else {
            return '0.6';
        }
    }

    /**
     * Get static routes to include in sitemap.
     */
    private function getStaticRoutes(): array
    {
        return [
            [
                'url' => '/about',
                'changefreq' => 'monthly',
                'priority' => '0.8',
            ],
            [
                'url' => '/contact',
                'changefreq' => 'monthly',
                'priority' => '0.7',
            ],
            [
                'url' => '/services',
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ],
            [
                'url' => '/blog',
                'changefreq' => 'daily',
                'priority' => '0.9',
            ],
            // Add more static routes as needed
        ];
    }

    /**
     * Validate sitemap.
     */
    public function validate(): \Illuminate\Http\JsonResponse
    {
        try {
            if (!Storage::disk('public')->exists('sitemap.xml')) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Sitemap does not exist.',
                ]);
            }

            $xml = Storage::disk('public')->get('sitemap.xml');
            
            // Basic XML validation
            $dom = new \DOMDocument();
            $dom->loadXML($xml);

            // Count URLs
            $urlCount = substr_count($xml, '<url>');
            
            // Check file size
            $fileSize = strlen($xml);
            $fileSizeMB = round($fileSize / 1024 / 1024, 2);

            // Sitemap limits
            $maxUrls = 50000;
            $maxSizeMB = 50;

            $warnings = [];
            if ($urlCount > $maxUrls * 0.8) {
                $warnings[] = "Approaching URL limit ({$urlCount}/{$maxUrls})";
            }
            if ($fileSizeMB > $maxSizeMB * 0.8) {
                $warnings[] = "Approaching size limit ({$fileSizeMB}MB/{$maxSizeMB}MB)";
            }

            return response()->json([
                'valid' => true,
                'message' => 'Sitemap is valid.',
                'stats' => [
                    'url_count' => $urlCount,
                    'file_size' => $fileSize,
                    'file_size_mb' => $fileSizeMB,
                ],
                'warnings' => $warnings,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Sitemap validation failed: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Submit sitemap to search engines.
     */
    public function submit(): \Illuminate\Http\JsonResponse
    {
        try {
            $sitemapUrl = url('sitemap.xml');
            $results = [];

            // Submit to Google
            $googleUrl = "https://www.google.com/ping?sitemap=" . urlencode($sitemapUrl);
            $results['google'] = $this->pingSearchEngine($googleUrl);

            // Submit to Bing
            $bingUrl = "https://www.bing.com/ping?sitemap=" . urlencode($sitemapUrl);
            $results['bing'] = $this->pingSearchEngine($bingUrl);

            return response()->json([
                'success' => true,
                'message' => 'Sitemap submitted to search engines.',
                'results' => $results,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit sitemap: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ping search engine with sitemap URL.
     */
    private function pingSearchEngine(string $url): array
    {
        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error) {
                return [
                    'success' => false,
                    'message' => 'cURL error: ' . $error,
                ];
            }

            return [
                'success' => $httpCode === 200,
                'http_code' => $httpCode,
                'message' => $httpCode === 200 ? 'Successfully submitted' : 'Submission failed',
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Exception: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Download sitemap file.
     */
    public function download(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        if (!Storage::disk('public')->exists('sitemap.xml')) {
            abort(404, 'Sitemap not found');
        }

        return Storage::disk('public')->download('sitemap.xml', 'sitemap.xml', [
            'Content-Type' => 'application/xml',
        ]);
    }

    /**
     * Auto-generate sitemap (for scheduled tasks).
     */
    public function autoGenerate(): void
    {
        try {
            $xml = $this->generateSitemapXML();
            Storage::disk('public')->put('sitemap.xml', $xml);
            file_put_contents(public_path('sitemap.xml'), $xml);
            
            \Log::info('Sitemap auto-generated successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to auto-generate sitemap: ' . $e->getMessage());
        }
    }
}
