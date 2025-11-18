<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of roles
     */
    public function index(Request $request): Response
    {
        $this->authorize('roles.view');

        $roles = Role::query()
            ->with('permissions')
            ->withCount('users')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'filters' => $request->only(['search', 'per_page']),
            'can' => [
                'create' => $request->user()->can('roles.create'),
                'edit' => $request->user()->can('roles.edit'),
                'delete' => $request->user()->can('roles.delete'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new role
     */
    public function create(): Response
    {
        $this->authorize('roles.create');

        $permissions = Permission::all()->groupBy(function ($permission) {
            return explode('.', $permission->name)[0];
        })->map(function ($group) {
            return $group->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'label' => ucwords(str_replace(['.', '_'], ' ', $permission->name)),
                ];
            });
        });

        return Inertia::render('admin/roles/create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role
     */
    public function store(StoreRoleRequest $request)
    {
        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'web',
        ]);

        if ($request->permissions) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()
            ->route('admin.roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role
     */
    public function show(Role $role): Response
    {
        $this->authorize('roles.view');

        $role->load('permissions', 'users');

        return Inertia::render('admin/roles/show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'users_count' => $role->users()->count(),
                'permissions' => $role->permissions->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'label' => ucwords(str_replace(['.', '_'], ' ', $p->name)),
                ]),
                'created_at' => $role->created_at?->format('M d, Y'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified role
     */
    public function edit(Role $role): Response
    {
        $this->authorize('roles.edit');

        // Prevent editing system roles
        if (in_array($role->name, ['super_admin', 'admin'])) {
            abort(403, 'Cannot edit system roles.');
        }

        $role->load('permissions');

        $permissions = Permission::all()->groupBy(function ($permission) {
            return explode('.', $permission->name)[0];
        })->map(function ($group) {
            return $group->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'label' => ucwords(str_replace(['.', '_'], ' ', $permission->name)),
                ];
            });
        });

        return Inertia::render('admin/roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ],
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update the specified role
     */
    public function update(UpdateRoleRequest $request, Role $role)
    {
        // Prevent editing system roles
        if (in_array($role->name, ['super_admin', 'admin'])) {
            abort(403, 'Cannot edit system roles.');
        }

        $role->update([
            'name' => $request->name,
        ]);

        $role->syncPermissions($request->permissions ?? []);

        return redirect()
            ->route('admin.roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role
     */
    public function destroy(Role $role)
    {
        $this->authorize('roles.delete');

        // Prevent deleting system roles
        if (in_array($role->name, ['super_admin', 'admin', 'user'])) {
            abort(403, 'Cannot delete system roles.');
        }

        // Check if role has users
        if ($role->users()->count() > 0) {
            return back()->with('error', 'Cannot delete role that has users assigned.');
        }

        $role->delete();

        return redirect()
            ->route('admin.roles.index')
            ->with('success', 'Role deleted successfully.');
    }

    /**
     * Bulk delete roles
     */
    public function bulkDestroy(Request $request)
    {
        $this->authorize('roles.delete');

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:roles,id',
        ]);

        $systemRoles = ['super_admin', 'admin', 'user'];

        $roles = Role::whereIn('id', $request->ids)
            ->whereNotIn('name', $systemRoles)
            ->get();

        $deleted = 0;
        $errors = [];

        foreach ($roles as $role) {
            if ($role->users()->count() > 0) {
                $errors[] = "Role '{$role->name}' has users assigned.";
                continue;
            }

            $role->delete();
            $deleted++;
        }

        $message = $deleted > 0
            ? "{$deleted} role(s) deleted successfully."
            : "No roles were deleted.";

        if (!empty($errors)) {
            $message .= ' ' . implode(' ', $errors);
        }

        return redirect()
            ->route('admin.roles.index')
            ->with($deleted > 0 ? 'success' : 'error', $message);
    }
}
