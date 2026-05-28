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

        return Inertia::render('Statistik/Index', [
            'jamKerjaPerAlat' => $jamKerjaPerAlat,
            'biayaPerBulan' => $biayaPerBulan,
            'kontrakPerStatus' => $kontrakPerStatus,
            'utilisasiAlat' => $utilisasiAlat,
            'bbmPerBulan' => $bbmPerBulan,
            'tahun' => $year,
        ]);
    }
}
