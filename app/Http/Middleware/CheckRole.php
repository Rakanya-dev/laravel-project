<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Check if the user's role matches the required role for this route
        if ($request->user() && $request->user()->role !== $role) {

            // 2. If they don't match, you can either show a 403 Error:
            // abort(403, 'Unauthorized access. You do not have permission to view this page.');

            // OR (Better UX) quietly redirect them back to their correct dashboard:
            return redirect()->route('role.redirect');
        }

        return $next($request);
    }
}
