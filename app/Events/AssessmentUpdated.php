<?php

namespace App\Events;

use App\Models\Assessment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // 👈 Use 'Now' for instant speed
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// Changed to 'ShouldBroadcastNow' to skip the queue and update instantly
class AssessmentUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $assessment;

    public function __construct(Assessment $assessment)
    {
        $this->assessment = $assessment;
    }

    public function broadcastOn(): array
    {
        // 👇 UPDATED: Broadcast to the whole daycare, not just one user
        return [
            new PrivateChannel('daycare.' . $this->assessment->daycare_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'assessment.updated';
    }
}
