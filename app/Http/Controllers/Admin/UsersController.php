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

        $applyFilters = function ($query) use ($search, $status, $daycare) {
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($status !== 'all') {
                $query->where('status', $status);
            }

            if ($daycare !== 'all') {
                $query->where(function ($q) use ($daycare) {
                    $q->whereHas('daycare', fn($d) => $d->where('name', $daycare))
                        ->orWhereHas('students.daycare', fn($d) => $d->where('name', $daycare));
                });
            }
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
            'email' => 'required|email|unique:users,email',
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

                // 🚀 Sync with the new JSON array column
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
                Rule::unique('users')->ignore($user->id),
            ],
            'phone' => 'required',
            'daycare_id' => 'required|exists:daycares,id',
            'status' => 'required|in:Active,Pending,Inactive',
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->daycareCenter) {
            $daycare = $user->daycareCenter;

            // Clean up old column
            if ($daycare->principal_name === $user->full_name) {
                $daycare->principal_name = null;
            }

            // 🚀 Clean up new JSON array column
            $currentTeachers = is_array($daycare->teachers) ? $daycare->teachers : [];
            if (($key = array_search($user->full_name, $currentTeachers)) !== false) {
                unset($currentTeachers[$key]);
                $daycare->teachers = array_values($currentTeachers); // re-index array
            }

            $daycare->save();
        }

        $user->delete();

        return Redirect::back()->with('success', 'User deleted successfully.');
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

    // 🚀 NEW: Strict Assignment Logic Added Here!
    public function getTeacherList(Request $request): JsonResponse
    {
        // Check if the frontend passed a specific daycare ID that we are currently editing
        $currentDaycareId = $request->query('daycare_id');

        // 1. Find all daycares EXCEPT the one we are editing
        $query = Daycare::query();
        if ($currentDaycareId) {
            $query->where('id', '!=', $currentDaycareId);
        }

        // 2. Get all teachers currently assigned to those other daycares
        $assignedTeachers = $query->pluck('teachers')
            ->flatten()
            ->filter()
            ->unique()
            ->toArray();

        // 3. Fetch all active users with the 'teacher' role
        $activeTeachers = User::where('role', 'teacher')
            ->where('status', 'active')
            ->get(['id', 'first_name', 'middle_name', 'last_name']);

        // 4. Map to full_name and EXCLUDE the ones already assigned elsewhere
        $availableTeacherNames = $activeTeachers
            ->map(function ($user) {
                return $user->full_name;
            })
            ->reject(function ($fullName) use ($assignedTeachers) {
                return in_array($fullName, $assignedTeachers);
            })
            ->values() // Reset array keys after rejecting
            ->toArray();

        return response()->json([
            'teachers' => $availableTeacherNames
        ]);
    }
}
