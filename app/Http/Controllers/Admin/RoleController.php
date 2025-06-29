<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Role;
use App\Models\Permission;
// use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware(['auth', 'verified', 'permission:view roles'])->only(['index', 'show']);
    //     $this->middleware(['auth', 'verified', 'permission:create roles'])->only(['create', 'store']);
    //     $this->middleware(['auth', 'verified', 'permission:edit roles'])->only(['edit', 'update']);
    //     $this->middleware(['auth', 'verified', 'permission:delete roles'])->only(['destroy']);
    //     $this->middleware(['auth', 'verified', 'permission:assign permissions'])->only(['updatePermissions']);
    // }

    /**
     * Display a listing of roles.
     */
    public function index(Request $request): Response
    {
        $query = Role::with('permissions')
            ->withCount('users');

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $roles = $query->orderBy('name')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description ?? '',
                    'users_count' => $role->users_count,
                    'permissions_count' => $role->permissions->count(),
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'is_system_role' => in_array($role->name, ['admin', 'manager', 'staff', 'customer']),
                    'created_at' => $role->created_at,
                    'updated_at' => $role->updated_at,
                ];
            });

        // Get all permissions grouped by module for matrix view
        $allPermissions = Permission::orderBy('name')->get();
        $permissionMatrix = [];

        foreach ($allPermissions as $permission) {
            $module = explode('.', $permission->name)[0] ?? 'system';
            if (!isset($permissionMatrix[$module])) {
                $permissionMatrix[$module] = [];
            }
            $permissionMatrix[$module][] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'description' => $permission->description ?? '',
            ];
        }

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'permissionMatrix' => $permissionMatrix,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        $permissions = Permission::orderBy('name')->get()->map(function ($permission) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'description' => $permission->description ?? '',
            ];
        });

        return Inertia::render('Admin/Roles/Create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
            'description' => 'nullable|string|max:500',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $role = Role::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        if ($request->has('permissions')) {
            $role->givePermissionTo($request->permissions);
        }

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): Response
    {
        $role->load('permissions', 'users');

        return Inertia::render('Admin/Roles/Show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description ?? '',
                'permissions' => $role->permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'description' => $permission->description ?? '',
                    ];
                }),
                'users' => $role->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ];
                }),
                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role): Response
    {
        $permissions = Permission::orderBy('name')->get()->map(function ($permission) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'description' => $permission->description ?? '',
            ];
        });

        $role->load('permissions');

        return Inertia::render('Admin/Roles/Edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description ?? '',
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ],
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'description' => 'nullable|string|max:500',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $role->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        // Sync permissions
        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        } else {
            $role->syncPermissions([]);
        }

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        // Prevent deletion of system roles
        if (in_array($role->name, ['admin', 'manager', 'staff', 'customer'])) {
            return redirect()->back()
                ->with('error', 'Cannot delete system roles.');
        }

        $role->delete();

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role deleted successfully.');
    }

    /**
     * Show permission matrix view.
     */
    public function permissionMatrix(): Response
    {
        $roles = Role::with('permissions')->orderBy('name')->get();
        $permissions = Permission::orderBy('name')->get();

        // Group permissions by module
        $groupedPermissions = [];
        foreach ($permissions as $permission) {
            $module = explode('.', $permission->name)[0] ?? 'system';
            if (!isset($groupedPermissions[$module])) {
                $groupedPermissions[$module] = [];
            }
            $groupedPermissions[$module][] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'description' => $permission->description ?? '',
            ];
        }

        // Create matrix data
        $matrix = [];
        foreach ($roles as $role) {
            $rolePermissions = $role->permissions->pluck('name')->toArray();
            $matrix[$role->id] = [
                'role' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description ?? '',
                    'is_system_role' => in_array($role->name, ['admin', 'manager', 'staff', 'customer']),
                ],
                'permissions' => $rolePermissions,
            ];
        }

        return Inertia::render('Admin/Roles/PermissionMatrix', [
            'matrix' => $matrix,
            'groupedPermissions' => $groupedPermissions,
        ]);
    }

    /**
     * Update permission matrix.
     */
    public function updatePermissionMatrix(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'role_id' => 'required|exists:roles,id',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $role = Role::findOrFail($request->role_id);

        // Prevent modification of admin role permissions by non-admin users
        if ($role->name === 'admin' && !auth()->user()->hasRole('admin')) {
            return redirect()->back()
                ->withErrors(['role_id' => 'You cannot modify admin role permissions.']);
        }

        $role->syncPermissions($request->permissions ?? []);

        return redirect()->back()
            ->with('success', 'Permissions updated successfully for ' . $role->name . ' role.');
    }

    /**
     * Show user assignment interface.
     */
    public function userAssignment(): Response
    {
        $roles = Role::withCount('users')->orderBy('name')->get();
        $users = \App\Models\User::with('roles')->orderBy('name')->get();

        $userRoleMatrix = [];
        foreach ($users as $user) {
            $userRoles = $user->roles->pluck('name')->toArray();
            $userRoleMatrix[] = [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                ],
                'roles' => $userRoles,
            ];
        }

        return Inertia::render('Admin/Roles/UserAssignment', [
            'roles' => $roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description ?? '',
                    'users_count' => $role->users_count,
                    'is_system_role' => in_array($role->name, ['admin', 'manager', 'staff', 'customer']),
                ];
            }),
            'userRoleMatrix' => $userRoleMatrix,
        ]);
    }

    /**
     * Bulk assign users to roles.
     */
    public function bulkAssignUsers(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
            'action' => 'required|in:assign,remove',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $users = \App\Models\User::whereIn('id', $request->user_ids)->get();
        $roles = Role::whereIn('id', $request->role_ids)->get();

        foreach ($users as $user) {
            if ($request->action === 'assign') {
                $user->assignRole($roles);
            } else {
                $user->removeRole($roles);
            }
        }

        $action = $request->action === 'assign' ? 'assigned to' : 'removed from';
        $message = count($request->user_ids) . ' user(s) ' . $action . ' ' . count($request->role_ids) . ' role(s) successfully.';

        return redirect()->back()
            ->with('success', $message);
    }

    /**
     * Get role history for a user.
     */
    public function userRoleHistory(Request $request, $userId): Response
    {
        $user = \App\Models\User::with('roles')->findOrFail($userId);

        // For now, return current roles. In a full implementation,
        // you'd have an audit table to track role changes over time
        $roleHistory = [
            [
                'action' => 'current',
                'roles' => $user->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'description' => $role->description ?? '',
                    ];
                }),
                'changed_at' => $user->updated_at,
                'changed_by' => 'System',
            ]
        ];

        return Inertia::render('Admin/Roles/UserRoleHistory', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'roleHistory' => $roleHistory,
        ]);
    }
}
