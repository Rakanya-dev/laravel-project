<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Daycare;
use Inertia\Inertia;

class UsersManagementController extends Controller
{
    public function index()
    {
        $teachers = User::with('daycare')
            ->where('account_type', 'teacher')
            ->paginate(10);

        $parents = User::with('daycare')
            ->where('account_type', 'parent')
            ->paginate(10);

        $daycares = Daycare::all();

        return Inertia::render('admin/users-management', [
            'teachers' => $teachers,
            'parents' => $parents,
            'daycares' => $daycares,
        ]);
    }






}
