<?php

namespace App\Http\Middleware;

use App\Models\Page;
use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }

        $tenant = $request->attributes->get('tenant');

        if (! $tenant) {
            $route = $request->route();
            $params = $route?->parameters() ?? [];

            if (isset($params['tenant']) && $params['tenant'] instanceof Tenant) {
                $tenant = $params['tenant'];
            }

            if (! $tenant && isset($params['page']) && $params['page'] instanceof Page) {
                $tenant = $params['page']->tenant;
            }

            if (! $tenant && $request->has('tenant_id')) {
                $tenant = Tenant::find((int) $request->input('tenant_id'));
            }
        }

        if ($tenant) {
            if (! $user->isSuperAdmin() && ! $user->canAccessTenant($tenant)) {
                abort(403);
            }
        }

        return $next($request);
    }
}

