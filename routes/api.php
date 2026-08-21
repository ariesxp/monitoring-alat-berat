<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\PengeluaranController;
use Illuminate\Support\Facades\Route;

Route::post('/webhook/fonnte', [\App\Http\Controllers\Api\WhatsappWebhookController::class, 'handle'])
    ->name('webhook.fonnte');

/*
|--------------------------------------------------------------------------
| API Aplikasi Android — AOB Gudang (Pengeluaran Barang)
|--------------------------------------------------------------------------
| Autentikasi memakai token Bearer sederhana (tabel api_tokens) tanpa
| dependensi Sanctum. Prefix: /api/v1
*/
Route::prefix('v1')->group(function () {
    // Publik
    Route::post('/login', [AuthController::class, 'login']);

    // Terproteksi token
    Route::middleware('auth.apitoken')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);

        // Data master untuk form
        Route::get('/kategori', [MasterController::class, 'kategori']);
        Route::get('/alat-berat', [MasterController::class, 'alatBerat']);
        Route::get('/barang', [MasterController::class, 'barang']);

        // Pengeluaran
        Route::get('/pengeluaran', [PengeluaranController::class, 'index']);
        Route::post('/pengeluaran', [PengeluaranController::class, 'store']);
        Route::get('/pengeluaran/{pengeluaran}', [PengeluaranController::class, 'show']);

        // Ringkasan & laporan
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/laporan', [LaporanController::class, 'index']);
    });
});
