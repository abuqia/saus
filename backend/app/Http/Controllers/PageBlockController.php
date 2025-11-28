<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PageBlockController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('can:pages.edit')->only(['store', 'update', 'reorder']);
        $this->middleware('can:pages.delete')->only(['destroy']);
    }

    protected function authorizeTenant(Request $request, Page $page): void
    {
        $tenant = $page->tenant;
        $user = $request->user();
        if ($tenant && (!$user->isSuperAdmin() && !$user->canAccessTenant($tenant))) {
            abort(403);
        }
    }

    public function store(Request $request, Page $page): JsonResponse
    {
        $this->authorizeTenant($request, $page);

        $validated = $request->validate([
            'type' => ['required', 'string', 'max:255'],
            'data' => ['nullable', 'array'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $nextOrder = $validated['order'] ?? ($page->blocks()->max('order') + 1);

        $block = $page->blocks()->create([
            'type' => $validated['type'],
            'data' => $validated['data'] ?? null,
            'order' => $nextOrder ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'block' => [
                'id' => $block->id,
                'page_id' => $block->page_id,
                'type' => $block->type,
                'data' => $block->data,
                'order' => $block->order,
            ],
        ]);
    }

    public function update(Request $request, Page $page, PageBlock $block): JsonResponse
    {
        $this->authorizeTenant($request, $page);
        if ($block->page_id !== $page->id) {
            abort(404);
        }

        $validated = $request->validate([
            'type' => ['sometimes', 'string', 'max:255'],
            'data' => ['nullable', 'array'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $block->update([
            'type' => $validated['type'] ?? $block->type,
            'data' => $validated['data'] ?? $block->data,
            'order' => $validated['order'] ?? $block->order,
        ]);

        return response()->json([
            'success' => true,
            'block' => [
                'id' => $block->id,
                'page_id' => $block->page_id,
                'type' => $block->type,
                'data' => $block->data,
                'order' => $block->order,
            ],
        ]);
    }

    public function destroy(Request $request, Page $page, PageBlock $block): JsonResponse
    {
        $this->authorizeTenant($request, $page);
        if ($block->page_id !== $page->id) {
            abort(404);
        }
        $block->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    public function reorder(Request $request, Page $page): JsonResponse
    {
        $this->authorizeTenant($request, $page);

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('page_blocks', 'id')->where(fn ($q) => $q->where('page_id', $page->id))],
        ]);

        $order = 0;
        foreach ($validated['ids'] as $id) {
            PageBlock::where('id', $id)->where('page_id', $page->id)->update(['order' => $order]);
            $order++;
        }

        $blocks = $page->blocks()->orderBy('order')->get()->map(function ($b) {
            return [
                'id' => $b->id,
                'page_id' => $b->page_id,
                'type' => $b->type,
                'data' => $b->data,
                'order' => $b->order,
            ];
        });

        return response()->json([
            'success' => true,
            'blocks' => $blocks,
        ]);
    }
}

