<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Daycare;
use App\Models\User;
use App\Models\Section;
use App\Models\EnrollmentRequest;
use App\Models\GuardianRequest;
use App\Models\Assessment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
// 👇 1. IMPORT THE EVENT HERE
use App\Events\StudentUpdated;

class StudentController extends Controller
{
    /**
     * Display the student management page.
     */
    public function index()
    {
        // PERFECT: Eager loading daycare, parents, and section directly stops N+1 lag on load!
        $students = Student::withTrashed()->with('daycare:id,name', 'parents', 'section:id,name')->get();
        $daycares = Daycare::all(['id', 'name']);

        // Fetch Sections so the Admin can assign them during approval
        $sections = Section::select('id', 'name', 'daycare_id', 'capacity')
            ->withCount('students')
            ->get();

        // Fetch Pending Enrollments
        $pendingEnrollments = EnrollmentRequest::with(['user:id,first_name,last_name,email', 'daycare:id,name'])
            ->where('status', 'Pending')
            ->get();

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
            'sections' => $sections,
            'pendingEnrollments' => $pendingEnrollments,
        ]);
    }

    /**
     * Approve Enrollment & Assign Section (Handles BOTH New Students and PIN Links)
     */
    public function approveEnrollment(Request $request, $id)
    {
        $enrollment = EnrollmentRequest::findOrFail($id);

        // 🚀 FIX 1: THE DOUBLE-CLICK GUARD
        if ($enrollment->status === 'Approved') {
            return redirect()->back()->with('error', 'This application has already been processed.');
        }

        if ($enrollment->student_id) {
            // SCENARIO 1: LINKING AN EXISTING CHILD (Via Secret PIN)
            $student = Student::findOrFail($enrollment->student_id);

            $student->parents()->syncWithoutDetaching([
                $enrollment->user_id => ['relationship' => 'Parent', 'is_primary' => false]
            ]);

            $student->update(['access_code' => null]);

            $message = 'Parent verified and officially linked! Documents securely deleted.';
            $broadcastType = 'update';

        } else {
            // SCENARIO 2: BRAND NEW ENROLLMENT (Website Application)
            $request->validate([
                'section_id' => 'required|exists:sections,id',
            ]);

            // 🚀 FIX 2: THE "ALREADY EXISTS" GUARD
            $student = Student::where('first_name', $enrollment->first_name)
                ->where('last_name', $enrollment->last_name)
                ->where('date_of_birth', $enrollment->date_of_birth)
                ->first();

            if (!$student) {
                $student = Student::create([
                    'daycare_id' => $enrollment->daycare_id,
                    'section_id' => $request->section_id,
                    'first_name' => $enrollment->first_name,
                    'middle_name' => $enrollment->middle_name,
                    'last_name' => $enrollment->last_name,
                    'date_of_birth' => $enrollment->date_of_birth,
                    'gender' => $enrollment->gender,
                    'status' => 'Active',
                    'access_code' => null,
                ]);
                $broadcastType = 'create';
            } else {
                $student->update([
                    'section_id' => $request->section_id,
                    'access_code' => null
                ]);
                $broadcastType = 'update';
            }

            $student->parents()->syncWithoutDetaching([
                $enrollment->user_id => ['relationship' => 'Parent', 'is_primary' => true]
            ]);

            $message = 'Student approved, assigned to section, and documents securely destroyed.';
        }

        // SECURE DATA DELETION
        if ($enrollment->birth_cert_path) {
            Storage::delete($enrollment->birth_cert_path);
        }
        if ($enrollment->parent_id_path) {
            Storage::delete($enrollment->parent_id_path);
        }

        $enrollment->update([
            'status' => 'Approved',
            'student_id' => $student->id
        ]);

        broadcast(new StudentUpdated($student, $broadcastType))->toOthers();

        return redirect()->back()->with('success', $message);
    }

    public function viewSecureDoc($type, $filename)
    {
        $path = "private_docs/{$type}/{$filename}";

        if (!Storage::exists($path)) {
            abort(404, 'Document not found on server.');
        }

        return Storage::response($path);
    }

    /**
     * Reject Enrollment
     */
    public function rejectEnrollment(Request $request, $id)
    {
        $enrollment = EnrollmentRequest::findOrFail($id);

        Storage::delete($enrollment->birth_cert_path);
        Storage::delete($enrollment->parent_id_path);

        $enrollment->update(['status' => 'Rejected']);

        return redirect()->back()->with('success', 'Application rejected and documents securely deleted.');
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
            'section_id' => 'required|exists:sections,id',
            'nickname' => 'nullable|string|max:255',
            'gender' => 'required|string|max:50',
            'special_needs' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $daycare = Daycare::where('name', $validated['daycare_name'])->first();
        unset($validated['daycare_name']);

        $validated['daycare_id'] = $daycare->id;
        $validated['access_code'] = $this->generateUniqueAccessCode();
        $validated['status'] = 'Active';

        $student = Student::create($validated);

        broadcast(new StudentUpdated($student, 'create'))->toOthers();

        return Redirect::route('admin.student.index')->with([
            'success' => 'Student created successfully.',
            'new_access_code' => $validated['access_code'],
            'student_name' => $student->first_name . ' ' . $student->last_name,
        ]);
    }

    private function generateUniqueAccessCode()
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (Student::where('access_code', $code)->exists());

        return $code;
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
            'section_id' => 'required|exists:sections,id',
            'nickname' => 'nullable|string|max:255',
            'gender' => 'required|string|max:50',
            'special_needs' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $daycare = Daycare::where('name', $validated['daycare_name'])->first();
        unset($validated['daycare_name']);

        $validated['daycare_id'] = $daycare->id;

        $student->update($validated);

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
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:students,id',
            'status' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $students = Student::whereIn('id', $request->ids)->get();

        foreach ($students as $student) {
            $student->status = $request->status;
            $student->archive_reason = $request->reason;
            $student->save();
            $student->delete();

            broadcast(new StudentUpdated($student, 'archive'))->toOthers();
        }

        return back()->with('success', 'Students bulk archived successfully.');
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

        // 🚀 OPTIMIZATION: Load Daycares ONCE into memory instead of querying for every row!
        // This prevents the N+1 lag spike when importing large CSV files.
        $daycareDictionary = Daycare::select('id', 'name')->get()->mapWithKeys(function ($item) {
            return [strtolower(trim($item->name)) => $item->id];
        });

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

            $searchKey = strtolower(trim($daycareName));

            // 🚀 Now it instantly checks memory instead of hitting the database
            if (!isset($daycareDictionary[$searchKey])) {
                $errors[] = "Row {$rowNumber}: Daycare '{$daycareName}' not found.";
                continue;
            }

            $daycareId = $daycareDictionary[$searchKey];

            try {
                $student = Student::create([
                    'first_name' => trim($firstName),
                    'middle_name' => $middleName ? trim($middleName) : null,
                    'last_name' => trim($lastName),
                    'date_of_birth' => \Carbon\Carbon::parse($dob)->format('Y-m-d'),
                    'gender' => ucfirst(strtolower(trim($gender))),
                    'daycare_id' => $daycareId,
                    'status' => 'Active',
                    'access_code' => strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1)) . '-' . rand(1000, 9999),
                ]);
                $importedCount++;

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

        broadcast(new StudentUpdated($student, 'archive'))->toOthers();

        return Redirect::route('admin.student.index')->with('success', 'Student moved to archive.');
    }

    public function approveLinkRequest($id)
    {
        $linkRequest = GuardianRequest::findOrFail($id);

        DB::table('student_parent')->insert([
            'student_id' => $linkRequest->student_id,
            'parent_id' => $linkRequest->user_id,
            'relationship' => 'Parent',
            'is_primary' => false,
            'status' => 'Active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Storage::delete([$linkRequest->birth_cert_path, $linkRequest->parent_id_path]);

        $linkRequest->update([
            'status' => 'Approved',
            'birth_cert_path' => null,
            'parent_id_path' => null,
        ]);

        $student = Student::find($linkRequest->student_id);
        if ($student) {
            $student->update(['access_code' => null]);
        }

        return redirect()->back()->with('success', 'Parent verified and officially linked! Documents securely deleted.');
    }

    public function showSecureDoc($folder, $filename)
    {
        if (!in_array($folder, ['birth_certs', 'parent_ids'])) {
            abort(404, 'Invalid folder.');
        }

        $path = 'documents/' . $folder . '/' . $filename;

        if (!Storage::disk('local')->exists($path)) {
            abort(404, 'File not found at: ' . $path);
        }

        return Storage::disk('local')->response($path);
    }

    public function printReport($id)
    {
        // PERFORMANCE: Using Eager Loading correctly here!
        $student = Student::withTrashed()
            ->with(['daycare', 'parents'])
            ->findOrFail($id);

        if ($student->date_of_birth) {
            $student->formatted_age = Carbon::parse($student->date_of_birth)->age . ' yrs old';
        } else {
            $student->formatted_age = 'N/A';
        }

        // PERFORMANCE: Eager loading the domain and teacher stops N+1 lag on the PDF print
        $assessments = Assessment::where('student_id', $id)
            ->with(['scores.domain', 'teacher'])
            ->orderBy('created_at', 'asc')
            ->get();

        $pdf = Pdf::loadView('exports.report-card-pdf', [
            'student' => $student,
            'assessments' => $assessments
        ]);

        return $pdf->stream($student->last_name . '_Official_ECCD_Report.pdf');
    }
}
