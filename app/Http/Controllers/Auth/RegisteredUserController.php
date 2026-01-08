<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
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
    public function create(): Response
    {
        $daycares = Daycare::select('id', 'name')->get();

        return Inertia::render('auth/register', [
            'daycares' => $daycares,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // 1. Validation
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'contact_number' => ['required', 'string', 'regex:/^63\d{10}$/'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],

            'access_code' => 'nullable|string|exists:students,access_code',

            'child_first_name' => 'nullable|required_without:access_code|string|max:255',
            'child_middle_name' => 'nullable|string|max:255',
            'child_last_name' => 'nullable|required_without:access_code|string|max:255',
            'child_birth_date' => 'nullable|required_without:access_code|date',
            'child_gender' => 'nullable|required_without:access_code|in:Male,Female',
            'child_daycare_id' => 'nullable|required_without:access_code|exists:daycares,id',
        ]);

        $student = null;
        $isTrusted = false;

        // --- PATH A: Access Code (Best Match) ---
        if (!empty($request->access_code)) {
            $student = Student::where('access_code', $request->access_code)->first();
            if ($student) {
                $isTrusted = true;
            }
        }

        // --- PATH B: Smart Match (The Fix) ---
        if (!$student && $request->child_first_name) {

            $query = Student::where('first_name', 'LIKE', trim($request->child_first_name))
                ->where('last_name', 'LIKE', trim($request->child_last_name));

            // FIX 2: Daycare Strict Check
            if ($request->child_daycare_id) {
                $query->where('daycare_id', $request->child_daycare_id);
            }

            // FIX 3: Smarter Middle Name Check
            // Instead of strictly requiring a match, we only filter IF the DB record actually HAS a middle name.
            // This prevents creating a duplicate just because the Teacher left the middle name blank.
            if ($request->filled('child_middle_name')) {
                $query->where(function ($q) use ($request) {
                    $q->where('middle_name', 'LIKE', trim($request->child_middle_name))
                        ->orWhereNull('middle_name')
                        ->orWhere('middle_name', '');
                });
            }

            $student = $query->first();
        }

        // --- PATH C: Create New (Only if absolutely no match found) ---
        if (!$student) {
            $student = Student::create([
                'daycare_id' => $request->child_daycare_id ?? 1,
                'first_name' => $request->child_first_name,
                'middle_name' => $request->child_middle_name,
                'last_name' => $request->child_last_name,
                'date_of_birth' => $request->child_birth_date,
                'gender' => $request->child_gender,
                'status' => 'Active',
                'access_code' => strtoupper(substr($request->child_first_name, 0, 1) . substr($request->child_last_name, 0, 1)) . '-' . rand(1000, 9999),
            ]);
        }

        // 3. Create Parent User
        $user = User::create([
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->contact_number,
            'password' => Hash::make($request->password),
            'role' => 'parent',
            'daycare_id' => $student->daycare_id,
            'status' => 'Pending',
        ]);

        // 4. Link Parent & Student
        $linkStatus = $isTrusted ? 'Active' : 'Pending';
        $isPrimary = !$isTrusted;

        if (!$student->parents()->where('parent_id', $user->id)->exists()) {
            $student->parents()->attach($user->id, [
                'relationship' => 'Parent',
                'is_primary' => $isPrimary,
                'status' => $linkStatus
            ]);
        }

        // 5. Burn Code
        if ($isTrusted && $student->access_code === $request->access_code) {
            $student->access_code = null;
            $student->save();
        }

        event(new Registered($user));


        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
