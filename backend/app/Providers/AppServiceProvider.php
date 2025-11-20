<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Lab404\Impersonate\Services\ImpersonateManager;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'impersonating' => function () {
                return app(ImpersonateManager::class)->isImpersonating();
            },
            'original_user' => function () {
                $impersonateManager = app(ImpersonateManager::class);
                return $impersonateManager->isImpersonating()
                    ? $impersonateManager->getImpersonator()
                    : null;
            },
        ]);
    }
}
