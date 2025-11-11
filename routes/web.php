<?php

use App\Http\Controllers\Admin\DaycareManagementController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', fn() => Redirect::route('login'))->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/redirect-by-role', function () {
        $user = Auth::user();
        return match ($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'teacher' => redirect()->route('teacher.dashboard'),
            'parent' => redirect()->route('parent.dashboard'),
            default => abort(403, 'Unauthorized.'),
        };
    })->name('role.redirect');

    Route::get('/dashboard', fn() => redirect()->route('role.redirect'))->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/users-management', [UsersController::class, 'index'])->name('users.management');

            // Route for Add Teacher (your store method)
        Route::post('/teachers', [UsersController::class, 'store'])
            ->name('admin.teachers.store');

        // Route for Edit User (your update method)
        Route::patch('/users/{id}', [UsersController::class, 'update'])
            ->name('admin.users.update');

        // --- FIX FOR APPROVE/REJECT ---
        // These MUST be POST routes to match your React code

        Route::post('/users/{id}/approve', [UsersController::class, 'approve'])
            ->name('admin.users.approve');

        Route::post('/users/{id}/reject', [UsersController::class, 'reject'])
            ->name('admin.users.reject');

        // --- Other routes ---
        Route::delete('/users/{id}', [UsersController::class, 'delete'])
            ->name('admin.users.delete');

        Route::get('/users/export', [UsersController::class, 'export'])
            ->name('admin.users.export');

        Route::get('/users-management', [UsersController::class, 'index'])
            ->name('admin.users.management');

        // Daycare Management
        Route::get('/daycare-management', [DaycareManagementController::class, 'index'])->name('daycare.index');
        Route::get('/daycare-management/{daycare}', [DaycareManagementController::class, 'show'])->name('daycare.show');



        Route::get('/child-management', fn() => Inertia::render('admin/child-management'))->name('child-management');
        Route::get('/reports', fn() => Inertia::render('admin/reports'))->name('reports');
        Route::get('/messages', fn() => Inertia::render('admin/messages'))->name('messages');
    });

    Route::prefix('teacher')->name('teacher.')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('teacher/dashboard'))->name('dashboard');
        Route::get('/assessment-management', fn() => Inertia::render('teacher/assessment-management'))->name('assessment-management');
        Route::get('/students', fn() => Inertia::render('teacher/students'))->name('students');
        Route::get('/reports', fn() => Inertia::render('teacher/reports'))->name('reports');
        Route::get('/messages', fn() => Inertia::render('teacher/messages'))->name('messages');
    });

    Route::prefix('parent')->name('parent.')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('parent/dashboard'))->name('dashboard');
        Route::get('/child-profile', fn() => Inertia::render('parent/child-profile'))->name('child-profile');
        Route::get('/assessment', fn() => Inertia::render('parent/assessment'))->name('assessment');
        Route::get('/messages', fn() => Inertia::render('parent/messages'))->name('messages');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

