<?php

use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

// Admin Routes - Protected by auth and admin middleware
Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified'])
    ->group(function () {

        // Dashboard
        Route::get('/', function () {
            return inertia('admin/dashboard');
        })->name('dashboard');

        // ============================================
        // USER MANAGEMENT
        // ============================================
        Route::resource('users', UserController::class)->except(['show']);
        Route::post('users/bulk-destroy', [UserController::class, 'bulkDestroy'])
            ->name('users.bulk-destroy');
        Route::post('users/{user}/impersonate', [UserController::class, 'impersonate'])
            ->name('users.impersonate');
        Route::post('users/{user}/verify-email', [UserController::class, 'verifyEmail'])
            ->name('users.verify-email');
        Route::post('users/{user}/change-status', [UserController::class, 'changeStatus'])
            ->name('users.change-status');

        // ============================================
        // ROLE MANAGEMENT
        // ============================================
        Route::resource('roles', RoleController::class);
        Route::post('roles/bulk-destroy', [RoleController::class, 'bulkDestroy'])
            ->name('roles.bulk-destroy');

        // ============================================
        // PERMISSION MANAGEMENT
        // ============================================
        Route::get('permissions', [PermissionController::class, 'index'])
            ->name('permissions.index');
        Route::post('permissions', [PermissionController::class, 'store'])
            ->name('permissions.store');
        Route::put('permissions/{permission}', [PermissionController::class, 'update'])
            ->name('permissions.update');
        Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])
            ->name('permissions.destroy');
        Route::post('permissions/{permission}/assign-roles', [PermissionController::class, 'assignToRoles'])
            ->name('permissions.assign-roles');
        Route::post('permissions/{permission}/remove-role', [PermissionController::class, 'removeFromRole'])
            ->name('permissions.remove-role');
        Route::post('permissions/sync', [PermissionController::class, 'sync'])
            ->name('permissions.sync');
        Route::get('permissions/export', [PermissionController::class, 'export'])
            ->name('permissions.export');

        // ============================================
        // TENANT MANAGEMENT
        // ============================================
        Route::resource('tenants', TenantController::class);
        Route::post('tenants/{tenant}/verify-domain', [TenantController::class, 'verifyDomain'])
            ->name('tenants.verify-domain');
        Route::post('tenants/{tenant}/suspend', [TenantController::class, 'suspend'])
            ->name('tenants.suspend');
        Route::post('tenants/{tenant}/activate', [TenantController::class, 'activate'])
            ->name('tenants.activate');

        // ============================================
        // THEME MANAGEMENT
        // ============================================
        Route::resource('themes', ThemeController::class);
        Route::post('themes/{theme}/duplicate', [ThemeController::class, 'duplicate'])
            ->name('themes.duplicate');
        Route::post('themes/{theme}/toggle-featured', [ThemeController::class, 'toggleFeatured'])
            ->name('themes.toggle-featured');

        // ============================================
        // SETTINGS
        // ============================================
        Route::get('settings', [SettingController::class, 'index'])
            ->name('settings.index');
        Route::put('settings', [SettingController::class, 'update'])
            ->name('settings.update');
        Route::post('settings/clear-cache', [SettingController::class, 'clearCache'])
            ->name('settings.clear-cache');

        // ============================================
        // ACTIVITY LOG
        // ============================================
        Route::get('activity-log', [ActivityLogController::class, 'index'])
            ->name('activity-log.index');
        Route::delete('activity-log/{activity}', [ActivityLogController::class, 'destroy'])
            ->name('activity-log.destroy');
        Route::post('activity-log/clear', [ActivityLogController::class, 'clear'])
            ->name('activity-log.clear');

        // ============================================
        // BACKUP
        // ============================================
        Route::get('/backups', [BackupController::class, 'index'])->name('backups.index');
        Route::post('/backups/create', [BackupController::class, 'create'])->name('backups.create');
        Route::get('/backups/download/{file_name}', [BackupController::class, 'download'])->name('backups.download');
        Route::delete('/backups/delete/{file_name}', [BackupController::class, 'delete'])->name('backups.delete');
    });
