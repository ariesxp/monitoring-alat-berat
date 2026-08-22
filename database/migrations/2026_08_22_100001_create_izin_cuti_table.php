<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pengajuan izin / sakit / cuti oleh karyawan (operator) melalui aplikasi
 * Android, untuk direview (disetujui / ditolak) oleh supervisor.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('izin_cuti', function (Blueprint $table) {
            $table->id();
            $table->foreignId('operator_id')->constrained('operators')->cascadeOnDelete();
            $table->enum('jenis', ['izin', 'sakit', 'cuti'])->default('izin');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->decimal('jumlah_hari', 4, 1)->default(1);
            $table->text('alasan')->nullable();
            $table->string('lampiran')->nullable();
            $table->enum('status', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu');
            $table->text('catatan_approval')->nullable();
            $table->foreignId('diproses_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('diproses_pada')->nullable();
            $table->timestamps();

            $table->index(['status', 'tanggal_mulai']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('izin_cuti');
    }
};
