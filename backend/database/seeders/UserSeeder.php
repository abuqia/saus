<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'email' => 'superadmin@saus.com',
            'username' => 'superadmin',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
        ]);

        User::create([
            'first_name' => 'Admin',
            'last_name' => '',
            'email' => 'admin@saus.com',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        User::create([
            'first_name' => 'Sub',
            'last_name' => 'Scriber',
            'email' => 'subscriber@saus.com',
            'username' => 'subscriber',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Run factory to create additional users with unique details.
        User::factory()->count(500)->create();
        $this->command->info('Users table seeded with 502 users!');
    }
}
