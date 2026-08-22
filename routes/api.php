<?php

use App\Http\Controllers\Api\AbsensiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\IzinCutiController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Controllers\Api\PegawaiController;
use App\Http\Controllers\Api\PengeluaranController;
use App\Http\Controllers\Api\RekapController;
use App\Http\Controllers\Api\SettingController;
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

        /*
        |----------------------------------------------------------------
        | Aplikasi Absensi (AOB ABSENSI)
        |----------------------------------------------------------------
        */
        // Absensi karyawan (selfie + geotag)
        Route::get('/absensi/status', [AbsensiController::class, 'status']);
        Route::post('/absensi/masuk', [AbsensiController::class, 'checkIn']);
        Route::post('/absensi/pulang', [AbsensiController::class, 'checkOut']);
        Route::get('/absensi/riwayat', [AbsensiController::class, 'riwayat']);

        // Supervisi
        Route::get('/absensi/dashboard', [AbsensiController::class, 'dashboard']);
        Route::get('/absensi/hari-ini', [AbsensiController::class, 'todayList']);
        Route::get('/absensi/{absensi}', [AbsensiController::class, 'show']);
        Route::post('/absensi/{absensi}/setujui', [AbsensiController::class, 'approve']);

        // Izin / Cuti
        Route::get('/izin', [IzinCutiController::class, 'index']);
        Route::post('/izin', [IzinCutiController::class, 'store']);
        Route::post('/izin/{izin}/status', [IzinCutiController::class, 'updateStatus']);

        // Rekap & laporan
        Route::get('/rekap', [RekapController::class, 'index']);
        Route::get('/rekap/export', [RekapController::class, 'export']);

        // Pegawai & notifikasi
        Route::get('/pegawai', [PegawaiController::class, 'index']);
        Route::get('/notifikasi', [NotifikasiController::class, 'index']);

        // Pengaturan lokasi kantor
        Route::get('/pengaturan', [SettingController::class, 'show']);
        Route::post('/pengaturan', [SettingController::class, 'update']);
    });
});
