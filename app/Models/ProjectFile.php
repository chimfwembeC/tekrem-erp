<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class ProjectFile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'milestone_id',
        'name',
        'original_name',
        'file_path',
        'file_url',
        'mime_type',
        'file_size',
        'category',
        'description',
        'version',
        'is_latest_version',
        'uploaded_by',
        'access_level',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'file_size' => 'integer',
        'version' => 'integer',
        'is_latest_version' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Get the project that owns the file.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the milestone that owns the file.
     */
    public function milestone(): BelongsTo
    {
        return $this->belongsTo(ProjectMilestone::class, 'milestone_id');
    }

    /**
     * Get the user who uploaded the file.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get all versions of this file.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(static::class, 'name', 'name')
                    ->where('project_id', $this->project_id)
                    ->orderBy('version', 'desc');
    }

    /**
     * Get the file icon based on mime type.
     */
    protected function fileIcon(): Attribute
    {
        return Attribute::make(
            get: function () {
                $mimeType = $this->mime_type;
                
                if (str_starts_with($mimeType, 'image/')) {
                    return 'image';
                }
                
                if (str_starts_with($mimeType, 'video/')) {
                    return 'video';
                }
                
                if (str_starts_with($mimeType, 'audio/')) {
                    return 'audio';
                }
                
                return match ($mimeType) {
                    'application/pdf' => 'file-text',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'file-text',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'file-spreadsheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'presentation',
                    'application/zip',
                    'application/x-rar-compressed',
                    'application/x-7z-compressed' => 'archive',
                    default => 'file',
                };
            }
        );
    }

    /**
     * Get the formatted file size.
     */
    protected function fileSizeFormatted(): Attribute
    {
        return Attribute::make(
            get: function () {
                $bytes = $this->file_size;
                $units = ['B', 'KB', 'MB', 'GB', 'TB'];
                
                for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
                    $bytes /= 1024;
                }
                
                return round($bytes, 2) . ' ' . $units[$i];
            }
        );
    }

    /**
     * Check if the current user can access this file.
     */
    protected function canAccess(): Attribute
    {
        return Attribute::make(
            get: function () {
                $user = auth()->user();
                
                if (!$user) {
                    return false;
                }
                
                // File uploader can always access
                if ($this->uploaded_by === $user->id) {
                    return true;
                }
                
                // Project manager can always access
                if ($this->project->manager_id === $user->id) {
                    return true;
                }
                
                return match ($this->access_level) {
                    'public' => true,
                    'team' => in_array($user->id, $this->project->team_members ?? []),
                    'managers' => $user->hasRole(['admin', 'manager']),
                    'private' => false,
                    default => false,
                };
            }
        );
    }

    /**
     * Get the full file URL.
     */
    protected function fullUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->file_url ?: Storage::url($this->file_path)
        );
    }

    /**
     * Create a new version of this file.
     */
    public function createNewVersion(array $fileData): static
    {
        // Mark current version as not latest
        $this->update(['is_latest_version' => false]);
        
        // Create new version
        return static::create([
            'project_id' => $this->project_id,
            'milestone_id' => $this->milestone_id,
            'name' => $this->name,
            'original_name' => $fileData['original_name'],
            'file_path' => $fileData['file_path'],
            'file_url' => $fileData['file_url'] ?? null,
            'mime_type' => $fileData['mime_type'],
            'file_size' => $fileData['file_size'],
            'category' => $this->category,
            'description' => $fileData['description'] ?? $this->description,
            'version' => $this->version + 1,
            'is_latest_version' => true,
            'uploaded_by' => auth()->id(),
            'access_level' => $this->access_level,
            'metadata' => $fileData['metadata'] ?? [],
        ]);
    }

    /**
     * Delete the file from storage.
     */
    public function deleteFile(): bool
    {
        if ($this->file_path && Storage::exists($this->file_path)) {
            return Storage::delete($this->file_path);
        }
        
        return true;
    }

    /**
     * Scope a query to only include files of a specific category.
     */
    public function scopeOfCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope a query to only include latest versions.
     */
    public function scopeLatestVersions($query)
    {
        return $query->where('is_latest_version', true);
    }

    /**
     * Scope a query to only include files accessible by the current user.
     */
    public function scopeAccessible($query)
    {
        $user = auth()->user();
        
        if (!$user) {
            return $query->where('access_level', 'public');
        }
        
        return $query->where(function ($q) use ($user) {
            $q->where('access_level', 'public')
              ->orWhere('uploaded_by', $user->id)
              ->orWhere(function ($subQ) use ($user) {
                  $subQ->where('access_level', 'team')
                       ->whereHas('project', function ($projectQ) use ($user) {
                           $projectQ->where('manager_id', $user->id)
                                   ->orWhereJsonContains('team_members', $user->id);
                       });
              })
              ->orWhere(function ($subQ) use ($user) {
                  $subQ->where('access_level', 'managers')
                       ->whereHas('uploader', function ($userQ) {
                           $userQ->whereHas('roles', function ($roleQ) {
                               $roleQ->whereIn('name', ['admin', 'manager']);
                           });
                       });
              });
        });
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();
        
        static::deleting(function ($file) {
            $file->deleteFile();
        });
    }
}
