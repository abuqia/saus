<?php

use App\Models\Setting;
use App\Models\Tenant;
use App\Models\User;

if (!function_exists('setting')) {
    /**
     * Get or set application settings
     */
    function setting(string $key, $default = null)
    {
        return Setting::get($key, $default);
    }
}

if (!function_exists('set_setting')) {
    /**
     * Set application setting
     */
    function set_setting(string $key, $value, ?string $group = null, ?string $type = null): void
    {
        Setting::set($key, $value, $group, $type);
    }
}

if (!function_exists('current_tenant')) {
    /**
     * Get current tenant from session or context
     */
    function current_tenant(): ?Tenant
    {
        if (auth()->guest()) {
            return null;
        }

        $tenantId = session('current_tenant_id');

        if (!$tenantId) {
            // Get first tenant if not set
            $tenant = auth()->user()->tenants()->first();
            if ($tenant) {
                session(['current_tenant_id' => $tenant->id]);
                return $tenant;
            }
            return null;
        }

        return Tenant::find($tenantId);
    }
}

if (!function_exists('switch_tenant')) {
    /**
     * Switch current tenant context
     */
    function switch_tenant(Tenant $tenant): void
    {
        if (!auth()->user()->canAccessTenant($tenant)) {
            throw new \Exception('You do not have access to this tenant');
        }

        session(['current_tenant_id' => $tenant->id]);
    }
}

if (!function_exists('user_can')) {
    /**
     * Check if current user has permission in current tenant context
     */
    function user_can(string $permission): bool
    {
        if (auth()->guest()) {
            return false;
        }

        $user = auth()->user();

        // Super admin has all permissions
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->can($permission);
    }
}

if (!function_exists('format_number')) {
    /**
     * Format number with K, M, B suffixes
     */
    function format_number(int $number): string
    {
        if ($number < 1000) {
            return (string) $number;
        }

        if ($number < 1000000) {
            return round($number / 1000, 1) . 'K';
        }

        if ($number < 1000000000) {
            return round($number / 1000000, 1) . 'M';
        }

        return round($number / 1000000000, 1) . 'B';
    }
}

if (!function_exists('format_bytes')) {
    /**
     * Format bytes to human readable format
     */
    function format_bytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}

if (!function_exists('slug_available')) {
    /**
     * Check if tenant slug is available
     */
    function slug_available(string $slug, ?int $exceptId = null): bool
    {
        $query = Tenant::where('slug', $slug);

        if ($exceptId) {
            $query->where('id', '!=', $exceptId);
        }

        return !$query->exists();
    }
}

if (!function_exists('generate_unique_slug')) {
    /**
     * Generate unique slug for tenant
     */
    function generate_unique_slug(string $name): string
    {
        $slug = \Illuminate\Support\Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (!slug_available($slug)) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }
}

if (!function_exists('tenant_url')) {
    /**
     * Generate URL for tenant
     */
    function tenant_url(Tenant $tenant, ?string $path = null): string
    {
        if ($tenant->custom_domain && $tenant->custom_domain_verified) {
            $url = 'https://' . $tenant->custom_domain;
        } else {
            $url = config('app.url') . '/' . $tenant->slug;
        }

        if ($path) {
            $url .= '/' . ltrim($path, '/');
        }

        return $url;
    }
}

if (!function_exists('plan_limit')) {
    /**
     * Get plan limit by key
     */
    function plan_limit(User $user, string $limitKey): int
    {
        $plan = $user->plan;
        $settingKey = "limits.{$plan}_plan_{$limitKey}";

        return (int) setting($settingKey, 0);
    }
}

if (!function_exists('user_can_create_tenant')) {
    /**
     * Check if user can create more tenants
     */
    function user_can_create_tenant(User $user): bool
    {
        $currentCount = $user->ownedTenants()->count();
        $limit = plan_limit($user, 'tenants_limit');

        // 0 means unlimited
        if ($limit === 0) {
            return true;
        }

        return $currentCount < $limit;
    }
}

if (!function_exists('is_super_admin')) {
    /**
     * Check if current user is super admin
     */
    function is_super_admin(): bool
    {
        return auth()->check() && auth()->user()->isSuperAdmin();
    }
}

if (!function_exists('is_admin')) {
    /**
     * Check if current user is admin or super admin
     */
    function is_admin(): bool
    {
        return auth()->check() && (auth()->user()->isSuperAdmin() || auth()->user()->isAdmin());
    }
}

if (!function_exists('tenant_role')) {
    /**
     * Get current user's role in current tenant
     */
    function tenant_role(?Tenant $tenant = null): ?string
    {
        if (auth()->guest()) {
            return null;
        }

        $tenant = $tenant ?? current_tenant();

        if (!$tenant) {
            return null;
        }

        return auth()->user()->getTenantRole($tenant);
    }
}

if (!function_exists('money_format')) {
    /**
     * Format money with currency
     */
    function money_format(float $amount, string $currency = 'USD'): string
    {
        $formatter = new \NumberFormatter('en_US', \NumberFormatter::CURRENCY);
        return $formatter->formatCurrency($amount, $currency);
    }
}

if (!function_exists('percentage')) {
    /**
     * Calculate percentage
     */
    function percentage(float $value, float $total, int $decimals = 2): float
    {
        if ($total == 0) {
            return 0;
        }

        return round(($value / $total) * 100, $decimals);
    }
}

if (!function_exists('time_ago')) {
    /**
     * Get time ago string
     */
    function time_ago(\Carbon\Carbon $date): string
    {
        return $date->diffForHumans();
    }
}

if (!function_exists('active_route')) {
    /**
     * Check if route is active (for navigation highlighting)
     */
    function active_route(string|array $routes, string $activeClass = 'active', string $inactiveClass = ''): string
    {
        $routes = is_array($routes) ? $routes : [$routes];

        foreach ($routes as $route) {
            if (request()->routeIs($route)) {
                return $activeClass;
            }
        }

        return $inactiveClass;
    }
}

if (!function_exists('avatar_url')) {
    /**
     * Get avatar URL for user
     */
    function avatar_url(?string $avatar = null, ?string $name = null): string
    {
        if ($avatar) {
            return asset('storage/' . $avatar);
        }

        if ($name) {
            return 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&color=fff&background=4F46E5';
        }

        return 'https://ui-avatars.com/api/?name=User&color=fff&background=4F46E5';
    }
}

if (!function_exists('short_url')) {
    /**
     * Generate short URL using tenant slug
     */
    function short_url(Tenant $tenant): string
    {
        return config('app.url') . '/' . $tenant->slug;
    }
}

if (!function_exists('feature_enabled')) {
    /**
     * Check if feature is enabled
     */
    function feature_enabled(string $feature): bool
    {
        return (bool) setting("features.{$feature}_enabled", false);
    }
}
