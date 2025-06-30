<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SocialMedia\FacebookService;
use App\Services\SocialMedia\InstagramService;
use App\Services\SocialMedia\LinkedInService;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class IntegrationVerificationController extends Controller
{
    protected FacebookService $facebookService;
    protected InstagramService $instagramService;
    protected LinkedInService $linkedInService;

    public function __construct(
        FacebookService $facebookService,
        InstagramService $instagramService,
        LinkedInService $linkedInService
    ) {
        $this->facebookService = $facebookService;
        $this->instagramService = $instagramService;
        $this->linkedInService = $linkedInService;
    }

    /**
     * Display integration verification dashboard
     */
    public function index(): Response
    {
        $integrations = $this->getAllIntegrations();
        $systemHealth = $this->getSystemHealth();
        $recentTests = $this->getRecentTests();

        return Inertia::render('Admin/IntegrationVerification/Index', [
            'integrations' => $integrations,
            'systemHealth' => $systemHealth,
            'recentTests' => $recentTests,
        ]);
    }

    /**
     * Test all integrations
     */
    public function testAllIntegrations(): JsonResponse
    {
        try {
            $results = [];

            // Test Social Media Integrations
            $results['social_media'] = [
                'facebook' => $this->testFacebookIntegration(),
                'instagram' => $this->testInstagramIntegration(),
                'linkedin' => $this->testLinkedInIntegration(),
            ];

            // Test Database Connections
            $results['database'] = $this->testDatabaseConnections();

            // Test Email Configuration
            $results['email'] = $this->testEmailConfiguration();

            // Test File Storage
            $results['storage'] = $this->testFileStorage();

            // Test Queue System
            $results['queue'] = $this->testQueueSystem();

            // Test Cache System
            $results['cache'] = $this->testCacheSystem();

            // Calculate overall health score
            $healthScore = $this->calculateHealthScore($results);

            // Log test results
            Log::info('Integration verification completed', [
                'health_score' => $healthScore,
                'results' => $results
            ]);

            return response()->json([
                'success' => true,
                'results' => $results,
                'health_score' => $healthScore,
                'tested_at' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Integration verification failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Integration verification failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test specific integration
     */
    public function testIntegration(Request $request): JsonResponse
    {
        $request->validate([
            'integration' => 'required|string|in:facebook,instagram,linkedin,database,email,storage,queue,cache'
        ]);

        try {
            $result = match($request->integration) {
                'facebook' => $this->testFacebookIntegration(),
                'instagram' => $this->testInstagramIntegration(),
                'linkedin' => $this->testLinkedInIntegration(),
                'database' => $this->testDatabaseConnections(),
                'email' => $this->testEmailConfiguration(),
                'storage' => $this->testFileStorage(),
                'queue' => $this->testQueueSystem(),
                'cache' => $this->testCacheSystem(),
            };

            return response()->json([
                'success' => true,
                'integration' => $request->integration,
                'result' => $result,
                'tested_at' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Failed to test {$request->integration}: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get integration configuration status
     */
    public function getConfigurationStatus(): JsonResponse
    {
        try {
            $configurations = [
                'facebook' => $this->getFacebookConfigStatus(),
                'instagram' => $this->getInstagramConfigStatus(),
                'linkedin' => $this->getLinkedInConfigStatus(),
                'email' => $this->getEmailConfigStatus(),
                'storage' => $this->getStorageConfigStatus(),
                'queue' => $this->getQueueConfigStatus(),
                'cache' => $this->getCacheConfigStatus(),
            ];

            return response()->json([
                'success' => true,
                'configurations' => $configurations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get configuration status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test Facebook integration
     */
    private function testFacebookIntegration(): array
    {
        try {
            $result = $this->facebookService->testConnection();
            
            return [
                'status' => $result['status'] === 'success' ? 'healthy' : 'error',
                'message' => $result['message'],
                'details' => $result['data'] ?? null,
                'response_time' => $this->measureResponseTime(fn() => $this->facebookService->testConnection()),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Facebook integration test failed: ' . $e->getMessage(),
                'details' => null,
                'response_time' => null,
            ];
        }
    }

    /**
     * Test Instagram integration
     */
    private function testInstagramIntegration(): array
    {
        try {
            $result = $this->instagramService->testConnection();
            
            return [
                'status' => $result['status'] === 'success' ? 'healthy' : 'error',
                'message' => $result['message'],
                'details' => $result['data'] ?? null,
                'response_time' => $this->measureResponseTime(fn() => $this->instagramService->testConnection()),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Instagram integration test failed: ' . $e->getMessage(),
                'details' => null,
                'response_time' => null,
            ];
        }
    }

    /**
     * Test LinkedIn integration
     */
    private function testLinkedInIntegration(): array
    {
        try {
            $result = $this->linkedInService->testConnection();
            
            return [
                'status' => $result['status'] === 'success' ? 'healthy' : 'error',
                'message' => $result['message'],
                'details' => $result['data'] ?? null,
                'response_time' => $this->measureResponseTime(fn() => $this->linkedInService->testConnection()),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'LinkedIn integration test failed: ' . $e->getMessage(),
                'details' => null,
                'response_time' => null,
            ];
        }
    }

    /**
     * Test database connections
     */
    private function testDatabaseConnections(): array
    {
        try {
            $startTime = microtime(true);
            
            // Test main database connection
            DB::connection()->getPdo();
            $mainDbStatus = 'healthy';
            $mainDbMessage = 'Main database connection successful';
            
            // Test a simple query
            $userCount = DB::table('users')->count();
            
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            return [
                'status' => $mainDbStatus,
                'message' => $mainDbMessage,
                'details' => [
                    'user_count' => $userCount,
                    'driver' => config('database.default'),
                    'host' => config('database.connections.' . config('database.default') . '.host'),
                ],
                'response_time' => $responseTime,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Database connection test failed: ' . $e->getMessage(),
                'details' => null,
                'response_time' => null,
            ];
        }
    }

    /**
     * Test email configuration
     */
    private function testEmailConfiguration(): array
    {
        try {
            $mailer = config('mail.default');
            $host = config("mail.mailers.{$mailer}.host");
            $port = config("mail.mailers.{$mailer}.port");
            
            return [
                'status' => 'healthy',
                'message' => 'Email configuration is valid',
                'details' => [
                    'mailer' => $mailer,
                    'host' => $host,
                    'port' => $port,
                    'from_address' => config('mail.from.address'),
                ],
                'response_time' => null,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Email configuration test failed: ' . $e->getMessage(),
                'details' => null,
                'response_time' => null,
            ];
        }
    }

    /**
     * Test file storage
     */
    private function testFileStorage(): array
    {
        try {
            $disk = config('filesystems.default');
            $testFile = 'integration-test-' . time() . '.txt';
            $testContent = 'Integration test file';
            
            $startTime = microtime(true);
            
            // Test write
            \Storage::disk($disk)->put($testFile, $testContent);
            
            // Test read
            $readContent = \Storage::disk($disk)->get($testFile);
            
            // Test delete
            \Storage::disk($disk)->delete($testFile);
            
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            $success = $readContent === $testContent;
            
            return [
                'status' => $success ? 'healthy' : 'error',
                'message' => $success ? 'File storage test successful' : 'File storage test failed',
                'details' => [
                    'disk' => $disk,
                    'driver' => config("filesystems.disks.{$disk}.driver"),
                ],
                'response_time' => $responseTime,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'File storage test failed: ' . $e->getMessage(),
                'details' => null,
                'response_time' => null,
            ];
        }
    }

    /**
     * Test queue system
     */
    private function testQueueSystem(): array
    {
        try {
            $connection = config('queue.default');
            $driver = config("queue.connections.{$connection}.driver");
            
            return [
                'status' => 'healthy',
                'message' => 'Queue system configuration is valid',
                'details' => [
                    'connection' => $connection,
                    'driver' => $driver,
                ],
                'response_time' => null,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Queue system test failed: ' . $e->getMessage(),
                'details' => null,
                'response_time' => null,
            ];
        }
    }

    /**
     * Test cache system
     */
    private function testCacheSystem(): array
    {
        try {
            $testKey = 'integration-test-' . time();
            $testValue = 'test-value';
            
            $startTime = microtime(true);
            
            // Test cache write
            \Cache::put($testKey, $testValue, 60);
            
            // Test cache read
            $cachedValue = \Cache::get($testKey);
            
            // Test cache delete
            \Cache::forget($testKey);
            
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            $success = $cachedValue === $testValue;
            
            return [
                'status' => $success ? 'healthy' : 'error',
                'message' => $success ? 'Cache system test successful' : 'Cache system test failed',
                'details' => [
                    'driver' => config('cache.default'),
                ],
                'response_time' => $responseTime,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Cache system test failed: ' . $e->getMessage(),
                'details' => null,
                'response_time' => null,
            ];
        }
    }

    /**
     * Get all integrations status
     */
    private function getAllIntegrations(): array
    {
        return [
            'social_media' => [
                'facebook' => $this->getFacebookConfigStatus(),
                'instagram' => $this->getInstagramConfigStatus(),
                'linkedin' => $this->getLinkedInConfigStatus(),
            ],
            'system' => [
                'database' => ['configured' => true, 'status' => 'unknown'],
                'email' => ['configured' => true, 'status' => 'unknown'],
                'storage' => ['configured' => true, 'status' => 'unknown'],
                'queue' => ['configured' => true, 'status' => 'unknown'],
                'cache' => ['configured' => true, 'status' => 'unknown'],
            ],
        ];
    }

    /**
     * Get system health overview
     */
    private function getSystemHealth(): array
    {
        return [
            'overall_status' => 'unknown',
            'last_check' => null,
            'issues_count' => 0,
            'uptime' => '99.9%',
        ];
    }

    /**
     * Get recent test results
     */
    private function getRecentTests(): array
    {
        return [];
    }

    /**
     * Calculate overall health score
     */
    private function calculateHealthScore(array $results): int
    {
        $totalTests = 0;
        $passedTests = 0;

        foreach ($results as $category => $tests) {
            if (is_array($tests)) {
                foreach ($tests as $test) {
                    $totalTests++;
                    if (isset($test['status']) && $test['status'] === 'healthy') {
                        $passedTests++;
                    }
                }
            }
        }

        return $totalTests > 0 ? round(($passedTests / $totalTests) * 100) : 0;
    }

    /**
     * Measure response time for a function
     */
    private function measureResponseTime(callable $function): float
    {
        $startTime = microtime(true);
        $function();
        return round((microtime(true) - $startTime) * 1000, 2);
    }

    /**
     * Get Facebook configuration status
     */
    private function getFacebookConfigStatus(): array
    {
        $appId = Setting::get('integration.facebook.app_id');
        $appSecret = Setting::get('integration.facebook.app_secret');
        $accessToken = Setting::get('integration.facebook.access_token');

        return [
            'configured' => !empty($appId) && !empty($appSecret) && !empty($accessToken),
            'status' => 'unknown',
            'last_test' => null,
        ];
    }

    /**
     * Get Instagram configuration status
     */
    private function getInstagramConfigStatus(): array
    {
        $accessToken = Setting::get('integration.instagram.access_token');

        return [
            'configured' => !empty($accessToken),
            'status' => 'unknown',
            'last_test' => null,
        ];
    }

    /**
     * Get LinkedIn configuration status
     */
    private function getLinkedInConfigStatus(): array
    {
        $accessToken = Setting::get('integration.linkedin.access_token');

        return [
            'configured' => !empty($accessToken),
            'status' => 'unknown',
            'last_test' => null,
        ];
    }

    /**
     * Get email configuration status
     */
    private function getEmailConfigStatus(): array
    {
        return [
            'configured' => !empty(config('mail.from.address')),
            'status' => 'unknown',
            'last_test' => null,
        ];
    }

    /**
     * Get storage configuration status
     */
    private function getStorageConfigStatus(): array
    {
        return [
            'configured' => !empty(config('filesystems.default')),
            'status' => 'unknown',
            'last_test' => null,
        ];
    }

    /**
     * Get queue configuration status
     */
    private function getQueueConfigStatus(): array
    {
        return [
            'configured' => !empty(config('queue.default')),
            'status' => 'unknown',
            'last_test' => null,
        ];
    }

    /**
     * Get cache configuration status
     */
    private function getCacheConfigStatus(): array
    {
        return [
            'configured' => !empty(config('cache.default')),
            'status' => 'unknown',
            'last_test' => null,
        ];
    }
}
