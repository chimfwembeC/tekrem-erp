<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\CMS\Menu;
use App\Models\CMS\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MenuItemController extends Controller
{
    /**
     * Store a newly created menu item.
     */
    public function store(Request $request, Menu $menu): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:255'],
            'page_id' => ['nullable', 'exists:cms_pages,id'],
            'parent_id' => ['nullable', 'exists:cms_menu_items,id'],
            'target' => ['nullable', 'in:_self,_blank,_parent,_top'],
            'icon' => ['nullable', 'string', 'max:100'],
            'css_class' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'require_auth' => ['boolean'],
            'permissions' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        // Validate that either URL or page_id is provided
        if (empty($validated['url']) && empty($validated['page_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Either URL or page must be specified.',
                'errors' => [
                    'url' => ['Either URL or page must be specified.'],
                    'page_id' => ['Either URL or page must be specified.'],
                ],
            ], 422);
        }

        // Validate parent belongs to same menu
        if (!empty($validated['parent_id'])) {
            $parent = MenuItem::find($validated['parent_id']);
            if (!$parent || $parent->menu_id !== $menu->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid parent menu item.',
                    'errors' => [
                        'parent_id' => ['Invalid parent menu item.'],
                    ],
                ], 422);
            }
        }

        // Set default sort order
        if (!isset($validated['sort_order'])) {
            $maxOrder = $menu->items()
                ->where('parent_id', $validated['parent_id'] ?? null)
                ->max('sort_order') ?? 0;
            $validated['sort_order'] = $maxOrder + 1;
        }

        $validated['menu_id'] = $menu->id;
        $validated['created_by'] = Auth::id();

        $menuItem = MenuItem::create($validated);
        $menuItem->load(['page', 'children']);

        return response()->json([
            'success' => true,
            'message' => 'Menu item created successfully.',
            'item' => $menuItem,
        ]);
    }

    /**
     * Update the specified menu item.
     */
    public function update(Request $request, Menu $menu, MenuItem $item): JsonResponse
    {
        // Ensure item belongs to menu
        if ($item->menu_id !== $menu->id) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:255'],
            'page_id' => ['nullable', 'exists:cms_pages,id'],
            'parent_id' => ['nullable', 'exists:cms_menu_items,id'],
            'target' => ['nullable', 'in:_self,_blank,_parent,_top'],
            'icon' => ['nullable', 'string', 'max:100'],
            'css_class' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'require_auth' => ['boolean'],
            'permissions' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        // Validate that either URL or page_id is provided
        if (empty($validated['url']) && empty($validated['page_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Either URL or page must be specified.',
                'errors' => [
                    'url' => ['Either URL or page must be specified.'],
                    'page_id' => ['Either URL or page must be specified.'],
                ],
            ], 422);
        }

        // Validate parent belongs to same menu and prevent circular reference
        if (!empty($validated['parent_id'])) {
            $parent = MenuItem::find($validated['parent_id']);
            if (!$parent || $parent->menu_id !== $menu->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid parent menu item.',
                    'errors' => [
                        'parent_id' => ['Invalid parent menu item.'],
                    ],
                ], 422);
            }

            // Check for circular reference
            if ($this->wouldCreateCircularReference($item, $validated['parent_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot set parent - would create circular reference.',
                    'errors' => [
                        'parent_id' => ['Cannot set parent - would create circular reference.'],
                    ],
                ], 422);
            }
        }

        $item->update($validated);
        $item->load(['page', 'children']);

        return response()->json([
            'success' => true,
            'message' => 'Menu item updated successfully.',
            'item' => $item,
        ]);
    }

    /**
     * Remove the specified menu item.
     */
    public function destroy(Menu $menu, MenuItem $item): JsonResponse
    {
        // Ensure item belongs to menu
        if ($item->menu_id !== $menu->id) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found.',
            ], 404);
        }

        // Move children to parent or root level
        $item->children()->update(['parent_id' => $item->parent_id]);

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu item deleted successfully.',
        ]);
    }

    /**
     * Move menu item to different position.
     */
    public function move(Request $request, MenuItem $item): JsonResponse
    {
        $validated = $request->validate([
            'parent_id' => ['nullable', 'exists:cms_menu_items,id'],
            'sort_order' => ['required', 'integer', 'min:0'],
        ]);

        // Validate parent belongs to same menu
        if (!empty($validated['parent_id'])) {
            $parent = MenuItem::find($validated['parent_id']);
            if (!$parent || $parent->menu_id !== $item->menu_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid parent menu item.',
                ], 422);
            }

            // Check for circular reference
            if ($this->wouldCreateCircularReference($item, $validated['parent_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot move item - would create circular reference.',
                ], 422);
            }
        }

        DB::transaction(function () use ($item, $validated) {
            $oldParentId = $item->parent_id;
            $newParentId = $validated['parent_id'] ?? null;
            $newSortOrder = $validated['sort_order'];

            // If moving to different parent, adjust sort orders
            if ($oldParentId !== $newParentId) {
                // Decrease sort order of items after the moved item in old parent
                MenuItem::where('menu_id', $item->menu_id)
                    ->where('parent_id', $oldParentId)
                    ->where('sort_order', '>', $item->sort_order)
                    ->decrement('sort_order');

                // Increase sort order of items at or after new position in new parent
                MenuItem::where('menu_id', $item->menu_id)
                    ->where('parent_id', $newParentId)
                    ->where('sort_order', '>=', $newSortOrder)
                    ->increment('sort_order');
            } else {
                // Moving within same parent
                if ($newSortOrder > $item->sort_order) {
                    // Moving down - decrease sort order of items between old and new position
                    MenuItem::where('menu_id', $item->menu_id)
                        ->where('parent_id', $oldParentId)
                        ->where('sort_order', '>', $item->sort_order)
                        ->where('sort_order', '<=', $newSortOrder)
                        ->decrement('sort_order');
                } else {
                    // Moving up - increase sort order of items between new and old position
                    MenuItem::where('menu_id', $item->menu_id)
                        ->where('parent_id', $oldParentId)
                        ->where('sort_order', '>=', $newSortOrder)
                        ->where('sort_order', '<', $item->sort_order)
                        ->increment('sort_order');
                }
            }

            // Update the moved item
            $item->update([
                'parent_id' => $newParentId,
                'sort_order' => $newSortOrder,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Menu item moved successfully.',
        ]);
    }

    /**
     * Reorder menu items.
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:cms_menu_items,id'],
            'items.*.parent_id' => ['nullable', 'exists:cms_menu_items,id'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['items'] as $itemData) {
                $item = MenuItem::find($itemData['id']);
                
                // Validate parent belongs to same menu
                if (!empty($itemData['parent_id'])) {
                    $parent = MenuItem::find($itemData['parent_id']);
                    if (!$parent || $parent->menu_id !== $item->menu_id) {
                        continue; // Skip invalid items
                    }

                    // Check for circular reference
                    if ($this->wouldCreateCircularReference($item, $itemData['parent_id'])) {
                        continue; // Skip items that would create circular reference
                    }
                }

                $item->update([
                    'parent_id' => $itemData['parent_id'] ?? null,
                    'sort_order' => $itemData['sort_order'],
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Menu items reordered successfully.',
        ]);
    }

    /**
     * Check if setting parent would create circular reference.
     */
    private function wouldCreateCircularReference(MenuItem $item, int $parentId): bool
    {
        $currentId = $parentId;
        $visited = [];
        $maxDepth = 10; // Prevent infinite loops

        while ($currentId && count($visited) < $maxDepth) {
            if ($currentId === $item->id) {
                return true; // Circular reference detected
            }

            if (in_array($currentId, $visited)) {
                break; // Already visited this item
            }

            $visited[] = $currentId;
            $parent = MenuItem::find($currentId);
            $currentId = $parent ? $parent->parent_id : null;
        }

        return false;
    }

    /**
     * Bulk actions on menu items.
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:activate,deactivate,delete'],
            'item_ids' => ['required', 'array'],
            'item_ids.*' => ['exists:cms_menu_items,id'],
        ]);

        $processed = 0;

        switch ($validated['action']) {
            case 'activate':
                MenuItem::whereIn('id', $validated['item_ids'])
                    ->update(['is_active' => true]);
                $processed = count($validated['item_ids']);
                break;

            case 'deactivate':
                MenuItem::whereIn('id', $validated['item_ids'])
                    ->update(['is_active' => false]);
                $processed = count($validated['item_ids']);
                break;

            case 'delete':
                // Move children to parent level before deleting
                foreach ($validated['item_ids'] as $itemId) {
                    $item = MenuItem::find($itemId);
                    if ($item) {
                        $item->children()->update(['parent_id' => $item->parent_id]);
                    }
                }
                
                $processed = MenuItem::whereIn('id', $validated['item_ids'])->count();
                MenuItem::whereIn('id', $validated['item_ids'])->delete();
                break;
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully processed {$processed} menu items.",
            'processed' => $processed,
        ]);
    }
}
