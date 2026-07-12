<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssessmentDomain;
use App\Models\Daycare;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class DomainController extends Controller
{
    public function index()
    {
        // 🚀 Highly optimized Read-Only query
        $domains = AssessmentDomain::with('daycares:id')
            ->orderBy('is_core', 'desc')
            ->orderBy('sort_order', 'asc')
            ->get()
            ->map(function ($domain) {
                return [
                    'id' => $domain->id,
                    'name' => $domain->name,
                    'description' => $domain->description,
                    'max_score' => $domain->max_score,
                    'is_core' => (bool) $domain->is_core, // Strictly types it for React
                    'active_daycare_ids' => $domain->daycares->pluck('id')->toArray(),
                ];
            });

        $daycares = Daycare::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('admin/domain-management', [
            'domains' => $domains,
            'daycares' => $daycares,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_score' => 'required|integer|min:1',
            'is_core' => 'boolean',
        ]);

        $validated['sort_order'] = AssessmentDomain::max('sort_order') + 1;
        $validated['is_active'] = true;

        AssessmentDomain::create($validated);

        return Redirect::back()->with('success', 'Domain added successfully.');
    }

    public function update(Request $request, $id)
    {
        $domain = AssessmentDomain::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_score' => 'required|integer|min:1',
        ]);

        $domain->update($validated);

        return Redirect::back()->with('success', 'Domain updated successfully.');
    }

    public function toggleStatus($id)
    {
        $domain = AssessmentDomain::findOrFail($id);

        if ($domain->is_core && $domain->is_active) {
            return Redirect::back()->with('error', 'Core ECCD domains cannot be deactivated as they are required for standard scoring.');
        }

        $domain->is_active = !$domain->is_active;
        $domain->save();

        $status = $domain->is_active ? 'Activated' : 'Deactivated';

        return Redirect::back()->with('success', "Domain successfully {$status}. It will " . ($domain->is_active ? "now" : "no longer") . " appear on new assessments.");
    }

    public function destroy($id)
    {
        $domain = AssessmentDomain::findOrFail($id);

        if ($domain->is_core) {
            return Redirect::back()->with('error', 'Core ECCD domains cannot be deleted.');
        }

        if ($domain->scores()->exists()) {
            return Redirect::back()->with('error', 'Cannot delete this domain because it has already been used in student assessments. Deactivate it instead.');
        }

        $domain->delete();

        return Redirect::back()->with('success', 'Custom domain deleted.');
    }

    // 🚀 NEW METHOD: Handles the Facility-Specific Toggle Switch
    public function toggleDaycare(Request $request, $id)
    {
        $request->validate([
            'daycare_id' => 'required|exists:daycares,id',
        ]);

        $domain = AssessmentDomain::findOrFail($id);

        // Flips the switch in the pivot table (Attaches if missing, Detaches if exists)
        $domain->daycares()->toggle($request->daycare_id);

        return Redirect::back()->with('success', 'Facility domain availability updated.');
    }
}
