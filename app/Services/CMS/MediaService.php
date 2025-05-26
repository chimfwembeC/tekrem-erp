<?php

namespace App\Services\CMS;

use App\Models\CMS\Media;
use App\Models\CMS\MediaFolder;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class MediaService
{
    /**
     * Upload a file.
     */
    public function uploadFile(UploadedFile $file, User $user, ?MediaFolder $folder = null, array $options = []): Media
    {
        // Generate unique filename
        $filename = $this->generateUniqueFilename($file);
        
        // Determine storage path
        $folderPath = $folder ? $folder->path : 'uploads';
        $filePath = $folderPath . '/' . $filename;
        
        // Store file
        $storedPath = $file->storeAs('cms/' . $folderPath, $filename, 'public');
        
        // Get file information
        $fileInfo = $this->getFileInfo($file, $storedPath);
        
        // Create media record
        $media = Media::create([
            'name' => $options['name'] ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $storedPath,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'dimensions' => $fileInfo['dimensions'],
            'alt_text' => $options['alt_text'] ?? null,
            'description' => $options['description'] ?? null,
            'metadata' => $fileInfo['metadata'],
            'folder_id' => $folder?->id,
            'tags' => $options['tags'] ?? [],
            'uploaded_by' => $user->id,
            'is_public' => $options['is_public'] ?? true,
        ]);
        
        // Create image variants if it's an image
        if ($media->isImage()) {
            $this->createImageVariants($media);
        }
        
        // Optimize if requested
        if ($options['optimize'] ?? true) {
            $this->optimizeMedia($media);
        }
        
        return $media;
    }

    /**
     * Upload multiple files.
     */
    public function uploadMultipleFiles(array $files, User $user, ?MediaFolder $folder = null, array $options = []): array
    {
        $uploadedMedia = [];
        
        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $uploadedMedia[] = $this->uploadFile($file, $user, $folder, $options);
            }
        }
        
        return $uploadedMedia;
    }

    /**
     * Create a folder.
     */
    public function createFolder(array $data, User $user): MediaFolder
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        
        $data['slug'] = $this->generateUniqueFolderSlug($data['slug'], $data['parent_id'] ?? null);
        $data['created_by'] = $user->id;
        
        return MediaFolder::create($data);
    }

    /**
     * Move media to folder.
     */
    public function moveMediaToFolder(Media $media, ?MediaFolder $folder): bool
    {
        return $media->update(['folder_id' => $folder?->id]);
    }

    /**
     * Move folder.
     */
    public function moveFolder(MediaFolder $folder, ?MediaFolder $newParent): bool
    {
        return $folder->moveTo($newParent);
    }

    /**
     * Delete media.
     */
    public function deleteMedia(Media $media): bool
    {
        return $media->delete();
    }

    /**
     * Delete folder and contents.
     */
    public function deleteFolder(MediaFolder $folder, bool $deleteContents = false): bool
    {
        if ($deleteContents) {
            return $folder->deleteWithContents();
        }
        
        // Move contents to parent folder
        $parentId = $folder->parent_id;
        
        // Move subfolders
        $folder->children()->update(['parent_id' => $parentId]);
        
        // Move media files
        $folder->media()->update(['folder_id' => $parentId]);
        
        return $folder->delete();
    }

    /**
     * Search media.
     */
    public function searchMedia(string $query, array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        $queryBuilder = Media::search($query);
        
        // Apply filters
        if (!empty($filters['type'])) {
            switch ($filters['type']) {
                case 'image':
                    $queryBuilder->images();
                    break;
                case 'video':
                    $queryBuilder->videos();
                    break;
                case 'document':
                    $queryBuilder->documents();
                    break;
            }
        }
        
        if (!empty($filters['folder_id'])) {
            $queryBuilder->inFolder($filters['folder_id']);
        }
        
        if (!empty($filters['tags'])) {
            $queryBuilder->withTags($filters['tags']);
        }
        
        if (!empty($filters['uploaded_by'])) {
            $queryBuilder->where('uploaded_by', $filters['uploaded_by']);
        }
        
        return $queryBuilder->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get media by folder.
     */
    public function getMediaByFolder(?MediaFolder $folder = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Media::query();
        
        if ($folder) {
            $query->inFolder($folder->id);
        } else {
            $query->whereNull('folder_id');
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Optimize media file.
     */
    public function optimizeMedia(Media $media): bool
    {
        if (!$media->isImage()) {
            return false;
        }
        
        try {
            $image = Image::make(Storage::disk('public')->path($media->file_path));
            
            // Optimize image
            $image->orientate(); // Fix orientation
            
            // Compress based on format
            if ($media->mime_type === 'image/jpeg') {
                $image->save(null, 85); // 85% quality for JPEG
            } elseif ($media->mime_type === 'image/png') {
                $image->save(null, 90); // 90% quality for PNG
            }
            
            // Update file size
            $newSize = Storage::disk('public')->size($media->file_path);
            $media->update([
                'file_size' => $newSize,
                'is_optimized' => true,
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            \Log::error('Failed to optimize media', [
                'media_id' => $media->id,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }

    /**
     * Create image variants.
     */
    public function createImageVariants(Media $media, array $sizes = []): array
    {
        if (!$media->isImage()) {
            return [];
        }
        
        $defaultSizes = [
            'thumb' => [150, 150],
            'small' => [300, 300],
            'medium' => [600, 600],
            'large' => [1200, 1200],
        ];
        
        $sizes = array_merge($defaultSizes, $sizes);
        $variants = $media->variants ?? [];
        
        try {
            $originalImage = Image::make(Storage::disk('public')->path($media->file_path));
            
            foreach ($sizes as $name => $dimensions) {
                [$width, $height] = $dimensions;
                $variantKey = "{$name}_{$width}x{$height}";
                
                if (!isset($variants[$variantKey])) {
                    // Create variant
                    $variant = clone $originalImage;
                    $variant->fit($width, $height, function ($constraint) {
                        $constraint->upsize();
                    });
                    
                    // Generate variant filename
                    $pathInfo = pathinfo($media->file_path);
                    $variantPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . "_{$name}." . $pathInfo['extension'];
                    
                    // Save variant
                    $variant->save(Storage::disk('public')->path($variantPath));
                    $variants[$variantKey] = $variantPath;
                }
            }
            
            $media->update(['variants' => $variants]);
            return $variants;
            
        } catch (\Exception $e) {
            \Log::error('Failed to create image variants', [
                'media_id' => $media->id,
                'error' => $e->getMessage(),
            ]);
            
            return [];
        }
    }

    /**
     * Generate unique filename.
     */
    private function generateUniqueFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename = Str::random(40) . '.' . $extension;
        
        // Ensure filename is unique
        while (Storage::disk('public')->exists('cms/' . $filename)) {
            $filename = Str::random(40) . '.' . $extension;
        }
        
        return $filename;
    }

    /**
     * Generate unique folder slug.
     */
    private function generateUniqueFolderSlug(string $slug, ?int $parentId = null): string
    {
        $originalSlug = $slug;
        $counter = 1;
        
        while (MediaFolder::where('slug', $slug)
            ->where('parent_id', $parentId)
            ->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }

    /**
     * Get file information.
     */
    private function getFileInfo(UploadedFile $file, string $storedPath): array
    {
        $info = [
            'dimensions' => null,
            'metadata' => [],
        ];
        
        // Get image dimensions
        if (str_starts_with($file->getMimeType(), 'image/')) {
            try {
                $image = Image::make($file->getPathname());
                $info['dimensions'] = [
                    'width' => $image->width(),
                    'height' => $image->height(),
                ];
                
                // Get EXIF data
                $exif = @exif_read_data($file->getPathname());
                if ($exif) {
                    $info['metadata']['exif'] = $exif;
                }
            } catch (\Exception $e) {
                // Ignore errors
            }
        }
        
        return $info;
    }

    /**
     * Get media statistics.
     */
    public function getStatistics(): array
    {
        return Media::getStatistics();
    }

    /**
     * Clean up unused media.
     */
    public function cleanupUnusedMedia(int $daysOld = 30): int
    {
        $cutoffDate = now()->subDays($daysOld);
        
        $unusedMedia = Media::where('usage_count', 0)
            ->where('created_at', '<', $cutoffDate)
            ->get();
        
        $deleted = 0;
        
        foreach ($unusedMedia as $media) {
            if ($media->delete()) {
                $deleted++;
            }
        }
        
        return $deleted;
    }

    /**
     * Bulk tag media.
     */
    public function bulkTagMedia(array $mediaIds, array $tags): int
    {
        $updated = 0;
        
        foreach ($mediaIds as $mediaId) {
            $media = Media::find($mediaId);
            if ($media) {
                $media->addTags($tags);
                $updated++;
            }
        }
        
        return $updated;
    }

    /**
     * Bulk move media.
     */
    public function bulkMoveMedia(array $mediaIds, ?MediaFolder $folder): int
    {
        return Media::whereIn('id', $mediaIds)
            ->update(['folder_id' => $folder?->id]);
    }

    /**
     * Bulk delete media.
     */
    public function bulkDeleteMedia(array $mediaIds): int
    {
        $deleted = 0;
        
        foreach ($mediaIds as $mediaId) {
            $media = Media::find($mediaId);
            if ($media && $media->delete()) {
                $deleted++;
            }
        }
        
        return $deleted;
    }
}
