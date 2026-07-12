<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    // 🚀 NEW: The page that shows all history
    public function index()
    {
        // Get all notifications, 15 per page, newest first
        $notifications = auth()->user()->notifications()->paginate(15);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications
        ]);
    }

    public function markAsRead($id)
    {
        $notification = auth()->user()->notifications()->find($id);
        if ($notification) {
            $notification->markAsRead();
        }
        return back();
    }

    public function markAllRead()
    {
        auth()->user()->unreadNotifications->markAsRead();
        return back();
    }
}
