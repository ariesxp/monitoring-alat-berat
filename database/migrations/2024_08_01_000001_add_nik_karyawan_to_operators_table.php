<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operators', function (Blueprint $table) {
            $table->string('nik_karyawan', 20)->nullable()->unique()->after('kode_karyawan');
        });
    }

    public function down(): void
    {
        Schema::table('operators', function (Blueprint $table) {
            $table->dropColumn('nik_karyawan');
        });
    }
};
