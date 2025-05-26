<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\CMS\Menu;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    /**
     * Display a listing of menus.
     */
    public function index(Request $request): Response
    {
        $query = Menu::with(['items' => function ($q) {
            $q->orderBy('sort_order');
        }])
        ->when($request->search, function ($q, $search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        })
        ->when($request->location, function ($q, $location) {
            $q->where('location', $location);
        });

        $menus = $query->orderBy('created_at', 'desc')->paginate(15);

        $locations = Menu::getLocations();

        return Inertia::render('CMS/Menus/Index', [
            'menus' => $menus,
            'locations' => $locations,
            'filters' => $request->only(['search', 'location']),
        ]);
    }

    /**
     * Show the form for creating a new menu.
     */
    public function create(): Response
    {
        $locations = Menu::getLocations();

        return Inertia::render('CMS/Menus/Create', [
            'locations' => $locations,
        ]);
    }

    /**
     * Store a newly created menu.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:cms_menus,slug'],
            'description' => ['nullable', 'string'],
            'location' => ['required', 'string'],
            'is_active' => ['boolean'],
            'settings' => ['nullable', 'array'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = \Str::slug($validated['name']);
        }

        $validated['created_by'] = Auth::id();

        $menu = Menu::create($validated);

        return redirect()->route('cms.menus.show', $menu)
            ->with('success', 'Menu created successfully.');
    }

    /**
     * Display the specified menu.
     */
    public function show(Menu $menu): Response
    {
        $menu->load(['items.page', 'items.children', 'createdBy']);

        return Inertia::render('CMS/Menus/Show', [
            'menu' => $menu,
        ]);
    }

    /**
     * Show the form for editing the specified menu.
     */
    public function edit(Menu $menu): Response
    {
        $menu->load(['items' => function ($q) {
            $q->with(['page', 'children'])->orderBy('sort_order');
        }]);

        $locations = Menu::getLocations();
        $pages = \App\Models\CMS\Page::published()
            ->select('id', 'title', 'slug')
            ->orderBy('title')
            ->get();

        return Inertia::render('CMS/Menus/Edit', [
            'menu' => $menu,
            'locations' => $locations,
            'pages' => $pages,
        ]);
    }

    /**
     * Update the specified menu.
     */
    public function update(Request $request, Menu $menu): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:cms_menus,slug,' . $menu->id],
            'description' => ['nullable', 'string'],
            'location' => ['required', 'string'],
            'is_active' => ['boolean'],
            'settings' => ['nullable', 'array'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = \Str::slug($validated['name']);
        }

        $menu->update($validated);

        return redirect()->route('cms.menus.show', $menu)
            ->with('success', 'Menu updated successfully.');
    }

    /**
     * Remove the specified menu.
     */
    public function destroy(Menu $menu): RedirectResponse
    {
        $menu->delete();

        return redirect()->route('cms.menus.index')
            ->with('success', 'Menu deleted successfully.');
    }

    /**
     * Get menu structure for API.
     */
    public function structure(Menu $menu): JsonResponse
    {
        $items = $menu->items()
            ->with(['page', 'children' => function ($q) {
                $q->orderBy('sort_order');
            }])
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        $structure = $this->buildMenuStructure($items);

        return response()->json([
            'menu' => $menu,
            'structure' => $structure,
        ]);
    }

    /**
     * Build hierarchical menu structure.
     */
    private function buildMenuStructure($items): array
    {
        return $items->map(function ($item) {
            return [
                'id' => $item->id,
                'title' => $item->title,
                'url' => $item->getUrl(),
                'target' => $item->target,
                'icon' => $item->icon,
                'css_class' => $item->css_class,
                'is_active' => $item->is_active,
                'children' => $item->children->isNotEmpty() 
                    ? $this->buildMenuStructure($item->children) 
                    : [],
            ];
        })->toArray();
    }

    /**
     * Duplicate menu.
     */
    public function duplicate(Request $request, Menu $menu): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $newMenu = $menu->duplicate($validated['name'] ?? null);

        return redirect()->route('cms.menus.edit', $newMenu)
            ->with('success', 'Menu duplicated successfully.');
    }

    /**
     * Export menu.
     */
    public function export(Menu $menu): JsonResponse
    {
        $exportData = $menu->export();

        return response()->json($exportData)
            ->header('Content-Disposition', 'attachment; filename="menu-' . $menu->slug . '.json"');
    }

    /**
     * Import menu.
     */
    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'menu_file' => ['required', 'file', 'mimes:json'],
        ]);

        try {
            $content = file_get_contents($validated['menu_file']->getPathname());
            $menuData = json_decode($content, true);

            if (!$menuData || !isset($menuData['name'], $menuData['items'])) {
                throw new \Exception('Invalid menu file format.');
            }

            $menu = Menu::import($menuData, Auth::id());

            return redirect()->route('cms.menus.show', $menu)
                ->with('success', 'Menu imported successfully.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to import menu: ' . $e->getMessage());
        }
    }

    /**
     * Bulk actions on menus.
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:activate,deactivate,delete'],
            'menu_ids' => ['required', 'array'],
            'menu_ids.*' => ['exists:cms_menus,id'],
        ]);

        $processed = 0;

        switch ($validated['action']) {
            case 'activate':
                Menu::whereIn('id', $validated['menu_ids'])
                    ->update(['is_active' => true]);
                $processed = count($validated['menu_ids']);
                break;

            case 'deactivate':
                Menu::whereIn('id', $validated['menu_ids'])
                    ->update(['is_active' => false]);
                $processed = count($validated['menu_ids']);
                break;

            case 'delete':
                $processed = Menu::whereIn('id', $validated['menu_ids'])->count();
                Menu::whereIn('id', $validated['menu_ids'])->delete();
                break;
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully processed {$processed} menus.",
            'processed' => $processed,
        ]);
    }

    /**
     * Get menu for frontend rendering.
     */
    public function render(string $location): JsonResponse
    {
        $menu = Menu::active()
            ->where('location', $location)
            ->with(['items' => function ($q) {
                $q->active()
                  ->with(['page', 'children' => function ($subQ) {
                      $subQ->active()->orderBy('sort_order');
                  }])
                  ->whereNull('parent_id')
                  ->orderBy('sort_order');
            }])
            ->first();

        if (!$menu) {
            return response()->json([
                'menu' => null,
                'items' => [],
            ]);
        }

        $structure = $this->buildMenuStructure($menu->items);

        return response()->json([
            'menu' => [
                'id' => $menu->id,
                'name' => $menu->name,
                'location' => $menu->location,
                'settings' => $menu->settings,
            ],
            'items' => $structure,
        ]);
    }
}
