<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckParentStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // 1. Safety check: ensure user is logged in and is a parent
        if ($user && $user->role === 'parent') {

            // 2. If status is NOT active...
            if ($user->status !== 'active') {

                // ...redirect them to the waiting room.
                return redirect()->route('approval.notice');
            }
        }

        return $next($request);
    }
}
