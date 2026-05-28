<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laporan_harian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spk_id')->constrained('spk')->cascadeOnDelete();
            $table->foreignId('alat_berat_id')->constrained('alat_berat')->cascadeOnDelete();
            $table->foreignId('operator_id')->constrained('operators')->cascadeOnDelete();
            $table->date('tanggal');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->decimal('jam_kerja', 5, 2)->default(0);
            $table->decimal('bbm_liter', 10, 2)->default(0);
            $table->decimal('hm_awal', 10, 2)->default(0);
            $table->decimal('hm_akhir', 10, 2)->default(0);
            $table->decimal('km_awal', 10, 2)->nullable();
            $table->decimal('km_akhir', 10, 2)->nullable();
            $table->string('jenis_pekerjaan');
            $table->decimal('volume_pekerjaan', 10, 2)->nullable();
            $table->string('satuan_volume', 50)->nullable();
            $table->enum('kondisi_alat', ['baik', 'kurang_baik', 'rusak'])->default('baik');
            $table->text('catatan')->nullable();
            $table->string('foto')->nullable();
            $table->enum('sumber_input', ['web', 'whatsapp'])->default('web');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_harian');
    }
};
