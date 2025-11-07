<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Child;
use App\Models\Daycare;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the parent registration page with daycare options.
     */
    public function create(): Response
    {
        $daycares = Daycare::select('id', 'daycare_name')->get();

        return Inertia::render('auth/register', [
            'daycares' => $daycares,
        ]);
    }

    /**
     * Handle the parent + child registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // Parent fields
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'contact_number' => 'required|string|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],

            // Child fields
            'child_first_name' => 'required|string|max:255',
            'child_middle_name' => 'nullable|string|max:255',
            'child_last_name' => 'required|string|max:255',
            'child_birth_date' => 'required|date',
            'child_daycare_id' => 'required|exists:daycares,id',
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'contact_number' => $validated['contact_number'],
            'password' => Hash::make($validated['password']),
            'account_type' => 'parent',
            'daycare_id' => $validated['child_daycare_id'], // assign daycare to user account
        ]);


        Child::create([
            'user_id' => $user->id,
            'first_name' => $validated['child_first_name'],
            'middle_name' => $validated['child_middle_name'],
            'last_name' => $validated['child_last_name'],
            'birthdate' => $validated['child_birth_date'],
            'daycare_id' => $validated['child_daycare_id'],
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
