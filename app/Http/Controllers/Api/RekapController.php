<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Operator;
use App\Support\Geo;
use Carbon\Carbon;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RekapController extends Controller
{
    /**
     * GET /rekap — Ringkasan & rekap kehadiran per periode (supervisi).
     */
    public function index(Request $request)
    {
        $this->authorizeSupervisor($request);
        [$from, $to] = $this->period($request);

        return response()->json($this->buildRekap($from, $to));
    }

    /**
     * GET /rekap/export?format=excel|pdf — Unduh laporan.
     */
    public function export(Request $request)
    {
        $this->authorizeSupervisor($request);
        [$from, $to] = $this->period($request);
        $format = $request->get('format', 'excel');
        $rekap = $this->buildRekap($from, $to);

        return $format === 'pdf'
            ? $this->exportPdf($rekap)
            : $this->exportExcel($rekap);
    }

    // ---------------------------------------------------------------------

    protected function period(Request $request): array
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to', now()->toDateString());
        return [$from, $to];
    }

    protected function buildRekap(string $from, string $to): array
    {
        $office = Geo::officeConfig();
        $start = Carbon::parse($from);
        $end = Carbon::parse($to);
        $hariKerja = $start->diffInDays($end) + 1;

        $operators = Operator::aktif()->orderBy('nama')->get();

        $absensi = Absensi::whereBetween('tanggal', [$from, $to])->get()->groupBy('operator_id');

        $batas = Carbon::createFromFormat('H:i', $office['batas_terlambat']);
        $baris = [];
        $totalPersen = 0;

        foreach ($operators as $op) {
            $rows = $absensi->get($op->id, collect());
            $hadir = 0; $terlambat = 0; $izin = 0;

            foreach ($rows as $a) {
                if (in_array($a->status, ['izin', 'sakit', 'cuti'], true)) {
                    $izin++;
                    continue;
                }
                if ($a->jam_masuk) {
                    $hadir++;
                    $masuk = Carbon::createFromFormat('H:i', substr((string) $a->jam_masuk, 0, 5));
                    if ($masuk->gt($batas)) {
                        $terlambat++;
                    }
                }
            }

            $alpha = max(0, $hariKerja - $hadir - $izin);
            $persen = $hariKerja > 0 ? round($hadir / $hariKerja * 100) : 0;
            $totalPersen += $persen;

            $baris[] = [
                'operator_id' => $op->id,
                'nama'        => $op->nama,
                'nik'         => $op->nik_karyawan ?: $op->nik,
                'jabatan'     => $op->jabatan,
                'hadir'       => $hadir,
                'terlambat'   => $terlambat,
                'izin'        => $izin,
                'alpha'       => $alpha,
                'persen'      => $persen,
            ];
        }

        $totalPegawai = $operators->count();
        $totalHadir = collect($baris)->sum('hadir');
        $totalAlpha = collect($baris)->sum('alpha');
        $rataKehadiran = $totalPegawai > 0 ? round($totalPersen / $totalPegawai) : 0;

        // Ringkasan "hari ini" (mirip kartu di mockup) berdasar hari terakhir periode.
        $hariHadir = collect($baris)->filter(fn ($b) => $b['hadir'] > 0)->count();
        $hariTidakHadir = max(0, $totalPegawai - $hariHadir);

        return [
            'periode' => ['from' => $from, 'to' => $to, 'hari_kerja' => $hariKerja],
            'ringkasan' => [
                'total_pegawai'      => $totalPegawai,
                'rata_rata_kehadiran' => $rataKehadiran,
                'hadir'              => $hariHadir,
                'hadir_persen'      => $totalPegawai > 0 ? round($hariHadir / $totalPegawai * 100) : 0,
                'tidak_hadir'        => $hariTidakHadir,
                'tidak_hadir_persen' => $totalPegawai > 0 ? round($hariTidakHadir / $totalPegawai * 100) : 0,
                'total_hari_hadir'   => $totalHadir,
                'total_hari_alpha'   => $totalAlpha,
            ],
            'detail' => $baris,
        ];
    }

    protected function exportExcel(array $rekap): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Rekap Absensi');

        $p = $rekap['periode'];
        $sheet->setCellValue('A1', 'REKAP ABSENSI KARYAWAN');
        $sheet->setCellValue('A2', "Periode: {$p['from']} s/d {$p['to']}");
        $sheet->mergeCells('A1:H1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $headers = ['No', 'NIK', 'Nama', 'Jabatan', 'Hadir', 'Terlambat', 'Izin/Cuti', 'Alpha', '% Hadir'];
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . '4', $h);
            $col++;
        }
        $sheet->getStyle('A4:I4')->getFont()->setBold(true);

        $r = 5;
        foreach ($rekap['detail'] as $i => $d) {
            $sheet->setCellValue('A' . $r, $i + 1);
            $sheet->setCellValue('B' . $r, $d['nik']);
            $sheet->setCellValue('C' . $r, $d['nama']);
            $sheet->setCellValue('D' . $r, $d['jabatan']);
            $sheet->setCellValue('E' . $r, $d['hadir']);
            $sheet->setCellValue('F' . $r, $d['terlambat']);
            $sheet->setCellValue('G' . $r, $d['izin']);
            $sheet->setCellValue('H' . $r, $d['alpha']);
            $sheet->setCellValue('I' . $r, $d['persen'] . '%');
            $r++;
        }

        foreach (range('A', 'I') as $c) {
            $sheet->getColumnDimension($c)->setAutoSize(true);
        }

        $filename = 'rekap-absensi-' . $p['from'] . '_' . $p['to'] . '.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /** Ekspor sebagai HTML siap-cetak (print-to-PDF dari browser/webview). */
    protected function exportPdf(array $rekap)
    {
        $p = $rekap['periode'];
        $rows = '';
        foreach ($rekap['detail'] as $i => $d) {
            $rows .= '<tr>'
                . '<td>' . ($i + 1) . '</td>'
                . '<td>' . e($d['nik']) . '</td>'
                . '<td style="text-align:left">' . e($d['nama']) . '</td>'
                . '<td style="text-align:left">' . e($d['jabatan']) . '</td>'
                . '<td>' . $d['hadir'] . '</td>'
                . '<td>' . $d['terlambat'] . '</td>'
                . '<td>' . $d['izin'] . '</td>'
                . '<td>' . $d['alpha'] . '</td>'
                . '<td>' . $d['persen'] . '%</td>'
                . '</tr>';
        }

        $html = <<<HTML
<!doctype html><html lang="id"><head><meta charset="utf-8">
<title>Rekap Absensi {$p['from']} - {$p['to']}</title>
<style>
 body{font-family:Arial,sans-serif;color:#14251b;margin:24px}
 h1{font-size:18px;margin:0 0 4px}
 .sub{color:#4b5563;margin:0 0 16px}
 table{width:100%;border-collapse:collapse;font-size:12px}
 th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:center}
 th{background:#166534;color:#fff}
 @media print{.noprint{display:none}}
 .btn{background:#166534;color:#fff;border:0;padding:8px 16px;border-radius:6px;cursor:pointer}
</style></head><body>
<button class="btn noprint" onclick="window.print()">Cetak / Simpan PDF</button>
<h1>Rekap Absensi Karyawan</h1>
<p class="sub">Periode: {$p['from']} s/d {$p['to']} &middot; Hari kerja: {$p['hari_kerja']}</p>
<table><thead><tr>
<th>No</th><th>NIK</th><th>Nama</th><th>Jabatan</th><th>Hadir</th><th>Terlambat</th><th>Izin/Cuti</th><th>Alpha</th><th>% Hadir</th>
</tr></thead><tbody>{$rows}</tbody></table>
</body></html>
HTML;

        return response($html, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }

    protected function authorizeSupervisor(Request $request): void
    {
        abort_unless(in_array($request->user()->role, ['supervisor', 'admin'], true), 403, 'Hanya supervisor.');
    }
}
