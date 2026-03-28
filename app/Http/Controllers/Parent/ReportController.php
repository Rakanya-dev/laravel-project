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
        $dob = Carbon::parse($student->date_of_birth);
        $student->age = $dob->age;
        $student->age_years = $dob->age;
        $student->age_months = $dob->diffInMonths(now()) % 12;
        $student->formatted_age = $dob->diff(now())->format('%y Years, %m Months');

        return $student;
    }

    /**
     * Reusable method to get the consolidated history.
     */
    private function getConsolidatedAssessments($studentId)
    {
        // 🚀 THE FIX: Fetch ALL completed assessments in chronological order
        // so the PDF can show Eval 1, Eval 2, and Eval 3 side-by-side!
        return Assessment::with('scores.domain')
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
