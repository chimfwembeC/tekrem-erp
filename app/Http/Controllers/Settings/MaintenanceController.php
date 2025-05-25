<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MaintenanceController extends Controller
{
    /**
     * Clear application cache.
     */
    public function clearCache(Request $request): JsonResponse
    {
        try {
            // Clear various caches
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');
            
            // Clear compiled views
            if (File::exists(storage_path('framework/views'))) {
                File::cleanDirectory(storage_path('framework/views'));
            }

            Log::info('System cache cleared by admin', [
                'user_id' => auth()->id(),
                'ip' => $request->ip(),
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'All caches cleared successfully!',
                'details' => [
                    'Application cache cleared',
                    'Configuration cache cleared',
                    'Route cache cleared',
                    'View cache cleared',
                    'Compiled views cleared'
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to clear cache', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear application logs.
     */
    public function clearLogs(Request $request): JsonResponse
    {
        try {
            $logPath = storage_path('logs');
            $clearedFiles = [];

            if (File::exists($logPath)) {
                $files = File::files($logPath);
                foreach ($files as $file) {
                    if (pathinfo($file, PATHINFO_EXTENSION) === 'log') {
                        File::delete($file);
                        $clearedFiles[] = basename($file);
                    }
                }
            }

            Log::info('System logs cleared by admin', [
                'user_id' => auth()->id(),
                'ip' => $request->ip(),
                'files_cleared' => count($clearedFiles),
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Log files cleared successfully!',
                'details' => [
                    'Files cleared: ' . count($clearedFiles),
                    'Log directory cleaned'
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to clear logs', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear logs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create system backup.
     */
    public function createBackup(Request $request): JsonResponse
    {
        try {
            $timestamp = now()->format('Y-m-d_H-i-s');
            $backupName = "backup_{$timestamp}";
            
            // Create backup directory if it doesn't exist
            $backupPath = storage_path('app/backups');
            if (!File::exists($backupPath)) {
                File::makeDirectory($backupPath, 0755, true);
            }

            // Database backup
            $dbBackupFile = "{$backupPath}/{$backupName}_database.sql";
            $this->createDatabaseBackup($dbBackupFile);

            // Files backup (excluding storage and vendor)
            $filesBackupFile = "{$backupPath}/{$backupName}_files.zip";
            $this->createFilesBackup($filesBackupFile);

            // Create backup manifest
            $manifest = [
                'name' => $backupName,
                'created_at' => now()->toISOString(),
                'created_by' => auth()->user()->name,
                'database_file' => basename($dbBackupFile),
                'files_file' => basename($filesBackupFile),
                'size' => $this->getBackupSize($dbBackupFile, $filesBackupFile),
                'version' => app()->version(),
            ];

            File::put("{$backupPath}/{$backupName}_manifest.json", json_encode($manifest, JSON_PRETTY_PRINT));

            Log::info('System backup created by admin', [
                'user_id' => auth()->id(),
                'backup_name' => $backupName,
                'size' => $manifest['size'],
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Backup created successfully!',
                'details' => [
                    'Backup name: ' . $backupName,
                    'Database backup: ' . basename($dbBackupFile),
                    'Files backup: ' . basename($filesBackupFile),
                    'Total size: ' . $manifest['size']
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create backup', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create backup: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get system information.
     */
    public function systemInfo(): JsonResponse
    {
        try {
            $info = [
                'system' => [
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                    'operating_system' => PHP_OS,
                    'server_time' => now()->toISOString(),
                    'timezone' => config('app.timezone'),
                ],
                'database' => [
                    'driver' => config('database.default'),
                    'version' => $this->getDatabaseVersion(),
                    'size' => $this->getDatabaseSize(),
                    'tables_count' => $this->getTablesCount(),
                ],
                'storage' => [
                    'disk_total' => $this->formatBytes(disk_total_space('/')),
                    'disk_free' => $this->formatBytes(disk_free_space('/')),
                    'disk_used' => $this->formatBytes(disk_total_space('/') - disk_free_space('/')),
                    'storage_path_size' => $this->getDirectorySize(storage_path()),
                ],
                'performance' => [
                    'memory_limit' => ini_get('memory_limit'),
                    'memory_usage' => $this->formatBytes(memory_get_usage(true)),
                    'peak_memory' => $this->formatBytes(memory_get_peak_usage(true)),
                    'max_execution_time' => ini_get('max_execution_time') . 's',
                    'upload_max_filesize' => ini_get('upload_max_filesize'),
                ],
                'cache' => [
                    'driver' => config('cache.default'),
                    'status' => $this->getCacheStatus(),
                    'redis_status' => $this->getRedisStatus(),
                ],
                'queue' => [
                    'driver' => config('queue.default'),
                    'failed_jobs' => $this->getFailedJobsCount(),
                    'pending_jobs' => $this->getPendingJobsCount(),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $info
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get system info: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create database backup.
     */
    private function createDatabaseBackup(string $filePath): void
    {
        $database = config('database.connections.' . config('database.default'));
        
        if ($database['driver'] === 'mysql') {
            $command = sprintf(
                'mysqldump -h%s -u%s -p%s %s > %s',
                $database['host'],
                $database['username'],
                $database['password'],
                $database['database'],
                $filePath
            );
            exec($command);
        } else {
            // For SQLite or other databases, you might use different approaches
            throw new \Exception('Database backup not supported for ' . $database['driver']);
        }
    }

    /**
     * Create files backup.
     */
    private function createFilesBackup(string $filePath): void
    {
        $zip = new \ZipArchive();
        if ($zip->open($filePath, \ZipArchive::CREATE) === TRUE) {
            $this->addDirectoryToZip($zip, base_path(), '', ['vendor', 'node_modules', 'storage/logs', 'storage/framework']);
            $zip->close();
        } else {
            throw new \Exception('Failed to create files backup');
        }
    }

    /**
     * Add directory to zip archive.
     */
    private function addDirectoryToZip(\ZipArchive $zip, string $dir, string $zipDir = '', array $exclude = []): void
    {
        if (is_dir($dir)) {
            $files = scandir($dir);
            foreach ($files as $file) {
                if ($file != '.' && $file != '..') {
                    $filePath = $dir . '/' . $file;
                    $zipPath = $zipDir . $file;
                    
                    // Skip excluded directories
                    if (in_array($file, $exclude)) {
                        continue;
                    }
                    
                    if (is_dir($filePath)) {
                        $zip->addEmptyDir($zipPath);
                        $this->addDirectoryToZip($zip, $filePath, $zipPath . '/', $exclude);
                    } else {
                        $zip->addFile($filePath, $zipPath);
                    }
                }
            }
        }
    }

    /**
     * Get backup size.
     */
    private function getBackupSize(string ...$files): string
    {
        $totalSize = 0;
        foreach ($files as $file) {
            if (File::exists($file)) {
                $totalSize += File::size($file);
            }
        }
        return $this->formatBytes($totalSize);
    }

    /**
     * Format bytes to human readable format.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }

    /**
     * Get database version.
     */
    private function getDatabaseVersion(): string
    {
        try {
            return DB::select('SELECT VERSION() as version')[0]->version ?? 'Unknown';
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    /**
     * Get database size.
     */
    private function getDatabaseSize(): string
    {
        try {
            $database = config('database.connections.' . config('database.default'))['database'];
            $result = DB::select("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS 'size' FROM information_schema.tables WHERE table_schema=?", [$database]);
            return ($result[0]->size ?? 0) . ' MB';
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    /**
     * Get tables count.
     */
    private function getTablesCount(): int
    {
        try {
            $database = config('database.connections.' . config('database.default'))['database'];
            $result = DB::select("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema=?", [$database]);
            return $result[0]->count ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get directory size.
     */
    private function getDirectorySize(string $directory): string
    {
        $size = 0;
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($directory)) as $file) {
            $size += $file->getSize();
        }
        return $this->formatBytes($size);
    }

    /**
     * Get cache status.
     */
    private function getCacheStatus(): string
    {
        try {
            Cache::put('test_key', 'test_value', 60);
            $value = Cache::get('test_key');
            Cache::forget('test_key');
            return $value === 'test_value' ? 'Working' : 'Failed';
        } catch (\Exception $e) {
            return 'Failed';
        }
    }

    /**
     * Get Redis status.
     */
    private function getRedisStatus(): string
    {
        try {
            if (config('cache.default') === 'redis') {
                $redis = app('redis');
                $redis->ping();
                return 'Connected';
            }
            return 'Not configured';
        } catch (\Exception $e) {
            return 'Failed';
        }
    }

    /**
     * Get failed jobs count.
     */
    private function getFailedJobsCount(): int
    {
        try {
            return DB::table('failed_jobs')->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get pending jobs count.
     */
    private function getPendingJobsCount(): int
    {
        try {
            return DB::table('jobs')->count();
        } catch (\Exception $e) {
            return 0;
        }
    }
}
