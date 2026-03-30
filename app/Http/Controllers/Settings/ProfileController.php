<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function updatePhoto(Request $request)
    {
        // 1. Validate it's actually an image under 2MB
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $user = auth()->user();

        // 2. Delete the old photo from the server if it exists
        if ($user->profile_photo) {
            Storage::disk('public')->delete($user->profile_photo);
        }

        // 3. Save the new file to storage/app/public/profile-photos
        $path = $request->file('photo')->store('profile-photos', 'public');

        // 4. Save the path to the database
        $user->update([
            'profile_photo' => $path
        ]);

        // 5. Send them right back to the page they were on
        return back()->with('success', 'Profile photo updated successfully!');
    }

    public function deletePhoto()
    {
        $user = auth()->user();

        // If they have a photo, delete it from the server
        if ($user->profile_photo) {
            Storage::disk('public')->delete($user->profile_photo);

            // Set the database column back to null
            $user->update([
                'profile_photo' => null
            ]);
        }

        return back()->with('success', 'Profile photo removed!');
    }
}
