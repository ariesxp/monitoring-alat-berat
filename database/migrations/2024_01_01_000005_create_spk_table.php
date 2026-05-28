<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spk', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_spk', 50)->unique();
            $table->foreignId('kontrak_kerja_id')->constrained('kontrak_kerja')->cascadeOnDelete();
            $table->foreignId('alat_berat_id')->constrained('alat_berat')->cascadeOnDelete();
            $table->foreignId('operator_id')->constrained('operators')->cascadeOnDelete();
            $table->date('tanggal_spk');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai')->nullable();
            $table->string('jenis_pekerjaan');
            $table->string('lokasi_kerja');
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['draft', 'disetujui', 'berlangsung', 'selesai', 'dibatalkan'])->default('draft');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spk');
    }
};
