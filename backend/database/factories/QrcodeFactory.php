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
        return [
            'token' => Str::uuid()->toString(),
            'type' => 'student',
            'schedule_id' => ScheduleItem::factory(),
            'issued_by' => User::factory(),
            'expires_at' => now()->addMinutes(15),
            'is_active' => true,
            'status' => 'available',
        ];
    }
}
