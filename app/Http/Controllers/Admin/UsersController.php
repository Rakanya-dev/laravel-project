<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Daycare;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Exports\UsersExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Redirect;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $status = $request->query('status', 'all');
        $daycare = $request->query('daycare', 'all');

        // 🚀 OPTIMIZATION: Used Laravel's when() for cleaner conditional querying
        $applyFilters = function ($query) use ($search, $status, $daycare) {
            $query->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
                ->when($status !== 'all', fn($q) => $q->where('status', $status))
                ->when($daycare !== 'all', function ($q) use ($daycare) {
                    $q->where(function ($sub) use ($daycare) {
                        $sub->whereHas('daycare', fn($d) => $d->where('name', $daycare))
                            ->orWhereHas('students.daycare', fn($d) => $d->where('name', $daycare));
                    });
                });
        };

        // 1. Fetch Teachers
        $teachers = User::with('daycare:id,name')
            ->where('role', 'teacher')
            ->where($applyFilters)
            ->latest()
            ->paginate(10, ['*'], 'teachers_page')
            ->withQueryString();

        // 2. Fetch Parents
        $parents = User::with(['daycare', 'students.daycare'])
            ->where('role', 'parent')
            ->where($applyFilters)
            ->latest()
            ->paginate(10, ['*'], 'parents_page')
            ->withQueryString();

        $daycares = Daycare::all(['id', 'name']);

        return Inertia::render('admin/users-management', [
            'teachers' => $teachers,
            'parents' => $parents,
            'daycares' => $daycares,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'required|string',
            'email' => ['required', 'email', Rule::unique('users')->whereNull('deleted_at')],
            'phone' => 'required',
            'password' => 'required|confirmed|min:8',
            'daycare_id' => 'required|exists:daycares,id',
            'role' => 'required|in:teacher,parent',
        ]);

        $newUser = User::create([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'daycare_id' => $validated['daycare_id'],
            'role' => $validated['role'],
            'status' => 'Active',
            'password' => bcrypt($validated['password']),
        ]);

        if ($validated['role'] === 'teacher') {
            $daycare = Daycare::find($validated['daycare_id']);
            if ($daycare) {
                // Keep old column for backward compatibility
                $daycare->principal_name = $newUser->full_name;

                // Sync with the new JSON array column
                $currentTeachers = is_array($daycare->teachers) ? $daycare->teachers : [];
                if (!in_array($newUser->full_name, $currentTeachers)) {
                    $currentTeachers[] = $newUser->full_name;
                    $daycare->teachers = $currentTeachers;
                }

                $daycare->save();
            }
        }

        return redirect()->route('admin.users.management')->with(
            'success',
            ucfirst($validated['role']) . ' account created successfully.'
        );
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'required|string',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($user->id)->whereNull('deleted_at'),
            ],
            'phone' => 'required',
            'daycare_id' => 'required|exists:daycares,id',
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // 1. TEACHER CLEANUP: Remove them from the Daycare JSON arrays
        // 🚀 FIXED: Changed 'daycareCenter' to 'daycare' to match your relationship
        if ($user->role === 'teacher' && $user->daycare) {
            $daycare = $user->daycare;

            if ($daycare->principal_name === $user->full_name) {
                $daycare->principal_name = null;
            }

            $currentTeachers = is_array($daycare->teachers) ? $daycare->teachers : [];
            $daycare->teachers = array_values(array_diff($currentTeachers, [$user->full_name]));
            $daycare->save();
        }

        // 2. PARENT CLEANUP: Handle the orphaned students problem
        if ($user->role === 'parent') {
            // Option A: Stop the deletion and warn the admin (Safest)
            if ($user->students()->count() > 0) {
                return Redirect::back()->withErrors([
                    'error' => 'Cannot delete this parent because they have enrolled students. Please remove the students first.'
                ]);
            }

            // Option B: (Alternative) Automatically delete the parent's students too
            // If you prefer this, comment out Option A and uncomment the line below:
            // $user->students()->delete();
        }

        // 3. Finally, delete the user
        $user->delete();

        return Redirect::back()->with('success', ucfirst($user->role) . ' deleted successfully.');
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

    public function getTeacherList(Request $request): JsonResponse
    {
        $currentDaycareId = $request->query('daycare_id');

        // 1. Get all teachers currently assigned to other daycares
        // 🚀 OPTIMIZATION: Used when() to avoid an if-statement wrapper
        $assignedTeachers = Daycare::when($currentDaycareId, fn($q) => $q->where('id', '!=', $currentDaycareId))
            ->pluck('teachers')
            ->flatten()
            ->filter()
            ->unique()
            ->toArray();

        // 2. Fetch all active users with the 'teacher' role, and immediately
        // 🚀 OPTIMIZATION: Used Collections pluck()->diff() to extract available names instantly
        $availableTeacherNames = User::where('role', 'teacher')
            ->where('status', 'active')
            ->get(['id', 'first_name', 'middle_name', 'last_name'])
            ->pluck('full_name') // Plucks the accessor!
            ->diff($assignedTeachers) // Removes the ones already assigned
            ->values() // Re-indexes the array cleanly
            ->toArray();

        return response()->json([
            'teachers' => $availableTeacherNames
        ]);
    }
}
