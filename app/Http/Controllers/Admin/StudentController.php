<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Daycare;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

// 👇 1. IMPORT THE EVENT HERE
use App\Events\StudentUpdated;

class StudentController extends Controller
{
    /**
     * Display the student management page.
     */
    public function index()
    {
        $students = Student::withTrashed()->with('daycare:id,name', 'parents')->get();
        $daycares = Daycare::all(['id', 'name']);
        $parents = User::where('role', 'parent')
            ->select('id', 'first_name', 'middle_name', 'last_name', 'email')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->full_name,
                'email' => $p->email
            ]);

        return Inertia::render('admin/student-management', [
            'students' => $students,
            'daycares' => $daycares,
            'parents' => $parents,
        ]);
    }

    /**
     * Store a newly created student in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'daycare_name' => 'required|string|exists:daycares,name',
            'nickname' => 'nullable|string|max:255',
            'gender' => 'required|string|max:50',
            'special_needs' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $daycare = Daycare::where('name', $validated['daycare_name'])->first();
        unset($validated['daycare_name']);
        $validated['daycare_id'] = $daycare->id;
        $validated['status'] = 'Active';

        $student = Student::create($validated);

        // 2. BROADCAST CREATE
        broadcast(new StudentUpdated($student, 'create'))->toOthers();

        return Redirect::route('admin.student.index')->with('success', 'Student created successfully.');
    }

    /**
     * Update the specified student in storage.
     */
    public function update(Request $request, $id)
    {
        $student = Student::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'daycare_name' => 'required|string|exists:daycares,name',
            'nickname' => 'nullable|string|max:255',
            'gender' => 'required|string|max:50',
            'special_needs' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $daycare = Daycare::where('name', $validated['daycare_name'])->first();
        unset($validated['daycare_name']);
        $validated['daycare_id'] = $daycare->id;

        $student->update($validated);

        // 3. BROADCAST UPDATE
        broadcast(new StudentUpdated($student, 'update'))->toOthers();

        return Redirect::route('admin.student.index')->with('success', 'Student updated successfully.');
    }

    /**
     * Archive the specified student (Soft Delete).
     */
    public function archive(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Inactive', 'Graduated', 'Transferred'])],
            'reason' => 'nullable|string',
        ]);

        $student->status = $validated['status'];
        $student->notes = $student->notes . "\nArchived Reason: " . $validated['reason'];
        $student->save();
        $student->delete();

        // 👇 4. BROADCAST ARCHIVE
        broadcast(new StudentUpdated($student, 'archive'))->toOthers();

        return Redirect::route('admin.student.index')->with('success', 'Student archived.');
    }

    /**
     * Restore the specified archived student.
     */
    public function restore(Request $request, $id)
    {
        $student = Student::withTrashed()->findOrFail($id);
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Active', 'Inactive', 'Graduated', 'Transferred'])],
        ]);

        $student->restore();
        $student->status = $validated['status'];
        $student->save();

        // 👇 5. BROADCAST RESTORE
        broadcast(new StudentUpdated($student, 'restore'))->toOthers();

        return Redirect::route('admin.student.index')->with('success', 'Student restored.');
    }

    /**
     * Permanently delete the specified student.
     */
    public function permanentDelete($id)
    {
        $student = Student::withTrashed()->findOrFail($id);

        broadcast(new StudentUpdated($student, 'delete'))->toOthers();

        $student->forceDelete();

        return Redirect::route('admin.student.index')->with('success', 'Student permanently deleted.');
    }

    /**
     * Bulk archive multiple students.
     */
    public function bulkArchive(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:students,id',
            'status' => ['required', Rule::in(['Inactive', 'Graduated', 'Transferred'])],
            'reason' => 'nullable|string',
        ]);

        // Fetch students first to broadcast individually
        $students = Student::whereIn('id', $validated['ids'])->get();

        foreach ($students as $student) {
            $student->status = $validated['status'];
            $student->save();
            $student->delete();

            // 👇 6. BROADCAST EACH ARCHIVE
            broadcast(new StudentUpdated($student, 'archive'))->toOthers();
        }

        return Redirect::route('admin.student.index')->with('success', 'Students archived.');
    }

    /**
     * Bulk restore multiple students.
     */
    public function bulkRestore(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
            'status' => ['required', Rule::in(['Active', 'Inactive', 'Graduated', 'Transferred'])],
        ]);

        $students = Student::withTrashed()->whereIn('id', $validated['ids'])->get();

        foreach ($students as $student) {
            $student->restore();
            $student->status = $validated['status'];
            $student->save();

            // 👇 7. BROADCAST EACH RESTORE
            broadcast(new StudentUpdated($student, 'restore'))->toOthers();
        }

        return Redirect::route('admin.student.index')->with('success', 'Students restored.');
    }

    /**
     * Bulk permanently delete multiple students.
     */
    public function bulkPermanentDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);

        $students = Student::withTrashed()->whereIn('id', $validated['ids'])->get();

        foreach ($students as $student) {
            // 👇 8. BROADCAST EACH DELETE
            broadcast(new StudentUpdated($student, 'delete'))->toOthers();
            $student->forceDelete();
        }

        return Redirect::route('admin.student.index')->with('success', 'Students permanently deleted.');
    }

    public function linkParent(Request $request, $id)
    {
        $request->validate([
            'parent_id' => 'required|exists:users,id',
        ]);

        $student = Student::findOrFail($id);
        $student->parents()->syncWithoutDetaching([
            $request->parent_id => ['relationship' => 'Parent', 'is_primary' => true]
        ]);

        if ($student->status === 'Pending') {
            $student->update(['status' => 'Active']);
        }

        // Broadcast update since parent/status changed
        broadcast(new StudentUpdated($student, 'update'))->toOthers();

        return redirect()->back()->with('success', 'Parent linked successfully.');
    }

    /**
     * Bulk Import Students via CSV
     */
    public function bulkImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);

        $importedCount = 0;
        $errors = [];
        $rowNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;
            $firstName = $row[0] ?? null;
            $middleName = $row[1] ?? null;
            $lastName = $row[2] ?? null;
            $dob = $row[3] ?? null;
            $gender = $row[4] ?? null;
            $daycareName = $row[5] ?? null;

            if (!$firstName || !$lastName || !$dob || !$daycareName) {
                $errors[] = "Row {$rowNumber}: Missing required fields.";
                continue;
            }

            $daycare = Daycare::where('name', 'LIKE', trim($daycareName))->first();

            if (!$daycare) {
                $errors[] = "Row {$rowNumber}: Daycare '{$daycareName}' not found.";
                continue;
            }

            try {
                $student = Student::create([
                    'first_name' => trim($firstName),
                    'middle_name' => $middleName ? trim($middleName) : null,
                    'last_name' => trim($lastName),
                    'date_of_birth' => \Carbon\Carbon::parse($dob)->format('Y-m-d'),
                    'gender' => ucfirst(strtolower(trim($gender))),
                    'daycare_id' => $daycare->id,
                    'status' => 'Active',
                    'access_code' => strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1)) . '-' . rand(1000, 9999),
                ]);
                $importedCount++;

                // 👇 9. BROADCAST IMPORTED STUDENT
                broadcast(new StudentUpdated($student, 'create'))->toOthers();

            } catch (\Exception $e) {
                $errors[] = "Row {$rowNumber}: Invalid data format (Check Date or Duplicates).";
            }
        }

        fclose($handle);

        $message = "Successfully imported {$importedCount} students.";
        if (count($errors) > 0) {
            $message .= " " . count($errors) . " rows failed.";
        }

        return redirect()->back()->with('success', $message)->with('import_errors', $errors);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $student->status = 'Inactive';
        $student->save();
        $student->delete();

        // 👇 10. BROADCAST DESTROY (ARCHIVE)
        broadcast(new StudentUpdated($student, 'archive'))->toOthers();

        return Redirect::route('admin.student.index')->with('success', 'Student moved to archive.');
    }
}
