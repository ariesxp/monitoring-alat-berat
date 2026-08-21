<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetailPengeluaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LaporanController extends Controller
{
    /**
     * Rekap pengeluaran untuk tab Laporan:
     *  - ringkasan total nilai & jumlah transaksi pada rentang tanggal
     *  - nilai per hari (untuk grafik batang)
     *  - top barang berdasarkan total nilai
     */
    public function index(Request $request)
    {
        $data = $request->validate([
            'from' => 'nullable|date',
            'to'   => 'nullable|date',
        ]);

        $from = $data['from'] ?? now()->startOfMonth()->toDateString();
        $to   = $data['to'] ?? now()->toDateString();

        $base = DetailPengeluaran::query()
            ->join('pengeluaran_gudang', 'detail_pengeluaran.pengeluaran_gudang_id', '=', 'pengeluaran_gudang.id')
            ->join('barang', 'detail_pengeluaran.barang_id', '=', 'barang.id')
            ->whereBetween('pengeluaran_gudang.tanggal_keluar', [$from, $to]);

        $totalNilai = (clone $base)->sum(DB::raw('detail_pengeluaran.jumlah * barang.harga_satuan'));
        $totalTransaksi = (clone $base)->distinct('pengeluaran_gudang.id')->count('pengeluaran_gudang.id');

        $perHari = (clone $base)
            ->select(
                'pengeluaran_gudang.tanggal_keluar as tanggal',
                DB::raw('SUM(detail_pengeluaran.jumlah * barang.harga_satuan) as nilai')
            )
            ->groupBy('pengeluaran_gudang.tanggal_keluar')
            ->orderBy('pengeluaran_gudang.tanggal_keluar')
            ->get()
            ->map(fn ($r) => [
                'tanggal' => (string) $r->tanggal,
                'nilai'   => (float) $r->nilai,
            ]);

        $topBarang = (clone $base)
            ->select(
                'barang.nama_barang',
                'barang.satuan',
                DB::raw('SUM(detail_pengeluaran.jumlah) as total_jumlah'),
                DB::raw('SUM(detail_pengeluaran.jumlah * barang.harga_satuan) as total_nilai')
            )
            ->groupBy('barang.id', 'barang.nama_barang', 'barang.satuan')
            ->orderByDesc('total_nilai')
            ->limit(10)
            ->get()
            ->map(fn ($r) => [
                'nama_barang'  => $r->nama_barang,
                'satuan'       => $r->satuan,
                'total_jumlah' => (float) $r->total_jumlah,
                'total_nilai'  => (float) $r->total_nilai,
            ]);

        return response()->json([
            'from'            => $from,
            'to'              => $to,
            'total_nilai'     => (float) $totalNilai,
            'total_transaksi' => $totalTransaksi,
            'per_hari'        => $perHari,
            'top_barang'      => $topBarang,
        ]);
    }
}
