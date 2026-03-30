<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Daycare;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DaycareManagementController extends Controller
{
    public function index()
    {
        // 🚀 OPTIMIZATION: Used PHP arrow functions for cleaner, faster execution in memory
        $daycares = Daycare::with([
            'students' => fn ($query) => $query->where('status', 'Active')->with('section'),
            'sections'
        ])
        ->withCount([
            'students as current_enrollment' => fn ($query) => $query->where('status', 'Active')
        ])
        ->get();

        // 🚀 OPTIMIZATION: Added a filter to prevent "Double Spaces" if a teacher has no middle name.
        // Also used `values()` to ensure it stays a clean JavaScript array.
        $availableTeachers = User::where('role', 'teacher')
            ->where('status', 'active')
            ->get(['first_name', 'middle_name', 'last_name'])
            ->map(fn($user) => collect([$user->first_name, $user->middle_name, $user->last_name])
                ->filter()
                ->implode(' ')
            )
            ->values()
            ->toArray();

        return Inertia::render('admin/daycare-management', [
            'daycares' => $daycares,
            'availableTeachers' => $availableTeachers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:daycares,name',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'postal_code' => 'nullable|string|max:10',
            'email' => 'required|email|max:255|unique:daycares,email',
            'phone' => 'required|string|max:20',
            'principal_name' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'established_date' => 'nullable|date',
            'teachers' => 'nullable|array',
            'teachers.*' => 'string|max:255',
        ]);

        Daycare::create($validated);

        return Redirect::route('admin.daycare.index')->with('success', 'Daycare created successfully.');
    }

    public function update(Request $request, Daycare $daycare)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('daycares', 'name')->ignore($daycare->id)],
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'postal_code' => 'nullable|string|max:10',
            'email' => ['required', 'email', 'max:255', Rule::unique('daycares', 'email')->ignore($daycare->id)],
            'phone' => 'required|string|max:20',
            'principal_name' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'established_date' => 'nullable|date',
            'teachers' => 'nullable|array',
            'teachers.*' => 'string|max:255',
        ]);

        $daycare->update($validated);

        return Redirect::back()->with('success', 'Daycare updated successfully.');
    }

    public function destroy(Daycare $daycare)
    {
        $daycare->delete();

        return Redirect::route('admin.daycare.index')->with('success', 'Daycare deleted successfully.');
    }
}
