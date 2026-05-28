<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operators', function (Blueprint $table) {
            $table->string('kode_karyawan', 20)->nullable()->unique()->after('id');
            $table->string('departemen', 50)->nullable()->after('jabatan');
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->nullable()->after('nik');
            $table->string('tempat_lahir', 100)->nullable()->after('jenis_kelamin');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->enum('status_perkawinan', ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'])->nullable()->after('tanggal_masuk');
            $table->string('pendidikan', 50)->nullable()->after('status_perkawinan');
        });
    }

    public function down(): void
    {
        Schema::table('operators', function (Blueprint $table) {
            $table->dropColumn([
                'kode_karyawan',
                'departemen',
                'jenis_kelamin',
                'tempat_lahir',
                'tanggal_lahir',
                'status_perkawinan',
                'pendidikan',
            ]);
        });
    }
};
