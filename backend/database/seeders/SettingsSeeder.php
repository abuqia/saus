<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Services\SettingService;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settingService = app(SettingService::class);
        $settingService->initializeDefaults();

        $this->command->info('Default settings initialized successfully.');
    }
}
