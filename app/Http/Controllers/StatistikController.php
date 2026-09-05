<?php

namespace App\Http\Controllers;

use App\Models\AlatBerat;
use App\Models\BiayaOperasional;
use App\Models\KontrakKerja;
use App\Models\LaporanHarian;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatistikController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->get('tahun', date('Y'));

        $jamKerjaPerAlat = LaporanHarian::selectRaw('alat_berat_id, sum(jam_kerja) as total_jam, sum(bbm_liter) as total_bbm')
            ->whereYear('tanggal', $year)
            ->groupBy('alat_berat_id')
            ->with('alatBerat')
            ->get();

        $biayaPerBulan = BiayaOperasional::selectRaw('DATE_FORMAT(tanggal, "%Y-%m") as bulan, kategori, sum(jumlah) as total')
            ->whereYear('tanggal', $year)
            ->groupBy('bulan', 'kategori')
            ->orderBy('bulan')
            ->get();

        $kontrakPerStatus = KontrakKerja::selectRaw('status, count(*) as total, sum(nilai_kontrak) as nilai')
            ->groupBy('status')
            ->get();

        $utilisasiAlat = AlatBerat::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $bbmPerBulan = LaporanHarian::selectRaw('DATE_FORMAT(tanggal, "%Y-%m") as bulan, sum(bbm_liter) as total')
            ->whereYear('tanggal', $year)
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->pluck('total', 'bulan');

        // Progress Pekerjaan: akumulasi muatan m³ yang sudah diangkut per area (tahun terpilih).
        $progressArea = LaporanHarian::query()
            ->leftJoin('spk', 'laporan_harian.spk_id', '=', 'spk.id')
            ->whereYear('laporan_harian.tanggal', $year)
            ->whereRaw("LOWER(laporan_harian.satuan_volume) IN ('m³', 'm3', 'meter kubik', 'kubik')")
            ->selectRaw("COALESCE(NULLIF(laporan_harian.lokasi_kerja, ''), spk.lokasi_kerja, 'Tanpa Area') as area")
            ->selectRaw('SUM(laporan_harian.volume_pekerjaan) as total_m3')
            ->groupBy('area')
            ->orderByDesc('total_m3')
            ->get()
            ->map(fn ($r) => [
                'area' => $r->area,
                'total_m3' => round((float) $r->total_m3, 2),
            ]);

        $totalMuatan = round($progressArea->sum('total_m3'), 2);

        return Inertia::render('Statistik/Index', [
            'jamKerjaPerAlat' => $jamKerjaPerAlat,
            'biayaPerBulan' => $biayaPerBulan,
            'kontrakPerStatus' => $kontrakPerStatus,
            'utilisasiAlat' => $utilisasiAlat,
            'bbmPerBulan' => $bbmPerBulan,
            'progressArea' => $progressArea,
            'totalMuatan' => $totalMuatan,
            'tahun' => $year,
        ]);
    }
}
