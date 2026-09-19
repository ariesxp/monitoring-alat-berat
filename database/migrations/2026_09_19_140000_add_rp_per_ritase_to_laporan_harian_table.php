<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Snapshot tarif Rp/Ritase pada laporan_harian, disalin dari settings saat
 * laporan dibuat, agar perubahan tarif tidak mengubah pendapatan data lama.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan_harian', function (Blueprint $table) {
            if (!Schema::hasColumn('laporan_harian', 'rp_per_ritase')) {
                $table->decimal('rp_per_ritase', 12, 2)->nullable()->after('ritase');
            }
        });
    }

    public function down(): void
    {
        Schema::table('laporan_harian', function (Blueprint $table) {
            if (Schema::hasColumn('laporan_harian', 'rp_per_ritase')) {
                $table->dropColumn('rp_per_ritase');
            }
        });
    }
};
