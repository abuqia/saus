<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(Tests\TestCase::class)
    ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

expect()->extend('toBeSuccessful', function () {
    return $this->toBeInArray([200, 201, 204]);
});

expect()->extend('toBeUnauthorized', function () {
    return $this->toBe(401);
});

expect()->extend('toBeForbidden', function () {
    return $this->toBe(403);
});

expect()->extend('toHaveValidationError', function ($field = null) {
    $this->toBe(422);
    
    if ($field) {
        expect($this->value->errors())->toHaveKey($field);
    }
    
    return $this;
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

/**
 * Create and authenticate a user for testing
 */
function actingAsUser(array $attributes = [], ?string $guard = null): \App\Models\User
{
    $user = \App\Models\User::factory()->create($attributes);
    
    test()->actingAs($user, $guard);
    
    return $user;
}

/**
 * Create an admin user and authenticate
 */
function actingAsAdmin(array $attributes = []): \App\Models\User
{
    $user = \App\Models\User::factory()->create(array_merge([
        'email' => 'admin@test.com',
    ], $attributes));
    
    // Assign admin role if Spatie Permission is being used
    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        $user->assignRole($adminRole);
    }
    
    test()->actingAs($user);
    
    return $user;
}

/**
 * Create a guest (unauthenticated) session
 */
function actingAsGuest(): void
{
    auth()->logout();
}

/**
 * Seed specific data for testing
 */
function seedData(string|array $seeders): void
{
    if (is_string($seeders)) {
        $seeders = [$seeders];
    }
    
    foreach ($seeders as $seeder) {
        test()->seed($seeder);
    }
}

/**
 * Create fake file for upload testing
 */
function fakeFile(string $name = 'test.jpg', int $kilobytes = 100): \Illuminate\Http\Testing\File
{
    return \Illuminate\Http\UploadedFile::fake()->image($name, 600, 600)->size($kilobytes);
}

/**
 * Assert database has record with attributes
 */
function assertDatabaseHasRecord(string $table, array $attributes): void
{
    test()->assertDatabaseHas($table, $attributes);
}

/**
 * Assert database missing record with attributes
 */
function assertDatabaseMissingRecord(string $table, array $attributes): void
{
    test()->assertDatabaseMissing($table, $attributes);
}
