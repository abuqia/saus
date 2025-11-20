<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\ThemeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Lab404\Impersonate\Controllers\ImpersonateController;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // ============================================
    // USER MANAGEMENT
    // ============================================
    // Impersonate routes
    Route::get('/users/{user}/impersonate', [ImpersonateController::class, 'take'])->name('users.impersonate')->middleware('can:users.impersonate');
    Route::get('/users/stop-impersonate', [ImpersonateController::class, 'leave'])->name('users.stop-impersonate');

    Route::resource('users', UserController::class)->name('users', 'users');
    Route::patch('users/{user}/status', [UserController::class, 'updateStatus'])->name('users.status');
    Route::post('users/bulk-destroy', [UserController::class, 'bulkDestroy'])->name('users.bulk-destroy');
    Route::post('users/{user}/verify-email', [UserController::class, 'verifyEmail'])->name('users.verify-email');
    Route::get('/users/{user}/email', [UserController::class, 'email'])->name('users.email');
    Route::get('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    Route::post('users/{user}/change-status', [UserController::class, 'changeStatus'])->name('users.change-status');

    // ============================================
    // ROLE MANAGEMENT
    // ============================================
    Route::resource('roles', RoleController::class);
    Route::post('roles/bulk-destroy', [RoleController::class, 'bulkDestroy'])->name('roles.bulk-destroy');
    Route::post('roles/{role}/sync-permissions', [RoleController::class, 'syncPermissions'])->name('roles.sync-permissions');

    // ============================================
    // PERMISSION MANAGEMENT
    // ============================================
    Route::resource('permissions', PermissionController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::post('permissions/bulk-destroy', [PermissionController::class, 'bulkDestroy'])->name('permissions.bulk-destroy');
    Route::post('permissions/sync', [PermissionController::class, 'sync'])->name('permissions.sync');

    // ============================================
    // TENANT MANAGEMENT
    // ============================================
    Route::resource('tenants', TenantController::class);
    Route::post('tenants/{tenant}/verify-domain', [TenantController::class, 'verifyDomain'])->name('tenants.verify-domain');
    Route::post('tenants/{tenant}/suspend', [TenantController::class, 'suspend'])->name('tenants.suspend');
    Route::post('tenants/{tenant}/activate', [TenantController::class, 'activate'])->name('tenants.activate');

    // ============================================
    // THEME MANAGEMENT
    // ============================================
    Route::resource('themes', ThemeController::class);
    Route::post('themes/{theme}/duplicate', [ThemeController::class, 'duplicate'])->name('themes.duplicate');
    Route::post('themes/{theme}/toggle-featured', [ThemeController::class, 'toggleFeatured'])->name('themes.toggle-featured');

    // ============================================
    // SETTINGS
    // ============================================
    Route::get('settings', [SettingController::class, 'index'])->name('settings');
    Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
    Route::post('settings/clear-cache', [SettingController::class, 'clearCache'])->name('settings.clear-cache');

    // ============================================
    // ACTIVITY LOG
    // ============================================
    Route::get('activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
    Route::delete('activity-log/{activity}', [ActivityLogController::class, 'destroy'])->name('activity-log.destroy');
    Route::post('activity-log/clear', [ActivityLogController::class, 'clear'])->name('activity-log.clear');

    // ============================================
    // BACKUP
    // ============================================
    Route::get('/backups', [BackupController::class, 'index'])->name('backups.index');
    Route::post('/backups/create', [BackupController::class, 'create'])->name('backups.create');
    Route::get('/backups/download/{file_name}', [BackupController::class, 'download'])->name('backups.download');
    Route::delete('/backups/delete/{file_name}', [BackupController::class, 'delete'])->name('backups.delete');
});

// require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
