<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kategori_barang', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });

        Schema::create('barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_barang_id')->constrained('kategori_barang')->cascadeOnDelete();
            $table->string('kode_barang', 50)->unique();
            $table->string('nama_barang');
            $table->string('satuan', 50);
            $table->decimal('stok_minimum', 10, 2)->default(0);
            $table->decimal('stok_saat_ini', 10, 2)->default(0);
            $table->decimal('harga_satuan', 15, 2)->default(0);
            $table->string('lokasi_gudang')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('penerimaan_gudang', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_penerimaan', 50)->unique();
            $table->date('tanggal_terima');
            $table->string('supplier');
            $table->string('nomor_surat_jalan', 100)->nullable();
            $table->text('catatan')->nullable();
            $table->enum('sumber_input', ['web', 'whatsapp'])->default('web');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('detail_penerimaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penerimaan_gudang_id')->constrained('penerimaan_gudang')->cascadeOnDelete();
            $table->foreignId('barang_id')->constrained('barang')->cascadeOnDelete();
            $table->decimal('jumlah', 10, 2);
            $table->decimal('harga_satuan', 15, 2)->default(0);
            $table->decimal('total_harga', 15, 2)->default(0);
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('pengeluaran_gudang', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pengeluaran', 50)->unique();
            $table->date('tanggal_keluar');
            $table->foreignId('spk_id')->nullable()->constrained('spk')->nullOnDelete();
            $table->foreignId('alat_berat_id')->nullable()->constrained('alat_berat')->nullOnDelete();
            $table->string('tujuan');
            $table->text('catatan')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('detail_pengeluaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengeluaran_gudang_id')->constrained('pengeluaran_gudang')->cascadeOnDelete();
            $table->foreignId('barang_id')->constrained('barang')->cascadeOnDelete();
            $table->decimal('jumlah', 10, 2);
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_pengeluaran');
        Schema::dropIfExists('pengeluaran_gudang');
        Schema::dropIfExists('detail_penerimaan');
        Schema::dropIfExists('penerimaan_gudang');
        Schema::dropIfExists('barang');
        Schema::dropIfExists('kategori_barang');
    }
};
