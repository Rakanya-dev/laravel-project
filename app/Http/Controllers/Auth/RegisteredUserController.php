<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        // We no longer need to pass Daycares here, because they choose the daycare
        // LATER inside the secure dashboard!
        return Inertia::render('auth/register');
    }

    public function store(Request $request): RedirectResponse
    {
        // 1. Strict Validation (Only for the Parent's Account)
        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'contact_number' => ['required', 'string', 'regex:/^63\d{10}$/'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        // 2. Create the Parent Account
        $user = User::create([
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->contact_number,
            'password' => Hash::make($request->password),
            'role' => 'parent',
            'status' => 'Active', // The user account is active immediately
        ]);

        event(new Registered($user));

        // 3. Log them in
        Auth::login($user);

        // 4. Send them to the Dashboard (which will automatically show the "Enroll Your Child" form!)
        return redirect(route('dashboard', absolute: false));
    }
}
