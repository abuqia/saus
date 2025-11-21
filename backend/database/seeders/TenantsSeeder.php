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
                'owner_email' => 'owner@acme.test',
                'members' => [
                    ['email' => 'manager@acme.test', 'role' => 'admin'],
                    ['email' => 'editor@acme.test', 'role' => 'editor'],
                    ['email' => 'viewer@acme.test', 'role' => 'viewer'],
                ],
            ],
            [
                'name' => 'Globex LLC',
                'domain' => 'globex.test',
                'owner_email' => 'owner@globex.test',
                'members' => [
                    ['email' => 'editor@globex.test', 'role' => 'editor'],
                ],
            ],
        ];

        foreach ($definitions as $def) {
            $owner = User::firstOrCreate(
                ['email' => $def['owner_email']],
                [
                    'name' => $def['name'] . ' Owner',
                    'password' => '12345678',
                    'type' => 'user',
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

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
                $member = User::firstOrCreate(
                    ['email' => $memberDef['email']],
                    [
                        'name' => ucfirst(explode('@', $memberDef['email'])[0]),
                        'password' => '12345678',
                        'type' => 'user',
                        'status' => 'active',
                        'email_verified_at' => now(),
                    ]
                );

                $tenant->users()->syncWithPivotValues($member->id, [
                    'role' => $memberDef['role'],
                    'status' => 'active',
                ], false);
            }
        }
    }
}
