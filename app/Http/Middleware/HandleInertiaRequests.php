<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\Daycare;
use Illuminate\Support\Facades\Cache; // 🚀 ADDED THIS IMPORT

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();

        // 🚀 THE FIX: Tell the cache this user is online right now!
        if ($user) {
            Cache::put(
                'user-is-online-' . $user->id,
                true,
                now()->addMinutes(2) // They are "online" for 2 mins after their last click
            );
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],

            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->profile_photo_url ?? $user->profile_photo_path ?? null,

                    'daycare' => function () use ($request) {
                        if ($request->user() && $request->user()->daycare_id) {
                            return Daycare::select('id', 'name')
                                ->find($request->user()->daycare_id);
                        }
                        return null;
                    },
                ] : null,
            ],

            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'new_access_code' => fn() => $request->session()->get('new_access_code'),
                'student_name' => fn() => $request->session()->get('student_name'),
            ],

            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ]
        ];
    }
}
