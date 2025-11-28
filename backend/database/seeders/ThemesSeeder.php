<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Theme;

class ThemesSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            [
                'name' => 'Modern Light',
                'slug' => 'modern-light',
                'description' => 'Clean light theme with neutral palette',
                'variables' => [
                    'primary' => '#4F46E5',
                    'background' => '#ffffff',
                    'text' => '#1b1b18',
                ],
                'is_active' => true,
                'is_default' => true,
            ],
            [
                'name' => 'Modern Dark',
                'slug' => 'modern-dark',
                'description' => 'Elegant dark theme optimized for contrast',
                'variables' => [
                    'primary' => '#FF4433',
                    'background' => '#0a0a0a',
                    'text' => '#EDEDEC',
                ],
                'is_active' => true,
                'is_default' => false,
            ],
        ];

        foreach ($defaults as $data) {
            Theme::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }
}

