<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;
use App\Models\Schedule;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('schedules.{scheduleId}', function (User $user, $scheduleId) {
    // Check if user is authorized to listen to this schedule
    // Admin/Waka: Yes
    // Teacher: If owns schedule or homeroom
    // Student: If in class
    
    // Simplification for now: Authenticated users can listen
    return $user !== null;
});
