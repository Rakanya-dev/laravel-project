<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class EnrollmentRejected extends Notification
{
    protected $childName;
    protected $reason;

    public function __construct($childName, $reason)
    {
        $this->childName = $childName;
        $this->reason = $reason;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => 'Enrollment Update',
            'message' => "Your application for {$this->childName} was rejected.",
            'reason' => $this->reason,
            'icon' => 'XCircle'
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title' => 'Enrollment Rejected',
            'message' => "Your application for {$this->childName} was rejected. Reason: {$this->reason}",
        ]);
    }
}
