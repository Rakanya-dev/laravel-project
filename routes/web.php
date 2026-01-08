<?php
use App\Http\Controllers\MessageController;
use App\Http\Controllers\Admin\DaycareManagementController as AdminDaycareController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Admin\UsersController as AdminUsersController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\AssessmentOverviewController as AdminAssessmentOverviewController;
use App\Http\Controllers\Admin\ReportsController as AdminReportsController;

use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Teacher\StudentController as TeacherStudentController;
use App\Http\Controllers\Teacher\AssessmentController as TeacherAssessmentController;
use App\Http\Controllers\Teacher\ReportsController as TeacherReportsController;

use App\Http\Controllers\Parent\DashboardController as ParentDashboardController;
use App\Http\Controllers\Parent\ChildController as ParentChildController;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Http\Middleware\CheckParentStatus;

Route::get('/', fn() => Redirect::route('login'))->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // 1. THE WAITING ROOM
    // This gives your Middleware a safe place to redirect pending users.
    Route::get('/approval-pending', function () {
        return Inertia::render('auth/pending-approval');
    })->name('approval.notice');

    Route::get('/auth/check-status', function () {
        $user = Auth::user()->fresh();

        // Check 1: Is the User Account active?
        if ($user->status !== 'Active') {
            return response()->json([
                'status' => 'Pending',
                'reason' => 'User Account is still Pending'
            ]);
        }

        // Check 2: Is the Child Link active?
        $student = $user->students()->withPivot('status')->first();

        if ($student && $student->pivot->status === 'Pending') {
            return response()->json([
                'status' => 'Pending',
                'reason' => 'Child Link is still Pending (User is Active)'
            ]);
        }

        return response()->json(['status' => 'Active']);
    });
    // 1. View the Inbox
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');

    // 2. Send a Message
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
    Route::patch('/messages/{message}/read', [MessageController::class, 'markAsRead'])->name('messages.read');
    Route::delete('/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
    // 2. REDIRECT LOGIC
    Route::get('/redirect-by-role', function () {
        $user = Auth::user();

        // If parent is pending, send them to the dedicated route above
        if ($user->role === 'parent' && $user->status !== 'active') {
            return redirect()->route('approval.notice');
        }

        return match ($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'teacher' => redirect()->route('teacher.dashboard'),
            'parent' => redirect()->route('parent.dashboard'),
            default => abort(403, 'Unauthorized role.'),
        };
    })->name('role.redirect');

    Route::get('/dashboard', fn() => redirect()->route('role.redirect'))->name('dashboard');

    // ADMIN ROUTES
    Route::prefix('admin')->name('admin.')->group(function () {

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
        // Daycare
        Route::get('/daycare-management', [AdminDaycareController::class, 'index'])->name('daycare.index');
        Route::post('/daycare-management', [AdminDaycareController::class, 'store'])->name('daycare.store');
        Route::patch('/daycare-management/{daycare}', [AdminDaycareController::class, 'update'])->name('daycare.update');
        Route::delete('/daycare-management/{daycare}', [AdminDaycareController::class, 'destroy'])->name('daycare.destroy');

        // Students
        Route::get('/student-management', [AdminStudentController::class, 'index'])->name('student.index');
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
        Route::post('/students/bulk-archive', [AdminStudentController::class, 'bulkArchive'])->name('students.bulk-archive');
        Route::post('/students/bulk-restore', [AdminStudentController::class, 'bulkRestore'])->name('students.bulk-restore');
        Route::post('/students/bulk-permanent-delete', [AdminStudentController::class, 'bulkPermanentDelete'])->name('students.bulk-permanent-delete');

        // Assessments & Reports
        Route::get('/assessments-overview', [AdminAssessmentOverviewController::class, 'index'])->name('assessments.overview');
        Route::get('/reports', [AdminReportsController::class, 'index'])->name('reports');
        Route::post('/reports/templates', [AdminReportsController::class, 'storeTemplate'])->name('reports.templates.store');
        Route::patch('/reports/templates/{id}', [AdminReportsController::class, 'updateTemplate'])->name('reports.templates.update');
        Route::delete('/reports/templates/{id}', [AdminReportsController::class, 'destroyTemplate'])->name('reports.templates.destroy');
        Route::post('/reports/store', [AdminReportsController::class, 'storeReport'])->name('reports.store');
        Route::get('/reports/export', [AdminReportsController::class, 'export'])->name('reports.export');
        Route::get('/reports/fetch-data', [AdminReportsController::class, 'getReportData'])->name('reports.data');
    });

    // TEACHER ROUTES
    Route::prefix('teacher')->name('teacher.')->group(function () {
        Route::get('/dashboard', [TeacherDashboardController::class, 'index'])->name('dashboard');

        // Students
        Route::get('/my-students', [TeacherStudentController::class, 'index'])->name('my-students.index');
        Route::post('/students', [TeacherStudentController::class, 'store'])->name('students.store');
        Route::patch('/students/{id}', [TeacherStudentController::class, 'update'])->name('students.update');
        Route::post('/students/{id}/archive', [TeacherStudentController::class, 'archive'])->name('students.archive');
        Route::post('/students/{id}/restore', [TeacherStudentController::class, 'restore'])->name('students.restore');
        Route::delete('/students/{id}/permanent-delete', [TeacherStudentController::class, 'permanentDelete'])->name('students.permanent-delete');
        Route::post('/students/bulk-archive', [TeacherStudentController::class, 'bulkArchive'])->name('students.bulk-archive');
        Route::post('/students/bulk-restore', [TeacherStudentController::class, 'bulkRestore'])->name('students.bulk-restore');
        Route::post('/students/bulk-permanent-delete', [TeacherStudentController::class, 'bulkPermanentDelete'])->name('students.bulk-permanent-delete');
        Route::post('/students/{student}/regenerate-code', [TeacherStudentController::class, 'regenerateCode'])->name('students.regenerate-code');
        Route::get('/students/print', [TeacherStudentController::class, 'printCodes'])->name('students.print-codes');
        // Assessments
        Route::get('/assessments', [TeacherAssessmentController::class, 'index'])->name('assessment-management');
        Route::post('/assessments', [TeacherAssessmentController::class, 'store'])->name('assessments.store');
        Route::get('/assessments/{id}/edit', [TeacherAssessmentController::class, 'edit'])->name('assessments.edit');
        Route::patch('/assessments/{id}', [TeacherAssessmentController::class, 'update'])->name('assessments.update');
        Route::delete('/assessments/{id}', [TeacherAssessmentController::class, 'destroy'])->name('assessments.destroy');

        // Reports
        Route::get('/reports', [TeacherReportsController::class, 'index'])->name('reports');
        Route::post('/reports/store', [TeacherReportsController::class, 'storeReport'])->name('reports.store');
        Route::get('/reports/fetch-data', [AdminReportsController::class, 'getReportData'])->name('reports.data');
    });

    // PARENT ROUTES
    Route::prefix('parent')
        ->name('parent.')
        ->middleware([CheckParentStatus::class]) // Protected by Middleware
        ->group(function () {
            Route::get('/dashboard', [ParentDashboardController::class, 'index'])->name('dashboard');
            Route::get('/child-profile', [ParentChildController::class, 'index'])->name('child-profile');
            Route::post('/notes', [ParentChildController::class, 'storeNote'])->name('notes.store');
            Route::patch('/notes/{id}', [ParentChildController::class, 'updateNote'])->name('notes.update');
            Route::delete('/notes/{id}', [ParentChildController::class, 'deleteNote'])->name('notes.delete');

            Route::get('/assessment', fn() => Inertia::render('parent/assessment'))->name('assessment');
        });

});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
