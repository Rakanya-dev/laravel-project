<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. If not logged in, let standard auth middleware handle it (or redirect)
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // 2. Admins always bypass this check
        if ($user->role === 'admin') {
            return $next($request);
        }

        // 3. If user is NOT active...
        if ($user->status !== 'active') {

            // This prevents the "Too Many Redirects" error.
            if ($request->routeIs('approval.notice') || $request->routeIs('logout')) {
                return $next($request);
            }

            // Otherwise, kick them to the waiting room
            return redirect()->route('approval.notice');
        }

        // 4. If they are active, and trying to view the "pending" page, send them to dashboard
        if ($request->routeIs('approval.notice') && $user->status === 'active') {
             return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
