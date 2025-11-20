<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Auth\Access\ImpersonateManager;


class HandleImpersonation
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $impersonateManager = app(ImpersonateManager::class);

        // Debug: Log impersonation status
        \Log::info('Impersonation Middleware', [
            'is_impersonating' => $impersonateManager->isImpersonating(),
            'impersonator_id' => $impersonateManager->getImpersonatorId(),
            'current_user_id' => auth()->id(),
        ]);

        // Share impersonation data dengan Inertia
        if ($request->inertia()) {
            inertia()->share([
                'impersonating' => $impersonateManager->isImpersonating(),
                'original_user' => $impersonateManager->isImpersonating()
                    ? $impersonateManager->getImpersonator()
                    : null,
            ]);
        }

        return $next($request);
    }
}
