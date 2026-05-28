<?php

namespace App\Http\Controllers;

use App\Models\AlatBerat;
use App\Models\Barang;
use App\Models\BiayaOperasional;
use App\Models\KontrakKerja;
use App\Models\LaporanHarian;
use App\Models\Spk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $bulan = $request->get('bulan', date('Y-m'));
        [$year, $month] = explode('-', $bulan);

        $kontrakAktif = KontrakKerja::where('status', 'aktif')->count();
        $alatBeroperasi = AlatBerat::where('status', 'beroperasi')->count();
        $totalAlat = AlatBerat::count();
        $spkAktif = Spk::whereIn('status', ['disetujui', 'berlangsung'])->count();

        $pendapatanBulan = KontrakKerja::where('status', 'aktif')
            ->whereMonth('tanggal_mulai', '<=', $month)
            ->whereYear('tanggal_mulai', '<=', $year)
            ->sum('nilai_kontrak');

        $biayaBulan = BiayaOperasional::whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month)
            ->sum('jumlah');

        $stokMenipis = Barang::whereColumn('stok_saat_ini', '<=', 'stok_minimum')
            ->where('stok_minimum', '>', 0)
            ->count();

        $laporanTerbaru = LaporanHarian::with(['spk', 'alatBerat', 'operator'])
            ->orderByDesc('tanggal')
            ->limit(5)
            ->get();

        $statusAlat = AlatBerat::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $biayaPerKategori = BiayaOperasional::selectRaw('kategori, sum(jumlah) as total')
            ->whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month)
            ->groupBy('kategori')
            ->pluck('total', 'kategori');

        $biayaBulanan = BiayaOperasional::selectRaw('DATE_FORMAT(tanggal, "%Y-%m") as bulan, sum(jumlah) as total')
            ->whereYear('tanggal', $year)
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->pluck('total', 'bulan');

        return Inertia::render('Dashboard', [
            'stats' => [
                'kontrak_aktif' => $kontrakAktif,
                'alat_beroperasi' => $alatBeroperasi,
                'total_alat' => $totalAlat,
                'spk_aktif' => $spkAktif,
                'pendapatan_bulan' => $pendapatanBulan,
                'biaya_bulan' => $biayaBulan,
                'stok_menipis' => $stokMenipis,
            ],
            'status_alat' => $statusAlat,
            'biaya_per_kategori' => $biayaPerKategori,
            'biaya_bulanan' => $biayaBulanan,
            'laporan_terbaru' => $laporanTerbaru,
            'bulan' => $bulan,
        ]);
    }
}
