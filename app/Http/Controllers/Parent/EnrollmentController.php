<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\EnrollmentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Models\Student;

// 🚀 ADDED NEW IMPORTS FOR NOTIFICATIONS
use App\Models\User;
use App\Notifications\AppNotification;
use Illuminate\Support\Facades\Notification;

class EnrollmentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string|in:Male,Female',
            'daycare_id' => 'required|exists:daycares,id',
            'birth_cert' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'parent_id_doc' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $birthCertPath = $request->file('birth_cert')->store('private_docs/birth_certs');
            $parentIdPath = $request->file('parent_id_doc')->store('private_docs/parent_ids');

            EnrollmentRequest::create([
                'user_id' => Auth::id(),
                'daycare_id' => $request->daycare_id,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'birth_cert_path' => $birthCertPath,
                'parent_id_path' => $parentIdPath,
                'status' => 'Pending',
            ]);

            DB::commit();

            // 🚀 FIRE NEW ENROLLMENT NOTIFICATION TO ADMINS
            $admins = User::where('role', 'admin')->get();
            if ($admins->count() > 0) {
                Notification::send($admins, new AppNotification(
                    'enrollment', // Uses your emerald green icon
                    'New Enrollment Application',
                    "{$request->first_name} {$request->last_name} has applied for enrollment. Review required.",
                    route('admin.student.index', ['tab' => 'pending'])
                ));
            }

            return back()->with('success', 'Application submitted! It is now under review by the Admin.');

        } catch (\Exception $e) {
            DB::rollBack();

            // 🧹 Clean up the files if the DB failed!
            if (isset($birthCertPath)) Storage::delete($birthCertPath);
            if (isset($parentIdPath)) Storage::delete($parentIdPath);

            Log::error('New Enrollment failed: ' . $e->getMessage());
            return back()->with('error', 'Something went wrong saving your application. Please try again.');
        }
    }

    public function verifyPin(Request $request)
    {
        $request->validate([
            'access_code' => 'required|string',
            'date_of_birth' => 'required|date',
        ]);

        $student = Student::where('access_code', trim(strtoupper($request->access_code)))
            ->where('date_of_birth', $request->date_of_birth)
            ->first();

        if (!$student) {
            return back()->withErrors([
                'access_code' => 'Invalid Secret PIN or Date of Birth. Please try again.'
            ]);
        }

        session()->put('verified_link_student_id', $student->id);

        return redirect()->route('parent.link-documents')->with([
            'success' => 'Child found! Please upload your ID and Birth Certificate to finish linking.',
            'student_name' => $student->first_name . ' ' . $student->last_name
        ]);
    }

    public function showLinkDocuments()
    {
        $studentId = session('verified_link_student_id');

        if (!$studentId) {
            return redirect()->route('parent.dashboard')->with('error', 'Please verify your PIN first.');
        }

        // 🚀 OPTIMIZATION: Only select the first and last name to save PHP memory
        $student = Student::select('first_name', 'last_name')->find($studentId);

        return inertia('parent/link-documents', [
            'studentName' => $student->first_name . ' ' . $student->last_name,
        ]);
    }

    public function storeLinkDocuments(Request $request)
    {
        $request->validate([
            'birth_cert' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'parent_id_doc' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $studentId = session('verified_link_student_id');

        if (!$studentId) {
            return redirect()->route('parent.dashboard')->with('error', 'Session expired. Please enter the PIN again.');
        }

        $student = Student::findOrFail($studentId);

        try {
            DB::beginTransaction();

            $birthCertPath = $request->file('birth_cert')->store('private_docs/birth_certs');
            $parentIdPath = $request->file('parent_id_doc')->store('private_docs/parent_ids');

            EnrollmentRequest::create([
                'user_id' => Auth::id(),
                'student_id' => $student->id,
                'daycare_id' => $student->daycare_id,
                'first_name' => $student->first_name,
                'middle_name' => $student->middle_name,
                'last_name' => $student->last_name,
                'date_of_birth' => $student->date_of_birth,
                'gender' => $student->gender,
                'birth_cert_path' => $birthCertPath,
                'parent_id_path' => $parentIdPath,
                'status' => 'Pending'
            ]);

            DB::commit();
            session()->forget('verified_link_student_id');

            // 🚀 FIRE NEW LINKING NOTIFICATION TO ADMINS
            $admins = User::where('role', 'admin')->get();
            if ($admins->count() > 0) {
                Notification::send($admins, new AppNotification(
                    'enrollment',
                    'Account Linking Request',
                    "A parent has uploaded verification documents to link with student {$student->first_name} {$student->last_name}. Review required.",
                    route('admin.student.index', ['tab' => 'pending'])
                ));
            }

            return redirect()->route('parent.dashboard')->with(
                'success',
                'Documents uploaded successfully! The Admin is reviewing your request.'
            );

        } catch (\Exception $e) {
            DB::rollBack();

            // 🧹 Clean up the files!
            if (isset($birthCertPath)) Storage::delete($birthCertPath);
            if (isset($parentIdPath)) Storage::delete($parentIdPath);

            Log::error('Link Documents failed: ' . $e->getMessage());
            return back()->with('error', 'Something went wrong uploading your documents. Please try again.');
        }
    }

    public function showSecureDoc($folder, $filename)
    {
        // 🚀 SECURITY FIX: Prevent Path Traversal Attacks (Hackers trying to read server files)
        if (!in_array($folder, ['birth_certs', 'parent_ids'])) {
            abort(404, 'Invalid directory access.');
        }

        $path = "private_docs/{$folder}/{$filename}";

        if (!Storage::exists($path)) {
            abort(404, 'Document not found or has been deleted.');
        }

        return Storage::response($path);
    }
}
