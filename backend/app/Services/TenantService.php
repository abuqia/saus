<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TenantService
{
    /**
     * Create a new tenant
     */
    public function createTenant(User $user, array $data): Tenant
    {
        return DB::transaction(function () use ($user, $data) {
            // Create tenant
            $tenant = $user->ownedTenants()->create([
                'name' => $data['name'],
                'slug' => $data['slug'] ?? Str::slug($data['name']),
                'description' => $data['description'] ?? null,
                'status' => 'active',
            ]);

            // Apply default theme if specified
            if (isset($data['theme_id'])) {
                $theme = Theme::find($data['theme_id']);
                if ($theme) {
                    $tenant->themes()->create([
                        'theme_id' => $theme->id,
                        'is_active' => true,
                    ]);
                    $theme->incrementUsage();
                }
            }

            // Add owner to tenant users (for consistency)
            $tenant->users()->attach($user->id, [
                'role' => 'tenant_owner',
                'status' => 'active',
                'invitation_accepted_at' => now(),
            ]);

            // Assign tenant_owner role
            if (!$user->hasRole('tenant_owner')) {
                $user->assignRole('tenant_owner');
            }

            return $tenant;
        });
    }

    /**
     * Update tenant information
     */
    public function updateTenant(Tenant $tenant, array $data): Tenant
    {
        $tenant->update($data);

        // Handle logo upload
        if (isset($data['logo'])) {
            $tenant->clearMediaCollection('logo');
            $tenant->addMedia($data['logo'])->toMediaCollection('logo');
        }

        // Handle favicon upload
        if (isset($data['favicon'])) {
            $tenant->clearMediaCollection('favicon');
            $tenant->addMedia($data['favicon'])->toMediaCollection('favicon');
        }

        return $tenant->fresh();
    }

    /**
     * Delete tenant
     */
    public function deleteTenant(Tenant $tenant): bool
    {
        return DB::transaction(function () use ($tenant) {
            // Detach all users
            $tenant->users()->detach();

            // Delete all media
            $tenant->clearMediaCollection();

            // Soft delete
            return $tenant->delete();
        });
    }

    /**
     * Check if user can create more tenants based on their plan
     */
    public function canCreateTenant(User $user): bool
    {
        $currentCount = $user->ownedTenants()->count();

        $limits = [
            'free' => (int) setting('limits.free_plan_tenants_limit', 1),
            'starter' => (int) setting('limits.starter_plan_tenants_limit', 3),
            'pro' => (int) setting('limits.pro_plan_tenants_limit', 10),
            'enterprise' => 999, // Unlimited
        ];

        $limit = $limits[$user->plan] ?? $limits['free'];

        return $currentCount < $limit;
    }

    /**
     * Get tenant limits for user's plan
     */
    public function getTenantLimits(User $user): array
    {
        $currentCount = $user->ownedTenants()->count();

        $maxTenants = match($user->plan) {
            'free' => (int) setting('limits.free_plan_tenants_limit', 1),
            'starter' => (int) setting('limits.starter_plan_tenants_limit', 3),
            'pro' => (int) setting('limits.pro_plan_tenants_limit', 10),
            'enterprise' => 0, // 0 = unlimited
            default => 1,
        };

        return [
            'current' => $currentCount,
            'max' => $maxTenants,
            'remaining' => $maxTenants > 0 ? max(0, $maxTenants - $currentCount) : 'unlimited',
            'can_create' => $maxTenants === 0 || $currentCount < $maxTenants,
        ];
    }

    /**
     * Invite user to tenant
     */
    public function inviteUser(Tenant $tenant, string $email, string $role = 'tenant_editor'): void
    {
        $invitationToken = Str::random(32);

        // Check if user exists
        $user = User::where('email', $email)->first();

        if ($user) {
            // User exists, attach directly
            $tenant->allUsers()->attach($user->id, [
                'role' => $role,
                'status' => 'pending',
                'invitation_token' => $invitationToken,
                'invitation_sent_at' => now(),
                'invited_by' => auth()->user()->email,
            ]);
        } else {
            // User doesn't exist, create pending invitation
            // This will be handled when user registers
            DB::table('tenant_invitations')->insert([
                'tenant_id' => $tenant->id,
                'email' => $email,
                'role' => $role,
                'token' => $invitationToken,
                'invited_by' => auth()->user()->email,
                'created_at' => now(),
            ]);
        }

        // TODO: Send invitation email
    }

    /**
     * Accept invitation
     */
    public function acceptInvitation(User $user, string $token): bool
    {
        $invitation = DB::table('tenant_user')
            ->where('user_id', $user->id)
            ->where('invitation_token', $token)
            ->where('status', 'pending')
            ->first();

        if (!$invitation) {
            return false;
        }

        DB::table('tenant_user')
            ->where('id', $invitation->id)
            ->update([
                'status' => 'active',
                'invitation_accepted_at' => now(),
            ]);

        // Assign role to user
        $user->assignRole($invitation->role);

        return true;
    }

    /**
     * Remove user from tenant
     */
    public function removeUser(Tenant $tenant, User $user): void
    {
        $tenant->users()->detach($user->id);
    }

    /**
     * Update user role in tenant
     */
    public function updateUserRole(Tenant $tenant, User $user, string $role): void
    {
        $tenant->users()->updateExistingPivot($user->id, [
            'role' => $role,
        ]);

        // Update user's role
        $user->syncRoles([$role]);
    }

    /**
     * Verify custom domain
     */
    public function verifyCustomDomain(Tenant $tenant, string $domain): bool
    {
        // TODO: Implement DNS verification logic
        // Check if domain points to our server

        $tenant->update([
            'custom_domain' => $domain,
            'custom_domain_verified' => true,
            'custom_domain_verified_at' => now(),
        ]);

        return true;
    }

    /**
     * Apply theme to tenant
     */
    public function applyTheme(Tenant $tenant, int $themeId): void
    {
        DB::transaction(function () use ($tenant, $themeId) {
            // Deactivate all themes
            $tenant->themes()->update(['is_active' => false]);

            // Check if theme already applied
            $tenantTheme = $tenant->themes()->where('theme_id', $themeId)->first();

            if ($tenantTheme) {
                $tenantTheme->activate();
            } else {
                // Create new theme application
                $theme = Theme::findOrFail($themeId);
                $tenant->themes()->create([
                    'theme_id' => $themeId,
                    'is_active' => true,
                ]);
                $theme->incrementUsage();
            }
        });
    }

    /**
     * Get tenant statistics
     */
    public function getStatistics(Tenant $tenant): array
    {
        return [
            'total_views' => $tenant->total_views,
            'total_clicks' => $tenant->total_clicks,
            'total_links' => $tenant->total_links,
            'click_through_rate' => $tenant->total_views > 0
                ? round(($tenant->total_clicks / $tenant->total_views) * 100, 2)
                : 0,
            'team_members' => $tenant->users()->count(),
            'created_at' => $tenant->created_at,
        ];
    }
}
