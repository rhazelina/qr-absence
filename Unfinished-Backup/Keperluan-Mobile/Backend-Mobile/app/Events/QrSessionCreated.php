<?php

namespace App\Events;

use App\Models\Qrcode;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QrSessionCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Qrcode $qrcode) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('schedules.'.$this->qrcode->schedule_id)];
    }

    public function broadcastAs(): string
    {
        return 'qr.generated';
    }

    public function broadcastWith(): array
    {
        return [
            'token' => $this->qrcode->token,
            'type' => $this->qrcode->type,
            'schedule_id' => $this->qrcode->schedule_id,
            'expires_at' => optional($this->qrcode->expires_at)->toIso8601String(),
        ];
    }
}
