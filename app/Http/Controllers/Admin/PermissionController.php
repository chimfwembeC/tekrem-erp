<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Validator;

class PermissionController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware(['auth', 'verified', 'permission:view permissions'])->only(['index', 'show']);
    //     $this->middleware(['auth', 'verified', 'permission:create permissions'])->only(['create', 'store']);
    //     $this->middleware(['auth', 'verified', 'permission:edit permissions'])->only(['edit', 'update']);
    //     $this->middleware(['auth', 'verified', 'permission:delete permissions'])->only(['destroy']);
    // }

    /**
     * Display a listing of permissions.
     */
    public function index(Request $request): Response
    {
        $query = Permission::with('roles');

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply module filter
        if ($request->filled('module') && $request->get('module') !== 'all') {
            $module = $request->get('module');
            $query->where('name', 'like', "{$module}.%");
        }

        // Apply role filter
        if ($request->filled('role') && $request->get('role') !== 'all') {
            $role = $request->get('role');
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            });
        }

        $permissions = $query->orderBy('name')
            ->get()
            ->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'description' => $permission->description ?? '',
                    'module' => $this->extractModuleFromPermission($permission->name),
                    'action' => $this->extractActionFromPermission($permission->name),
                    'roles' => $permission->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                            'description' => $role->description ?? '',
                        ];
                    }),
                    'created_at' => $permission->created_at,
                    'updated_at' => $permission->updated_at,
                ];
            });

        // Get all roles for filters
        $allRoles = Role::orderBy('name')->get(['id', 'name']);

        // Get modules from permissions
        $modules = Permission::select('name')
            ->get()
            ->map(function ($permission) {
                return $this->extractModuleFromPermission($permission->name);
            })
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('Admin/Permissions/Index', [
            'permissions' => $permissions,
            'roles' => $allRoles,
            'modules' => $modules,
            'filters' => $request->only(['search', 'module', 'role']),
        ]);
    }

    /**
     * Show the form for creating a new permission.
     */
    public function create(): Response
    {
        $roles = Role::orderBy('name')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description ?? '',
            ];
        });

        return Inertia::render('Admin/Permissions/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created permission.
     */
    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:permissions,name',
            'description' => 'nullable|string|max:500',
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $permission = Permission::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        if ($request->has('roles')) {
            $roles = Role::whereIn('name', $request->roles)->get();
            foreach ($roles as $role) {
                $role->givePermissionTo($permission);
            }
        }

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permission created successfully.');
    }

    /**
     * Display the specified permission.
     */
    public function show(Permission $permission): Response
    {
        $permission->load('roles');

        return Inertia::render('Admin/Permissions/Show', [
            'permission' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'description' => $permission->description ?? '',
                'roles' => $permission->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'description' => $role->description ?? '',
                        'users_count' => $role->users()->count(),
                    ];
                }),
                'created_at' => $permission->created_at,
                'updated_at' => $permission->updated_at,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified permission.
     */
    public function edit(Permission $permission): Response
    {
        $roles = Role::orderBy('name')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description ?? '',
            ];
        });

        $permission->load('roles');

        return Inertia::render('Admin/Permissions/Edit', [
            'permission' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'description' => $permission->description ?? '',
                'roles' => $permission->roles->pluck('name')->toArray(),
            ],
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified permission.
     */
    public function update(Request $request, Permission $permission): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
            'description' => 'nullable|string|max:500',
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $permission->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        // Sync roles
        if ($request->has('roles')) {
            $roles = Role::whereIn('name', $request->roles)->get();
            $permission->syncRoles($roles);
        } else {
            $permission->syncRoles([]);
        }

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permission updated successfully.');
    }

    /**
     * Remove the specified permission.
     */
    public function destroy(Permission $permission): RedirectResponse
    {
        // Check if this is a system permission that shouldn't be deleted
        $systemPermissions = [
            'view users', 'create users', 'edit users', 'delete users',
            'view roles', 'create roles', 'edit roles', 'delete roles',
            'view permissions', 'create permissions', 'edit permissions', 'delete permissions',
            'access customer portal',
        ];

        if (in_array($permission->name, $systemPermissions)) {
            return redirect()->back()
                ->with('error', 'Cannot delete system permissions.');
        }

        $permission->delete();

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permission deleted successfully.');
    }

    /**
     * Bulk assign permissions to roles.
     */
    public function bulkAssignRoles(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id',
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
            'action' => 'required|in:assign,remove',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $permissions = Permission::whereIn('id', $request->permission_ids)->get();
        $roles = Role::whereIn('id', $request->role_ids)->get();

        foreach ($permissions as $permission) {
            if ($request->action === 'assign') {
                $permission->assignRole($roles);
            } else {
                $permission->removeRole($roles);
            }
        }

        $action = $request->action === 'assign' ? 'assigned to' : 'removed from';
        $message = count($request->permission_ids) . ' permission(s) ' . $action . ' ' . count($request->role_ids) . ' role(s) successfully.';

        return redirect()->route('admin.permissions.index')
            ->with('success', $message);
    }

    /**
     * Bulk delete permissions.
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Prevent deletion of critical admin permissions
        $permissions = Permission::whereIn('id', $request->permission_ids)->get();
        $criticalPermissions = $permissions->filter(function ($permission) {
            return str_contains($permission->name, 'admin.') ||
                   str_contains($permission->name, 'settings.manage') ||
                   in_array($permission->name, ['view users', 'manage roles', 'manage permissions']);
        });

        if ($criticalPermissions->count() > 0) {
            return redirect()->back()
                ->withErrors(['permission_ids' => 'Cannot delete critical system permissions.']);
        }

        Permission::whereIn('id', $request->permission_ids)->delete();

        return redirect()->route('admin.permissions.index')
            ->with('success', count($request->permission_ids) . ' permission(s) deleted successfully.');
    }

    /**
     * Generate permissions for a module.
     */
    public function generateModulePermissions(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'module' => 'required|string|max:50',
            'actions' => 'required|array',
            'actions.*' => 'string|in:view,create,edit,delete,manage,export,import',
            'assign_to_roles' => 'array',
            'assign_to_roles.*' => 'exists:roles,name',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $module = strtolower($request->module);
        $createdPermissions = [];

        foreach ($request->actions as $action) {
            $permissionName = "{$module}.{$action}";

            // Check if permission already exists
            if (Permission::where('name', $permissionName)->exists()) {
                continue;
            }

            $permission = Permission::create([
                'name' => $permissionName,
                'description' => "Allow {$action} access to {$module} module",
            ]);

            $createdPermissions[] = $permission;
        }

        // Assign to roles if specified
        if ($request->has('assign_to_roles') && count($createdPermissions) > 0) {
            $roles = Role::whereIn('name', $request->assign_to_roles)->get();
            foreach ($createdPermissions as $permission) {
                $permission->assignRole($roles);
            }
        }

        $message = count($createdPermissions) . ' permission(s) created for ' . $module . ' module.';

        return redirect()->route('admin.permissions.index')
            ->with('success', $message);
    }

    /**
     * Extract module name from permission name
     */
    private function extractModuleFromPermission(string $permissionName): string
    {
        // Handle both dot notation (module.action) and space notation (action module)
        if (strpos($permissionName, '.') !== false) {
            // Dot notation: crm.view -> crm
            return explode('.', $permissionName)[0];
        } else {
            // Space notation: view crm -> crm, create clients -> clients
            $parts = explode(' ', $permissionName);
            if (count($parts) >= 2) {
                // Get the last part as the module (e.g., "view crm" -> "crm")
                $lastPart = end($parts);

                // Map common permission patterns to modules
                $moduleMap = [
                    'users' => 'admin',
                    'roles' => 'admin',
                    'permissions' => 'admin',
                    'clients' => 'crm',
                    'leads' => 'crm',
                    'communications' => 'crm',
                    'livechat' => 'crm',
                    'invoices' => 'finance',
                    'payments' => 'finance',
                    'quotations' => 'finance',
                    'transactions' => 'finance',
                    'expenses' => 'finance',
                    'budgets' => 'finance',
                    'reports' => 'finance',
                    'employees' => 'hr',
                    'departments' => 'hr',
                    'leave' => 'hr',
                    'performance' => 'hr',
                    'attendance' => 'hr',
                    'training' => 'hr',
                    'projects' => 'projects',
                    'milestones' => 'projects',
                    'tasks' => 'projects',
                    'tickets' => 'support',
                    'knowledge' => 'support',
                    'faq' => 'support',
                    'pages' => 'cms',
                    'posts' => 'cms',
                    'categories' => 'cms',
                    'tags' => 'cms',
                    'media' => 'cms',
                    'menus' => 'cms',
                    'models' => 'ai',
                    'prompts' => 'ai',
                    'services' => 'ai',
                    'notifications' => 'system',
                    'settings' => 'system',
                    'portal' => 'customer',
                ];

                return $moduleMap[$lastPart] ?? $lastPart;
            }
            return 'system';
        }
    }

    /**
     * Extract action from permission name
     */
    private function extractActionFromPermission(string $permissionName): string
    {
        // Handle both dot notation (module.action) and space notation (action module)
        if (strpos($permissionName, '.') !== false) {
            // Dot notation: crm.view -> view
            $parts = explode('.', $permissionName);
            return $parts[1] ?? '';
        } else {
            // Space notation: view crm -> view, create clients -> create
            $parts = explode(' ', $permissionName);
            return $parts[0] ?? '';
        }
    }
}
