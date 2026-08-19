<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alat_berat', function (Blueprint $table) {
            $table->enum('status_kepemilikan', ['milik', 'sewa'])->default('milik')->after('tahun');
            $table->decimal('hm_sewa_awal', 10, 2)->nullable()->after('hm_awal');
        });
    }

    public function down(): void
    {
        Schema::table('alat_berat', function (Blueprint $table) {
            $table->dropColumn(['status_kepemilikan', 'hm_sewa_awal']);
        });
    }
};
