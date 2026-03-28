<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Models\Student;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();

        // ---------------------------------------------------------
        // SCENARIO 1: API / AJAX REQUEST (Used by Parent Dashboard Tab)
        // ---------------------------------------------------------
        if ($request->wantsJson() && $request->has('recipient')) {
            $selectedUserId = $request->query('recipient');

            // Mark as read immediately
            Message::where('sender_id', $selectedUserId)
                ->where('recipient_id', $userId)
                ->where('status', 'unread')
                ->update(['status' => 'read']);

            // Fetch conversation history
            $activeMessages = Message::where(function ($q) use ($userId, $selectedUserId) {
                $q->where('sender_id', $userId)->where('recipient_id', $selectedUserId);
            })
                ->orWhere(function ($q) use ($userId, $selectedUserId) {
                    $q->where('sender_id', $selectedUserId)->where('recipient_id', $userId);
                })
                ->orderBy('created_at', 'asc')
                ->get();

            // 🚀 THE FIX: Fetch the updated Sidebar data for the Parent Tab!
            $allMessages = Message::where('sender_id', $userId)
                ->orWhere('recipient_id', $userId)
                ->latest()
                ->with(['sender', 'recipient'])
                ->get();

            $updatedSidebar = $allMessages->groupBy(function ($msg) use ($userId) {
                return $msg->sender_id === $userId ? $msg->recipient_id : $msg->sender_id;
            })->map(function ($msgs) use ($userId) {
                $lastMsg = $msgs->first();
                $otherUser = $lastMsg->sender_id === $userId ? $lastMsg->recipient : $lastMsg->sender;

                return [
                    'contact_id' => $otherUser->id,
                    'contact_name' => $otherUser->first_name . ' ' . $otherUser->last_name,
                    'contact_role' => $otherUser->role,
                    'last_message' => $lastMsg->body ?: 'Attachment',
                    'time' => $lastMsg->created_at,
                    'is_online' => $otherUser->is_online, // Online status!
                ];
            })->values();

            return response()->json([
                'initialMessages' => $activeMessages,
                'conversations' => $updatedSidebar // 🚀 Send it to React
            ]);
        }

        // ---------------------------------------------------------
        // SCENARIO 2: FULL PAGE VISIT (Used by Admin/Teacher Sidebar)
        // ---------------------------------------------------------
        $selectedUserId = $request->query('user');

        $allMessages = Message::where('sender_id', $userId)
            ->orWhere('recipient_id', $userId)
            ->latest()
            ->with(['sender', 'recipient'])
            ->get();

        $conversations = $allMessages->groupBy(function ($msg) use ($userId) {
            return $msg->sender_id === $userId ? $msg->recipient_id : $msg->sender_id;
        })->map(function ($msgs) use ($userId) {
            $lastMsg = $msgs->first();
            $otherUser = $lastMsg->sender_id === $userId ? $lastMsg->recipient : $lastMsg->sender;

            return [
                'user' => $otherUser->only(['id', 'first_name', 'last_name', 'role', 'is_online']),
                'last_message' => [
                    'body' => $lastMsg->body,
                    'created_at' => $lastMsg->created_at,
                    'is_read' => $lastMsg->recipient_id === $userId ? $lastMsg->status === 'read' : true,
                ]
            ];
        })->values();

        $activeMessages = [];
        $activeRecipient = null;

        if ($selectedUserId) {
            $activeRecipient = User::find($selectedUserId);
            if ($activeRecipient) {
                Message::where('sender_id', $selectedUserId)
                    ->where('recipient_id', $userId)
                    ->where('status', 'unread')
                    ->update(['status' => 'read']);

                $activeMessages = Message::where(function ($q) use ($userId, $selectedUserId) {
                    $q->where('sender_id', $userId)->where('recipient_id', $selectedUserId);
                })->orWhere(function ($q) use ($userId, $selectedUserId) {
                    $q->where('sender_id', $selectedUserId)->where('recipient_id', $userId);
                })->orderBy('created_at', 'asc')->get();
            }
        }

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
            'body' => 'nullable|string',
            'attachment' => 'nullable|file|max:10240',
            'subject' => 'nullable|string',
        ]);

        if (empty($validated['body']) && !$request->hasFile('attachment')) {
            return back()->withErrors(['body' => 'You must provide a message or an attachment.']);
        }

        $attachmentUrl = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');

            $attachmentName = $file->getClientOriginalName();
            $path = $file->store('chat_attachments', 'public');
            $attachmentUrl = '/storage/' . $path;
        }

        $message = Message::create([
            'sender_id' => auth()->id(),
            'recipient_id' => $validated['recipient_id'],
            'subject' => $validated['subject'] ?? 'Chat',
            'body' => $validated['body'] ?? '',
            'attachment_url' => $attachmentUrl,
            'attachment_name' => $attachmentName,
            'status' => 'unread',
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => $message, 'status' => 'success']);
        }

        return redirect()->back();
    }

    // 🚀 THE FIXED METHOD
    private function getAllowedRecipients($user)
    {
        $allowedRecipients = collect();

        // 1. ADMIN: Can message absolutely anyone in the system
        if ($user->role === 'admin') {
            $allowedRecipients = User::where('id', '!=', $user->id)->get();
        }

        // 2. TEACHER: Can message Admins + Parents of students in their Daycare
        elseif ($user->role === 'teacher') {
            $admins = User::where('role', 'admin')->get();

            // Get all students in this teacher's daycare, along with their linked parents
            $students = Student::where('daycare_id', $user->daycare_id)
                ->with('parents')
                ->get();

            // Extract just the parents from those students, flatten into one list, and remove duplicates
            $parents = $students->pluck('parents')->flatten()->unique('id');

            // Combine Admins and Parents into the teacher's address book
            $allowedRecipients = $admins->merge($parents)->where('id', '!=', $user->id);
        }

        // 3. PARENT: Can message Admins + Teachers at their child's Daycare
        elseif ($user->role === 'parent') {
            $admins = User::where('role', 'admin')->get();

            // Find all daycares this parent's children belong to
            $daycareIds = Student::whereHas('parents', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })->pluck('daycare_id')->unique();

            // Get the Teachers that work at those specific daycares
            $teachers = User::where('role', 'teacher')
                ->whereIn('daycare_id', $daycareIds)
                ->get();

            $allowedRecipients = $admins->merge($teachers)->where('id', '!=', $user->id);
        }

        // Reset the array keys to ensure React gets a clean JSON array
        return $allowedRecipients->values();
    }
}
