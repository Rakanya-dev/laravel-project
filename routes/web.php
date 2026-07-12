<?php
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\DaycareManagementController as AdminDaycareController;
use App\Http\Controllers\Admin\SectionController as AdminSectionController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Admin\UsersController as AdminUsersController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\DomainController as AdminDomainController;

use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Teacher\StudentController as TeacherStudentController;
use App\Http\Controllers\Teacher\AssessmentController as TeacherAssessmentController;
use App\Http\Controllers\Teacher\ReportController as TeacherReportController;

use App\Http\Controllers\Parent\DashboardController as ParentDashboardController;
use App\Http\Controllers\Parent\EnrollmentController as ParentEnrollmentController;
use App\Http\Controllers\Parent\AssessmentController as ParentAssessmentController;
use App\Http\Controllers\Parent\ReportController as ParentReportController;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Http\Controllers\Auth\EmailVerificationNotificationController;

Route::middleware('auth')->group(function () {

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');
});


Route::get('/', fn() => Redirect::route('login'))->name(name: 'home');

Route::middleware(['auth', 'verified'])->group(function () {

    // 1. DASHBOARD REDIRECT (Clean and simple!)
    Route::get('/redirect-by-role', function () {
        $user = Auth::user();
        return match ($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'teacher' => redirect()->route('teacher.dashboard'),
            'parent' => redirect()->route('parent.dashboard'),
            default => abort(403, 'Unauthorized role.'),
        };
    })->name('role.redirect');

    // 1. View the Inbox
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');

    // 2. Send a Message
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
    Route::patch('/messages/{message}/read', [MessageController::class, 'markAsRead'])->name('messages.read');
    Route::delete('/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');


    // ADMIN ROUTES
    Route::prefix('admin')->name('admin.')->middleware(['role:admin'])->group(function () {

        // Dashboard & Users
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/users-management', [AdminUsersController::class, 'index'])->name('users.management');

        // User Actions (Approve/Reject logic)
        Route::post('/teachers', [AdminUsersController::class, 'store'])->name('teachers.store');
        Route::patch('/users/{id}', [AdminUsersController::class, 'update'])->name('users.update');
        Route::post('/users/{id}/approve', [AdminUsersController::class, 'approve'])->name('users.approve');
        Route::post('/users/{id}/reject', [AdminUsersController::class, 'reject'])->name('users.reject');
        Route::delete('/users/{id}', [AdminUsersController::class, 'destroy'])->name('users.destroy');
        Route::get('/users/export', [AdminUsersController::class, 'export'])->name('users.export');
        Route::get('/teachers/list', [AdminUsersController::class, 'getTeacherList'])->name('teachers.list');
        Route::post('/users/{id}/approve', [AdminUsersController::class, 'approveRequest'])->name('users.approve');
        Route::post('/users/{id}/reject', [AdminUsersController::class, 'rejectRequest'])->name('users.reject');
        Route::post('/users/bulk-delete', [AdminUsersController::class, 'bulkDelete'])->name('users.bulk-delete');

        Route::get('/teachers/print', [AdminUsersController::class, 'printTeachers'])->name('users.teachers.print');
        Route::get('/parents/print', [AdminUsersController::class, 'printParents'])->name('users.parents.print');

        // Daycare
        Route::get('/daycare-management', [AdminDaycareController::class, 'index'])->name('daycare.index');
        Route::post('/daycare-management', [AdminDaycareController::class, 'store'])->name('daycare.store');
        Route::patch('/daycare-management/{daycare}', [AdminDaycareController::class, 'update'])->name('daycare.update');
        Route::delete('/daycare-management/{daycare}', [AdminDaycareController::class, 'destroy'])->name('daycare.destroy');

        Route::post('/admin/sections', [AdminSectionController::class, 'store'])->name('sections.store');
        Route::delete('/admin/sections/{section}', [AdminSectionController::class, 'destroy'])->name('sections.destroy');

        // Students
        Route::get('/student-management', [AdminStudentController::class, 'index'])->name('student.index');
        Route::get('/students/print', [AdminStudentController::class, 'printAll'])->name('student.print-all');

        Route::get('/secure-docs/{type}/{filename}', [AdminStudentController::class, 'viewSecureDoc'])->name('secure-doc');
        // Secure Document Viewer for Admins
        Route::get('/secure-docs/{folder}/{filename}', [AdminStudentController::class, 'showSecureDoc'])
            ->name('secure-docs.show');
        Route::post('/enrollments/{id}/approve', [AdminStudentController::class, 'approveEnrollment'])->name('enrollments.approve');
        Route::post('/enrollments/{id}/reject', [AdminStudentController::class, 'rejectEnrollment'])->name('enrollments.reject');
        Route::post('/guardian-requests/{id}/approve', [AdminStudentController::class, 'approveLinkRequest'])->name('requests.approve');
        Route::post('/students', [AdminStudentController::class, 'store'])->name('students.store');
        Route::patch('/students/{id}', [AdminStudentController::class, 'update'])->name('students.update');
        Route::delete('/students/{id}', [AdminStudentController::class, 'destroy'])->name('students.destroy');
        Route::post('/students/{id}/link-parent', [AdminStudentController::class, 'linkParent'])
            ->name('students.link-parent');
        Route::post('/students/bulk-import', [AdminStudentController::class, 'bulkImport'])->name('students.bulk-import');

        // Student Archive/Restore
        Route::post('/students/{id}/archive', [AdminStudentController::class, 'archive'])->name('students.archive');
        Route::post('/students/{id}/restore', [AdminStudentController::class, 'restore'])->name('students.restore');
        Route::delete('/students/{id}/permanent-delete', [AdminStudentController::class, 'permanentDelete'])->name('students.permanent-delete');
        // Add this right next to your other Admin student routes:
        Route::post('/students/bulk-archive', [AdminStudentController::class, 'bulkArchive'])->name('students.bulk-archive');
        Route::post('/students/bulk-restore', [AdminStudentController::class, 'bulkRestore'])->name('students.bulk-restore');
        Route::post('/students/bulk-permanent-delete', [AdminStudentController::class, 'bulkPermanentDelete'])->name('students.bulk-permanent-delete');
        Route::get('/students/{id}/report', [AdminStudentController::class, 'printReport'])->name('students.report');
        // Reports
        // The actual page
        Route::get('/reports', [AdminReportController::class, 'index'])
            ->name('reports.index');

        // The CSV export
        Route::get('/reports/master-roster', [AdminReportController::class, 'exportMasterRoster'])
            ->name('reports.master-roster');
        // The Compliance Audit CSV
        Route::get('/reports/compliance-audit', [AdminReportController::class, 'exportComplianceAudit'])
            ->name('reports.compliance-audit');
        // The Consolidated Analytics PDF
        Route::get('/reports/consolidated-report', [AdminReportController::class, 'exportConsolidatedReport'])
            ->name('reports.consolidated-report');

        // Domains
        Route::get('/domain-management', [AdminDomainController::class, 'index'])->name('domains.index');
        Route::post('/domain-management', [AdminDomainController::class, 'store'])->name('domains.store');
        Route::patch('/domain-management/{id}', [AdminDomainController::class, 'update'])->name('domains.update');
        Route::post('/domain-management/{id}/toggle-status', [AdminDomainController::class, 'toggleStatus'])->name('domains.toggle-status');
        Route::post('/domain-management/{id}/toggle-daycare', [AdminDomainController::class, 'toggleDaycare'])->name('domains.toggle-daycare');
    });

    // TEACHER ROUTES
    Route::prefix('teacher')->name('teacher.')->middleware(['role:teacher'])->group(function () {
        Route::get('/dashboard', [TeacherDashboardController::class, 'index'])->name('dashboard');

        // Students
        Route::get('/my-students', [TeacherStudentController::class, 'index'])->name('my-students.index');
        Route::get('/students/print', [TeacherStudentController::class, 'printAll']);
        Route::get('/students/export', [TeacherStudentController::class, 'export'])->name('students.export');

        Route::post('/students', [TeacherStudentController::class, 'store'])->name('students.store');
        Route::patch('/students/{id}', [TeacherStudentController::class, 'update'])->name('students.update');
        Route::post('/students/{id}/archive', [TeacherStudentController::class, 'archive'])->name('students.archive');
        Route::post('/students/{id}/restore', [TeacherStudentController::class, 'restore'])->name('students.restore');
        Route::post('/students/bulk-archive', [TeacherStudentController::class, 'bulkArchive'])->name('students.bulk-archive');
        Route::post('/students/bulk-restore', [TeacherStudentController::class, 'bulkRestore'])->name('students.bulk-restore');

        Route::get('/students/{id}/consolidated-report', [TeacherStudentController::class, 'printConsolidatedReport'])->name('students.consolidated-report');
        // Printable Report
        Route::get('/students/{id}/report', [TeacherStudentController::class, 'printReport'])
            ->name('students.report');

        // Reports
        Route::get('/reports/student/{id}', [TeacherReportController::class, 'showStudentProfile'])
            ->name('reports.student');
        Route::get('/reports/class-consolidated', [TeacherReportController::class, 'showClassConsolidated'])
            ->name('reports.consolidated');
        Route::get('/reports/domain-analysis', [TeacherReportController::class, 'showDomainAnalysis'])
            ->name('reports.analysis');

        // Assessments
        Route::get('/assessments-management', [TeacherAssessmentController::class, 'index'])->name('assessments-management');
        Route::get('/assessments/{assessment}', [TeacherAssessmentController::class, 'show'])->name('assessments.show');
        Route::post('/assessments-management', [TeacherAssessmentController::class, 'store'])->name('assessments.store');
        Route::post('/assessments-management/bulk-store', [TeacherAssessmentController::class, 'bulkStore'])->name('assessments.bulk-store');
        Route::get('/assessments-management/{id}/edit', [TeacherAssessmentController::class, 'edit'])->name('assessments.edit');
        Route::patch('/assessments-management/{id}', [TeacherAssessmentController::class, 'update'])->name('assessments.update');
        Route::delete('/assessments-management/{id}', [TeacherAssessmentController::class, 'destroy'])->name('assessments.destroy');
        Route::get('assessments-management/create', [TeacherAssessmentController::class, 'create'])->name('assessments.create');

        // The actual form pages
        Route::get('assessments/ited/{assessment}', [TeacherAssessmentController::class, 'itedForm'])->name('assessments.ited.form');
        Route::get('assessments/eccd/{assessment}', [TeacherAssessmentController::class, 'eccdForm'])->name('assessments.eccd.form');

        // 🚀 Import Routes
        Route::get('/students/import-template', [TeacherStudentController::class, 'importTemplate']);
        Route::post('/students/import', [TeacherStudentController::class, 'import']);
    });

    // PARENT ROUTES
    Route::prefix('parent')
        ->name('parent.')
        ->middleware(['role:parent'])
        ->group(function () {

            Route::post('/enroll', [ParentEnrollmentController::class, 'store'])->name('enroll.store');
            Route::post('/verify-pin', [ParentEnrollmentController::class, 'verifyPin'])->name('verify-pin');
            // 1. To show the document upload page
            Route::get('/link-documents', [ParentEnrollmentController::class, 'showLinkDocuments'])->name('link-documents');

            // 2. To handle the actual file upload (we'll build the logic for this next!)
            Route::post('/link-documents', [ParentEnrollmentController::class, 'storeLinkDocuments'])->name('link.store');

            Route::get('/dashboard', [ParentDashboardController::class, 'index'])->name('dashboard');


            Route::get('/assessments/{assessment}', [ParentAssessmentController::class, 'show'])->name('assessments.show');
            // 🚀 The PDF Routes for Assessments
            Route::get('/assessments/{id}/download', [ParentAssessmentController::class, 'download'])->name('assessments.download');
            Route::get('/assessments/{id}/print', [ParentAssessmentController::class, 'print'])->name('assessments.print');

            // 🚀 The PDF Routes for Reports
            Route::get('/reports/{id}/download', [ParentReportController::class, 'download'])->name('reports.download');
            Route::get('/reports/{id}/print', [ParentReportController::class, 'print'])->name('reports.print');

        });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
