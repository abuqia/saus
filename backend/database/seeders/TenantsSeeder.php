<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TenantsSeeder extends Seeder
{
    public function run(): void
    {
        $definitions = [
            [
                'name' => 'Acme Inc',
                'domain' => 'acme.test',
                'owner_email' => 'owner@example.com',
                'members' => [
                    ['email' => 'manager@example.com', 'role' => 'admin'],
                    ['email' => 'editor@example.com', 'role' => 'editor'],
                    ['email' => 'viewer@example.com', 'role' => 'viewer'],
                ],
            ],
            [
                'name' => 'Globex LLC',
                'domain' => 'globex.test',
                'owner_email' => 'owner@example.com',
                'members' => [
                    ['email' => 'editor@example.com', 'role' => 'editor'],
                ],
            ],
        ];

        foreach ($definitions as $def) {
            $owner = User::where('email', $def['owner_email'])->first();
            if (!$owner) {
                continue;
            }

            $tenant = Tenant::firstOrCreate(
                ['slug' => Str::slug($def['name'])],
                [
                    'user_id' => $owner->id,
                    'name' => $def['name'],
                    'domain' => $def['domain'],
                    'is_active' => true,
                ]
            );

            foreach ($def['members'] as $memberDef) {
                $member = User::where('email', $memberDef['email'])->first();
                if (!$member) {
                    continue;
                }
                $tenant->users()->syncWithPivotValues($member->id, [
                    'role' => $memberDef['role'],
                    'status' => 'active',
                ], false);
            }
        }
    }
}