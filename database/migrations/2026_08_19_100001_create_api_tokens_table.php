<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Token API sederhana (tanpa dependensi Sanctum) untuk autentikasi
 * aplikasi Android. Setiap login menghasilkan satu baris token acak yang
 * dikirim balik ke perangkat dan divalidasi lewat header Authorization: Bearer.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('api_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name')->default('android');
            $table->string('token', 80)->unique();
            $table->string('device')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('api_tokens');
    }
};
