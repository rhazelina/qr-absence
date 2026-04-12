<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = \App\Models\User::where('user_type', 'teacher')->whereHas('teacherProfile', fn($q) => $q->whereNotNull('homeroom_class_id'))->first();
if (!$user) { echo "No user found\n"; exit; }
$token = $user->createToken('test')->plainTextToken;

$request = Illuminate\Http\Request::create('/api/classes/' . $user->teacherProfile->homeroom_class_id . '/attendance?date=2026-03-11', 'GET');
$request->headers->set('Accept', 'application/json');
$request->headers->set('Authorization', 'Bearer '.$token);

$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Response: " . $response->getContent() . "\n";
