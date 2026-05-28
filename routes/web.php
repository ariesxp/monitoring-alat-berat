<?php

use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\AlatBeratController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GajiKaryawanController;
use App\Http\Controllers\GolonganController;
use App\Http\Controllers\KontrakKerjaController;
use App\Http\Controllers\LaporanHarianController;
use App\Http\Controllers\OperatorController;
use App\Http\Controllers\PenerimaanGudangController;
use App\Http\Controllers\PengeluaranGudangController;
use App\Http\Controllers\SpkController;
use App\Http\Controllers\StatistikController;
use App\Http\Controllers\StokGudangController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect('/login'));

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::resource('alat-berat', AlatBeratController::class);
        Route::resource('operator', OperatorController::class);
        Route::resource('client', ClientController::class);
        Route::resource('golongan', GolonganController::class)->except(['show']);
        Route::resource('gaji', GajiKaryawanController::class)->except(['edit', 'update']);
        Route::post('gaji/{penggajian}/hitung', [GajiKaryawanController::class, 'hitung'])->name('gaji.hitung');
        Route::resource('absensi', AbsensiController::class)->only(['index', 'store']);
    });

    // Admin + Supervisor
    Route::middleware('role:admin,supervisor')->group(function () {
        Route::resource('kontrak-kerja', KontrakKerjaController::class);
        Route::post('kontrak-kerja/{kontrakKerja}/approve', [KontrakKerjaController::class, 'approve'])->name('kontrak-kerja.approve');
        Route::resource('spk', SpkController::class);
        Route::post('spk/{spk}/approve', [SpkController::class, 'approve'])->name('spk.approve');
        Route::get('statistik', [StatistikController::class, 'index'])->name('statistik.index');
        Route::resource('pengeluaran-gudang', PengeluaranGudangController::class);
    });

    // All roles
    Route::resource('laporan-harian', LaporanHarianController::class);
    Route::resource('penerimaan-gudang', PenerimaanGudangController::class)->only(['index', 'create', 'store', 'show']);
    Route::get('stok-gudang', [StokGudangController::class, 'index'])->name('stok-gudang.index');
});
