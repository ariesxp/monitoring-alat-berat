<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Jam kerja per kantor (multi-office). Setiap kantor bisa punya jam masuk,
 * batas terlambat, dan jam pulang sendiri — mis. Head Office batas 09:00,
 * Site lain batas 07:00. Nullable: bila kosong, sistem memakai setingan
 * global (tabel settings) agar tetap kompatibel dengan data lama.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('offices', function (Blueprint $table) {
            if (!Schema::hasColumn('offices', 'jam_masuk')) {
                $table->string('jam_masuk', 5)->nullable()->after('radius_m');
            }
            if (!Schema::hasColumn('offices', 'batas_terlambat')) {
                $table->string('batas_terlambat', 5)->nullable()->after('jam_masuk');
            }
            if (!Schema::hasColumn('offices', 'jam_pulang')) {
                $table->string('jam_pulang', 5)->nullable()->after('batas_terlambat');
            }
        });
    }

    public function down(): void
    {
        Schema::table('offices', function (Blueprint $table) {
            foreach (['jam_masuk', 'batas_terlambat', 'jam_pulang'] as $col) {
                if (Schema::hasColumn('offices', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
