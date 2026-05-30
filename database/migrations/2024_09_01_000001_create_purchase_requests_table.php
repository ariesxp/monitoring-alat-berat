<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_requests', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pr', 50)->unique();
            $table->enum('domisili', ['HO', 'Site']);
            $table->enum('jenis_pr', ['Inventory', 'Asset']);
            $table->string('kode_site', 50);
            $table->string('nama_site');
            $table->date('posting_date');
            $table->string('lokasi_gudang');
            $table->text('keterangan')->nullable();
            $table->string('lampiran')->nullable();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['Draft', 'Pending', 'Approved', 'Rejected'])->default('Draft');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_note')->nullable();
            $table->timestamps();
        });

        Schema::create('purchase_request_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_request_id')->constrained('purchase_requests')->cascadeOnDelete();
            $table->string('jenis_barang');
            $table->string('barcode')->nullable();
            $table->string('kode_barang', 50);
            $table->string('nama_barang');
            $table->string('satuan', 50);
            $table->decimal('quantity', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_request_details');
        Schema::dropIfExists('purchase_requests');
    }
};
