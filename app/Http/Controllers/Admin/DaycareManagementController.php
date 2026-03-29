<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Daycare;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class DaycareManagementController extends Controller
{
    public function index()
    {
        $daycares = Daycare::with([
            // 🚀 FIX: Filter the students first, THEN load their section!
            'students' => function ($query) {
                $query->where('status', 'Active')->with('section');
            },
            'sections'

        ])
            ->withCount([
                'students as current_enrollment' => function ($query) {
                    $query->where('status', 'Active');
                }
            ])
            ->get();

        $teachers = User::where('role', 'teacher')
            ->where('status', 'active')
            ->get(['first_name', 'middle_name', 'last_name']);

        $availableTeachers = $teachers->map(function ($user) {
            return trim("{$user->first_name} {$user->middle_name} {$user->last_name}");
        })->toArray();

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
            // 🚀 REMOVED: current_enrollment
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
            // 🚀 REMOVED: current_enrollment
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
