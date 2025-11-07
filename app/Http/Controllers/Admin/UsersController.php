<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function create()
    {
        return Inertia::render('admin/users/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'contact_number' => 'required',
            'password' => 'required|confirmed|min:8',
            'daycare_id' => 'required|exists:daycares,id', // this must be here
        ]);


        User::create([
            ...$validated,
            'account_type' => 'teacher',
            'daycare_id' => $validated['daycare_id'],
            'status' => 'active',
            'contact_number' => $validated['contact_number'],
            'password' => bcrypt($validated['password']),
        ]);

        return redirect()->route('admin.users.management')->with('success', 'Teacher account created.');
    }



    public function approve($id)
    {
        $user = User::where('account_type', 'parent')->findOrFail($id);

        if ($user->status === 'pending') {
            $user->status = 'active';
            $user->save();
        }

        return redirect()->back()->with('success', 'Parent account approved.');
    }

    public function reject($id)
    {
        $user = User::where('account_type', 'parent')->findOrFail($id);

        if ($user->status === 'pending') {
            $user->status = 'rejected';
            $user->save();
        }

        return redirect()->back()->with('success', 'Parent account rejected.');
    }

}
