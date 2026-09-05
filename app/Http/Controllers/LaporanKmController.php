<?php

namespace App\Http\Controllers;

use App\Models\AlatBerat;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LaporanKmController extends Controller
{
    /**
     * Rekap Kilometer (KM) alat berat per bulan.
     *
     * Untuk tiap alat ditampilkan:
     *  - KM Sebelumnya  : akumulasi pemakaian KM sebelum bulan terpilih.
     *  - KM Bulan Ini   : total pemakaian KM (Σ km_akhir - km_awal) pada bulan terpilih.
     *  - KM s/d Bulan   : KM Sebelumnya + KM Bulan Ini.
     *
     * Contoh: DT-0001 sebelumnya 5.651 KM, bulan ini 159 KM => s/d bulan 5.810 KM.
     */
    public function bulanan(Request $request)
    {
        Carbon::setLocale('id');

        $bulan = $request->get('bulan', now()->format('Y-m'));
        [$year, $month] = explode('-', $bulan);
        $periode = Carbon::createFromDate($year, $month, 1);
        $awalBulan = $periode->copy()->startOfMonth()->toDateString();

        // Ekspresi pemakaian KM per laporan (aman terhadap nilai null / mundur).
        $pemakaian = 'CASE WHEN km_akhir IS NOT NULL AND km_awal IS NOT NULL '
            . 'AND km_akhir >= km_awal THEN km_akhir - km_awal ELSE 0 END';

        // Akumulasi KM sebelum bulan terpilih, per alat.
        $sebelumnya = DB::table('laporan_harian')
            ->select('alat_berat_id', DB::raw("SUM($pemakaian) AS total"))
            ->where('tanggal', '<', $awalBulan)
            ->groupBy('alat_berat_id')
            ->pluck('total', 'alat_berat_id');

        // Pemakaian KM pada bulan terpilih, per alat.
        $bulanIni = DB::table('laporan_harian')
            ->select('alat_berat_id', DB::raw("SUM($pemakaian) AS total"))
            ->whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month)
            ->groupBy('alat_berat_id')
            ->pluck('total', 'alat_berat_id');

        $alatBerat = AlatBerat::orderBy('kode_alat')->get();

        $laporan = $alatBerat->map(function ($alat, $i) use ($sebelumnya, $bulanIni) {
            $km_sebelumnya = (float) ($sebelumnya[$alat->id] ?? 0);
            $km_bulan_ini = (float) ($bulanIni[$alat->id] ?? 0);

            return [
                'id' => $alat->id,
                'no' => $i + 1,
                'kode_alat' => $alat->kode_alat,
                'nama_alat' => $alat->nama_alat,
                'jenis' => $alat->jenis,
                'km_sebelumnya' => round($km_sebelumnya, 2),
                'km_bulan_ini' => round($km_bulan_ini, 2),
                'km_total' => round($km_sebelumnya + $km_bulan_ini, 2),
            ];
        })->values();

        $totals = [
            'km_sebelumnya' => round($laporan->sum('km_sebelumnya'), 2),
            'km_bulan_ini' => round($laporan->sum('km_bulan_ini'), 2),
            'km_total' => round($laporan->sum('km_total'), 2),
        ];

        return Inertia::render('LaporanKm/Bulanan', [
            'laporan' => $laporan,
            'bulan' => $bulan,
            'periode' => $periode->isoFormat('MMMM Y'),
            'totals' => $totals,
        ]);
    }
}
