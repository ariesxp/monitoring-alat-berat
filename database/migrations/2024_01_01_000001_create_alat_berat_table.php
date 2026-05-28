<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alat_berat', function (Blueprint $table) {
            $table->id();
            $table->string('kode_alat', 50)->unique();
            $table->string('nama_alat');
            $table->string('jenis', 100);
            $table->string('merk', 100);
            $table->year('tahun')->nullable();
            $table->string('nomor_seri', 100)->nullable();
            $table->string('nomor_polisi', 20)->nullable();
            $table->enum('status', ['tersedia', 'beroperasi', 'maintenance', 'rusak'])->default('tersedia');
            $table->string('lokasi_terakhir')->nullable();
            $table->string('foto')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alat_berat');
    }
};
