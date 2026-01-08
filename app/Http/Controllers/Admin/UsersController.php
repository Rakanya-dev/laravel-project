<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Daycare;
use App\Models\Student; // 👈 1. Import Student Model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Exports\UsersExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Redirect;

class UsersController extends Controller
{
    public function index()
    {
        $teachers = User::with('daycare:id,name')
            ->where('role', 'teacher')
            ->paginate(10);

        // 2. Select specific fields to see the "Claim"
        $parents = User::with(['daycare:id,name', 'students'])
            ->where('role', 'parent')
            ->select('id', 'first_name', 'last_name', 'email', 'status', 'role', 'phone', 'daycare_id')
            ->paginate(10);

        // 3. Get Pending Requests
        $pendingRequests = DB::table('student_parent')
            ->join('users', 'student_parent.parent_id', '=', 'users.id')
            ->join('students', 'student_parent.student_id', '=', 'students.id')
            ->where('student_parent.status', 'Pending')
            ->select(
                'student_parent.id as link_id',
                'users.id as parent_id',
                'users.first_name as parent_first',
                'users.last_name as parent_last',
                'users.email as parent_email',
                'students.first_name as child_first',
                'students.last_name as child_last',
                'student_parent.created_at'
            )
            ->get();
        $daycares = Daycare::all(['id', 'name']);

        // 3. Get all students for the dropdown list in the Approval Modal
        $students = Student::select('id', 'first_name', 'last_name')->get();

        return Inertia::render('admin/users-management', [
            'teachers' => $teachers,
            'parents' => $parents,
            'daycares' => $daycares,
            'students' => $students,
            'pendingRequests' => $pendingRequests,
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
        ]);

        $newUser = User::create([
            ...$validated,
            'role' => 'teacher',
            'daycare_id' => $validated['daycare_id'],
            'status' => 'active',
            'phone' => $validated['phone'],
            'password' => bcrypt($validated['password']),
        ]);

        $daycare = Daycare::find($validated['daycare_id']);

        if ($daycare) {
            $daycare->principal_name = $newUser->full_name;
            $daycare->save();
        }

        return redirect()->route('admin.users.management')->with('success', 'Teacher account created.');
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
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->daycare && $user->daycare->principal_name === $user->full_name) {
            $user->daycare->principal_name = null;
            $user->daycare->save();
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

    public function getTeacherList(): JsonResponse
    {
        $teachers = User::where('role', 'teacher')
            ->where('status', 'active')
            ->get(['id', 'first_name', 'middle_name', 'last_name']);

        $teacherNames = $teachers->map(function ($user) {
            return $user->full_name;
        })->toArray();

        return response()->json([
            'teachers' => $teacherNames
        ]);
    }

    public function approveRequest($linkId)
    {
        // 1. Find the Link Record
        $link = DB::table('student_parent')->where('id', $linkId)->first();

        if ($link) {
            // A. Approve the Link (The Connection)
            // This makes "parentLinked: true" on Student Management
            DB::table('student_parent')
                ->where('id', $linkId)
                ->update(['status' => 'Active']);

            // B. Approve the Parent Account (The User)
            // This allows them to log in
            User::where('id', $link->parent_id)->update(['status' => 'Active']);

            // C. Approve the Student (The Profile)
            // If this was a brand new student (Path C in Register), they are hidden as 'Pending'.
            // This reveals them on the Student Management list.
            Student::where('id', $link->student_id)
                ->where('status', 'Pending')
                ->update(['status' => 'Active']);
        }

        return back()->with('success', 'Parent account and Student link approved successfully.');
    }

    public function rejectRequest($id)
    {
        DB::table('student_parent')
            ->where('id', $id)
            ->delete();

        return back()->with('success', 'Request rejected.');
    }
}
