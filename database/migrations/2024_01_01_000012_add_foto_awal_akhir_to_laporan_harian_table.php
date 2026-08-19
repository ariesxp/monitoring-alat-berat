<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan_harian', function (Blueprint $table) {
            $table->string('foto_awal')->nullable()->after('foto');
            $table->string('foto_akhir')->nullable()->after('foto_awal');
        });
    }

    public function down(): void
    {
        Schema::table('laporan_harian', function (Blueprint $table) {
            $table->dropColumn(['foto_awal', 'foto_akhir']);
        });
    }
};
