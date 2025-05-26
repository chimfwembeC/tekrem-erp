<?php

namespace App\Models\CMS;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Menu extends Model
{
    use HasFactory;

    protected $table = 'cms_menus';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'location',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who created this menu.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get menu items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class)->whereNull('parent_id')->orderBy('sort_order');
    }

    /**
     * Get all menu items (including nested).
     */
    public function allItems(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    /**
     * Scope for active menus.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope by location.
     */
    public function scopeByLocation($query, $location)
    {
        return $query->where('location', $location);
    }

    /**
     * Generate a unique slug for the menu.
     */
    public function generateSlug(): string
    {
        $slug = Str::slug($this->name);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->where('id', '!=', $this->id)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Get menu structure as nested array.
     */
    public function getStructure(User $user = null): array
    {
        return $this->items()
            ->with(['children' => function ($query) {
                $query->orderBy('sort_order');
            }])
            ->get()
            ->map(function ($item) use ($user) {
                return $item->toArray($user);
            })
            ->toArray();
    }

    /**
     * Get available menu locations.
     */
    public static function getLocations(): array
    {
        return [
            'header' => 'Header Navigation',
            'footer' => 'Footer Navigation',
            'sidebar' => 'Sidebar Navigation',
            'mobile' => 'Mobile Navigation',
            'breadcrumb' => 'Breadcrumb Navigation',
        ];
    }
}

class MenuItem extends Model
{
    use HasFactory;

    protected $table = 'cms_menu_items';

    protected $fillable = [
        'menu_id',
        'title',
        'url',
        'page_id',
        'target',
        'icon',
        'attributes',
        'parent_id',
        'sort_order',
        'permissions',
        'require_auth',
        'is_active',
    ];

    protected $casts = [
        'attributes' => 'array',
        'permissions' => 'array',
        'require_auth' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the menu this item belongs to.
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Get the page this item links to.
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Get the parent menu item.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    /**
     * Get child menu items.
     */
    public function children(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('sort_order');
    }

    /**
     * Scope for active items.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for root items.
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get the URL for this menu item.
     */
    public function getUrlAttribute($value): string
    {
        if ($value) {
            return $value;
        }

        if ($this->page) {
            return $this->page->url;
        }

        return '#';
    }

    /**
     * Check if user can view this menu item.
     */
    public function canView(User $user = null): bool
    {
        if (!$this->is_active) {
            return false;
        }

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
     * Convert to array with children.
     */
    public function toArray(User $user = null): array
    {
        if (!$this->canView($user)) {
            return [];
        }

        $data = [
            'id' => $this->id,
            'title' => $this->title,
            'url' => $this->url,
            'target' => $this->target,
            'icon' => $this->icon,
            'attributes' => $this->attributes,
            'children' => [],
        ];

        foreach ($this->children as $child) {
            $childArray = $child->toArray($user);
            if (!empty($childArray)) {
                $data['children'][] = $childArray;
            }
        }

        return $data;
    }

    /**
     * Check if this item is currently active.
     */
    public function isActive(string $currentUrl): bool
    {
        if ($this->url === $currentUrl) {
            return true;
        }

        // Check if any child is active
        foreach ($this->children as $child) {
            if ($child->isActive($currentUrl)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Move item to a new parent.
     */
    public function moveTo(?MenuItem $newParent): bool
    {
        // Prevent moving to a child item (circular reference)
        if ($newParent && $this->isAncestorOf($newParent)) {
            return false;
        }

        $this->update(['parent_id' => $newParent?->id]);
        return true;
    }

    /**
     * Check if this item is an ancestor of another item.
     */
    public function isAncestorOf(MenuItem $item): bool
    {
        $parent = $item->parent;

        while ($parent) {
            if ($parent->id === $this->id) {
                return true;
            }
            $parent = $parent->parent;
        }

        return false;
    }
}
