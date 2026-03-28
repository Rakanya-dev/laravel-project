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
            'sections' => $sections, // 👈 PASS SECTIONS TO REACT
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
        // If the admin double-clicks the button, this stops the second click immediately!
        if ($enrollment->status === 'Approved') {
            return redirect()->back()->with('error', 'This application has already been processed.');
        }

        if ($enrollment->student_id) {
            // ---------------------------------------------------------
            // SCENARIO 1: LINKING AN EXISTING CHILD (Via Secret PIN)
            // ---------------------------------------------------------
            $student = Student::findOrFail($enrollment->student_id);

            $student->parents()->syncWithoutDetaching([
                $enrollment->user_id => ['relationship' => 'Parent', 'is_primary' => false]
            ]);

            $student->update(['access_code' => null]);

            $message = 'Parent verified and officially linked! Documents securely deleted.';
            $broadcastType = 'update';

        } else {
            // ---------------------------------------------------------
            // SCENARIO 2: BRAND NEW ENROLLMENT (Website Application)
            // ---------------------------------------------------------
            $request->validate([
                'section_id' => 'required|exists:sections,id',
            ]);

            // 🚀 FIX 2: THE "ALREADY EXISTS" GUARD
            // Search the database to see if a child with this exact name and DOB already exists
            $student = Student::where('first_name', $enrollment->first_name)
                ->where('last_name', $enrollment->last_name)
                ->where('date_of_birth', $enrollment->date_of_birth)
                ->first();

            // Only create a brand new student if they truly DO NOT exist yet!
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
                // If they did already exist, just update their section and remove their PIN!
                $student->update([
                    'section_id' => $request->section_id,
                    'access_code' => null
                ]);
                $broadcastType = 'update';
            }

            // Link the Parent to the Student safely
            $student->parents()->syncWithoutDetaching([
                $enrollment->user_id => ['relationship' => 'Parent', 'is_primary' => true]
            ]);

            $message = 'Student approved, assigned to section, and documents securely destroyed.';
        }

        // ---------------------------------------------------------
        // SHARED CLEANUP (Executes for both scenarios)
        // ---------------------------------------------------------

        // SECURE DATA DELETION
        if ($enrollment->birth_cert_path) {
            Storage::delete($enrollment->birth_cert_path);
        }
        if ($enrollment->parent_id_path) {
            Storage::delete($enrollment->parent_id_path);
        }

        // 🚀 CRITICAL: Update status so the Double-Click Guard works,
        // and link the student_id for your historical records!
        $enrollment->update([
            'status' => 'Approved',
            'student_id' => $student->id
        ]);

        // Broadcast to update the Teacher's screen instantly
        broadcast(new StudentUpdated($student, $broadcastType))->toOthers();

        return redirect()->back()->with('success', $message);
    }

    public function viewSecureDoc($type, $filename)
    {
        $path = "private_docs/{$type}/{$filename}";

        if (!Storage::exists($path)) {
            abort(404, 'Document not found on server.');
        }

        // 👈 This is the safest way to serve private files directly to the browser
        return Storage::response($path);
    }

    /**
     * Reject Enrollment
     */
    public function rejectEnrollment(Request $request, $id)
    {
        $enrollment = EnrollmentRequest::findOrFail($id);

        // We still delete the files if rejected to prevent keeping sensitive data on the server
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
            // 🚀 NEW: Validate the section!
            'section_id' => 'required|exists:sections,id',
            'nickname' => 'nullable|string|max:255',
            'gender' => 'required|string|max:50',
            'special_needs' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $daycare = Daycare::where('name', $validated['daycare_name'])->first();
        unset($validated['daycare_name']);

        $validated['daycare_id'] = $daycare->id;

        // 🚀 NEW: Generate the 6-digit Secret PIN for the parent
        $validated['access_code'] = $this->generateUniqueAccessCode();

        // Note: You can keep this 'Active', or change it to 'Pending' until the parent links their account!
        $validated['status'] = 'Active';

        // 🚀 Ensure section_id is saved!
        $student = Student::create($validated);

        // BROADCAST CREATE
        broadcast(new StudentUpdated($student, 'create'))->toOthers();

        // Pass the generated code back to Inertia so the Admin can see it on screen
        return Redirect::route('admin.student.index')->with([
            'success' => 'Student created successfully.',
            'new_access_code' => $validated['access_code'],
            'student_name' => $student->first_name . ' ' . $student->last_name,
        ]);
    }

    // 🚀 NEW: The safety-net function to guarantee 100% unique codes
    private function generateUniqueAccessCode()
    {
        do {
            $code = strtoupper(Str::random(6)); // Generates something like "A7X9WQ"
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
            // 🚀 NEW: Validate the section!
            'section_id' => 'required|exists:sections,id',
            'nickname' => 'nullable|string|max:255',
            'gender' => 'required|string|max:50',
            'special_needs' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $daycare = Daycare::where('name', $validated['daycare_name'])->first();
        unset($validated['daycare_name']);

        $validated['daycare_id'] = $daycare->id;

        // 🚀 Ensure the new section_id is updated in the database
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
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:students,id',
            'status' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        // Find all the selected students
        $students = Student::whereIn('id', $request->ids)->get();

        foreach ($students as $student) {
            // Update their status and reason
            $student->status = $request->status;
            $student->archive_reason = $request->reason;
            $student->save();

            // Soft delete them (moves them to archive)
            $student->delete();

            // 🚀 MOVED INSIDE THE LOOP: Now it broadcasts EVERY student correctly as a Model!
            broadcast(new StudentUpdated($student, 'archive'))->toOthers();
        } // 👈 Notice the broadcast is ABOVE this closing bracket now

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

    public function approveLinkRequest($id)
    {
        $linkRequest = GuardianRequest::findOrFail($id);

        // 1. Create the official link in your pivot table
        DB::table('student_parent')->insert([
            'student_id' => $linkRequest->student_id,
            'parent_id' => $linkRequest->user_id,
            'relationship' => 'Parent', // Default relationship
            'is_primary' => false, // Can be edited later
            'status' => 'Active', // Instantly gives them dashboard access!
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Nuke the confidential files from the server (RA 10173 Compliance)
        Storage::delete([$linkRequest->birth_cert_path, $linkRequest->parent_id_path]);

        // 3. Mark the request as Approved and clear the file paths
        $linkRequest->update([
            'status' => 'Approved',
            'birth_cert_path' => null, // Clear the path since the file is gone
            'parent_id_path' => null,
        ]);

        // 4. Destroy the Secret PIN so it can never be used again
        $student = Student::find($linkRequest->student_id);
        if ($student) {
            $student->update(['access_code' => null]);
        }

        return redirect()->back()->with('success', 'Parent verified and officially linked! Documents securely deleted.');
    }

    public function showSecureDoc($folder, $filename)
    {
        // 1. Prevent hackers from typing random folder names
        if (!in_array($folder, ['birth_certs', 'parent_ids'])) {
            abort(404, 'Invalid folder.');
        }

        $path = 'documents/' . $folder . '/' . $filename;

        // 2. 🚀 FIX: Explicitly check the 'local' disk so it doesn't get confused
        if (!Storage::disk('local')->exists($path)) {
            // If it still fails, this will tell us exactly what path it is failing to find!
            abort(404, 'File not found at: ' . $path);
        }

        // 3. 🚀 FIX: Explicitly stream from the 'local' disk
        return Storage::disk('local')->response($path);
    }
    public function printReport($id)
    {
        $student = Student::withTrashed()
            ->with(['daycare', 'parents'])
            ->findOrFail($id);

        // 🚀 THE FIX: Calculate and attach the exact variable the Blade file is looking for!
        if ($student->date_of_birth) {
            $student->formatted_age = Carbon::parse($student->date_of_birth)->age . ' yrs old';
        } else {
            $student->formatted_age = 'N/A';
        }

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
