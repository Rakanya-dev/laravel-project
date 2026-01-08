<?php

namespace App\Events;

use App\Models\Student; // Make sure this matches your model name (Student or Child)
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; // <--- IMPORTANT
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StudentUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $student;
    public $action;

    /**
     * Create a new event instance.
     *
     * @param \App\Models\Student $student
     * @param string $action  'create', 'update', 'archive', 'restore', 'delete'
     */
    public function __construct(Student $student, $action = 'update')
    {
        $this->student = $student;
        $this->action = $action;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('students');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs()
    {
        return 'StudentUpdated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'id' => $this->student->id,
            'firstName' => $this->student->first_name,
            'lastName' => $this->student->last_name,
            'status' => $this->student->status,
            'archived' => !!$this->student->deleted_at,
            'archivedDate' => $this->student->deleted_at,
            'action' => $this->action,
        ];
    }
}
