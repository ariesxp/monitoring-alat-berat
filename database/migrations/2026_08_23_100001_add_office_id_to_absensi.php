<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Mencatat di kantor mana absensi dilakukan (multi-office). Nullable agar
 * kompatibel dengan data lama yang belum punya kantor tertaut.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            if (!Schema::hasColumn('absensi', 'office_id')) {
                $table->foreignId('office_id')->nullable()->after('lokasi')
                    ->constrained('offices')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            if (Schema::hasColumn('absensi', 'office_id')) {
                $table->dropConstrainedForeignId('office_id');
            }
        });
    }
};
