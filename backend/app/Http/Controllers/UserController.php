<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Mail\UserNotificationMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('can:users.view')->only(['index', 'show']);
        $this->middleware('can:users.create')->only(['create', 'store']);
        $this->middleware('can:users.edit')->only(['edit', 'update', 'updateStatus', 'verifyEmail']);
        $this->middleware('can:users.delete')->only(['destroy', 'bulkDestroy']);
    }

    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $query = User::query()
            ->with(['roles', 'ownedTenants'])
            ->withCount('ownedTenants');

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by type
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // Filter by plan
        if ($plan = $request->input('plan')) {
            $query->where('plan', $plan);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Pagination
        $perPage = $request->input('per_page', 15);
        $users = $query->paginate($perPage)->withQueryString();

        // Transform users data
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'type' => $user->type,
                'status' => $user->status,
                'plan' => $user->plan,
                'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i:s'),
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'roles' => $user->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                ]),
                'tenants_count' => $user->owned_tenants_count,
            ];
        });

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'type' => $type,
                'plan' => $plan,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'stats' => [
                'total' => User::count(),
                'active' => User::where('status', 'active')->count(),
                'admins' => User::whereIn('type', ['super_admin', 'admin'])->count(),
                'verified' => User::whereNotNull('email_verified_at')->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $roles = Role::all()->map(fn($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'display_name' => ucwords(str_replace('_', ' ', $role->name)),
        ]);

        return Inertia::render('users/create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'type' => ['required', 'in:super_admin,admin,user'],
            'status' => ['required', 'in:active,inactive,suspended,banned'],
            'plan' => ['required', 'in:free,starter,pro,enterprise'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['exists:roles,id'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'type' => $validated['type'],
            'status' => $validated['status'],
            'plan' => $validated['plan'],
        ]);

        if (!$user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }

        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $user->load(['roles.permissions', 'ownedTenants', 'tenants']);

        return Inertia::render('users/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'phone' => $user->phone,
                'bio' => $user->bio,
                'type' => $user->type,
                'status' => $user->status,
                'plan' => $user->plan,
                'plan_expires_at' => $user->plan_expires_at?->format('Y-m-d H:i:s'),
                'trial_ends_at' => $user->trial_ends_at?->format('Y-m-d H:i:s'),
                'timezone' => $user->timezone,
                'language' => $user->language,
                'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i:s'),
                'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                'last_login_ip' => $user->last_login_ip,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'roles' => $user->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'permissions' => $role->permissions->pluck('name'),
                ]),
                'owned_tenants' => $user->ownedTenants->map(fn($tenant) => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'status' => $tenant->status,
                ]),
                'member_tenants' => $user->tenants->map(fn($tenant) => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'role' => $tenant->pivot->role,
                ]),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $roles = Role::all()->map(fn($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'display_name' => ucwords(str_replace('_', ' ', $role->name)),
        ]);

        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'bio' => $user->bio,
                'type' => $user->type,
                'status' => $user->status,
                'plan' => $user->plan,
                'timezone' => $user->timezone,
                'language' => $user->language,
                'roles' => $user->roles->pluck('id')->toArray(),
            ],
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'type' => ['required', 'in:super_admin,admin,user'],
            'status' => ['required', 'in:active,inactive,suspended,banned'],
            'plan' => ['required', 'in:free,starter,pro,enterprise'],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:500'],
            'timezone' => ['nullable', 'string'],
            'language' => ['nullable', 'string'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['exists:roles,id'],
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

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Update user status.
     */
    public function updateStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:active,inactive,suspended,banned'],
        ]);

        $user->update(['status' => $validated['status']]);

        return redirect()->back();
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Prevent deleting super admin
        if ($user->type === 'super_admin') {
            return redirect()->route('users.index')
                ->with('error', 'Cannot delete super admin users.');
        }

        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return redirect()->route('users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Bulk delete users.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['exists:users,id'],
        ]);

        $users = User::whereIn('id', $validated['ids'])
            ->where('type', '!=', 'super_admin')
            ->where('id', '!=', auth()->id())
            ->get();

        if ($users->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No users can be deleted.',
            ], 422);
        }

        User::whereIn('id', $users->pluck('id'))->delete();

        return response()->json([
            'success' => true,
            'message' => count($users) . ' users deleted successfully.',
            'deleted_count' => count($users),
        ]);
    }

    /**
    * Send email to user
    */
    public function email(User $user): Response
    {
        return Inertia::render('users/email', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
    * Reset user password
    */
    public function resetPassword(User $user): Response
    {
        return Inertia::render('users/reset-password', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
    * Process password reset
    */
    public function processResetPassword(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'notify_user' => ['sometimes', 'boolean'],
        ]);

        try {
            // Update user password
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);

            // Optional: Invalidate existing sessions
            // DB::table('sessions')->where('user_id', $user->id)->delete();

            // Send notification email if requested
            if ($validated['notify_user'] ?? false) {
                // You can implement email notification here
                \Log::info('Password reset notification should be sent to: ' . $user->email);

                // Example using Laravel Notification:
                // $user->notify(new PasswordResetNotification($validated['password']));
            }

            // Log the password reset activity
            activity()
                ->causedBy(auth()->user())
                ->performedOn($user)
                ->withProperties([
                    'notified_user' => $validated['notify_user'] ?? false,
                ])
                ->log('reset_password');

            return redirect()->route('users.show', $user)
                ->with('success', 'Password reset successfully.');

        } catch (\Exception $e) {
            \Log::error('Failed to reset password: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Failed to reset password: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function verifyEmail(User $user): RedirectResponse
    {
        if ($user->hasVerifiedEmail()) {
            return redirect()->back()->with('info', 'User email is already verified.');
        }

        $user->sendEmailVerificationNotification();

        return redirect()->back()->with('success', 'Verification email sent successfully.');
    }

    /**
    * Send email to user using Mailable
    */
    public function sendEmail(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:10'],
            'cc' => ['nullable', 'array'],
            'cc.*' => ['email'],
            'bcc' => ['nullable', 'array'],
            'bcc.*' => ['email'],
        ]);

        try {
            // Create and send email
            $mail = new UserNotificationMail(
                $validated['subject'],
                $validated['message'],
                $user->name
            );

            // Send to primary recipient
            Mail::to($user->email)->send($mail);

            // Send to CC recipients if any
            if (!empty($validated['cc'])) {
                Mail::to($validated['cc'])->send($mail);
            }

            // Send to BCC recipients if any
            if (!empty($validated['bcc'])) {
                Mail::to($validated['bcc'])->send($mail);
            }

            // Log the email activity
            activity()
                ->causedBy(auth()->user())
                ->performedOn($user)
                ->withProperties([
                    'subject' => $validated['subject'],
                    'cc' => $validated['cc'] ?? [],
                    'bcc' => $validated['bcc'] ?? [],
                    'message_preview' => substr($validated['message'], 0, 100) . '...',
                ])
                ->log('sent_email');

            return redirect()->route('users.show', $user)
                ->with('success', 'Email sent successfully to ' . $user->email);

        } catch (\Exception $e) {
            \Log::error('Failed to send email: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Failed to send email: ' . $e->getMessage())
                ->withInput();
        }
    }
}
