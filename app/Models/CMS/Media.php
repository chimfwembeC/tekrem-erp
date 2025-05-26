<?php

namespace App\Models\CMS;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'cms_media';

    protected $fillable = [
        'name',
        'original_name',
        'file_path',
        'file_url',
        'mime_type',
        'file_size',
        'dimensions',
        'alt_text',
        'description',
        'metadata',
        'folder_id',
        'tags',
        'is_optimized',
        'variants',
        'usage_count',
        'last_used_at',
        'uploaded_by',
        'is_public',
    ];

    protected $casts = [
        'dimensions' => 'array',
        'metadata' => 'array',
        'tags' => 'array',
        'variants' => 'array',
        'is_optimized' => 'boolean',
        'is_public' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    /**
     * Get the user who uploaded this media.
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the folder this media belongs to.
     */
    public function folder(): BelongsTo
    {
        return $this->belongsTo(MediaFolder::class, 'folder_id');
    }

    /**
     * Scope for public media.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for images.
     */
    public function scopeImages($query)
    {
        return $query->where('mime_type', 'like', 'image/%');
    }

    /**
     * Scope for videos.
     */
    public function scopeVideos($query)
    {
        return $query->where('mime_type', 'like', 'video/%');
    }

    /**
     * Scope for documents.
     */
    public function scopeDocuments($query)
    {
        return $query->whereNotIn('mime_type', function ($query) {
            $query->selectRaw("mime_type")
                  ->from('cms_media')
                  ->where('mime_type', 'like', 'image/%')
                  ->orWhere('mime_type', 'like', 'video/%')
                  ->orWhere('mime_type', 'like', 'audio/%');
        });
    }

    /**
     * Scope by folder.
     */
    public function scopeInFolder($query, $folderId)
    {
        return $query->where('folder_id', $folderId);
    }

    /**
     * Scope by tags.
     */
    public function scopeWithTags($query, array $tags)
    {
        return $query->where(function ($q) use ($tags) {
            foreach ($tags as $tag) {
                $q->orWhereJsonContains('tags', $tag);
            }
        });
    }

    /**
     * Get the full URL for the media file.
     */
    public function getUrlAttribute(): string
    {
        if ($this->file_url) {
            return $this->file_url; // CDN URL
        }

        return Storage::url($this->file_path);
    }

    /**
     * Get the file size in human readable format.
     */
    public function getHumanFileSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Check if the media is an image.
     */
    public function isImage(): bool
    {
        return strpos($this->mime_type, 'image/') === 0;
    }

    /**
     * Check if the media is a video.
     */
    public function isVideo(): bool
    {
        return strpos($this->mime_type, 'video/') === 0;
    }

    /**
     * Check if the media is an audio file.
     */
    public function isAudio(): bool
    {
        return strpos($this->mime_type, 'audio/') === 0;
    }

    /**
     * Check if the media is a document.
     */
    public function isDocument(): bool
    {
        return !$this->isImage() && !$this->isVideo() && !$this->isAudio();
    }

    /**
     * Get the media type category.
     */
    public function getTypeAttribute(): string
    {
        if ($this->isImage()) return 'image';
        if ($this->isVideo()) return 'video';
        if ($this->isAudio()) return 'audio';
        return 'document';
    }

    /**
     * Get thumbnail URL for the media.
     */
    public function getThumbnailUrl(int $width = 150, int $height = 150): string
    {
        if (!$this->isImage()) {
            return $this->getDefaultThumbnail();
        }

        // Check if thumbnail variant exists
        $variants = $this->variants ?? [];
        $thumbnailKey = "thumb_{$width}x{$height}";

        if (isset($variants[$thumbnailKey])) {
            return Storage::url($variants[$thumbnailKey]);
        }

        // Return original image if no thumbnail
        return $this->url;
    }

    /**
     * Get default thumbnail for non-image files.
     */
    private function getDefaultThumbnail(): string
    {
        $type = $this->type;
        return asset("images/file-types/{$type}.svg");
    }

    /**
     * Create image variants (thumbnails, different sizes).
     */
    public function createVariants(array $sizes = []): array
    {
        if (!$this->isImage()) {
            return [];
        }

        $defaultSizes = [
            'thumb' => [150, 150],
            'small' => [300, 300],
            'medium' => [600, 600],
            'large' => [1200, 1200],
        ];

        $sizes = array_merge($defaultSizes, $sizes);
        $variants = $this->variants ?? [];

        foreach ($sizes as $name => $dimensions) {
            [$width, $height] = $dimensions;
            $variantKey = "{$name}_{$width}x{$height}";

            if (!isset($variants[$variantKey])) {
                $variantPath = $this->generateVariant($width, $height, $name);
                if ($variantPath) {
                    $variants[$variantKey] = $variantPath;
                }
            }
        }

        $this->update(['variants' => $variants]);
        return $variants;
    }

    /**
     * Generate a single image variant.
     */
    private function generateVariant(int $width, int $height, string $name): ?string
    {
        try {
            // This would integrate with an image processing service
            // For now, return null to indicate no variant was created
            return null;
        } catch (\Exception $e) {
            \Log::error('Failed to create image variant', [
                'media_id' => $this->id,
                'width' => $width,
                'height' => $height,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Increment usage count.
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Add tags to the media.
     */
    public function addTags(array $tags): void
    {
        $currentTags = $this->tags ?? [];
        $newTags = array_unique(array_merge($currentTags, $tags));
        $this->update(['tags' => $newTags]);
    }

    /**
     * Remove tags from the media.
     */
    public function removeTags(array $tags): void
    {
        $currentTags = $this->tags ?? [];
        $newTags = array_diff($currentTags, $tags);
        $this->update(['tags' => array_values($newTags)]);
    }

    /**
     * Get media statistics.
     */
    public static function getStatistics(): array
    {
        return [
            'total_files' => static::count(),
            'total_size' => static::sum('file_size'),
            'images' => static::images()->count(),
            'videos' => static::videos()->count(),
            'documents' => static::documents()->count(),
            'public_files' => static::public()->count(),
            'recent_uploads' => static::where('created_at', '>=', now()->subDays(7))->count(),
        ];
    }

    /**
     * Search media by name, alt text, or tags.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('original_name', 'like', "%{$search}%")
              ->orWhere('alt_text', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhereJsonContains('tags', $search);
        });
    }

    /**
     * Delete media file and variants.
     */
    public function deleteFile(): bool
    {
        try {
            // Delete main file
            if (Storage::exists($this->file_path)) {
                Storage::delete($this->file_path);
            }

            // Delete variants
            if ($this->variants) {
                foreach ($this->variants as $variantPath) {
                    if (Storage::exists($variantPath)) {
                        Storage::delete($variantPath);
                    }
                }
            }

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to delete media file', [
                'media_id' => $this->id,
                'file_path' => $this->file_path,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($media) {
            $media->deleteFile();
        });
    }
}
