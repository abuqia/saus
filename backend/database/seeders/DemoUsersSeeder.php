<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class DemoUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            ['email' => 'superadmin@saus.com', 'name' => 'Super Admin', 'role' => 'super_admin', 'type' => 'super_admin'],
            ['email' => 'admin@saus.com', 'name' => 'Admin', 'role' => 'admin', 'type' => 'admin'],
            ['email' => 'owner@saus.com', 'name' => 'Tenant Owner', 'role' => 'tenant_owner', 'type' => 'user'],
            ['email' => 'manager@saus.com', 'name' => 'Tenant Admin', 'role' => 'tenant_admin', 'type' => 'user'],
            ['email' => 'editor@saus.com', 'name' => 'Tenant Editor', 'role' => 'tenant_editor', 'type' => 'user'],
            ['email' => 'viewer@saus.com', 'name' => 'Tenant Viewer', 'role' => 'tenant_viewer', 'type' => 'user'],
            ['email' => 'user@saus.com', 'name' => 'User', 'role' => 'user', 'type' => 'user'],
        ];

        foreach ($data as $item) {
            $user = User::firstOrCreate(
                ['email' => $item['email']],
                [
                    'name' => $item['name'],
                    'password' => '12345678',
                    'type' => $item['type'],
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

            if (Role::where('name', $item['role'])->exists()) {
                $user->syncRoles([$item['role']]);
            }
        }
    }
}
