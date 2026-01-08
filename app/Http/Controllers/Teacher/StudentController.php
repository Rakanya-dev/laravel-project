<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Daycare;
use App\Models\Assessment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Auth\Access\AuthorizationException;

// 1. IMPORT THE EVENT
use App\Events\StudentUpdated;

class StudentController extends Controller
{
    /**
     * Helper function to get the teacher's daycare ID.
     */
    private function getTeacherDaycareId()
    {
        $daycareId = Auth::user()->daycare_id;
        if (!$daycareId) {
            throw new AuthorizationException('User is not assigned to a daycare.');
        }
        return $daycareId;
    }

    /**
     * Display the "My Students" management page.
     */
    public function index()
    {
        $daycareId = $this->getTeacherDaycareId();
        $teacher = Auth::user();

        $daycare = Daycare::where('id', $daycareId)->first(['id', 'name']);

        // Fetch Students
        $students = Student::where('daycare_id', $daycareId)
            ->withTrashed()
            ->with('daycare:id,name', 'parents')
            ->get();

        $studentIds = $students->pluck('id');

        // Fetch Assessments
        $assessments = Assessment::whereIn('student_id', $studentIds)
            ->orderBy('assessment_date', 'desc')
            ->get();

        $daycareList = $daycare ? [$daycare->name] : [];

        // Statistics
        $totalStudents = $students->whereNull('deleted_at')->count();
        $completedAssessments = $assessments->where('status', 'Completed')->count();
        $assessmentsDue = max(0, $totalStudents - $completedAssessments);
        $classAverage = $assessments->where('status', 'Completed')->avg('overall_score') ?? 0;

        return Inertia::render('teacher/my-students', [
            'students' => $students,
            'assessments' => $assessments,
            'daycareName' => $daycare ? $daycare->name : 'Unassigned',
            'daycareList' => $daycareList,
            'teacherName' => $teacher->first_name . ' ' . $teacher->last_name,
            'totalStudents' => $totalStudents,
            'assessmentsDue' => $assessmentsDue,
            'completedAssessments' => $completedAssessments,
            'classAverage' => round($classAverage, 1),
        ]);
    }

    /**
     * Store a newly created student.
     */
    public function store(Request $request)
    {
        $daycareId = $this->getTeacherDaycareId();

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string|max:50',
            'nickname' => 'nullable|string|max:255',
            'special_needs' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $initials = strtoupper(substr($validated['first_name'], 0, 1) . substr($validated['last_name'], 0, 1));
        $code = $initials . '-' . rand(1000, 9999);

        // Ensure uniqueness
        while (Student::where('access_code', $code)->exists()) {
            $code = $initials . '-' . rand(1000, 9999);
        }

        $student = Student::create([
            ...$validated,
            'daycare_id' => $daycareId,
            'status' => 'Active',
            'access_code' => $code,
        ]);

        // 2. BROADCAST CREATE
        broadcast(new StudentUpdated($student, 'create'))->toOthers();

        return Redirect::route('teacher.my-students.index')->with('success', 'Student created successfully.');
    }

    /**
     * Update the specified student.
     */
    public function update(Request $request, $id)
    {
        $daycareId = $this->getTeacherDaycareId();
        $student = Student::withTrashed()->where('daycare_id', $daycareId)->findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string|max:50',
            'nickname' => 'nullable|string|max:255',
            'special_needs' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $student->update($validated);

        //  3. BROADCAST UPDATE
        broadcast(new StudentUpdated($student, 'update'))->toOthers();

        return Redirect::route('teacher.my-students.index')->with('success', 'Student updated successfully.');
    }

