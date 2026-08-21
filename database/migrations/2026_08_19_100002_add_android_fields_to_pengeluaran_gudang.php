<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Menyiapkan tabel pengeluaran_gudang untuk input dari aplikasi Android:
 *  - sumber_input : menandai asal transaksi ('web' | 'android')
 *  - foto         : path bukti foto (opsional) yang diunggah dari perangkat
 *  - jenis_pengeluaran : label kategori (mis. BBM) sesuai form mock-up
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengeluaran_gudang', function (Blueprint $table) {
            if (!Schema::hasColumn('pengeluaran_gudang', 'sumber_input')) {
                $table->enum('sumber_input', ['web', 'android'])->default('web')->after('tujuan');
            }
            if (!Schema::hasColumn('pengeluaran_gudang', 'jenis_pengeluaran')) {
                $table->string('jenis_pengeluaran', 100)->nullable()->after('sumber_input');
            }
            if (!Schema::hasColumn('pengeluaran_gudang', 'foto')) {
                $table->string('foto')->nullable()->after('jenis_pengeluaran');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pengeluaran_gudang', function (Blueprint $table) {
            foreach (['sumber_input', 'jenis_pengeluaran', 'foto'] as $col) {
                if (Schema::hasColumn('pengeluaran_gudang', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
