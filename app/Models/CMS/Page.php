<?php

namespace App\Models\CMS;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Page extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'cms_pages';

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'content_blocks',
        'template',
        'layout',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_title',
        'og_description',
        'og_image',
        'canonical_url',
        'status',
        'published_at',
        'scheduled_at',
        'parent_id',
        'sort_order',
        'author_id',
        'editor_id',
        'approved_by',
        'approved_at',
        'language',
        'translation_group_id',
        'is_homepage',
        'show_in_menu',
        'require_auth',
        'permissions',
        'settings',
        'view_count',
        'last_viewed_at',
    ];

    protected $casts = [
        'content_blocks' => 'array',
        'meta_keywords' => 'array',
        'permissions' => 'array',
        'settings' => 'array',
        'published_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'approved_at' => 'datetime',
        'last_viewed_at' => 'datetime',
        'is_homepage' => 'boolean',
        'show_in_menu' => 'boolean',
        'require_auth' => 'boolean',
    ];

    /**
     * Get the author of the page.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Get the editor of the page.
     */
    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'editor_id');
    }

    /**
     * Get the user who approved the page.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the parent page.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'parent_id');
    }

    /**
     * Get the child pages.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Page::class, 'parent_id')->orderBy('sort_order');
    }

    /**
     * Get all revisions for this page.
     */
    public function revisions(): HasMany
    {
        return $this->hasMany(PageRevision::class)->orderBy('revision_number', 'desc');
    }

    /**
     * Get the current revision.
     */
    public function currentRevision(): HasMany
    {
        return $this->hasMany(PageRevision::class)->where('is_current', true);
    }

    /**
     * Get pages in the same translation group.
     */
    public function translations(): HasMany
    {
        return $this->hasMany(Page::class, 'translation_group_id', 'translation_group_id')
            ->where('id', '!=', $this->id);
    }

    /**
     * Scope for published pages.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('published_at')
                  ->orWhere('published_at', '<=', now());
            });
    }

    /**
     * Scope for draft pages.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope for scheduled pages.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled')
            ->where('scheduled_at', '>', now());
    }

    /**
     * Scope for pages by language.
     */
    public function scopeByLanguage($query, $language = 'en')
    {
        return $query->where('language', $language);
    }

    /**
     * Scope for root pages (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope for menu pages.
     */
    public function scopeInMenu($query)
    {
        return $query->where('show_in_menu', true);
    }

    /**
     * Generate a unique slug for the page.
     */
    public function generateSlug(): string
    {
        $slug = Str::slug($this->title);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->where('id', '!=', $this->id)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Create a new revision for this page.
     */
    public function createRevision(array $data, User $user, string $notes = null): PageRevision
    {
        // Mark all existing revisions as not current
        $this->revisions()->update(['is_current' => false]);

        // Get the next revision number
        $revisionNumber = $this->revisions()->max('revision_number') + 1;

        return $this->revisions()->create([
            'revision_number' => $revisionNumber,
            'title' => $data['title'] ?? $this->title,
            'excerpt' => $data['excerpt'] ?? $this->excerpt,
            'content' => $data['content'] ?? $this->content,
            'content_blocks' => $data['content_blocks'] ?? $this->content_blocks,
            'template' => $data['template'] ?? $this->template,
            'layout' => $data['layout'] ?? $this->layout,
            'meta_title' => $data['meta_title'] ?? $this->meta_title,
            'meta_description' => $data['meta_description'] ?? $this->meta_description,
            'meta_keywords' => $data['meta_keywords'] ?? $this->meta_keywords,
            'og_title' => $data['og_title'] ?? $this->og_title,
            'og_description' => $data['og_description'] ?? $this->og_description,
            'og_image' => $data['og_image'] ?? $this->og_image,
            'created_by' => $user->id,
            'revision_notes' => $notes,
            'is_current' => true,
            'is_published' => $this->status === 'published',
        ]);
    }

    /**
     * Restore from a specific revision.
     */
    public function restoreFromRevision(PageRevision $revision): bool
    {
        $this->update([
            'title' => $revision->title,
            'excerpt' => $revision->excerpt,
            'content' => $revision->content,
            'content_blocks' => $revision->content_blocks,
            'template' => $revision->template,
            'layout' => $revision->layout,
            'meta_title' => $revision->meta_title,
            'meta_description' => $revision->meta_description,
            'meta_keywords' => $revision->meta_keywords,
            'og_title' => $revision->og_title,
            'og_description' => $revision->og_description,
            'og_image' => $revision->og_image,
        ]);

        // Mark this revision as current
        $this->revisions()->update(['is_current' => false]);
        $revision->update(['is_current' => true]);

        return true;
    }

    /**
     * Publish the page.
     */
    public function publish(User $user = null): bool
    {
        $this->update([
            'status' => 'published',
            'published_at' => now(),
            'approved_by' => $user?->id,
            'approved_at' => $user ? now() : null,
        ]);

        // Mark current revision as published
        $this->revisions()->where('is_current', true)->update(['is_published' => true]);

        return true;
    }

    /**
     * Schedule the page for publishing.
     */
    public function schedule(\DateTime $scheduledAt): bool
    {
        $this->update([
            'status' => 'scheduled',
            'scheduled_at' => $scheduledAt,
        ]);

        return true;
    }

    /**
     * Unpublish the page.
     */
    public function unpublish(): bool
    {
        $this->update([
            'status' => 'draft',
            'published_at' => null,
        ]);

        return true;
    }

    /**
     * Archive the page.
     */
    public function archive(): bool
    {
        $this->update(['status' => 'archived']);
        return true;
    }

    /**
     * Increment view count.
     */
    public function incrementViews(): void
    {
        $this->increment('view_count');
        $this->update(['last_viewed_at' => now()]);
    }

    /**
     * Get the full URL for the page.
     */
    public function getUrlAttribute(): string
    {
        if ($this->is_homepage) {
            return url('/');
        }

        $segments = [];
        $page = $this;

        while ($page) {
            array_unshift($segments, $page->slug);
            $page = $page->parent;
        }

        return url('/' . implode('/', $segments));
    }

    /**
     * Get the breadcrumb trail for the page.
     */
    public function getBreadcrumbs(): array
    {
        $breadcrumbs = [];
        $page = $this;

        while ($page) {
            array_unshift($breadcrumbs, [
                'title' => $page->title,
                'url' => $page->url,
                'id' => $page->id,
            ]);
            $page = $page->parent;
        }

        return $breadcrumbs;
    }

    /**
     * Check if user can view this page.
     */
    public function canView(User $user = null): bool
    {
        if (!$this->require_auth) {
            return true;
        }

        if (!$user) {
            return false;
        }

        if (empty($this->permissions)) {
            return true;
        }

        $userRoles = $user->roles->pluck('name')->toArray();
        $allowedRoles = $this->permissions['roles'] ?? [];

        return !empty(array_intersect($userRoles, $allowedRoles));
    }

    /**
     * Check if user can edit this page.
     */
    public function canEdit(User $user): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('editor')) {
            return true;
        }

        if ($this->author_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Get SEO meta tags as array.
     */
    public function getSeoMetaTags(): array
    {
        return [
            'title' => $this->meta_title ?: $this->title,
            'description' => $this->meta_description ?: $this->excerpt,
            'keywords' => $this->meta_keywords ? implode(', ', $this->meta_keywords) : null,
            'og:title' => $this->og_title ?: $this->meta_title ?: $this->title,
            'og:description' => $this->og_description ?: $this->meta_description ?: $this->excerpt,
            'og:image' => $this->og_image,
            'og:url' => $this->url,
            'canonical' => $this->canonical_url ?: $this->url,
        ];
    }
}
