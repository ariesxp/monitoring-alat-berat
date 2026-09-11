<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Operator;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class LaporanAbsensiController extends Controller
{
    /** Daftar status absensi yang direkap. */
    private array $statuses = ['hadir', 'sakit', 'izin', 'alpha', 'cuti', 'libur'];

    /** Label tampilan tiap status. */
    private array $statusLabels = [
        'hadir' => 'Hadir', 'sakit' => 'Sakit', 'izin' => 'Izin',
        'alpha' => 'Alpha', 'cuti' => 'Cuti', 'libur' => 'Libur',
    ];

    /** Kode singkat status non-hadir (untuk sel harian). */
    private array $statusSingkat = ['sakit' => 'S', 'izin' => 'I', 'alpha' => 'A', 'cuti' => 'C', 'libur' => 'L'];

    /**
     * Absensi Harian.
     * Menampilkan Tanggal, Jam In, dan Jam Out untuk 7 hari terakhir per operator.
     */
    private function buildHarian(Request $request): array
    {
        Carbon::setLocale('id');

        $dari = $request->get('dari');
        $sampai = $request->get('sampai');

        // Jika rentang tanggal lengkap diisi pakai itu; selain itu 7 hari terakhir.
        if ($dari && $sampai) {
            $start = Carbon::parse($dari)->startOfDay();
            $end = Carbon::parse($sampai)->startOfDay();
            if ($end->lt($start)) {
                [$start, $end] = [$end, $start];
            }
            // Batasi maksimal 62 hari agar tabel tetap terkelola.
            if ($start->diffInDays($end) > 61) {
                $end = (clone $start)->addDays(61);
            }
        } else {
            $end = now()->startOfDay();
            $start = (clone $end)->subDays(6);
        }

        // Susun tanggal (dari terlama ke terbaru) sebagai kolom.
        $jumlahHari = $start->diffInDays($end) + 1;
        $hari = [];
        for ($d = 0; $d < $jumlahHari; $d++) {
            $tgl = (clone $start)->addDays($d);
            $hari[] = [
                'tanggal' => $tgl->toDateString(),
                'hari' => $tgl->isoFormat('ddd'),
                'label' => $tgl->isoFormat('DD/MM/YYYY'),
            ];
        }

        $operatorId = $request->get('operator_id');
        $departemen = $request->get('departemen');

        $operators = Operator::aktif()
            ->when($operatorId, fn ($q) => $q->where('id', $operatorId))
            ->when($departemen, fn ($q) => $q->where('departemen', $departemen))
            ->orderBy('nama')
            ->get();

        $absensi = Absensi::whereBetween('tanggal', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->groupBy('operator_id');

        $laporan = $operators->values()->map(function ($op, $i) use ($absensi, $hari) {
            $records = ($absensi->get($op->id) ?? collect())
                ->keyBy(fn ($r) => Carbon::parse($r->tanggal)->toDateString());

            // Map tanggal => jam in/out/status.
            $harian = [];
            $totalKehadiran = 0;
            foreach ($hari as $h) {
                $rec = $records->get($h['tanggal']);
                if ($rec && $rec->status === 'hadir') {
                    $totalKehadiran++;
                }
                $harian[$h['tanggal']] = [
                    'in' => $rec?->jam_masuk,
                    'out' => $rec?->jam_pulang,
                    'status' => $rec?->status,
                ];
            }

            return [
                'id' => $op->id,
                'no' => $i + 1,
                'nama' => $op->nama,
                'jabatan' => $op->jabatan,
                'harian' => $harian,
                'total_kehadiran' => $totalKehadiran,
            ];
        })->values();

        return [
            'laporan' => $laporan,
            'hari' => $hari,
            'periode' => [
                'mulai' => $start->isoFormat('D MMMM Y'),
                'selesai' => $end->isoFormat('D MMMM Y'),
            ],
            'operators' => Operator::aktif()
                ->when($departemen, fn ($q) => $q->where('departemen', $departemen))
                ->orderBy('nama')
                ->get(['id', 'nama']),
            'operatorId' => $operatorId,
            'dari' => $dari,
            'sampai' => $sampai,
            'departemenList' => $this->departemenList(),
            'departemen' => $departemen,
        ];
    }

    public function harian(Request $request)
    {
        return Inertia::render('LaporanAbsensi/Harian', $this->buildHarian($request));
    }

    /**
     * Laporan Absensi Mingguan.
     * Menampilkan grid harian (Senin–Minggu) beserta rekap status per operator.
     */
    private function buildMingguan(Request $request): array
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

        $departemen = $request->get('departemen');

        $operators = Operator::aktif()
            ->when($departemen, fn ($q) => $q->where('departemen', $departemen))
            ->orderBy('nama')
            ->get();

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

        return [
            'laporan' => $laporan,
            'hari' => $hari,
            'periode' => [
                'tanggal' => $start->toDateString(),
                'mulai' => $start->isoFormat('D MMMM Y'),
                'selesai' => $end->isoFormat('D MMMM Y'),
            ],
            'statuses' => $this->statuses,
            'totals' => $this->hitungTotal($laporan),
            'departemenList' => $this->departemenList(),
            'departemen' => $departemen,
        ];
    }

    public function mingguan(Request $request)
    {
        return Inertia::render('LaporanAbsensi/Mingguan', $this->buildMingguan($request));
    }

    /**
     * Laporan Absensi Bulanan.
     * Rekap jumlah tiap status per operator dalam satu bulan.
     */
    private function buildBulanan(Request $request): array
    {
        Carbon::setLocale('id');

        $bulan = $request->get('bulan', now()->format('Y-m'));
        $dari = $request->get('dari');
        $sampai = $request->get('sampai');

        // Jika rentang tanggal lengkap diisi, gunakan itu; selain itu pakai bulan.
        $pakaiRentang = $dari && $sampai;

        $departemen = $request->get('departemen');

        $operators = Operator::aktif()
            ->when($departemen, fn ($q) => $q->where('departemen', $departemen))
            ->orderBy('nama')
            ->get();

        if ($pakaiRentang) {
            $start = Carbon::parse($dari)->startOfDay();
            $end = Carbon::parse($sampai)->startOfDay();
            if ($end->lt($start)) {
                [$start, $end] = [$end, $start];
            }
            $absensi = Absensi::whereBetween('tanggal', [$start->toDateString(), $end->toDateString()])
                ->get()
                ->groupBy('operator_id');
            $periodeLabel = $start->isoFormat('D MMMM Y') . ' – ' . $end->isoFormat('D MMMM Y');
        } else {
            [$year, $month] = explode('-', $bulan);
            $absensi = Absensi::whereYear('tanggal', $year)
                ->whereMonth('tanggal', $month)
                ->get()
                ->groupBy('operator_id');
            $periodeLabel = Carbon::createFromDate($year, $month, 1)->isoFormat('MMMM Y');
        }

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

        return [
            'laporan' => $laporan,
            'bulan' => $bulan,
            'dari' => $pakaiRentang ? $start->toDateString() : $dari,
            'sampai' => $pakaiRentang ? $end->toDateString() : $sampai,
            'periode' => $periodeLabel,
            'statuses' => $this->statuses,
            'totals' => $this->hitungTotal($laporan),
            'departemenList' => $this->departemenList(),
            'departemen' => $departemen,
        ];
    }

    public function bulanan(Request $request)
    {
        return Inertia::render('LaporanAbsensi/Bulanan', $this->buildBulanan($request));
    }

    /**
     * Laporan Absensi Tahunan.
     * Matriks kehadiran per bulan (12 kolom) + rekap status per operator.
     */
    private function buildTahunan(Request $request): array
    {
        Carbon::setLocale('id');

        $tahun = $request->get('tahun', now()->format('Y'));

        $bulanLabels = [];
        for ($m = 1; $m <= 12; $m++) {
            $bulanLabels[] = Carbon::createFromDate($tahun, $m, 1)->isoFormat('MMM');
        }

        $departemen = $request->get('departemen');

        $operators = Operator::aktif()
            ->when($departemen, fn ($q) => $q->where('departemen', $departemen))
            ->orderBy('nama')
            ->get();

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

        return [
            'laporan' => $laporan,
            'tahun' => (string) $tahun,
            'bulanLabels' => $bulanLabels,
            'statuses' => $this->statuses,
            'totals' => $this->hitungTotal($laporan),
            'departemenList' => $this->departemenList(),
            'departemen' => $departemen,
        ];
    }

    public function tahunan(Request $request)
    {
        return Inertia::render('LaporanAbsensi/Tahunan', $this->buildTahunan($request));
    }

    /**
     * Ekspor laporan absensi ke Excel/PDF.
     * GET /laporan-absensi/{jenis}/export?format=excel|pdf (+ filter yang sama seperti halaman).
     */
    public function export(Request $request, string $jenis)
    {
        abort_unless(in_array($jenis, ['harian', 'mingguan', 'bulanan', 'tahunan'], true), 404);

        $format = $request->get('format', 'excel');
        $data = match ($jenis) {
            'harian' => $this->buildHarian($request),
            'mingguan' => $this->buildMingguan($request),
            'bulanan' => $this->buildBulanan($request),
            'tahunan' => $this->buildTahunan($request),
        };

        $table = $this->tableFor($jenis, $data);

        return $format === 'pdf'
            ? $this->exportPdf($table)
            : $this->exportExcel($table);
    }

    /**
     * Ubah hasil build menjadi struktur tabel datar untuk ekspor:
     * ['title', 'periode', 'headers' => [...], 'rows' => [[...], ...], 'filename'].
     */
    private function tableFor(string $jenis, array $data): array
    {
        return match ($jenis) {
            'harian' => $this->tableHarian($data),
            'mingguan' => $this->tableMingguan($data),
            'bulanan' => $this->tableBulanan($data),
            'tahunan' => $this->tableTahunan($data),
        };
    }

    private function tableHarian(array $data): array
    {
        $headers = ['No', 'Nama', 'Jabatan'];
        foreach ($data['hari'] as $h) {
            $headers[] = $h['label'] . ' In';
            $headers[] = $h['label'] . ' Out';
        }
        $headers[] = 'Total Kehadiran';

        $rows = [];
        foreach ($data['laporan'] as $i => $op) {
            $row = [$i + 1, $op['nama'], $op['jabatan']];
            foreach ($data['hari'] as $h) {
                $sel = $op['harian'][$h['tanggal']] ?? null;
                $row[] = $this->selHarian($sel, 'in');
                $row[] = $this->selHarian($sel, 'out');
            }
            $row[] = $op['total_kehadiran'];
            $rows[] = $row;
        }

        return [
            'title' => 'Laporan Absensi Harian',
            'periode' => 'Periode: ' . $data['periode']['mulai'] . ' – ' . $data['periode']['selesai'],
            'headers' => $headers,
            'rows' => $rows,
            'filename' => 'laporan-absensi-harian',
        ];
    }

    /** Nilai sel In/Out untuk ekspor: jam bila ada, kode status bila non-hadir, selain itu strip. */
    private function selHarian(?array $sel, string $field): string
    {
        $jam = $sel[$field] ?? null;
        if ($jam) {
            return substr((string) $jam, 0, 5);
        }
        $status = $sel['status'] ?? null;
        if ($status && $status !== 'hadir') {
            return $this->statusSingkat[$status] ?? '-';
        }
        return '-';
    }

    private function tableMingguan(array $data): array
    {
        $headers = ['No', 'Nama', 'Jabatan'];
        foreach ($data['hari'] as $h) {
            $headers[] = $h['hari'] . ' ' . $h['label'];
        }
        foreach ($data['statuses'] as $s) {
            $headers[] = $this->statusLabels[$s];
        }

        $rows = [];
        foreach ($data['laporan'] as $i => $op) {
            $row = [$i + 1, $op['nama'], $op['jabatan']];
            foreach ($data['hari'] as $h) {
                $abs = $op['harian'][$h['tanggal']] ?? null;
                $row[] = $abs ? strtoupper(substr($abs['status'], 0, 1)) : '-';
            }
            foreach ($data['statuses'] as $s) {
                $row[] = $op['counts'][$s] ?? 0;
            }
            $rows[] = $row;
        }

        return [
            'title' => 'Laporan Absensi Mingguan',
            'periode' => 'Periode: ' . $data['periode']['mulai'] . ' – ' . $data['periode']['selesai'],
            'headers' => $headers,
            'rows' => $rows,
            'filename' => 'laporan-absensi-mingguan',
        ];
    }

    private function tableBulanan(array $data): array
    {
        $headers = ['No', 'Nama', 'Jabatan'];
        foreach ($data['statuses'] as $s) {
            $headers[] = $this->statusLabels[$s];
        }
        $headers[] = 'Hari Kerja';
        $headers[] = '% Hadir';

        $rows = [];
        foreach ($data['laporan'] as $i => $op) {
            $row = [$i + 1, $op['nama'], $op['jabatan']];
            foreach ($data['statuses'] as $s) {
                $row[] = $op['counts'][$s] ?? 0;
            }
            $row[] = $op['hari_kerja'];
            $row[] = $op['persentase'] . '%';
            $rows[] = $row;
        }

        return [
            'title' => 'Laporan Absensi Bulanan',
            'periode' => 'Rekap Periode: ' . $data['periode'],
            'headers' => $headers,
            'rows' => $rows,
            'filename' => 'laporan-absensi-bulanan',
        ];
    }

    private function tableTahunan(array $data): array
    {
        $headers = ['No', 'Nama', 'Jabatan'];
        foreach ($data['bulanLabels'] as $label) {
            $headers[] = $label;
        }
        foreach ($data['statuses'] as $s) {
            $headers[] = $this->statusLabels[$s];
        }
        $headers[] = 'Total Hadir';

        $rows = [];
        foreach ($data['laporan'] as $i => $op) {
            $row = [$i + 1, $op['nama'], $op['jabatan']];
            foreach ($op['hadir_per_bulan'] as $h) {
                $row[] = $h;
            }
            foreach ($data['statuses'] as $s) {
                $row[] = $op['counts'][$s] ?? 0;
            }
            $row[] = $op['total_hadir'];
            $rows[] = $row;
        }

        return [
            'title' => 'Laporan Absensi Tahunan',
            'periode' => 'Tahun ' . $data['tahun'],
            'headers' => $headers,
            'rows' => $rows,
            'filename' => 'laporan-absensi-tahunan-' . $data['tahun'],
        ];
    }

    private function exportExcel(array $table)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Laporan');

        $lastCol = Coordinate::stringFromColumnIndex(count($table['headers']));

        $sheet->setCellValue('A1', $table['title']);
        $sheet->mergeCells("A1:{$lastCol}1");
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $sheet->setCellValue('A2', $table['periode']);
        $sheet->mergeCells("A2:{$lastCol}2");

        // Header tabel di baris 4.
        $col = 1;
        foreach ($table['headers'] as $h) {
            $sheet->setCellValue(Coordinate::stringFromColumnIndex($col) . '4', $h);
            $col++;
        }
        $sheet->getStyle("A4:{$lastCol}4")->getFont()->setBold(true);

        // Isi baris mulai baris 5.
        $r = 5;
        foreach ($table['rows'] as $row) {
            $col = 1;
            foreach ($row as $val) {
                $sheet->setCellValueExplicit(
                    Coordinate::stringFromColumnIndex($col) . $r,
                    (string) $val,
                    DataType::TYPE_STRING
                );
                $col++;
            }
            $r++;
        }

        for ($c = 1; $c <= count($table['headers']); $c++) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($c))->setAutoSize(true);
        }

        $filename = $table['filename'] . '.xlsx';

        // Tulis penuh ke file temp lebih dulu agar setiap error terjadi sebelum
        // output dikirim (tercatat di log & memunculkan halaman error yang benar,
        // bukan gagal di tengah stream), lalu unduh file tersebut.
        $tmp = tempnam(sys_get_temp_dir(), 'labs') . '.xlsx';
        (new Xlsx($spreadsheet))->save($tmp);

        return response()->download($tmp, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    /** Render PDF asli (dompdf) yang langsung terunduh. */
    private function exportPdf(array $table)
    {
        $thead = '';
        foreach ($table['headers'] as $h) {
            $thead .= '<th>' . e($h) . '</th>';
        }

        $tbody = '';
        foreach ($table['rows'] as $row) {
            $tbody .= '<tr>';
            foreach ($row as $i => $val) {
                // Kolom Nama & Jabatan rata kiri.
                $align = in_array($i, [1, 2], true) ? ' style="text-align:left"' : '';
                $tbody .= '<td' . $align . '>' . e((string) $val) . '</td>';
            }
            $tbody .= '</tr>';
        }

        $title = e($table['title']);
        $periode = e($table['periode']);

        $html = <<<HTML
<!doctype html><html lang="id"><head><meta charset="utf-8">
<style>
 body{font-family:'DejaVu Sans',sans-serif;color:#111827}
 h1{font-size:15px;margin:0 0 3px}
 .sub{color:#4b5563;margin:0 0 10px;font-size:10px}
 table{width:100%;border-collapse:collapse;font-size:8px}
 th,td{border:0.5px solid #94a3b8;padding:3px 4px;text-align:center}
 th{background:#1d4ed8;color:#fff}
 tbody tr:nth-child(even){background:#f1f5f9}
</style></head><body>
<h1>{$title}</h1>
<p class="sub">{$periode}</p>
<table><thead><tr>{$thead}</tr></thead><tbody>{$tbody}</tbody></table>
</body></html>
HTML;

        // Tabel lebar → paksa orientasi landscape.
        $pdf = Pdf::loadHTML($html)->setPaper('a4', 'landscape');

        return $pdf->download($table['filename'] . '.pdf');
    }

    /** Daftar departemen unik dari operator aktif untuk isi dropdown filter. */
    private function departemenList()
    {
        return Operator::aktif()
            ->whereNotNull('departemen')
            ->where('departemen', '!=', '')
            ->distinct()
            ->orderBy('departemen')
            ->pluck('departemen');
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
