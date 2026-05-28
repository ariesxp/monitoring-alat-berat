<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kontrak_kerja', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_kontrak', 50)->unique();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->string('nama_proyek');
            $table->string('lokasi_proyek');
            $table->text('deskripsi')->nullable();
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->decimal('nilai_kontrak', 15, 2);
            $table->enum('status', ['draft', 'aktif', 'selesai', 'dibatalkan'])->default('draft');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('kontrak_alat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kontrak_kerja_id')->constrained('kontrak_kerja')->cascadeOnDelete();
            $table->foreignId('alat_berat_id')->constrained('alat_berat')->cascadeOnDelete();
            $table->foreignId('operator_id')->nullable()->constrained('operators')->nullOnDelete();
            $table->decimal('tarif_harian', 15, 2)->default(0);
            $table->decimal('tarif_bulanan', 15, 2)->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kontrak_alat');
        Schema::dropIfExists('kontrak_kerja');
    }
};
