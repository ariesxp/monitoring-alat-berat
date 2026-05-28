<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alat_berat', function (Blueprint $table) {
            $table->string('no_mesin', 100)->nullable()->after('nomor_polisi');
            $table->string('no_chassis', 100)->nullable()->after('no_mesin');
            $table->string('dealer', 255)->nullable()->after('no_chassis');
            $table->decimal('harga', 15, 2)->nullable()->after('dealer');
            $table->string('invoice', 100)->nullable()->after('harga');
            $table->decimal('hm_awal', 10, 2)->nullable()->after('invoice');
        });
    }

    public function down(): void
    {
        Schema::table('alat_berat', function (Blueprint $table) {
            $table->dropColumn(['no_mesin', 'no_chassis', 'dealer', 'harga', 'invoice', 'hm_awal']);
        });
    }
};
