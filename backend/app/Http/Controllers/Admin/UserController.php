<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request): Response
    {
        $this->authorize('users.view');

        $users = User::query()
            ->with('roles')
            ->withCount('ownedTenants')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->status && $request->status !== 'all', function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->type && $request->type !== 'all', function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($request->plan && $request->plan !== 'all', function ($query, $plan) {
                $query->where('plan', $plan);
            })
            ->latest()
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        $stats = [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'verified' => User::whereNotNull('email_verified_at')->count(),
            'super_admins' => User::where('type', 'super_admin')->count(),
        ];

        return Inertia::render('admin/users/index', [
            'users' => $users->through(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'type' => $user->type,
                'status' => $user->status,
                'plan' => $user->plan,
                'email_verified_at' => $user->email_verified_at?->format('M d, Y'),
                'created_at' => $user->created_at?->format('M d, Y'),
                'tenants_count' => $user->owned_tenants_count,
                'roles' => $user->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                ]),
            ]),
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'type', 'plan', 'per_page']),
            'can' => [
                'create' => $request->user()->can('users.create'),
                'edit' => $request->user()->can('users.edit'),
                'delete' => $request->user()->can('users.delete'),
                'impersonate' => $request->user()->can('users.impersonate'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new user
     */
    public function create(): Response
    {
        $this->authorize('users.create');

        $roles = Role::all()->map(fn($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'label' => ucwords(str_replace('_', ' ', $role->name)),
        ]);

        return Inertia::render('admin/users/create', [
            'roles' => $roles,
            'plans' => ['free', 'starter', 'pro', 'enterprise'],
            'types' => ['user', 'admin', 'super_admin'],
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(StoreUserRequest $request)
    {
        $this->authorize('users.create');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'type' => 'required|in:user,admin,super_admin',
            'status' => 'required|in:active,inactive,suspended,banned',
            'plan' => 'required|in:free,starter,pro,enterprise',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
            'email_verified' => 'boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'type' => $validated['type'],
            'status' => $validated['status'],
            'plan' => $validated['plan'],
            'email_verified_at' => $request->email_verified ? now() : null,
        ]);

        if (!empty($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $this->authorize('users.view');

        $user->load(['roles', 'ownedTenants', 'tenants']);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'statistics' => [
                'owned_tenants' => $user->ownedTenants()->count(),
                'member_tenants' => $user->tenants()->count(),
                'total_views' => $user->ownedTenants()->sum('total_views'),
                'total_clicks' => $user->ownedTenants()->sum('total_clicks'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified user
     */
    public function edit(User $user): Response
    {
        $this->authorize('users.edit');

        // Prevent editing super admin by non-super admin
        if ($user->isSuperAdmin() && !auth()->user()->isSuperAdmin()) {
            abort(403, 'You cannot edit a super admin user.');
        }

        $user->load('roles');

        $roles = Role::all()->map(fn($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'label' => ucwords(str_replace('_', ' ', $role->name)),
        ]);

        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'type' => $user->type,
                'status' => $user->status,
                'plan' => $user->plan,
                'phone' => $user->phone,
                'bio' => $user->bio,
                'timezone' => $user->timezone,
                'language' => $user->language,
                'email_verified_at' => $user->email_verified_at,
                'roles' => $user->roles->pluck('id')->toArray(),
            ],
            'roles' => $roles,
            'plans' => ['free', 'starter', 'pro', 'enterprise'],
            'types' => ['user', 'admin', 'super_admin'],
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('users.edit');

        // Prevent editing super admin by non-super admin
        if ($user->isSuperAdmin() && !auth()->user()->isSuperAdmin()) {
            abort(403, 'You cannot edit a super admin user.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'type' => 'required|in:user,admin,super_admin',
            'status' => 'required|in:active,inactive,suspended,banned',
            'plan' => 'required|in:free,starter,pro,enterprise',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:500',
            'timezone' => 'nullable|string|max:50',
            'language' => 'nullable|string|max:5',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'type' => $validated['type'],
            'status' => $validated['status'],
            'plan' => $validated['plan'],
            'phone' => $validated['phone'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'timezone' => $validated['timezone'] ?? 'UTC',
            'language' => $validated['language'] ?? 'en',
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        $this->authorize('users.delete');

        // Prevent deleting super admin
        if ($user->isSuperAdmin()) {
            abort(403, 'Cannot delete super admin user.');
        }

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete yourself.');
        }

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
    /**
     * Restore the specified soft deleted user.
     */
    public function restore(int $id)
    {
        $this->authorize('users.delete');

        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return redirect()->route('admin.users.index')
            ->with('success', 'User restored successfully.');
    }

    /**
     * Force delete the specified user.
     */
    public function forceDelete(int $id)
    {
        $this->authorize('users.delete');

        $user = User::withTrashed()->findOrFail($id);

        // Delete avatar
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->forceDelete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User permanently deleted.');
    }

    /**
     * Bulk delete users
     */
    public function bulkDestroy(Request $request)
    {
        $this->authorize('users.delete');

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id',
        ]);

        $users = User::whereIn('id', $request->ids)
            ->where('type', '!=', 'super_admin')
            ->where('id', '!=', auth()->id())
            ->get();

        $deleted = $users->count();

        foreach ($users as $user) {
            $user->delete();
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', "{$deleted} user(s) deleted successfully.");
    }

    /**
     * Verify user email
     */
    public function verifyEmail(User $user)
    {
        $this->authorize('users.edit');

        $user->update([
            'email_verified_at' => now(),
        ]);

        return back()->with('success', 'User email verified successfully.');
    }

    /**
     * Change user status
     */
    public function changeStatus(Request $request, User $user)
    {
        $this->authorize('users.edit');

        $request->validate([
            'status' => 'required|in:active,inactive,suspended,banned',
        ]);

        $user->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'User status changed successfully.');
    }

    /**
     * Impersonate user
     */
    public function impersonate(User $user)
    {
        $this->authorize('users.impersonate');

        if ($user->isSuperAdmin()) {
            abort(403, 'Cannot impersonate super admin user.');
        }

        session()->put('impersonating', $user->id);
        session()->put('impersonator', auth()->id());

        return redirect()->route('dashboard');
    }

    /**
     * Stop impersonating
     */
    public function stopImpersonating()
    {
        $impersonatingUserId = session('impersonating');

        if ($impersonatingUserId) {
            $impersonatingUser = User::findOrFail($impersonatingUserId);
            auth()->login($impersonatingUser);
            session()->forget('impersonating');
            session()->forget('impersonator');

            return redirect()->route('admin.users.index')
                ->with('success', 'Stopped impersonating user.');
        }

        return redirect()->route('dashboard');
    }
}
