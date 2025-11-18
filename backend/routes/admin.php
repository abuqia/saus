<?php

use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {

    // Dashboard
    Route::get('/dashboard', function () {
        return inertia('Admin/Dashboard');
    })->name('dashboard');

    // User Management
    Route::resource('users', UserController::class);
    Route::post('users/{id}/restore', [UserController::class, 'restore'])->name('users.restore');
    Route::delete('users/{id}/force-delete', [UserController::class, 'forceDelete'])->name('users.force-delete');
    Route::post('users/{user}/impersonate', [UserController::class, 'impersonate'])->name('users.impersonate');
    Route::post('stop-impersonating', [UserController::class, 'stopImpersonating'])->name('stop-impersonating');

    // Role Management
    Route::resource('roles', RoleController::class);
    Route::post('roles/{role}/duplicate', [RoleController::class, 'duplicate'])->name('roles.duplicate');

    // Permission Management
    Route::resource('permissions', PermissionController::class);
    Route::post('permissions/{permission}/sync-roles', [PermissionController::class, 'syncRoles'])->name('permissions.sync-roles');
    Route::post('permissions/bulk-create', [PermissionController::class, 'bulkCreate'])->name('permissions.bulk-create');

    // Backup Management
    Route::get('/backups', [BackupController::class, 'index'])->name('backups.index');
    Route::post('/backups/create', [BackupController::class, 'create'])->name('backups.create');
    Route::get('/backups/download/{file_name}', [BackupController::class, 'download'])->name('backups.download');
    Route::delete('/backups/delete/{file_name}', [BackupController::class, 'delete'])->name('backups.delete');
});
