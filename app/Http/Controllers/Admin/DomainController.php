<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssessmentDomain;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DomainController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/domains/index', [
            'domains' => AssessmentDomain::orderBy('sort_order', 'asc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_score' => 'required|integer|min:1', // 👈 Important: Defines the max score
            'sort_order' => 'integer',
            'is_active' => 'boolean'
        ]);

        AssessmentDomain::create($validated);

        return redirect()->back()->with('success', 'Domain created successfully.');
    }

    public function update(Request $request, AssessmentDomain $domain)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_score' => 'required|integer|min:1',
            'sort_order' => 'integer',
            'is_active' => 'boolean'
        ]);

        $domain->update($validated);

        return redirect()->back()->with('success', 'Domain updated successfully.');
    }

    public function destroy(AssessmentDomain $domain)
    {
        // Optional: Add check if domain is used in existing assessments
        $domain->delete();
        return redirect()->back()->with('success', 'Domain deleted.');
    }
}