    /**
     * Archive the specified student (Soft Delete).
     */
    public function archive(Request $request, $id)
    {
        $daycareId = $this->getTeacherDaycareId();
        $student = Student::where('daycare_id', $daycareId)->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['Inactive', 'Graduated', 'Transferred'])],
            'reason' => 'nullable|string',
        ]);

        $student->status = $validated['status'];
        $student->notes = $validated['reason'];
        $student->save();
        $student->delete();

        //  4. BROADCAST ARCHIVE
        broadcast(new StudentUpdated($student, 'archive'))->toOthers();

        return Redirect::route('teacher.my-students.index')->with('success', 'Student archived.');
    }

    /**
     * Restore the specified archived student.
     */
    public function restore(Request $request, $id)
    {
        $daycareId = $this->getTeacherDaycareId();
        $student = Student::withTrashed()->where('daycare_id', $daycareId)->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['Active', 'Inactive', 'Graduated', 'Transferred'])],
        ]);

        $student->restore();
        $student->status = $validated['status'];
        $student->notes = null;
        $student->save();

        //  5. BROADCAST RESTORE
        broadcast(new StudentUpdated($student, 'restore'))->toOthers();

        return Redirect::route('teacher.my-students.index')->with('success', 'Student restored.');
    }

    /**
     * Permanently delete the specified student.
     */
    public function permanentDelete($id)
    {
        $daycareId = $this->getTeacherDaycareId();
        $student = Student::withTrashed()->where('daycare_id', $daycareId)->findOrFail($id);

        // Broadcast BEFORE deleting so clients know to remove it
        broadcast(new StudentUpdated($student, 'delete'))->toOthers();

        $student->forceDelete();

        return Redirect::route('teacher.my-students.index')->with('success', 'Student permanently deleted.');
    }

    /**
     * Bulk archive multiple students.
     */
    public function bulkArchive(Request $request)
    {
        $daycareId = $this->getTeacherDaycareId();

        // Validate
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:students,id',
            'items.*.status' => ['required', Rule::in(['Inactive', 'Graduated', 'Transferred'])],
            'reason' => 'nullable|string',
        ]);

        foreach ($validated['items'] as $item) {
            $student = Student::where('daycare_id', $daycareId)->find($item['id']);
            if ($student) {
                $student->status = $item['status'];
                $student->notes = $request->reason;

                $student->save();
                $student->delete();

                //  6. BROADCAST EACH ARCHIVE
                broadcast(new StudentUpdated($student, 'archive'))->toOthers();
            }
        }

        return Redirect::route('teacher.my-students.index')->with('success', count($validated['items']) . ' students archived.');
    }

    public function bulkRestore(Request $request)
    {
        $daycareId = $this->getTeacherDaycareId();
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
            'status' => ['required', Rule::in(['Active', 'Inactive', 'Graduated', 'Transferred'])],
        ]);

        // Get the students to iterate and broadcast
        $students = Student::withTrashed()
            ->where('daycare_id', $daycareId)
            ->whereIn('id', $validated['ids'])
            ->get();

        foreach($students as $student) {
             $student->restore();
             $student->status = $validated['status'];
             $student->notes = null;
             $student->save();

             //  7. BROADCAST EACH RESTORE
             broadcast(new StudentUpdated($student, 'restore'))->toOthers();
        }

        return Redirect::route('teacher.my-students.index')->with('success', 'Students restored.');
    }

    /**
     * Bulk permanently delete multiple students.
     */
    public function bulkPermanentDelete(Request $request)
    {
        $daycareId = $this->getTeacherDaycareId();
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);

        $students = Student::withTrashed()
            ->where('daycare_id', $daycareId)
            ->whereIn('id', $validated['ids'])
            ->get();

        foreach($students as $student) {
             // 👇 8. BROADCAST EACH DELETE
             broadcast(new StudentUpdated($student, 'delete'))->toOthers();
             $student->forceDelete();
        }

        return Redirect::route('teacher.my-students.index')->with('success', 'Students permanently deleted.');
    }

    public function regenerateCode($id)
    {
        $daycareId = $this->getTeacherDaycareId();
        $student = Student::where('daycare_id', $daycareId)->findOrFail($id);

        // Generate new code
        $initials = strtoupper(substr($student->first_name, 0, 1) . substr($student->last_name, 0, 1));
        if (empty($initials))
            $initials = 'ST';

        $newCode = $initials . '-' . rand(1000, 9999);

        // Ensure unique
        while (Student::where('access_code', $newCode)->exists()) {
            $newCode = $initials . '-' . rand(1000, 9999);
        }

        $student->update(['access_code' => $newCode]);

        // Broadcast update
        broadcast(new StudentUpdated($student, 'update'))->toOthers();

        return back()->with('success', 'New access code generated: ' . $newCode);
    }

    public function printCodes()
    {
        $daycareId = $this->getTeacherDaycareId();
        $daycare = Daycare::find($daycareId);

        // Fetch only active students who HAVE a code
        $students = Student::where('daycare_id', $daycareId)
            ->whereNotNull('access_code')
            ->where('status', '!=', 'Inactive')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'middle_name', 'last_name', 'access_code']);

        return Inertia::render('teacher/print-students', [
            'students' => $students,
            'daycareName' => $daycare->name,
        ]);
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

                //  9. BROADCAST IMPORTED STUDENT
                broadcast(new StudentUpdated($student, 'create'))->toOthers();

            } catch (\Exception $e) {
                $errors[] = "Row {$rowNumber}: Invalid data format (Check Date or Duplicates).";
            }
        }

        fclose($handle);

        $message = "Successfully imported {$importedCount} students.";
        if (count($errors) > 0) {
            $message .= " " . count($errors) . " rows failed. Check console or logs.";
        }

        return redirect()->back()->with('success', $message)->with('import_errors', $errors);
    }
}
