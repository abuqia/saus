<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class PermissionController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('permission:view_permissions')->only(['index', 'show']);
        $this->middleware('permission:create_permissions')->only(['create', 'store']);
        $this->middleware('permission:edit_permissions')->only(['edit', 'update']);
        $this->middleware('permission:delete_permissions')->only('destroy');
    }

    /**
     * Display a listing of permissions.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'module' => $request->string('module')->toString(),
        ];

        $query = QueryBuilder::for(Permission::class)
            ->allowedFilters([
                AllowedFilter::partial('name'),
                AllowedFilter::exact('group'),
            ])
            ->allowedSorts(['name', 'created_at'])
            ->withCount(['roles', 'users']);

        if (!empty($filters['module']) && $filters['module'] !== 'all') {
            $query->where('group', $filters['module']);
        }
        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        $permissions = $query->get();

        $modules = Permission::query()
            ->select('group')
            ->distinct()
            ->pluck('group')
            ->filter()
            ->values();

        $groupedPermissions = $permissions
            ->groupBy(fn($p) => $p->group ?? 'general')
            ->map(fn($items) => [
                'count' => $items->count(),
                'permissions' => $items->map(fn($perm) => [
                    'id' => $perm->id,
                    'name' => $perm->name,
                    'roles_count' => $perm->roles_count,
                    'users_count' => $perm->users_count,
                    'created_at' => $perm->created_at->toDateTimeString(),
                ])->values(),
            ])
            ->toArray();

        $statistics = [
            'total' => Permission::count(),
            'modules' => $modules->count(),
        ];

        return Inertia::render('admin/permissions/index', [
            'groupedPermissions' => $groupedPermissions,
            'filters' => [
                'search' => $filters['search'] ?? null,
                'module' => $filters['module'] ?? null,
            ],
            'modules' => $modules,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Show the form for creating a new permission.
     */
    public function create(): Response
    {
        $modules = Permission::query()
            ->select('group')
            ->distinct()
            ->pluck('group')
            ->filter()
            ->values();

        return Inertia::render('admin/permissions/create', [
            'modules' => $modules,
        ]);
    }

    /**
     * Store a newly created permission in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name'],
            'group' => ['nullable', 'string', 'max:255'],
        ]);

        $permission = Permission::create($validated);

        activity()
            ->causedBy(auth()->user())
            ->performedOn($permission)
            ->log('Permission created');

        return redirect()
            ->route('admin.permissions.index')
            ->with('success', 'Permission created successfully');
    }

    /**
     * Display the specified permission.
     */
    public function show(Permission $permission): Response
    {
        $permission->load(['roles', 'users']);

        return Inertia::render('admin/permissions/show', [
            'permission' => $permission,
        ]);
    }

    /**
     * Show the form for editing the specified permission.
     */
    public function edit(Permission $permission): Response
    {
        $modules = Permission::query()
            ->select('group')
            ->distinct()
            ->pluck('group')
            ->filter()
            ->values();

        return Inertia::render('admin/permissions/edit', [
            'permission' => $permission,
            'modules' => $modules,
        ]);
    }

    /**
     * Update the specified permission in storage.
     */
    public function update(Request $request, Permission $permission): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name,' . $permission->id],
            'group' => ['nullable', 'string', 'max:255'],
        ]);

        $permission->update($validated);

        activity()
            ->causedBy(auth()->user())
            ->performedOn($permission)
            ->log('Permission updated');

        return redirect()
            ->route('admin.permissions.index')
            ->with('success', 'Permission updated successfully');
    }

    /**
     * Remove the specified permission from storage.
     */
    public function destroy(Permission $permission): RedirectResponse
    {
        if ($permission->roles()->count() > 0 || $permission->users()->count() > 0) {
            return back()->with('error', 'Cannot delete permission that is assigned to roles or users');
        }

        $permission->delete();

        activity()
            ->causedBy(auth()->user())
            ->performedOn($permission)
            ->log('Permission deleted');

        return redirect()
            ->route('admin.permissions.index')
            ->with('success', 'Permission deleted successfully');
    }
}
