<?php

namespace App\Console\Commands;

use App\Services\WhatsAppService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use function Laravel\Prompts\info;
use function Laravel\Prompts\error;
use function Laravel\Prompts\spin;
use function Laravel\Prompts\table;

class SystemCheck extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check system health (Database, Cache, WhatsApp)';

    /**
     * Execute the console command.
     */
    public function handle(WhatsAppService $whatsapp)
    {
        info('Starting System Health Check...');

        $results = [];

        // 1. Check Database
        spin(function () use (&$results) {
            try {
                DB::connection()->getPdo();
                $results[] = ['Database', 'Connected', '✅'];
            } catch (\Exception $e) {
                $results[] = ['Database', 'Failed: ' . $e->getMessage(), '❌'];
            }
        }, 'Checking Database Connection...');

        // 2. Check Cache
        spin(function () use (&$results) {
            try {
                cache()->put('health_check', 'ok', 10);
                $val = cache()->get('health_check');
                if ($val === 'ok') {
                    $results[] = ['Cache', 'Working (' . config('cache.default') . ')', '✅'];
                } else {
                    $results[] = ['Cache', 'Failed to retrieve value', '❌'];
                }
            } catch (\Exception $e) {
                $results[] = ['Cache', 'Failed: ' . $e->getMessage(), '❌'];
            }
        }, 'Checking Cache...');

        // 3. Check Queue
        spin(function () use (&$results) {
            try {
                $connection = config('queue.default');
                // Check if queue is sync (not recommended for production but common in dev)
                if ($connection === 'sync') {
                    $results[] = ['Queue', 'SYNC (No worker needed)', '⚠️'];
                } else {
                    $results[] = ['Queue', "Connection: {$connection}", '✅'];
                }
            } catch (\Exception $e) {
                $results[] = ['Queue', 'Failed: ' . $e->getMessage(), '❌'];
            }
        }, 'Checking Queue Connection...');

        // 4. Check WhatsApp
        spin(function () use (&$results, $whatsapp) {
            $status = $whatsapp->getStatus();
            if ($status['success']) {
                $waData = $status['data']['data'] ?? [];
                $ready = $waData['ready'] ?? false ? 'Ready' : 'Not Ready';
                $results[] = ['WhatsApp', "Connected ({$ready})", $ready === 'Ready' ? '✅' : '⚠️'];
            } else {
                $results[] = ['WhatsApp', 'Failed: ' . ($status['message'] ?? 'Unknown error'), '❌'];
            }
        }, 'Checking WhatsApp Service...');

        table(
            ['Service', 'Status', 'State'],
            $results
        );

        info('Check complete.');
    }
}