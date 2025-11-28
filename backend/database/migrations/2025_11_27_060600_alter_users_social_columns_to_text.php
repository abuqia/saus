<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL to avoid doctrine/dbal requirement
        DB::statement('ALTER TABLE users ALTER COLUMN google_token TYPE TEXT');
        DB::statement('ALTER TABLE users ALTER COLUMN google_refresh_token TYPE TEXT');
        DB::statement('ALTER TABLE users ALTER COLUMN avatar TYPE TEXT');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to VARCHAR(255)
        DB::statement('ALTER TABLE users ALTER COLUMN google_token TYPE VARCHAR(255)');
        DB::statement('ALTER TABLE users ALTER COLUMN google_refresh_token TYPE VARCHAR(255)');
        DB::statement('ALTER TABLE users ALTER COLUMN avatar TYPE VARCHAR(255)');
    }
};