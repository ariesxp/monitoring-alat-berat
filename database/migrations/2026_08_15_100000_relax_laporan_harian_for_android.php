<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Melonggarkan tabel laporan_harian agar bisa menerima input dari aplikasi
 * Android (tanpa SPK & tanpa user web):
 *  - spk_id & created_by menjadi nullable
 *  - sumber_input menerima nilai 'android'
 *  - menambah kolom lokasi_kerja (Blok) yang dikirim dari Android
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE laporan_harian MODIFY spk_id BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE laporan_harian MODIFY created_by BIGINT UNSIGNED NULL');
        DB::statement("ALTER TABLE laporan_harian MODIFY sumber_input ENUM('web','whatsapp','android') NOT NULL DEFAULT 'web'");

        if (!Schema::hasColumn('laporan_harian', 'lokasi_kerja')) {
            Schema::table('laporan_harian', function (Blueprint $table) {
                $table->string('lokasi_kerja')->nullable()->after('jenis_pekerjaan');
            });
        }

        // Penanda unik asal aktivitas Android (mencegah duplikasi bridge/backfill).
        if (!Schema::hasColumn('laporan_harian', 'android_activity_id')) {
            Schema::table('laporan_harian', function (Blueprint $table) {
                $table->unsignedBigInteger('android_activity_id')->nullable()->unique()->after('sumber_input');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('laporan_harian', 'lokasi_kerja')) {
            Schema::table('laporan_harian', function (Blueprint $table) {
                $table->dropColumn('lokasi_kerja');
            });
        }

        DB::statement("ALTER TABLE laporan_harian MODIFY sumber_input ENUM('web','whatsapp') NOT NULL DEFAULT 'web'");
        DB::statement('ALTER TABLE laporan_harian MODIFY created_by BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE laporan_harian MODIFY spk_id BIGINT UNSIGNED NOT NULL');
    }
};
