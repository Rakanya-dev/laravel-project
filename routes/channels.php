<?php
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Add this new channel definition:
Broadcast::channel('daycare.{daycareId}', function (User $user, $daycareId) {
    // Only allow users who belong to this daycare to listen
    return (int) $user->daycare_id === (int) $daycareId;
});

Broadcast::channel('chat.{id}', function ($user, $id) {
    // 🚀 FIX: Cast $id to (int) to ensure the comparison passes
    return (int) $user->id === (int) $id;
});
