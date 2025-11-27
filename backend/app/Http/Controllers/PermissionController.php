<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;
use Illuminate\Support\Facades\Schema;

class PermissionController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('permission:permissions.view')->only(['index', 'show']);
        $this->middleware('permission:permissions.create')->only(['create', 'store']);
        $this->middleware('permission:permissions.edit')->only(['edit', 'update']);
        $this->middleware('permission:permissions.delete')->only('destroy');
    }

    /**
     * Display a listing of permissions.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'guard_name' => $request->string('guard_name')->toString(),
        ];

        $permissions = Permission::query()
            ->withCount(['roles'])
            ->get();

        $data = $permissions->map(fn($perm) => [
            'id' => $perm->id,
            'name' => $perm->name,
            'guard_name' => $perm->guard_name,
            'description' => $perm->description,
            'created_at' => optional($perm->created_at)->toDateTimeString(),
            'roles_count' => $perm->roles_count,
        ])->values();

        $stats = [
            'total' => $permissions->count(),
            'web' => $permissions->where('guard_name', 'web')->count(),
            'api' => $permissions->where('guard_name', 'api')->count(),
            'unused' => $permissions->filter(fn($p) => $p->roles_count === 0)->count(),
        ];

        return Inertia::render('permissions/index', [
            'permissions' => [
                'data' => $data,
                'meta' => [
                    'per_page' => 20,
                    'total' => $stats['total'],
                ],
            ],
            'filters' => [
                'search' => $filters['search'] ?? null,
                'guard_name' => $filters['guard_name'] ?? null,
                'sort_by' => 'name',
                'sort_direction' => 'asc',
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new permission.
     */
    public function create(): Response
    {
        $groupColumn = Schema::hasColumn('permissions', 'group')
            ? 'group'
            : (Schema::hasColumn('permissions', 'module') ? 'module' : null);

        if ($groupColumn) {
            $modules = Permission::query()
                ->select($groupColumn)
                ->distinct()
                ->pluck($groupColumn)
                ->filter()
                ->values();
        } else {
            $modules = Permission::query()
                ->pluck('name')
                ->map(fn($n) => explode('.', $n)[0])
                ->unique()
                ->filter()
                ->values();
        }

        return Inertia::render('permissions/create', [
            'modules' => $modules,
        ]);
    }

    /**
     * Store a newly created permission in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $groupColumn = Schema::hasColumn('permissions', 'group')
            ? 'group'
            : (Schema::hasColumn('permissions', 'module') ? 'module' : null);

        $rules = [
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name'],
            'description' => ['nullable', 'string'],
        ];
        if ($groupColumn) {
            $rules[$groupColumn] = ['nullable', 'string', 'max:255'];
        }

        $validated = $request->validate($rules);

        $data = ['name' => $validated['name']];
        if ($groupColumn && isset($validated[$groupColumn])) {
            $data[$groupColumn] = $validated[$groupColumn];
        }
        if (isset($validated['description'])) {
            $data['description'] = $validated['description'];
        }

        $permission = Permission::create($data);

        activity()
            ->causedBy(auth()->user())
            ->performedOn($permission)
            ->log('Permission created');

        return redirect()
            ->route('permissions.index')
            ->with('success', 'Permission created successfully');
    }

    /**
     * Display the specified permission.
     */
    public function show(Permission $permission): Response
    {
        $permission->load(['roles', 'users']);

        return Inertia::render('permissions/show', [
            'permission' => $permission,
        ]);
    }

    /**
     * Show the form for editing the specified permission.
     */
    public function edit(Permission $permission): Response
    {
        $groupColumn = Schema::hasColumn('permissions', 'group')
            ? 'group'
            : (Schema::hasColumn('permissions', 'module') ? 'module' : null);

        if ($groupColumn) {
            $modules = Permission::query()
                ->select($groupColumn)
                ->distinct()
                ->pluck($groupColumn)
                ->filter()
                ->values();
        } else {
            $modules = Permission::query()
                ->pluck('name')
                ->map(fn($n) => explode('.', $n)[0])
                ->unique()
                ->filter()
                ->values();
        }

        return Inertia::render('permissions/edit', [
            'permission' => $permission,
            'modules' => $modules,
        ]);
    }

    /**
     * Update the specified permission in storage.
     */
    public function update(Request $request, Permission $permission): RedirectResponse
    {
        $groupColumn = Schema::hasColumn('permissions', 'group')
            ? 'group'
            : (Schema::hasColumn('permissions', 'module') ? 'module' : null);

        $rules = [
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name,' . $permission->id],
            'description' => ['nullable', 'string'],
        ];
        if ($groupColumn) {
            $rules[$groupColumn] = ['nullable', 'string', 'max:255'];
        }

        $validated = $request->validate($rules);

        $data = ['name' => $validated['name']];
        if ($groupColumn && isset($validated[$groupColumn])) {
            $data[$groupColumn] = $validated[$groupColumn];
        }
        if (isset($validated['description'])) {
            $data['description'] = $validated['description'];
        }

        $permission->update($data);

        activity()
            ->causedBy(auth()->user())
            ->performedOn($permission)
            ->log('Permission updated');

        return redirect()
            ->route('permissions.index')
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
            ->route('permissions.index')
            ->with('success', 'Permission deleted successfully');
    }

    /**
     * Bulk destroy permissions.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:permissions,id'],
        ]);

        $ids = collect($validated['ids'])->unique()->values();

        $deletable = Permission::whereIn('id', $ids)
            ->whereDoesntHave('roles')
            ->whereDoesntHave('users')
            ->pluck('id');

        if ($deletable->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No permissions can be deleted (assigned to roles/users).',
            ], 422);
        }

        Permission::whereIn('id', $deletable)->delete();

        return response()->json([
            'success' => true,
            'message' => $deletable->count() . ' permissions deleted successfully.',
            'deleted_count' => $deletable->count(),
        ]);
    }

    /**
     * Sync permissions from canonical list.
     */
    public function sync(Request $request): RedirectResponse
    {
        $canonical = [
            // Users
            'users.view', 'users.create', 'users.edit', 'users.delete', 'users.impersonate',
            // Roles & Permissions
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
            'permissions.manage', 'permissions.view', 'permissions.create', 'permissions.edit', 'permissions.delete',
            // Tenants
            'tenants.view', 'tenants.create', 'tenants.edit', 'tenants.delete', 'tenants.settings',
            // Team
            'team.view', 'team.invite', 'team.remove', 'team.roles',
            // Links
            'links.view', 'links.create', 'links.edit', 'links.delete', 'links.reorder', 'links.analytics',
            // Pages
            'pages.view', 'pages.create', 'pages.edit', 'pages.delete', 'pages.publish',
            // Themes
            'themes.view', 'themes.apply', 'themes.customize', 'themes.create',
            // Media
            'media.view', 'media.upload', 'media.delete',
            // Analytics
            'analytics.view', 'analytics.export', 'analytics.advanced',
            // Settings
            'settings.view', 'settings.edit', 'settings.system',
            // Billing
            'billing.view', 'billing.manage', 'billing.invoices',
            // API & Integrations
            'api.access', 'api.manage', 'integrations.view', 'integrations.manage',
            // Activity Log
            'activity.view', 'activity.export',
        ];

        $created = 0; $updated = 0;

        foreach ($canonical as $name) {
            $desc = $this->describePermission($name);
            $perm = Permission::where('name', $name)->first();
            if (!$perm) {
                Permission::create([
                    'name' => $name,
                    'guard_name' => 'web',
                    'description' => $desc,
                ]);
                $created++;
            } else {
                if ($desc && $perm->description !== $desc) {
                    $perm->description = $desc;
                    $perm->save();
                    $updated++;
                }
            }
        }

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        return redirect()
            ->route('permissions.index')
            ->with('success', 'Permissions synced successfully');
    }

    private function describePermission(string $name): string
    {
        $parts = explode('.', $name);
        $model = ucfirst(str_replace('_', ' ', $parts[0] ?? 'General'));
        $action = ucfirst(str_replace('_', ' ', $parts[1] ?? 'Manage'));
        return $action . ' ' . $model;
    }
}
