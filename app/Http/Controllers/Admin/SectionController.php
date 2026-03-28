<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class SectionController extends Controller
{
    /**
     * Store a new section/session for a daycare.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'daycare_id' => 'required|exists:daycares,id',
            'name' => 'required|string|max:255',
            'form_type' => 'required|in:record_1,record_2',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'capacity' => 'required|integer|min:1',
        ]);

        Section::create($validated);

        // Redirect::back() keeps the admin on the exact same Daycare Profile page!
        return Redirect::back()->with('success', 'Session created successfully.');
    }

    /**
     * Delete a session.
     */
    public function destroy(Section $section)
    {
        $section->delete();
        return Redirect::back()->with('success', 'Session deleted successfully.');
    }
}
