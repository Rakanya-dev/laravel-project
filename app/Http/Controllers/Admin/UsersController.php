<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User; // Uses your new KIDTRAK User model
use App\Models\Daycare; // Uses your new KIDTRAK Daycare model
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Exports\UsersExport;
use Maatwebsite\Excel\Facades\Excel;

class UsersController extends Controller
{
    public function index()
    {
        // --- FIX: Use 'role' instead of 'account_type' ---
        $teachers = User::with('daycare:id,name')
            ->where('role', 'teacher') // Changed
            ->paginate(10);

        // --- FIX: Use 'role' instead of 'account_type' ---
        $parents = User::with('daycare:id,name')
            ->where('role', 'parent') // Changed
            ->paginate(10);

        // --- FIX: Use 'name' from your new Daycare model ---
        $daycares = Daycare::all(['id', 'name']); // Changed

        return Inertia::render('admin/users-management', [
            'teachers' => $teachers,
            'parents' => $parents,
            'daycares' => $daycares,
        ]);
    }

    public function store(Request $request)
    {
        // --- FIX: Validate 'phone' instead of 'contact_number' ---
        $validated = $request->validate([
            'first_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required', // Changed
            'password' => 'required|confirmed|min:8',
            'daycare_id' => 'required|exists:daycares,id',
        ]);

        User::create([
            ...$validated,
            'role' => 'teacher', // Changed
            'daycare_id' => $validated['daycare_id'],
            'status' => 'active',
            'phone' => $validated['phone'], // Changed
            'password' => bcrypt($validated['password']), // Model will hash, but bcrypt is explicit
        ]);

        return redirect()->route('admin.users.management')->with('success', 'Teacher account created.');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // --- FIX: Validate 'phone' instead of 'contact_number' ---
        $validated = $request->validate([
            'first_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'required|string',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            'phone' => 'required', // Changed
            'daycare_id' => 'required|exists:daycares,id',
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function approve($id)
    {
        // --- FIX: Use 'role' instead of 'account_type' ---
        $user = User::where('role', 'parent')->findOrFail($id); // Changed

        if ($user->status === 'pending') {
            $user->status = 'active';
            $user->save();
        }

        return redirect()->back()->with('success', 'Parent account approved.');
    }

    public function reject($id)
    {
        // --- FIX: Use 'role' instead of 'account_type' ---
        $user = User::where('role', 'parent')->findOrFail($id); // Changed

        if ($user->status === 'pending') {
            $user->status = 'rejected';
            $user->save();
        }

        return redirect()->back()->with('success', 'Parent account rejected.');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    public function export(Request $request)
    {
        $request->validate([
            'type' => ['required', Rule::in(['teachers', 'parents'])],
        ]);

        $userType = $request->query('type') === 'teachers' ? 'teacher' : 'parent';
        $filename = $request->query('type') . '-' . now()->format('Y-m-d') . '.csv';

        return Excel::download(new UsersExport($userType), $filename);
    }
}
