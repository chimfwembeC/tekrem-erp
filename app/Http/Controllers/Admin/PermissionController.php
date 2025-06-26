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
    public function index(): Response
    {
        $permissions = Permission::with('roles')
            ->orderBy('name')
            ->get()
            ->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'description' => $permission->description ?? '',
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

        return Inertia::render('Admin/Permissions/Index', [
            'permissions' => $permissions,
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
}
