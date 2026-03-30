<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Student;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        //
    }

    /**
     * Handle the User "updated" event.
     */
  public function updated(User $user)
    {
        // Check if the status CHANGED to 'active' (Approved)
        if ($user->wasChanged('status') && $user->status === 'Active') {

            // Logic: Find any students waiting for this parent
            $studentsToLink = Student::where('guardian_email', $user->email)
                                     ->whereNull('parent_id')
                                     ->get();

            foreach ($studentsToLink as $student) {
                $student->update([
                    'parent_id' => $user->id,
                    'parent_linked' => true,
                ]);
            }
        }
    }
    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
