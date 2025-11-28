<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\Page;
use App\Models\PageBlock;

class PagesSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();

        foreach ($tenants as $tenant) {
            $page = Page::firstOrCreate(
                ['tenant_id' => $tenant->id, 'slug' => 'home'],
                [
                    'title' => 'Home',
                    'status' => 'draft',
                    'data_draft' => [
                        'layout' => 'default',
                        'blocks' => [
                            ['type' => 'hero', 'data' => ['title' => $tenant->name, 'subtitle' => 'Welcome to your SAUS page']],
                            ['type' => 'links_grid', 'data' => ['items' => []]],
                        ],
                    ],
                ]
            );

            $order = 0;
            $blocks = [
                ['type' => 'hero', 'data' => ['title' => $tenant->name, 'subtitle' => 'Welcome to your SAUS page']],
                ['type' => 'links_grid', 'data' => ['items' => [
                    ['label' => 'Website', 'url' => 'https://example.com'],
                    ['label' => 'Instagram', 'url' => 'https://instagram.com'],
                ]]],
            ];

            foreach ($blocks as $b) {
                PageBlock::firstOrCreate(
                    ['page_id' => $page->id, 'type' => $b['type'], 'order' => $order],
                    ['data' => $b['data']]
                );
                $order++;
            }
        }
    }
}

