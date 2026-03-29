<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // --- Two-Factor Authentication Logic (Fortify) ---

    // 1. Enable 2FA
    Route::post('/user/two-factor-authentication', [TwoFactorAuthenticationController::class, 'store'])
        ->name('two-factor.enable');

    // 2. Confirm 2FA (The step where they enter the 6-digit code to finish setup)
    Route::post('/user/confirmed-two-factor-authentication', [TwoFactorAuthenticationController::class, 'confirm'])
        ->name('two-factor.confirm');

    // 3. Disable 2FA
    Route::delete('/user/two-factor-authentication', [TwoFactorAuthenticationController::class, 'destroy'])
        ->name('two-factor.disable');

    // 4. Data Fetching (Used by your useTwoFactorAuth hook)
    Route::get('/user/two-factor-qr-code', [TwoFactorAuthenticationController::class, 'qrCode'])
        ->name('two-factor.qr-code');

    Route::get('/user/two-factor-secret-key', [TwoFactorAuthenticationController::class, 'secretKey'])
        ->name('two-factor.secret-key');

    Route::get('/user/two-factor-recovery-codes', [TwoFactorAuthenticationController::class, 'recoveryCodes'])
        ->name('two-factor.recovery-codes');

    Route::post('/user/two-factor-recovery-codes', [TwoFactorAuthenticationController::class, 'regenerateRecoveryCodes'])
        ->name('two-factor.recovery-codes.regenerate');
});
