<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel lokasi kantor untuk absensi multi-office. Setiap kantor punya titik
 * koordinat + radius sendiri; karyawan boleh absen bila berada dalam radius
 * salah satu kantor yang aktif.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('offices')) {
            return;
        }

        Schema::create('offices', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->unsignedInteger('radius_m')->default(20);
            $table->boolean('aktif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offices');
    }
};
