<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Theme;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('can:tenants.view')->only(['index', 'show']);
        $this->middleware('can:tenants.create')->only(['create, store']);
        $this->middleware('can:tenants.edit')->only(['edit', 'update', 'verifyDomain', 'suspend', 'activate']);
        $this->middleware('can:themes.apply')->only(['applyTheme']);
        $this->middleware('can:themes.customize')->only(['toggleTenantTheme', 'detachTenantTheme']);
        $this->middleware('can:tenants.delete')->only(['destroy']);
    }

    public function index(Request $request): Response
    {
        $tenants = Tenant::query()->paginate(20);

        $tenants->getCollection()->transform(function ($tenant) {
            return [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'domain' => $tenant->domain,
                'is_active' => $tenant->is_active,
                'created_at' => $tenant->created_at?->toISOString(),
            ];
        });

        return Inertia::render('tenants/index', [
            'tenants' => $tenants,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('tenants/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:tenants,slug'],
            'domain' => ['nullable', 'string', 'max:255', 'unique:tenants,domain'],
        ]);

        $tenant = $request->user()->ownedTenants()->create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? \Illuminate\Support\Str::slug($validated['name']),
            'domain' => $validated['domain'] ?? null,
            'is_active' => true,
        ]);

        return redirect()->route('tenants.show', $tenant)->with('success', 'Tenant created');
    }

    public function show(Tenant $tenant): Response
    {
        return Inertia::render('tenants/show', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'domain' => $tenant->domain,
                'is_active' => $tenant->is_active,
            ],
        ]);
    }

    public function edit(Tenant $tenant): Response
    {
        return Inertia::render('tenants/edit', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'domain' => $tenant->domain,
                'is_active' => $tenant->is_active,
            ],
        ]);
    }

    public function update(Request $request, Tenant $tenant): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:tenants,slug,' . $tenant->id],
            'domain' => ['nullable', 'string', 'max:255', 'unique:tenants,domain,' . $tenant->id],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $tenant->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? $tenant->slug,
            'domain' => $validated['domain'] ?? $tenant->domain,
            'is_active' => $validated['is_active'] ?? $tenant->is_active,
        ]);

        return redirect()->route('tenants.show', $tenant)->with('success', 'Tenant updated');
    }

    public function destroy(Tenant $tenant): RedirectResponse
    {
        $tenant->delete();
        return redirect()->route('tenants.index')->with('success', 'Tenant deleted');
    }

    public function verifyDomain(Request $request, Tenant $tenant): RedirectResponse
    {
        return redirect()->route('tenants.show', $tenant)->with('success', 'Domain verified');
    }

    public function suspend(Request $request, Tenant $tenant): RedirectResponse
    {
        $tenant->update(['is_active' => false]);
        return redirect()->route('tenants.show', $tenant)->with('success', 'Tenant suspended');
    }

    public function activate(Request $request, Tenant $tenant): RedirectResponse
    {
        $tenant->update(['is_active' => true]);
        return redirect()->route('tenants.show', $tenant)->with('success', 'Tenant activated');
    }

    public function applyTheme(Request $request, Tenant $tenant, Theme $theme): RedirectResponse
    {
        if (! $request->user()->isSuperAdmin() && ! $request->user()->canAccessTenant($tenant)) {
            abort(403);
        }

        $tenant->themes()->syncWithoutDetaching([
            $theme->id => [
                'is_active' => true,
                'variables' => json_encode($theme->variables ?? []),
            ],
        ]);

        $theme->incrementUsage();

        return redirect()->route('tenants.show', $tenant)->with('success', 'Theme applied');
    }

    public function toggleTenantTheme(Request $request, Tenant $tenant, Theme $theme): RedirectResponse
    {
        if (! $request->user()->isSuperAdmin() && ! $request->user()->canAccessTenant($tenant)) {
            abort(403);
        }

        $pivot = $tenant->themes()->where('themes.id', $theme->id)->first()?->pivot;
        $new = !($pivot?->is_active ?? false);
        $tenant->themes()->syncWithoutDetaching([
            $theme->id => [
                'is_active' => $new,
                'variables' => json_encode($pivot?->variables ? json_decode($pivot->variables, true) : ($theme->variables ?? [])),
            ],
        ]);

        return redirect()->route('tenants.show', $tenant)->with('success', $new ? 'Theme activated' : 'Theme deactivated');
    }

    public function detachTenantTheme(Request $request, Tenant $tenant, Theme $theme): RedirectResponse
    {
        if (! $request->user()->isSuperAdmin() && ! $request->user()->canAccessTenant($tenant)) {
            abort(403);
        }

        $tenant->themes()->detach($theme->id);
        return redirect()->route('tenants.show', $tenant)->with('success', 'Theme detached');
    }
}
