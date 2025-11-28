<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tenant_themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('theme_id')->constrained('themes')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->json('variables')->nullable();
            $table->timestamps();
            $table->unique(['tenant_id', 'theme_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_themes');
    }
};

