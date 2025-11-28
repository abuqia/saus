<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = null;

        $host = $request->getHost();
        if (!empty($host)) {
            $tenant = Tenant::byDomain($host)->first();
        }

        if (!$tenant && $request->has('tenant_id')) {
            $tenant = Tenant::find((int) $request->input('tenant_id'));
        }

        if ($tenant) {
            $request->attributes->set('tenant', $tenant);
            app()->instance('currentTenant', $tenant);
        }

        return $next($request);
    }
}

