<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Assessment;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Reusable method to securely fetch the student and calculate their exact age.
     */
    private function getSecureStudent($studentId)
    {
        $parent = Auth::user();

        // 1. SECURITY: Use the relationship that already works on your Dashboard!
        // This automatically handles the pivot tables behind the scenes.
        $student = $parent->students()
            ->with(['daycare', 'parents'])
            ->findOrFail($studentId);

        // 2. AGE CALCULATION: Fix the "NA years old" bug for the PDF
        // 🚀 OPTIMIZATION 1: Calculate the exact difference ONCE instead of 3 separate times.
        $dob = Carbon::parse($student->date_of_birth);
        $diff = $dob->diff(now());

        $student->age = $diff->y;
        $student->age_years = $diff->y;
        $student->age_months = $diff->m;
        $student->formatted_age = $diff->format('%y Years, %m Months');

        return $student;
    }

    /**
     * Reusable method to get the consolidated history.
     */
    private function getConsolidatedAssessments($studentId)
    {
        // 🚀 OPTIMIZATION 2: Added 'teacher' to the eager load.
        // The PDF Blade view needs the teacher's name. Adding it here prevents
        // a hidden N+1 database query from firing while the PDF is rendering!
        return Assessment::with(['scores.domain', 'teacher'])
            ->where('student_id', $studentId)
            ->where('status', 'Completed')
            ->orderBy('assessment_date', 'asc') // Chronological (Oldest to Newest)
            ->get();
    }

    /**
     * Download the PDF to the parent's computer.
     */
    public function download($studentId)
    {
        $student = $this->getSecureStudent($studentId);
        $assessments = $this->getConsolidatedAssessments($studentId);

        // Pass the Student and the Array of Assessments to the Blade View
        $pdf = Pdf::loadView('exports.report-card-pdf', [
            'student' => $student,
            'assessments' => $assessments
        ]);

        // Clean filename: e.g., "Gammad_ECCD_Consolidated_Report.pdf"
        $fileName = $student->last_name . '_ECCD_Consolidated_Report.pdf';

        return $pdf->download($fileName);
    }

    /**
     * Open the PDF in the browser's print viewer.
     */
    public function print($studentId)
    {
        $student = $this->getSecureStudent($studentId);
        $assessments = $this->getConsolidatedAssessments($studentId);

        $pdf = Pdf::loadView('exports.report-card-pdf', [
            'student' => $student,
            'assessments' => $assessments
        ]);

        return $pdf->stream($student->last_name . '_Official_Report.pdf');
    }
}
