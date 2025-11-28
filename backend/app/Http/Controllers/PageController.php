<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Tenant;
use Illuminate\Validation\Rule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('can:pages.view')->only(['index', 'show']);
        $this->middleware('can:pages.create')->only(['create', 'store']);
        $this->middleware('can:pages.edit')->only(['edit', 'update', 'publish']);
        $this->middleware('can:pages.delete')->only(['destroy']);
    }

    public function index(Request $request): Response
    {
        $tenantId = $request->integer('tenant_id');
        $user = $request->user();
        $query = Page::query();
        if ($tenantId) {
            $tenant = Tenant::find($tenantId);
            if ($tenant && (!$user->isSuperAdmin() && !$user->canAccessTenant($tenant))) {
                abort(403);
            }
            $query->where('tenant_id', $tenantId);
        } else if (!$user->isSuperAdmin()) {
            $tenantIds = $user->tenants()->pluck('tenants.id')->merge($user->ownedTenants()->pluck('id'))->unique()->values();
            $query->whereIn('tenant_id', $tenantIds);
        }
        $pages = $query->paginate(20);

        $pages->getCollection()->transform(function ($page) {
            return [
                'id' => $page->id,
                'tenant_id' => $page->tenant_id,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status,
                'published_at' => $page->published_at?->toISOString(),
                'version' => $page->version,
            ];
        });

        return Inertia::render('pages/index', [
            'pages' => $pages,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('pages/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tenant_id' => ['required', 'exists:tenants,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('pages')->where(fn ($q) => $q->where('tenant_id', $request->integer('tenant_id')))],
            'data_draft' => ['nullable', 'array'],
        ]);

        $tenant = Tenant::findOrFail($validated['tenant_id']);
        if (!$request->user()->isSuperAdmin() && !$request->user()->canAccessTenant($tenant)) {
            abort(403);
        }

        $page = Page::create([
            'tenant_id' => $validated['tenant_id'],
            'title' => $validated['title'],
            'slug' => $validated['slug'],
            'status' => 'draft',
            'data_draft' => $validated['data_draft'] ?? null,
        ]);

        return redirect()->route('pages.show', $page)->with('success', 'Page created');
    }

    public function show(Page $page): Response
    {
        return Inertia::render('pages/show', [
            'page' => [
                'id' => $page->id,
                'tenant_id' => $page->tenant_id,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status,
                'data_draft' => $page->data_draft,
                'data_published' => $page->data_published,
                'published_at' => $page->published_at?->toISOString(),
                'version' => $page->version,
            ],
        ]);
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('pages/edit', [
            'page' => [
                'id' => $page->id,
                'tenant_id' => $page->tenant_id,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status,
                'data_draft' => $page->data_draft,
                'version' => $page->version,
            ],
        ]);
    }

    public function update(Request $request, Page $page): RedirectResponse
    {
        $tenant = $page->tenant;
        $user = $request->user();
        if ($tenant && (!$user->isSuperAdmin() && !$user->canAccessTenant($tenant))) {
            abort(403);
        }
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('pages')->ignore($page->id)->where(fn ($q) => $q->where('tenant_id', $page->tenant_id))],
            'data_draft' => ['nullable', 'array'],
            'status' => ['nullable', 'string'],
        ]);

        $page->update([
            'title' => $validated['title'],
            'slug' => $validated['slug'],
            'data_draft' => $validated['data_draft'] ?? $page->data_draft,
            'status' => $validated['status'] ?? $page->status,
        ]);

        return redirect()->route('pages.show', $page)->with('success', 'Page updated');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $tenant = $page->tenant;
        $user = request()->user();
        if ($tenant && (!$user->isSuperAdmin() && !$user->canAccessTenant($tenant))) {
            abort(403);
        }
        $page->delete();
        return redirect()->route('pages.index')->with('success', 'Page deleted');
    }

    public function publish(Request $request, Page $page): RedirectResponse
    {
        $tenant = $page->tenant;
        $user = $request->user();
        if ($tenant && (!$user->isSuperAdmin() && !$user->canAccessTenant($tenant))) {
            abort(403);
        }
        $page->update([
            'status' => 'published',
            'data_published' => $page->data_draft,
            'published_at' => now(),
            'version' => $page->version + 1,
        ]);
        return redirect()->route('pages.show', $page)->with('success', 'Page published');
    }

    public function preview(Page $page)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'title' => $page->title,
                'slug' => $page->slug,
                'data' => $page->data_draft,
            ],
        ]);
    }
}
