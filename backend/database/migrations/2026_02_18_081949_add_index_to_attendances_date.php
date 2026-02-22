<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! $this->hasIndex('attendances', 'attendances_date_index')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->index('date');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if ($this->hasIndex('attendances', 'attendances_date_index')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->dropIndex(['date']);
            });
        }
    }

    private function hasIndex(string $table, string $indexName): bool
    {
        $conn = Schema::getConnection();
        $db = $conn->getDatabaseName();

        if ($conn->getDriverName() === 'sqlite') {
            $results = $conn->select("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name=? AND name=?", [$table, $indexName]);

            return count($results) > 0;
        }

        // Fallback for MySQL/others
        try {
            $sm = $conn->getDoctrineSchemaManager();
            $indexes = $sm->listTableIndexes($table);

            return array_key_exists($indexName, $indexes);
        } catch (\Exception $e) {
            return false;
        }
    }
};
