<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();
        $selectedUserId = $request->query('user');

        // 1. Fetch "Conversations" (Unique partners + last message)
        $allMessages = Message::where('sender_id', $userId)
            ->orWhere('recipient_id', $userId)
            ->latest()
            ->with(['sender', 'recipient'])
            ->get();

        $conversations = $allMessages->groupBy(function ($msg) use ($userId) {
            // Group by the "Other" person's ID
            return $msg->sender_id === $userId ? $msg->recipient_id : $msg->sender_id;
        })->map(function ($msgs) use ($userId) {
            $lastMsg = $msgs->first();
            $otherUser = $lastMsg->sender_id === $userId ? $lastMsg->recipient : $lastMsg->sender;

            return [
                'user' => $otherUser->only(['id', 'first_name', 'last_name', 'role']),
                'last_message' => [
                    'body' => $lastMsg->body,
                    'created_at' => $lastMsg->created_at,
                    'is_read' => $lastMsg->recipient_id === $userId ? $lastMsg->status === 'read' : true,
                ]
            ];
        })->values();

        // 2. Fetch Full History for Selected User
        $activeMessages = [];
        $activeRecipient = null;

        if ($selectedUserId) {
            $activeRecipient = User::find($selectedUserId);
            if ($activeRecipient) {
                // Mark as read immediately
                Message::where('sender_id', $selectedUserId)
                    ->where('recipient_id', $userId)
                    ->where('status', 'unread')
                    ->update(['status' => 'read']);

                // Fetch history (My sent + Their sent)
                $activeMessages = Message::where(function($q) use ($userId, $selectedUserId) {
                    $q->where('sender_id', $userId)->where('recipient_id', $selectedUserId);
                })->orWhere(function($q) use ($userId, $selectedUserId) {
                    $q->where('sender_id', $selectedUserId)->where('recipient_id', $userId);
                })->orderBy('created_at', 'asc')->get(); // Oldest first for chat history
            }
        }

        // 3. Allowed Recipients (New Chat) Logic
        $allowedRecipients = $this->getAllowedRecipients(auth()->user());

        return Inertia::render('messages', [
            'conversations' => $conversations,
            'activeMessages' => $activeMessages,
            'activeRecipient' => $activeRecipient,
            'allowedRecipients' => $allowedRecipients
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'body'         => 'required|string',
            'subject'      => 'nullable|string',
        ]);

        Message::create([
            'sender_id'    => auth()->id(),
            'recipient_id' => $validated['recipient_id'],
            'subject'      => $validated['subject'] ?? 'Chat',
            'body'         => $validated['body'],
            'status'       => 'unread',
        ]);

        return redirect()->route('messages.index', ['user' => $validated['recipient_id']]);
    }

    // Helper for role-based permissions
    private function getAllowedRecipients($user)
    {
        if ($user->role === 'admin') {
            return User::where('role', 'teacher')->get(['id', 'first_name', 'last_name', 'role']);
        } elseif ($user->role === 'teacher') {
            return User::where('role', 'admin')
                ->orWhere(function($q) use ($user) {
                    $q->where('role', 'parent')->where('daycare_id', $user->daycare_id);
                })->get(['id', 'first_name', 'last_name', 'role']);
        } elseif ($user->role === 'parent') {
            return User::where('role', 'teacher')->where('daycare_id', $user->daycare_id)
                ->get(['id', 'first_name', 'last_name', 'role']);
        }
        return [];
    }
}
