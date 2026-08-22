<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Menambah kolom untuk absensi berbasis kamera selfie + geotag pada aplikasi
 * Android. Menyimpan foto selfie, koordinat, dan jarak (meter) dari lokasi
 * kantor saat check-in (masuk) dan check-out (pulang), serta info persetujuan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            if (!Schema::hasColumn('absensi', 'metode')) {
                $table->string('metode', 20)->nullable()->default('GPS')->after('status');
            }
            if (!Schema::hasColumn('absensi', 'lokasi')) {
                $table->string('lokasi')->nullable()->after('metode');
            }

            // Check-in (masuk)
            if (!Schema::hasColumn('absensi', 'foto_masuk')) {
                $table->string('foto_masuk')->nullable()->after('lokasi');
            }
            if (!Schema::hasColumn('absensi', 'lat_masuk')) {
                $table->decimal('lat_masuk', 10, 7)->nullable()->after('foto_masuk');
            }
            if (!Schema::hasColumn('absensi', 'lng_masuk')) {
                $table->decimal('lng_masuk', 10, 7)->nullable()->after('lat_masuk');
            }
            if (!Schema::hasColumn('absensi', 'jarak_masuk')) {
                $table->unsignedInteger('jarak_masuk')->nullable()->after('lng_masuk');
            }

            // Check-out (pulang)
            if (!Schema::hasColumn('absensi', 'foto_pulang')) {
                $table->string('foto_pulang')->nullable()->after('jarak_masuk');
            }
            if (!Schema::hasColumn('absensi', 'lat_pulang')) {
                $table->decimal('lat_pulang', 10, 7)->nullable()->after('foto_pulang');
            }
            if (!Schema::hasColumn('absensi', 'lng_pulang')) {
                $table->decimal('lng_pulang', 10, 7)->nullable()->after('lat_pulang');
            }
            if (!Schema::hasColumn('absensi', 'jarak_pulang')) {
                $table->unsignedInteger('jarak_pulang')->nullable()->after('lng_pulang');
            }

            // Persetujuan supervisor
            if (!Schema::hasColumn('absensi', 'disetujui_oleh')) {
                $table->foreignId('disetujui_oleh')->nullable()->after('keterangan')
                    ->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('absensi', 'disetujui_pada')) {
                $table->timestamp('disetujui_pada')->nullable()->after('disetujui_oleh');
            }
        });

        // Izinkan sumber_input = 'android'. MariaDB: ubah definisi enum.
        try {
            DB::statement("ALTER TABLE absensi MODIFY sumber_input ENUM('web','whatsapp','android') NOT NULL DEFAULT 'web'");
        } catch (\Throwable $e) {
            // Abaikan bila driver tidak mendukung MODIFY enum (mis. sqlite testing).
        }
    }

    public function down(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            if (Schema::hasColumn('absensi', 'disetujui_oleh')) {
                $table->dropConstrainedForeignId('disetujui_oleh');
            }
            foreach ([
                'metode', 'lokasi', 'foto_masuk', 'lat_masuk', 'lng_masuk', 'jarak_masuk',
                'foto_pulang', 'lat_pulang', 'lng_pulang', 'jarak_pulang', 'disetujui_pada',
            ] as $col) {
                if (Schema::hasColumn('absensi', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
