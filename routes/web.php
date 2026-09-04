<?php

use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AlatBeratController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinancialReportController;
use App\Http\Controllers\FinancialStatementTypeController;
use App\Http\Controllers\GajiKaryawanController;
use App\Http\Controllers\GolonganController;
use App\Http\Controllers\KontrakKerjaController;
use App\Http\Controllers\LaporanAbsensiController;
use App\Http\Controllers\LaporanHarianController;
use App\Http\Controllers\MainAccountController;
use App\Http\Controllers\OperatorController;
use App\Http\Controllers\PenerimaanGudangController;
use App\Http\Controllers\PengeluaranGudangController;
use App\Http\Controllers\BarangController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PettyCashController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PurchaseRequestController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
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

    // Profil pengguna (semua role)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::resource('alat-berat', AlatBeratController::class);
        Route::resource('operator', OperatorController::class);
        Route::resource('client', ClientController::class);
        Route::resource('golongan', GolonganController::class)->except(['show']);
        Route::resource('gaji', GajiKaryawanController::class)->except(['edit', 'update']);
        Route::post('gaji/{penggajian}/hitung', [GajiKaryawanController::class, 'hitung'])->name('gaji.hitung');
        Route::resource('absensi', AbsensiController::class)->only(['index', 'store']);
        Route::get('laporan-absensi/harian', [LaporanAbsensiController::class, 'harian'])->name('laporan-absensi.harian');
        Route::get('laporan-absensi/mingguan', [LaporanAbsensiController::class, 'mingguan'])->name('laporan-absensi.mingguan');
        Route::get('laporan-absensi/bulanan', [LaporanAbsensiController::class, 'bulanan'])->name('laporan-absensi.bulanan');
        Route::get('laporan-absensi/tahunan', [LaporanAbsensiController::class, 'tahunan'])->name('laporan-absensi.tahunan');
        Route::resource('main-account', MainAccountController::class)->except(['show']);
        Route::resource('financial-statement-type', FinancialStatementTypeController::class)->except(['show']);
        Route::resource('account', AccountController::class)->except(['show']);
        Route::resource('petty-cash', PettyCashController::class);
        Route::get('neraca-saldo', [FinancialReportController::class, 'neracaSaldo'])->name('neraca-saldo.index');
        Route::get('laba-rugi', [FinancialReportController::class, 'labaRugi'])->name('laba-rugi.index');
        Route::get('neraca', [FinancialReportController::class, 'neraca'])->name('neraca.index');
        Route::get('trial-balance', [FinancialReportController::class, 'trialBalance'])->name('trial-balance.index');

        // Manajemen User
        Route::resource('user', UserController::class)->except(['show']);
        Route::resource('role', RoleController::class)->except(['show']);
        Route::resource('permission', PermissionController::class)->except(['show']);
        Route::get('audit-log', [AuditLogController::class, 'index'])->name('audit-log.index');
        Route::get('audit-log/{auditLog}', [AuditLogController::class, 'show'])->name('audit-log.show');
    });

    // Admin + Supervisor
    Route::middleware('role:admin,supervisor')->group(function () {
        Route::resource('kontrak-kerja', KontrakKerjaController::class);
        Route::post('kontrak-kerja/{kontrakKerja}/approve', [KontrakKerjaController::class, 'approve'])->name('kontrak-kerja.approve');
        Route::patch('kontrak-kerja/{kontrakKerja}/status', [KontrakKerjaController::class, 'updateStatus'])->name('kontrak-kerja.status');
        Route::resource('spk', SpkController::class);
        Route::post('spk/{spk}/approve', [SpkController::class, 'approve'])->name('spk.approve');
        Route::patch('spk/{spk}/status', [SpkController::class, 'updateStatus'])->name('spk.status');
        Route::get('statistik', [StatistikController::class, 'index'])->name('statistik.index');
        Route::resource('pengeluaran-gudang', PengeluaranGudangController::class);
    });

    // Gudang - Master Barang & Purchase Request
    Route::resource('barang', BarangController::class);
    Route::resource('purchase-request', PurchaseRequestController::class);
    Route::post('purchase-request/{purchase_request}/approve', [PurchaseRequestController::class, 'approve'])->name('purchase-request.approve');

    // All roles
    Route::resource('laporan-harian', LaporanHarianController::class);
    Route::resource('penerimaan-gudang', PenerimaanGudangController::class)->only(['index', 'create', 'store', 'show']);
    Route::get('stok-gudang', [StokGudangController::class, 'index'])->name('stok-gudang.index');
});
