<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Operator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanAbsensiController extends Controller
{
    /** Daftar status absensi yang direkap. */
    private array $statuses = ['hadir', 'sakit', 'izin', 'alpha', 'cuti', 'libur'];

    /**
     * Laporan Absensi Mingguan.
     * Menampilkan grid harian (Senin–Minggu) beserta rekap status per operator.
     */
    public function mingguan(Request $request)
    {
        Carbon::setLocale('id');

        $ref = $request->get('tanggal', now()->toDateString());
        $start = Carbon::parse($ref)->startOfWeek(Carbon::MONDAY);
        $end = (clone $start)->endOfWeek(Carbon::SUNDAY);

        // Susun label 7 hari dalam minggu.
        $hari = [];
        for ($d = 0; $d < 7; $d++) {
            $tgl = (clone $start)->addDays($d);
            $hari[] = [
                'tanggal' => $tgl->toDateString(),
                'hari' => $tgl->isoFormat('ddd'),
                'label' => $tgl->isoFormat('DD/MM'),
            ];
        }

        $operators = Operator::aktif()->orderBy('nama')->get();

        $absensi = Absensi::whereBetween('tanggal', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->groupBy('operator_id');

        $laporan = $operators->map(function ($op) use ($absensi, $hari) {
            $records = ($absensi->get($op->id) ?? collect())
                ->keyBy(fn ($r) => Carbon::parse($r->tanggal)->toDateString());

            $counts = array_fill_keys($this->statuses, 0);
            $harian = [];

            foreach ($hari as $h) {
                $rec = $records->get($h['tanggal']);
                if ($rec) {
                    $counts[$rec->status] = ($counts[$rec->status] ?? 0) + 1;
                    $harian[$h['tanggal']] = [
                        'status' => $rec->status,
                        'jam_masuk' => $rec->jam_masuk,
                        'jam_pulang' => $rec->jam_pulang,
                    ];
                } else {
                    $harian[$h['tanggal']] = null;
                }
            }

            return [
                'id' => $op->id,
                'nama' => $op->nama,
                'jabatan' => $op->jabatan,
                'harian' => $harian,
                'counts' => $counts,
            ];
        })->values();

        return Inertia::render('LaporanAbsensi/Mingguan', [
            'laporan' => $laporan,
            'hari' => $hari,
            'periode' => [
                'tanggal' => $start->toDateString(),
                'mulai' => $start->isoFormat('D MMMM Y'),
                'selesai' => $end->isoFormat('D MMMM Y'),
            ],
            'statuses' => $this->statuses,
            'totals' => $this->hitungTotal($laporan),
        ]);
    }

    /**
     * Laporan Absensi Bulanan.
     * Rekap jumlah tiap status per operator dalam satu bulan.
     */
    public function bulanan(Request $request)
    {
        Carbon::setLocale('id');

        $bulan = $request->get('bulan', now()->format('Y-m'));
        [$year, $month] = explode('-', $bulan);
        $periode = Carbon::createFromDate($year, $month, 1);

        $operators = Operator::aktif()->orderBy('nama')->get();

        $absensi = Absensi::whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month)
            ->get()
            ->groupBy('operator_id');

        $laporan = $operators->map(function ($op) use ($absensi) {
            $records = $absensi->get($op->id) ?? collect();
            $counts = array_fill_keys($this->statuses, 0);

            foreach ($records as $rec) {
                $counts[$rec->status] = ($counts[$rec->status] ?? 0) + 1;
            }

            $hariKerja = array_sum($counts) - $counts['libur'];
            $persentase = $hariKerja > 0 ? round($counts['hadir'] / $hariKerja * 100, 1) : 0;

            return [
                'id' => $op->id,
                'nama' => $op->nama,
                'jabatan' => $op->jabatan,
                'counts' => $counts,
                'hari_kerja' => $hariKerja,
                'persentase' => $persentase,
            ];
        })->values();

        return Inertia::render('LaporanAbsensi/Bulanan', [
            'laporan' => $laporan,
            'bulan' => $bulan,
            'periode' => $periode->isoFormat('MMMM Y'),
            'statuses' => $this->statuses,
            'totals' => $this->hitungTotal($laporan),
        ]);
    }

    /**
     * Laporan Absensi Tahunan.
     * Matriks kehadiran per bulan (12 kolom) + rekap status per operator.
     */
    public function tahunan(Request $request)
    {
        Carbon::setLocale('id');

        $tahun = $request->get('tahun', now()->format('Y'));

        $bulanLabels = [];
        for ($m = 1; $m <= 12; $m++) {
            $bulanLabels[] = Carbon::createFromDate($tahun, $m, 1)->isoFormat('MMM');
        }

        $operators = Operator::aktif()->orderBy('nama')->get();

        $absensi = Absensi::whereYear('tanggal', $tahun)
            ->get()
            ->groupBy('operator_id');

        $laporan = $operators->map(function ($op) use ($absensi) {
            $records = $absensi->get($op->id) ?? collect();

            // Jumlah hadir per bulan (indeks 0–11).
            $hadirPerBulan = array_fill(0, 12, 0);
            $counts = array_fill_keys($this->statuses, 0);

            foreach ($records as $rec) {
                $counts[$rec->status] = ($counts[$rec->status] ?? 0) + 1;
                if ($rec->status === 'hadir') {
                    $bulanIdx = (int) Carbon::parse($rec->tanggal)->format('n') - 1;
                    $hadirPerBulan[$bulanIdx]++;
                }
            }

            return [
                'id' => $op->id,
                'nama' => $op->nama,
                'jabatan' => $op->jabatan,
                'hadir_per_bulan' => $hadirPerBulan,
                'counts' => $counts,
                'total_hadir' => $counts['hadir'],
            ];
        })->values();

        return Inertia::render('LaporanAbsensi/Tahunan', [
            'laporan' => $laporan,
            'tahun' => (string) $tahun,
            'bulanLabels' => $bulanLabels,
            'statuses' => $this->statuses,
            'totals' => $this->hitungTotal($laporan),
        ]);
    }

    /** Hitung total tiap status untuk baris footer. */
    private function hitungTotal($laporan): array
    {
        $totals = array_fill_keys($this->statuses, 0);
        foreach ($laporan as $row) {
            foreach ($this->statuses as $s) {
                $totals[$s] += $row['counts'][$s] ?? 0;
            }
        }

        return $totals;
    }
}
