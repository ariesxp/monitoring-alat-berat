<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LaporanHarian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Verifikasi Hasil Kerja (Ritase & BBM) oleh petugas gudang.
 *
 * Data berasal dari laporan_harian (hasil bridge aktivitas Android). Petugas
 * gudang meninjau nilai Ritase & BBM yang dilaporkan driver, boleh mengoreksi
 * (opsional), lalu menyetujui. Nilai final = koreksi bila diisi, else nilai driver.
 */
class VerifikasiController extends Controller
{
    /**
     * Daftar laporan untuk diverifikasi pada satu tanggal, difilter status.
     * Query: ?status=menunggu|disetujui&tanggal=YYYY-MM-DD&q=kata
     */
    public function index(Request $request)
    {
        $tanggal = $request->query('tanggal') ?: now()->toDateString();
        $status  = $request->query('status', 'menunggu');
        $q       = trim((string) $request->query('q', ''));

        $base = LaporanHarian::query()
            ->from('laporan_harian as lh')
            ->leftJoin('operators as o', 'o.id', '=', 'lh.operator_id')
            ->leftJoin('alat_berat as ab', 'ab.id', '=', 'lh.alat_berat_id')
            ->whereDate('lh.tanggal', $tanggal);

        // Hitung jumlah per status (pada tanggal yang sama, tanpa filter q).
        $counts = (clone $base)
            ->select('lh.status_verifikasi', DB::raw('COUNT(*) as total'))
            ->groupBy('lh.status_verifikasi')
            ->pluck('total', 'status_verifikasi');

        $rows = (clone $base)
            ->when(in_array($status, ['menunggu', 'disetujui'], true), function ($qb) use ($status) {
                $qb->where('lh.status_verifikasi', $status);
            })
            ->when($q !== '', function ($qb) use ($q) {
                $qb->where(function ($w) use ($q) {
                    $w->where('o.nama', 'like', "%{$q}%")
                        ->orWhere('ab.kode_alat', 'like', "%{$q}%")
                        ->orWhere('ab.nama_alat', 'like', "%{$q}%");
                });
            })
            ->orderByDesc('lh.id')
            ->get([
                'lh.id',
                'lh.operator_id',
                'lh.alat_berat_id',
                'lh.tanggal',
                'lh.lokasi_kerja',
                'lh.bbm_liter',
                'lh.jenis_bbm',
                'lh.ritase',
                'lh.status_verifikasi',
                'lh.ritase_koreksi',
                'lh.bbm_koreksi',
                'lh.verified_at',
                'o.nama as driver_nama',
                'ab.kode_alat as alat_kode',
                'ab.nama_alat as alat_nama',
            ]);

        $data = $rows->map(fn ($r) => $this->transform($r))->all();

        return response()->json([
            'tanggal' => $tanggal,
            'counts'  => [
                'menunggu'  => (int) ($counts['menunggu'] ?? 0),
                'disetujui' => (int) ($counts['disetujui'] ?? 0),
            ],
            'data' => $data,
        ]);
    }

    /**
     * Setujui satu laporan. Koreksi opsional: bila diisi, nilai koreksi menjadi
     * nilai final terverifikasi; bila kosong, nilai driver dipakai apa adanya.
     * Body: { ritase_koreksi?: int, bbm_koreksi?: number }
     */
    public function setujui(Request $request, int $id)
    {
        $validated = $request->validate([
            'ritase_koreksi' => 'nullable|integer|min:0',
            'bbm_koreksi'    => 'nullable|numeric|min:0',
        ]);

        $laporan = LaporanHarian::findOrFail($id);

        if ($laporan->status_verifikasi === 'disetujui') {
            return response()->json(['message' => 'Laporan sudah disetujui.'], 409);
        }

        $laporan->fill([
            'ritase_koreksi'    => $validated['ritase_koreksi'] ?? null,
            'bbm_koreksi'       => $validated['bbm_koreksi'] ?? null,
            'status_verifikasi' => 'disetujui',
            'verified_by'       => $request->user()->id,
            'verified_at'       => now(),
        ])->save();

        $laporan->loadMissing(['operator', 'alatBerat']);
        $row = (object) [
            'id'                => $laporan->id,
            'operator_id'       => $laporan->operator_id,
            'alat_berat_id'     => $laporan->alat_berat_id,
            'tanggal'           => $laporan->tanggal,
            'lokasi_kerja'      => $laporan->lokasi_kerja,
            'bbm_liter'         => $laporan->bbm_liter,
            'jenis_bbm'         => $laporan->jenis_bbm,
            'ritase'            => $laporan->ritase,
            'status_verifikasi' => $laporan->status_verifikasi,
            'ritase_koreksi'    => $laporan->ritase_koreksi,
            'bbm_koreksi'       => $laporan->bbm_koreksi,
            'verified_at'       => $laporan->verified_at,
            'driver_nama'       => optional($laporan->operator)->nama,
            'alat_kode'         => optional($laporan->alatBerat)->kode_alat,
            'alat_nama'         => optional($laporan->alatBerat)->nama_alat,
        ];

        return response()->json([
            'message' => 'Laporan berhasil disetujui.',
            'data'    => $this->transform($row),
        ]);
    }

    /** Bentuk satu baris untuk aplikasi. */
    private function transform($r): array
    {
        $ritase = $r->ritase !== null ? (int) $r->ritase : null;
        $ritaseKor = $r->ritase_koreksi !== null ? (int) $r->ritase_koreksi : null;
        $bbm = $r->bbm_liter !== null ? (float) $r->bbm_liter : null;
        $bbmKor = $r->bbm_koreksi !== null ? (float) $r->bbm_koreksi : null;

        return [
            'id'                => (int) $r->id,
            'driver_nama'       => $r->driver_nama ?: 'Tidak diketahui',
            'alat_kode'         => $r->alat_kode ?: '-',
            'alat_nama'         => $r->alat_nama ?: '-',
            'lokasi'            => $r->lokasi_kerja ?: '-',
            'tanggal'           => (string) $r->tanggal,
            'ritase'            => $ritase,
            'ritase_koreksi'    => $ritaseKor,
            'ritase_final'      => $ritaseKor ?? $ritase,
            'bbm_liter'         => $bbm,
            'bbm_koreksi'       => $bbmKor,
            'bbm_final'         => $bbmKor ?? $bbm,
            'jenis_bbm'         => $r->jenis_bbm,
            'status_verifikasi' => $r->status_verifikasi ?: 'menunggu',
            'verified_at'       => $r->verified_at ? (string) $r->verified_at : null,
        ];
    }
}
