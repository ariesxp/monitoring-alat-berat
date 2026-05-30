<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->string('barcode', 100)->nullable()->unique()->after('kode_barang');
            $table->string('gambar')->nullable()->after('lokasi_gudang');
        });
    }

    public function down(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->dropColumn(['barcode', 'gambar']);
        });
    }
};
