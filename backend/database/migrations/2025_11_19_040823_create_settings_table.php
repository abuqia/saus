<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, text, boolean, integer, json
            $table->string('group')->default('general'); // general, auth, mail, services, appearance, seo, etc.
            $table->text('description')->nullable();
            $table->json('options')->nullable(); // untuk select fields
            $table->integer('order')->default(0);
            $table->boolean('is_public')->default(false); // apakah bisa diakses public?
            $table->boolean('is_encrypted')->default(false); // apakah value di-encrypt?
            $table->timestamps();
        });

        // Index untuk performa
        Schema::table('settings', function (Blueprint $table) {
            $table->index(['group', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
