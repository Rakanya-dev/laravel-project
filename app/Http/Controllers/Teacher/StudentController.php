<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Daycare;
use App\Models\Assessment;
use App\Models\User;
use App\Models\Section;
use App\Models\AssessmentDomain;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Auth\Access\AuthorizationException;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Carbon;
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

        $sections = Section::where('daycare_id', $daycareId)
            ->select('id', 'name', 'form_type', 'start_time', 'end_time')
            ->get();

        // 🚀 OPTIMIZATION 1: Eager loaded 'section:id,name' to prevent frontend N+1 lag
        $students = Student::where('daycare_id', $daycareId)
            ->withTrashed()
            ->with(['daycare:id,name', 'parents', 'section:id,name'])
            ->get();

        $studentIds = $students->pluck('id');

        $assessments = Assessment::whereIn('student_id', $studentIds)
            ->with('scores')
            ->orderBy('assessment_date', 'desc')
            ->get();

        $daycareList = $daycare ? [$daycare->name] : [];

        $totalStudents = $students->whereNull('deleted_at')->count();
        $completedAssessments = $assessments->where('status', 'Completed')->count();
        $assessmentsDue = max(0, $totalStudents - $completedAssessments);
        $classAverage = $assessments->where('status', 'Completed')->avg('overall_score') ?? 0;

        $domains = AssessmentDomain::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name']);

        return Inertia::render('teacher/my-students', [
            'students' => $students,
            'sections' => $sections,
            'assessments' => $assessments,
            'daycareName' => $daycare ? $daycare->name : 'Unassigned',
            'domains' => $domains,
            'daycareList' => $daycareList,
            'teacherName' => $teacher->first_name . ' ' . $teacher->last_name,
            'totalStudents' => $totalStudents,
            'assessmentsDue' => $assessmentsDue,
            'completedAssessments' => $completedAssessments,
            'classAverage' => round($classAverage, 1),
        ]);
    }

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
            'section_id' => 'nullable|exists:sections,id',
            'notes' => 'nullable|string',
        ]);

        $initials = strtoupper(substr($validated['first_name'], 0, 1) . substr($validated['last_name'], 0, 1));
        $code = $initials . '-' . rand(1000, 9999);

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
            'section_id' => 'nullable|exists:sections,id',
            'notes' => 'nullable|string',
        ]);

        $student->update($validated);

        // 3. BROADCAST UPDATE
        broadcast(new StudentUpdated($student, 'update'))->toOthers();

        return Redirect::route('teacher.my-students.index')->with('success', 'Student updated successfully.');
    }

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

        // 4. BROADCAST ARCHIVE
        broadcast(new StudentUpdated($student, 'archive'))->toOthers();

        return Redirect::route('teacher.my-students.index')->with('success', 'Student archived.');
    }

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

        // 5. BROADCAST RESTORE
        broadcast(new StudentUpdated($student, 'restore'))->toOthers();

        return Redirect::route('teacher.my-students.index')->with('success', 'Student restored.');
    }

    public function bulkArchive(Request $request)
    {
        $daycareId = $this->getTeacherDaycareId();

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:students,id',
            'items.*.status' => ['required', Rule::in(['Inactive', 'Graduated', 'Transferred'])],
            'reason' => 'nullable|string',
        ]);

        // 🚀 OPTIMIZATION 2: Pre-fetch all requested students before the loop (Drops N queries to 1)
        $studentIds = collect($validated['items'])->pluck('id');
        $students = Student::where('daycare_id', $daycareId)
            ->whereIn('id', $studentIds)
            ->get()
            ->keyBy('id');

        foreach ($validated['items'] as $item) {
            $student = $students->get($item['id']);

            if ($student) {
                $student->status = $item['status'];
                $student->notes = $request->reason;

                $student->save();
                $student->delete();

                // 6. BROADCAST EACH ARCHIVE
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

        $students = Student::withTrashed()
            ->where('daycare_id', $daycareId)
            ->whereIn('id', $validated['ids'])
            ->get();

        foreach ($students as $student) {
            $student->restore();
            $student->status = $validated['status'];
            $student->notes = null;
            $student->save();

            // 7. BROADCAST EACH RESTORE
            broadcast(new StudentUpdated($student, 'restore'))->toOthers();
        }

        return Redirect::route('teacher.my-students.index')->with('success', 'Students restored.');
    }

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

        foreach ($students as $student) {
            // 8. BROADCAST EACH DELETE
            broadcast(new StudentUpdated($student, 'delete'))->toOthers();
            $student->forceDelete();
        }

        return Redirect::route('teacher.my-students.index')->with('success', 'Students permanently deleted.');
    }

    public function regenerateCode($id)
    {
        $daycareId = $this->getTeacherDaycareId();
        $student = Student::where('daycare_id', $daycareId)->findOrFail($id);

        $initials = strtoupper(substr($student->first_name, 0, 1) . substr($student->last_name, 0, 1));
        if (empty($initials))
            $initials = 'ST';

        $newCode = $initials . '-' . rand(1000, 9999);

        while (Student::where('access_code', $newCode)->exists()) {
            $newCode = $initials . '-' . rand(1000, 9999);
        }

        $student->update(['access_code' => $newCode]);

        broadcast(new StudentUpdated($student, 'update'))->toOthers();

        return back()->with('success', 'New access code generated: ' . $newCode);
    }

    public function printCodes()
    {
        $daycareId = $this->getTeacherDaycareId();
        $daycare = Daycare::find($daycareId);

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

        // 🚀 OPTIMIZATION 3: Load Daycares and Sections into RAM ONCE to prevent N+1 Queries during the CSV loop
        $daycareDictionary = Daycare::select('id', 'name')->get()->mapWithKeys(function ($item) {
            return [strtolower(trim($item->name)) => $item->id];
        });

        $sectionsData = Section::select('id', 'daycare_id', 'name')->get();

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;

            $firstName = $row[0] ?? null;
            $middleName = $row[1] ?? null;
            $lastName = $row[2] ?? null;
            $dob = $row[3] ?? null;
            $gender = $row[4] ?? null;
            $daycareName = $row[5] ?? null;
            $sessionName = $row[6] ?? null;

            if (!$firstName || !$lastName || !$dob || !$daycareName) {
                $errors[] = "Row {$rowNumber}: Missing required fields.";
                continue;
            }

            $searchKey = strtolower(trim($daycareName));

            // Fast RAM check instead of Database check
            if (!isset($daycareDictionary[$searchKey])) {
                $errors[] = "Row {$rowNumber}: Daycare '{$daycareName}' not found.";
                continue;
            }

            $daycareId = $daycareDictionary[$searchKey];

            // Fast RAM check for Section instead of Database check
            $sectionId = null;
            if ($sessionName) {
                $matchedSection = $sectionsData->where('daycare_id', $daycareId)
                    ->filter(function($sec) use ($sessionName) {
                        return str_contains(strtolower($sec->name), strtolower(trim($sessionName)));
                    })->first();

                if ($matchedSection) {
                    $sectionId = $matchedSection->id;
                } else {
                    $errors[] = "Row {$rowNumber}: Session '{$sessionName}' not found. Student imported as Unassigned.";
                }
            }

            try {
                $student = Student::create([
                    'first_name' => trim($firstName),
                    'middle_name' => $middleName ? trim($middleName) : null,
                    'last_name' => trim($lastName),
                    'date_of_birth' => \Carbon\Carbon::parse($dob)->format('Y-m-d'),
                    'gender' => ucfirst(strtolower(trim($gender))),
                    'daycare_id' => $daycareId,
                    'section_id' => $sectionId,
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
            $message .= " " . count($errors) . " rows had issues. Check console or logs.";
        }

        return redirect()->back()->with('success', $message)->with('import_errors', $errors);
    }

    public function printReport($id)
    {
        $student = Student::with(['daycare', 'parents'])->findOrFail($id);

        $assessments = Assessment::where('student_id', $id)
            ->with(['scores.domain', 'teacher'])
            ->orderBy('created_at', 'asc')
            ->get();

        return view('reports.eccd-checklist', compact('student', 'assessments'));
    }

    public function importTemplate()
    {
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=student_import_template.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = ['First Name', 'Middle Name', 'Last Name', 'Date of Birth (YYYY-MM-DD)', 'Gender (Male/Female)', 'Session Name'];

        $callback = function () use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            fputcsv($file, ['Juan', 'Dela', 'Cruz', '2020-05-15', 'Male', 'Morning Session']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();

        $data = array_map('str_getcsv', file($path));
        array_shift($data);

        $daycareId = Auth::user()->daycare_id;
        $importedCount = 0;

        $sections = Section::where('daycare_id', $daycareId)->get();

        foreach ($data as $row) {
            if (count($row) < 5 || empty(trim($row[0]))) {
                continue;
            }

            $sectionId = null;
            $csvSessionName = trim($row[5] ?? '');

            if (!empty($csvSessionName)) {
                $matchedSection = $sections->first(function ($sec) use ($csvSessionName) {
                    return strtolower($sec->name) === strtolower($csvSessionName);
                });

                if ($matchedSection) {
                    $sectionId = $matchedSection->id;
                }
            }

            Student::create([
                'daycare_id' => $daycareId,
                'section_id' => $sectionId,
                'first_name' => trim($row[0]),
                'middle_name' => trim($row[1] ?? ''),
                'last_name' => trim($row[2]),
                'date_of_birth' => trim($row[3]),
                'gender' => trim($row[4]),
                'status' => 'Active',
            ]);

            $importedCount++;
        }

        return redirect()->back()->with('success', "Successfully imported $importedCount students into their sessions!");
    }

    public function printConsolidatedReport($id)
    {
        $student = Student::withTrashed()
            ->with(['daycare', 'parents'])
            ->findOrFail($id);

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
