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
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $this->authorize('users.view');

        $query = User::query()->with('roles');

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by plan
        if ($request->has('plan') && $request->plan !== 'all') {
            $query->where('plan', $request->plan);
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate($request->input('per_page', 15))
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'type', 'status', 'plan', 'sort_by', 'sort_direction']),
            'statistics' => [
                'total' => User::count(),
                'active' => User::where('status', 'active')->count(),
                'super_admins' => User::where('type', 'super_admin')->count(),
                'admins' => User::where('type', 'admin')->count(),
                'users' => User::where('type', 'user')->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $this->authorize('users.create');

        return Inertia::render('Admin/Users/Create', [
            'roles' => Role::all(['id', 'name']),
            'types' => ['super_admin', 'admin', 'user'],
            'statuses' => ['active', 'inactive', 'suspended', 'banned'],
            'plans' => ['free', 'starter', 'pro', 'enterprise'],
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        // Hash password
        $validated['password'] = Hash::make($validated['password']);

        // Create user
        $user = User::create($validated);

        // Assign roles
        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        return redirect()->route('admin.users.index')
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
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $this->authorize('users.edit');

        $user->load('roles');

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'roles' => Role::all(['id', 'name']),
            'types' => ['super_admin', 'admin', 'user'],
            'statuses' => ['active', 'inactive', 'suspended', 'banned'],
            'plans' => ['free', 'starter', 'pro', 'enterprise'],
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        // Hash password if provided
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        // Update user
        $user->update($validated);

        // Sync roles
        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $this->authorize('users.delete');

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        // Prevent deleting super admin
        if ($user->isSuperAdmin() && !auth()->user()->isSuperAdmin()) {
            return back()->with('error', 'You cannot delete a super admin.');
        }

        // Delete avatar
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Delete user
        $user->delete();

        return redirect()->route('admin.users.index')
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
     * Impersonate user
     */
    public function impersonate(User $user)
    {
        $this->authorize('users.impersonate');

        // Store original user ID
        session(['impersonate_from' => auth()->id()]);

        // Login as target user
        auth()->login($user);

        return redirect()->route('dashboard')
            ->with('success', "You are now impersonating {$user->name}");
    }

    /**
     * Stop impersonating
     */
    public function stopImpersonating()
    {
        $originalUserId = session('impersonate_from');

        if ($originalUserId) {
            $originalUser = User::findOrFail($originalUserId);
            auth()->login($originalUser);
            session()->forget('impersonate_from');

            return redirect()->route('admin.users.index')
                ->with('success', 'Stopped impersonating user.');
        }

        return redirect()->route('dashboard');
    }
}
