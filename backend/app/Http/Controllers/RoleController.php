<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('can:roles.view')->only(['index', 'show', 'users', 'permissions']);
        $this->middleware('can:roles.create')->only(['create', 'store']);
        $this->middleware('can:roles.edit')->only(['edit', 'update', 'syncPermissions']);
        $this->middleware('can:roles.delete')->only(['destroy', 'bulkDestroy']);
    }

    /**
     * Display a listing of roles.
     */
    public function index(Request $request): Response
    {
        $query = Role::withCount(['users', 'permissions']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('label', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by guard
        if ($guard = $request->input('guard_name')) {
            $query->where('guard_name', $guard);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        $query->orderBy($sortBy, $sortDirection);

        // Pagination
        $perPage = $request->input('per_page', 15);
        $roles = $query->paginate($perPage)->withQueryString();

        // Transform roles data
        $roles->getCollection()->transform(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $role->label,
                'guard_name' => $role->guard_name,
                'description' => $role->description,
                'users_count' => $role->users_count,
                'permissions_count' => $role->permissions_count,
                'created_at' => $role->created_at?->toISOString(),
                'updated_at' => $role->updated_at?->toISOString(),
            ];
        });

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'guard_name' => $guard,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'stats' => [
                'total' => Role::count(),
                'total_users' => \App\Models\User::has('roles')->count(),
                'total_permissions' => Permission::count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        $guards = ['web', 'api'];

        return Inertia::render('roles/create', [
            'guards' => $guards,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $role = Role::create($validated);

        // Log the activity
        activity()
            ->causedBy(auth()->user())
            ->performedOn($role)
            ->withProperties([
                'name' => $role->name,
                'guard_name' => $role->guard_name,
            ])
            ->log('created_role');

        return redirect()->route('roles.show', $role)
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): Response
    {
        $role->loadCount(['users', 'permissions']);

        $moduleColumn = Schema::hasColumn('permissions', 'module')
            ? 'module'
            : (Schema::hasColumn('permissions', 'group') ? 'group' : null);

        $role->load([
            'permissions' => function ($query) use ($moduleColumn) {
                $columns = ['id', 'name'];
                if ($moduleColumn) {
                    $columns[] = $moduleColumn;
                }
                $query->select($columns)->limit(20);
            },
            'users' => function ($query) {
                $query->select('id', 'name', 'email', 'status')->limit(10);
            }
        ]);

        return Inertia::render('roles/show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'label' => $role->label,
                'description' => $role->description,
                'users_count' => $role->users_count,
                'permissions_count' => $role->permissions_count,
                'created_at' => $role->created_at?->toISOString(),
                'updated_at' => $role->updated_at?->toISOString(),
                'permissions' => $role->permissions->map(fn($permission) => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'module' => $moduleColumn ? ($permission->{$moduleColumn} ?? 'general') : 'general',
                ]),
                'users' => $role->users->map(fn($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                ]),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role): Response
    {
        $guards = ['web', 'api'];

        return Inertia::render('roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $role->label,
                'guard_name' => $role->guard_name,
                'description' => $role->description,
            ],
            'guards' => $guards,
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        // Prevent editing super_admin role
        if ($role->name === 'super_admin') {
            return redirect()->back()
                ->with('error', 'Cannot edit super_admin role.');
        }

        $validated = $request->validated();

        $role->update($validated);

        // Log the activity
        activity()
            ->causedBy(auth()->user())
            ->performedOn($role)
            ->withProperties([
                'old_name' => $role->getOriginal('name'),
                'new_name' => $validated['name'],
                'guard_name' => $validated['guard_name'],
            ])
            ->log('updated_role');

        return redirect()->route('roles.show', $role)
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        // Prevent deleting super_admin role and roles with users
        if ($role->name === 'super_admin') {
            return redirect()->route('roles.index')
                ->with('error', 'Cannot delete super_admin role.');
        }

        if ($role->users_count > 0) {
            return redirect()->route('roles.index')
                ->with('error', 'Cannot delete role with assigned users.');
        }

        $roleName = $role->name;
        $role->delete();

        // Log the activity
        activity()
            ->causedBy(auth()->user())
            ->withProperties([
                'role_name' => $roleName,
            ])
            ->log('deleted_role');

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }

    /**
     * Bulk delete roles.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['exists:roles,id'],
        ]);

        // Prevent deleting super_admin role and roles with users
        $roles = Role::whereIn('id', $validated['ids'])
            ->where('name', '!=', 'super_admin')
            ->withCount('users')
            ->get();

        $deletableRoles = $roles->filter(fn($role) => $role->users_count === 0);
        $protectedRoles = $roles->filter(fn($role) => $role->users_count > 0 || $role->name === 'super_admin');

        if ($deletableRoles->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No roles can be deleted. Some roles have users assigned or are system protected.',
            ], 422);
        }

        // Delete roles
        Role::whereIn('id', $deletableRoles->pluck('id'))->delete();

        // Log the activity
        activity()
            ->causedBy(auth()->user())
            ->withProperties([
                'deleted_roles' => $deletableRoles->pluck('name'),
                'protected_roles' => $protectedRoles->pluck('name'),
            ])
            ->log('bulk_deleted_roles');

        $message = "{$deletableRoles->count()} roles deleted successfully.";
        if ($protectedRoles->isNotEmpty()) {
            $message .= " {$protectedRoles->count()} roles were protected and could not be deleted.";
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'deleted_count' => $deletableRoles->count(),
            'protected_count' => $protectedRoles->count(),
        ]);
    }

    /**
     * Show role permissions management page.
     */
    public function permissions(Role $role): Response
    {
        $role->load('permissions');

        $moduleColumn = Schema::hasColumn('permissions', 'module')
            ? 'module'
            : (Schema::hasColumn('permissions', 'group') ? 'group' : null);

        $columns = ['id', 'name'];
        if ($moduleColumn) {
            $columns[] = $moduleColumn;
        }
        if (Schema::hasColumn('permissions', 'label')) {
            $columns[] = 'label';
        }
        if (Schema::hasColumn('permissions', 'description')) {
            $columns[] = 'description';
        }

        $allPermissions = Permission::select($columns)->get();

        $grouped = $allPermissions->groupBy(function ($permission) use ($moduleColumn) {
            return $moduleColumn ? ($permission->{$moduleColumn} ?: 'General') : 'General';
        });

        $permissions = $grouped->map(function ($permissions, $module) use ($role) {
            return [
                'module' => $module ?: 'General',
                'permissions' => $permissions->map(fn($permission) => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'label' => $permission->label ?? null,
                    'description' => $permission->description ?? null,
                    'assigned' => $role->permissions->contains('id', $permission->id),
                ]),
            ];
        })->values();

        $modules = $permissions->pluck('module');

        return Inertia::render('roles/permissions', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'label' => $role->label,
                'permissions_count' => $role->permissions_count,
            ],
            'permissions' => $permissions,
            'modules' => $modules,
        ]);
    }

    /**
     * Sync permissions to role.
     */
    public function syncPermissions(Request $request, Role $role): JsonResponse
    {
        // Prevent modifying super_admin permissions
        if ($role->name === 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot modify permissions for super_admin role.',
            ], 422);
        }

        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        try {
            $permissions = Permission::whereIn('id', $validated['permissions'])->get();

            // Get current permissions for logging
            $currentPermissions = $role->permissions;

            $role->syncPermissions($permissions);

            // Get added and removed permissions for logging
            $addedPermissions = $permissions->pluck('name')->diff($currentPermissions->pluck('name'));
            $removedPermissions = $currentPermissions->pluck('name')->diff($permissions->pluck('name'));

            // Log the activity
            activity()
                ->causedBy(auth()->user())
                ->performedOn($role)
                ->withProperties([
                    'permissions_count' => $permissions->count(),
                    'added_permissions' => $addedPermissions,
                    'removed_permissions' => $removedPermissions,
                ])
                ->log('synced_permissions');

            return response()->json([
                'success' => true,
                'message' => 'Permissions updated successfully.',
                'permissions_count' => $permissions->count(),
                'added_count' => $addedPermissions->count(),
                'removed_count' => $removedPermissions->count(),
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to sync permissions: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update permissions.',
            ], 500);
        }
    }

    /**
     * Show users assigned to role.
     */
    public function users(Role $role): Response
    {
        $users = $role->users()->paginate(20);

        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'type' => $user->type,
                'avatar_url' => $user->avatar_url,
                'created_at' => $user->created_at?->toISOString(),
            ];
        });

        return Inertia::render('roles/users', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $role->label,
                'users_count' => $role->users_count,
            ],
            'users' => $users,
        ]);
    }

    /**
     * Get role statistics for dashboard.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_roles' => Role::count(),
            'total_permissions' => Permission::count(),
            'roles_with_users' => Role::has('users')->count(),
            'recent_roles' => Role::orderBy('created_at', 'desc')->limit(5)->get(),
            'permissions_by_module' => Permission::select('module', DB::raw('count(*) as count'))
                ->groupBy('module')
                ->get()
                ->pluck('count', 'module'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
