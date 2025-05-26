<?php

namespace App\Models\CMS;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class MediaFolder extends Model
{
    use HasFactory;

    protected $table = 'cms_media_folders';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'parent_id',
        'sort_order',
        'created_by',
    ];

    /**
     * Get the user who created this folder.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the parent folder.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MediaFolder::class, 'parent_id');
    }

    /**
     * Get child folders.
     */
    public function children(): HasMany
    {
        return $this->hasMany(MediaFolder::class, 'parent_id')->orderBy('sort_order');
    }

    /**
     * Get media files in this folder.
     */
    public function media(): HasMany
    {
        return $this->hasMany(Media::class, 'folder_id');
    }

    /**
     * Scope for root folders.
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Generate a unique slug for the folder.
     */
    public function generateSlug(): string
    {
        $slug = Str::slug($this->name);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)
            ->where('parent_id', $this->parent_id)
            ->where('id', '!=', $this->id)
            ->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Get the full path of the folder.
     */
    public function getPathAttribute(): string
    {
        $segments = [];
        $folder = $this;

        while ($folder) {
            array_unshift($segments, $folder->slug);
            $folder = $folder->parent;
        }

        return implode('/', $segments);
    }

    /**
     * Get folder statistics.
     */
    public function getStatistics(): array
    {
        $mediaCount = $this->media()->count();
        $subfolderCount = $this->children()->count();
        $totalSize = $this->media()->sum('file_size');

        // Include statistics from subfolders
        foreach ($this->children as $child) {
            $childStats = $child->getStatistics();
            $mediaCount += $childStats['media_count'];
            $totalSize += $childStats['total_size'];
        }

        return [
            'media_count' => $mediaCount,
            'subfolder_count' => $subfolderCount,
            'total_size' => $totalSize,
            'images' => $this->media()->images()->count(),
            'videos' => $this->media()->videos()->count(),
            'documents' => $this->media()->documents()->count(),
        ];
    }

    /**
     * Get breadcrumb trail for the folder.
     */
    public function getBreadcrumbs(): array
    {
        $breadcrumbs = [];
        $folder = $this;

        while ($folder) {
            array_unshift($breadcrumbs, [
                'name' => $folder->name,
                'id' => $folder->id,
                'slug' => $folder->slug,
            ]);
            $folder = $folder->parent;
        }

        return $breadcrumbs;
    }

    /**
     * Move folder to a new parent.
     */
    public function moveTo(?MediaFolder $newParent): bool
    {
        // Prevent moving to a child folder (circular reference)
        if ($newParent && $this->isAncestorOf($newParent)) {
            return false;
        }

        $this->update(['parent_id' => $newParent?->id]);
        return true;
    }

    /**
     * Check if this folder is an ancestor of another folder.
     */
    public function isAncestorOf(MediaFolder $folder): bool
    {
        $parent = $folder->parent;

        while ($parent) {
            if ($parent->id === $this->id) {
                return true;
            }
            $parent = $parent->parent;
        }

        return false;
    }

    /**
     * Delete folder and all its contents.
     */
    public function deleteWithContents(): bool
    {
        // Delete all media in this folder
        foreach ($this->media as $media) {
            $media->delete();
        }

        // Delete all subfolders
        foreach ($this->children as $child) {
            $child->deleteWithContents();
        }

        // Delete the folder itself
        return $this->delete();
    }
}
