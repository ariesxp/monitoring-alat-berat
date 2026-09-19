<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Menambah kolom verifikasi gudang pada laporan_harian:
 *  - jenis_bbm, ritase           : nilai dari driver (aplikasi monitoring)
 *  - status_verifikasi           : menunggu | disetujui (default menunggu)
 *  - ritase_koreksi, bbm_koreksi : koreksi opsional oleh petugas gudang
 *  - verified_by, verified_at    : jejak siapa & kapan menyetujui
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan_harian', function (Blueprint $table) {
            if (!Schema::hasColumn('laporan_harian', 'jenis_bbm')) {
                $table->string('jenis_bbm', 20)->nullable()->after('bbm_liter');
            }
            if (!Schema::hasColumn('laporan_harian', 'ritase')) {
                $table->unsignedInteger('ritase')->nullable()->after('jenis_bbm');
            }
            if (!Schema::hasColumn('laporan_harian', 'status_verifikasi')) {
                $table->enum('status_verifikasi', ['menunggu', 'disetujui'])
                    ->default('menunggu')->after('ritase');
            }
            if (!Schema::hasColumn('laporan_harian', 'ritase_koreksi')) {
                $table->unsignedInteger('ritase_koreksi')->nullable()->after('status_verifikasi');
            }
            if (!Schema::hasColumn('laporan_harian', 'bbm_koreksi')) {
                $table->decimal('bbm_koreksi', 10, 2)->nullable()->after('ritase_koreksi');
            }
            if (!Schema::hasColumn('laporan_harian', 'verified_by')) {
                $table->unsignedBigInteger('verified_by')->nullable()->after('bbm_koreksi');
            }
            if (!Schema::hasColumn('laporan_harian', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('verified_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('laporan_harian', function (Blueprint $table) {
            foreach ([
                'jenis_bbm', 'ritase', 'status_verifikasi',
                'ritase_koreksi', 'bbm_koreksi', 'verified_by', 'verified_at',
            ] as $col) {
                if (Schema::hasColumn('laporan_harian', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
