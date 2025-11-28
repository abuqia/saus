<?php

namespace App\Http\Controllers;

use App\Models\Theme;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ThemeController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('can:themes.view')->only(['index', 'show']);
        $this->middleware('can:themes.create')->only(['create', 'store', 'duplicate']);
        $this->middleware('can:themes.customize')->only(['edit', 'update', 'toggleFeatured']);
        $this->middleware('can:themes.apply')->only(['toggleFeatured']);
    }

    public function index(Request $request): Response
    {
        $themes = Theme::query()->paginate(20);

        $themes->getCollection()->transform(function ($theme) {
            return [
                'id' => $theme->id,
                'name' => $theme->name,
                'slug' => $theme->slug,
                'description' => $theme->description,
                'is_active' => $theme->is_active,
                'is_default' => $theme->is_default,
                'usage_count' => $theme->usage_count,
            ];
        });

        return Inertia::render('themes/index', [
            'themes' => $themes,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('themes/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:themes,slug'],
            'description' => ['nullable', 'string'],
            'variables' => ['nullable', 'array'],
        ]);

        $theme = Theme::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? \Illuminate\Support\Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'variables' => $validated['variables'] ?? null,
            'is_active' => true,
        ]);

        return redirect()->route('themes.show', $theme)->with('success', 'Theme created');
    }

    public function show(Theme $theme): Response
    {
        return Inertia::render('themes/show', [
            'theme' => [
                'id' => $theme->id,
                'name' => $theme->name,
                'slug' => $theme->slug,
                'description' => $theme->description,
                'variables' => $theme->variables,
                'is_active' => $theme->is_active,
                'is_default' => $theme->is_default,
                'usage_count' => $theme->usage_count,
            ],
        ]);
    }

    public function edit(Theme $theme): Response
    {
        return Inertia::render('themes/edit', [
            'theme' => [
                'id' => $theme->id,
                'name' => $theme->name,
                'slug' => $theme->slug,
                'description' => $theme->description,
                'variables' => $theme->variables,
                'is_active' => $theme->is_active,
                'is_default' => $theme->is_default,
            ],
        ]);
    }

    public function update(Request $request, Theme $theme): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:themes,slug,' . $theme->id],
            'description' => ['nullable', 'string'],
            'variables' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        $theme->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? $theme->slug,
            'description' => $validated['description'] ?? $theme->description,
            'variables' => $validated['variables'] ?? $theme->variables,
            'is_active' => $validated['is_active'] ?? $theme->is_active,
            'is_default' => $validated['is_default'] ?? $theme->is_default,
        ]);

        return redirect()->route('themes.show', $theme)->with('success', 'Theme updated');
    }

    public function destroy(Theme $theme): RedirectResponse
    {
        $theme->delete();
        return redirect()->route('themes.index')->with('success', 'Theme deleted');
    }

    public function duplicate(Theme $theme): RedirectResponse
    {
        $copy = Theme::create([
            'name' => $theme->name . ' Copy',
            'slug' => $theme->slug . '-copy',
            'description' => $theme->description,
            'variables' => $theme->variables,
            'is_active' => $theme->is_active,
            'is_default' => false,
        ]);
        return redirect()->route('themes.show', $copy)->with('success', 'Theme duplicated');
    }

    public function toggleFeatured(Theme $theme): RedirectResponse
    {
        $theme->update(['is_default' => ! $theme->is_default]);
        return redirect()->route('themes.show', $theme)->with('success', 'Theme updated');
    }
}
