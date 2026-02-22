<?php

namespace Database\Factories;

use App\Models\Qrcode;
use App\Models\ScheduleItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class QrcodeFactory extends Factory
{
    protected $model = Qrcode::class;

    public function definition(): array
    {
        $uuid = Str::uuid()->toString();
        $signature = hash_hmac('sha256', $uuid, config('app.key'));
        return [
            'token' => $uuid . '.' . $signature,
            'type' => 'student',
            'schedule_id' => ScheduleItem::factory(),
            'issued_by' => User::factory(),
            'expires_at' => now()->addMinutes(15),
            'is_active' => true,
            'status' => 'available',
        ];
    }
}
