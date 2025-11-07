<?php

namespace App\Http\Controllers\Admin;
use App\Models\Daycare;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class DaycareManagementController extends Controller
{
    public function index()
    {
        $daycares = Daycare::all(['id', 'daycare_name', 'address']);
        return Inertia::render('admin/daycare-management/index', [
            'daycares' => $daycares,
        ]);
    }

    public function show(Daycare $daycare)
    {
        $daycare->load('children'); // eager load children
        return Inertia::render('admin/daycare-management/show', [
            'daycare' => $daycare,
        ]);
    }

}
