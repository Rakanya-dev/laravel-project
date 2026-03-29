<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication;

class TwoFactorAuthenticationController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return Features::optionEnabled(Features::twoFactorAuthentication(), 'confirmPassword')
            ? [new Middleware('password.confirm', only: ['show', 'confirm', 'destroy'])]
            : [];
    }

    /**
     * Show the 2FA settings page.
     */
    public function show(TwoFactorAuthenticationRequest $request): Response
    {
        // If your file is at resources/js/Pages/settings/two-factor.tsx
        return Inertia::render('settings/two-factor', [
            'twoFactorEnabled' => $request->user()->two_factor_confirmed_at !== null,
            'requiresConfirmation' => Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm'),
        ]);
    }

    /**
     * Enable 2FA for the user (Generates the secret but doesn't "confirm" it yet).
     */
    public function store(Request $request, EnableTwoFactorAuthentication $enable)
    {
        $enable($request->user());
        return back();
    }

    /**
     * Confirm 2FA (Validates the 6-digit code for the first time).
     */
    public function confirm(Request $request, ConfirmTwoFactorAuthentication $confirm)
    {
        $confirm($request->user(), $request->code);
        return back();
    }

    /**
     * Disable 2FA.
     */
    public function destroy(Request $request, DisableTwoFactorAuthentication $disable)
    {
        $disable($request->user());
        return back();
    }

    /**
     * Get the SVG QR Code for the user.
     */
    public function qrCode(Request $request)
    {
        if (is_null($request->user()->two_factor_secret)) {
            return response()->json(['svg' => null]);
        }

        return response()->json([
            'svg' => $request->user()->twoFactorQrCodeSvg(),
            'url' => $request->user()->twoFactorQrCodeUrl(),
        ]);
    }

    /**
     * Get the manual setup secret key.
     */
    public function secretKey(Request $request)
    {
        if (is_null($request->user()->two_factor_secret)) {
            return response()->json(['secretKey' => null]);
        }

        return response()->json([
            'secretKey' => decrypt($request->user()->two_factor_secret),
        ]);
    }

    /**
     * Get the recovery codes.
     */
    public function recoveryCodes(Request $request)
    {
        if (is_null($request->user()->two_factor_recovery_codes)) {
            return response()->json([]);
        }

        return response()->json(
            json_decode(decrypt($request->user()->two_factor_recovery_codes), true)
        );
    }
}
