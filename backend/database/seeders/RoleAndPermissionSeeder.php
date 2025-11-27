<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use App\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all permissions
        $permissions = [
            // User Management
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'users.impersonate',

            // Role & Permission Management
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
            'permissions.manage',
            'permissions.view',
            'permissions.create',
            'permissions.edit',
            'permissions.delete',

            // Tenant Management
            'tenants.view',
            'tenants.create',
            'tenants.edit',
            'tenants.delete',
            'tenants.settings',

            // Team Management
            'team.view',
            'team.invite',
            'team.remove',
            'team.roles',

            // Links Management
            'links.view',
            'links.create',
            'links.edit',
            'links.delete',
            'links.reorder',
            'links.analytics',

            // Pages Management
            'pages.view',
            'pages.create',
            'pages.edit',
            'pages.delete',
            'pages.publish',

            // Theme Management
            'themes.view',
            'themes.apply',
            'themes.customize',
            'themes.create', // For admin to create new themes

            // Media Management
            'media.view',
            'media.upload',
            'media.delete',

            // Analytics
            'analytics.view',
            'analytics.export',
            'analytics.advanced',

            // Settings
            'settings.view',
            'settings.edit',
            'settings.system', // System-wide settings (super admin only)

            // Billing & Subscriptions
            'billing.view',
            'billing.manage',
            'billing.invoices',

            // API & Integrations
            'api.access',
            'api.manage',
            'integrations.view',
            'integrations.manage',

            // Activity Log
            'activity.view',
            'activity.export',
        ];

        // Create all permissions with description/backfill
        foreach ($permissions as $permissionName) {
            $perm = Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);
            $desc = $this->describePermission($permissionName);
            if ($perm->description !== $desc) {
                $perm->description = $desc;
                $perm->save();
            }
        }

        // ============================================
        // SUPER ADMIN ROLE
        // ============================================
        $superAdmin = Role::updateOrCreate(
            ['name' => 'super_admin', 'guard_name' => 'web'],
            ['label' => 'Super Admin', 'description' => 'Full system access and management']
        );
        $superAdmin->syncPermissions(Permission::all());

        // ============================================
        // ADMIN ROLE (Platform Admin)
        // ============================================
        $admin = Role::updateOrCreate(
            ['name' => 'admin', 'guard_name' => 'web'],
            ['label' => 'Administrator', 'description' => 'Platform administrator with elevated privileges']
        );
        $admin->syncPermissions([
            // Users
            'users.view',
            'users.create',
            'users.edit',

            // Tenants
            'tenants.view',
            'tenants.create',
            'tenants.edit',

            // Themes
            'themes.view',
            'themes.create',

            // Settings
            'settings.view',
            'settings.edit',

            // Activity
            'activity.view',

            // Permissions
            'permissions.manage',
            'permissions.view',
            'permissions.create',
            'permissions.edit',
            'permissions.delete',
        ]);

        // ============================================
        // TENANT ROLES
        // ============================================

        // Tenant Owner (Full control of their tenant)
        $tenantOwner = Role::updateOrCreate(
            ['name' => 'tenant_owner', 'guard_name' => 'web'],
            ['label' => 'Tenant Owner', 'description' => 'Owns tenant and has full control over tenant resources']
        );
        $tenantOwner->syncPermissions([
            // Team
            'team.view',
            'team.invite',
            'team.remove',
            'team.roles',

            // Links
            'links.view',
            'links.create',
            'links.edit',
            'links.delete',
            'links.reorder',
            'links.analytics',

            // Pages
            'pages.view',
            'pages.create',
            'pages.edit',
            'pages.delete',
            'pages.publish',

            // Themes
            'themes.view',
            'themes.apply',
            'themes.customize',

            // Media
            'media.view',
            'media.upload',
            'media.delete',

            // Analytics
            'analytics.view',
            'analytics.export',
            'analytics.advanced',

            // Settings
            'settings.view',
            'settings.edit',

            // Billing
            'billing.view',
            'billing.manage',
            'billing.invoices',

            // API
            'api.access',
            'api.manage',
            'integrations.view',
            'integrations.manage',

            // Activity
            'activity.view',
        ]);

        // Tenant Admin (Can manage content and team)
        $tenantAdmin = Role::updateOrCreate(
            ['name' => 'tenant_admin', 'guard_name' => 'web'],
            ['label' => 'Tenant Admin', 'description' => 'Manages content and team within tenant']
        );
        $tenantAdmin->syncPermissions([
            // Team
            'team.view',
            'team.invite',

            // Links
            'links.view',
            'links.create',
            'links.edit',
            'links.delete',
            'links.reorder',
            'links.analytics',

            // Pages
            'pages.view',
            'pages.create',
            'pages.edit',
            'pages.delete',
            'pages.publish',

            // Themes
            'themes.view',
            'themes.apply',
            'themes.customize',

            // Media
            'media.view',
            'media.upload',
            'media.delete',

            // Analytics
            'analytics.view',
            'analytics.export',

            // Settings
            'settings.view',
            'settings.edit',

            // Integrations
            'integrations.view',
        ]);

        // Tenant Editor (Can create and edit content)
        $tenantEditor = Role::updateOrCreate(
            ['name' => 'tenant_editor', 'guard_name' => 'web'],
            ['label' => 'Tenant Editor', 'description' => 'Creates and edits content within tenant']
        );
        $tenantEditor->syncPermissions([
            // Links
            'links.view',
            'links.create',
            'links.edit',
            'links.reorder',
            'links.analytics',

            // Pages
            'pages.view',
            'pages.create',
            'pages.edit',

            // Themes
            'themes.view',
            'themes.apply',

            // Media
            'media.view',
            'media.upload',

            // Analytics
            'analytics.view',
        ]);

        // Tenant Viewer (Read-only access)
        $tenantViewer = Role::updateOrCreate(
            ['name' => 'tenant_viewer', 'guard_name' => 'web'],
            ['label' => 'Tenant Viewer', 'description' => 'Read-only access to tenant content']
        );
        $tenantViewer->syncPermissions([
            'links.view',
            'links.analytics',
            'pages.view',
            'themes.view',
            'media.view',
            'analytics.view',
        ]);

        // ============================================
        // USER ROLE (Regular registered user without tenant)
        // ============================================
        $user = Role::updateOrCreate(
            ['name' => 'user', 'guard_name' => 'web'],
            ['label' => 'User', 'description' => 'Registered user without tenant']
        );
        $user->syncPermissions([
            'tenants.create', // Can create their first tenant
        ]);

        $this->command->info('Roles and Permissions created successfully!');

        // Output summary
        $this->command->table(
            ['Role', 'Permissions Count'],
            [
                ['Super Admin', $superAdmin->permissions->count()],
                ['Admin', $admin->permissions->count()],
                ['Tenant Owner', $tenantOwner->permissions->count()],
                ['Tenant Admin', $tenantAdmin->permissions->count()],
                ['Tenant Editor', $tenantEditor->permissions->count()],
                ['Tenant Viewer', $tenantViewer->permissions->count()],
                ['User', $user->permissions->count()],
            ]
        );
    }

    private function describePermission(string $name): string
    {
        $parts = explode('.', $name);
        $model = ucfirst(str_replace('_', ' ', $parts[0] ?? 'General'));
        $action = ucfirst(str_replace('_', ' ', $parts[1] ?? 'Manage'));
        return $action . ' ' . $model;
    }
}
