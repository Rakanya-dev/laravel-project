<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class AssessmentController extends Controller
{
    private function getSecureAssessment($id)
    {
        // 🚀 Added 'student.daycare' and 'student.parents' so the PDF header/signatures work
        $assessment = Assessment::with(['student.daycare', 'student.parents', 'teacher', 'scores.domain'])
            ->findOrFail($id);

        $parent = Auth::user();

        // 🚀 OPTIMIZATION: Since we already eager-loaded 'student.parents' above,
        // we can check memory instantly instead of making another trip to the database!
        if (!$assessment->student->parents->contains('id', $parent->id)) {
            abort(403, 'Unauthorized access to this student record.');
        }

        // 🚀 AGE CALCULATION: How old was the child ON THE DAY of this assessment?
        $dob = Carbon::parse($assessment->student->date_of_birth);
        $evalDate = Carbon::parse($assessment->assessment_date ?? $assessment->created_at);

        $assessment->student->formatted_age = $dob->diff($evalDate)->format('%y Years, %m Months');

        return $assessment;
    }

    // 🚀 NEW METHOD: This handles the click from the Notification!
    public function show($id)
    {
        $assessment = $this->getSecureAssessment($id);

        // 🚀 Redirect to dashboard, but append a secret URL parameter!
        return redirect()->route('parent.dashboard', [
            'open_assessment' => $assessment->id
        ])->with('success', 'Assessment loaded successfully.');
    }
    public function download($id)
    {
        $assessment = $this->getSecureAssessment($id);

        $pdf = Pdf::loadView('pdf.assessment', ['assessment' => $assessment]);

        // Clean filename: "Gammad_1st_Evaluation_Assessment.pdf"
        $fileName = $assessment->student->last_name . '_' . str_replace(' ', '_', $assessment->assessment_type) . '_Assessment.pdf';

        return $pdf->download($fileName);
    }

    public function print($id)
    {
        $assessment = $this->getSecureAssessment($id);

        $pdf = Pdf::loadView('pdf.assessment', ['assessment' => $assessment]);

        return $pdf->stream($assessment->student->last_name . '_Assessment.pdf');
    }

}
