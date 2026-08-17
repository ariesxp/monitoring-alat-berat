<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Menambah kolom `password` pada tabel operators. Dipakai untuk login
 * aplikasi Android (username = NIK operator). Default: "12345".
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('operators', 'password')) {
            Schema::table('operators', function (Blueprint $table) {
                $table->string('password')->nullable()->after('nama');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('operators', 'password')) {
            Schema::table('operators', function (Blueprint $table) {
                $table->dropColumn('password');
            });
        }
    }
};
