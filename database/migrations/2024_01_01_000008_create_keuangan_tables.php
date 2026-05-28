<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absensi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('operator_id')->constrained('operators')->cascadeOnDelete();
            $table->date('tanggal');
            $table->time('jam_masuk')->nullable();
            $table->time('jam_pulang')->nullable();
            $table->enum('status', ['hadir', 'sakit', 'izin', 'alpha', 'cuti', 'libur'])->default('hadir');
            $table->text('keterangan')->nullable();
            $table->enum('sumber_input', ['web', 'whatsapp'])->default('web');
            $table->timestamps();

            $table->unique(['operator_id', 'tanggal']);
        });

        Schema::create('penggajian', function (Blueprint $table) {
            $table->id();
            $table->string('periode', 7);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->enum('status', ['draft', 'diproses', 'selesai'])->default('draft');
            $table->text('catatan')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('detail_gaji', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penggajian_id')->constrained('penggajian')->cascadeOnDelete();
            $table->foreignId('operator_id')->constrained('operators')->cascadeOnDelete();
            $table->decimal('gaji_pokok', 15, 2);
            $table->decimal('tunjangan', 15, 2)->default(0);
            $table->integer('hari_kerja');
            $table->integer('hari_hadir');
            $table->decimal('lembur_jam', 5, 2)->default(0);
            $table->decimal('upah_lembur', 15, 2)->default(0);
            $table->decimal('potongan', 15, 2)->default(0);
            $table->text('keterangan_potongan')->nullable();
            $table->decimal('total_gaji', 15, 2);
            $table->timestamps();
        });

        Schema::create('biaya_operasional', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kontrak_kerja_id')->nullable()->constrained('kontrak_kerja')->nullOnDelete();
            $table->foreignId('alat_berat_id')->nullable()->constrained('alat_berat')->nullOnDelete();
            $table->foreignId('spk_id')->nullable()->constrained('spk')->nullOnDelete();
            $table->date('tanggal');
            $table->enum('kategori', ['bbm', 'sparepart', 'maintenance', 'transport', 'lainnya']);
            $table->string('deskripsi');
            $table->decimal('jumlah', 15, 2);
            $table->string('bukti')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('biaya_operasional');
        Schema::dropIfExists('detail_gaji');
        Schema::dropIfExists('penggajian');
        Schema::dropIfExists('absensi');
    }
};
