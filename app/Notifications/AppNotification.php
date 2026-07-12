<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;

class AppNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    private $type;
    private $title;
    private $message;
    private $url;

    // 🚀 Accept all the details dynamically!
    public function __construct($type, $title, $message, $url = null)
    {
        $this->type = $type;
        $this->title = $title;
        $this->message = $message;
        $this->url = $url;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        // 🚀 Just pass the variables straight through
        return [
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
        ];
    }

    public function toBroadcast($notifiable)
    {
        // 🚀 Same here, keeping the database and frontend in sync
        return new BroadcastMessage([
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
        ]);
    }
}
