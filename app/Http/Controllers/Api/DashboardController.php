<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\DetailPengeluaran;
use App\Models\PengeluaranGudang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /** Ringkasan untuk tab Beranda. */
    public function index(Request $request)
    {
        $today = now()->toDateString();
        $startMonth = now()->startOfMonth()->toDateString();

        $transaksiHariIni = PengeluaranGudang::whereDate('tanggal_keluar', $today)->count();
        $transaksiBulanIni = PengeluaranGudang::whereBetween('tanggal_keluar', [$startMonth, $today])->count();

        // Total nilai bulan ini = jumlah detail * harga_satuan barang.
        $nilaiBulanIni = DetailPengeluaran::query()
            ->join('pengeluaran_gudang', 'detail_pengeluaran.pengeluaran_gudang_id', '=', 'pengeluaran_gudang.id')
            ->join('barang', 'detail_pengeluaran.barang_id', '=', 'barang.id')
            ->whereBetween('pengeluaran_gudang.tanggal_keluar', [$startMonth, $today])
            ->sum(DB::raw('detail_pengeluaran.jumlah * barang.harga_satuan'));

        $stokMenipis = Barang::stokMenipis()->count();

        $terbaru = PengeluaranGudang::with(['details.barang', 'alatBerat', 'createdBy'])
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(function ($p) {
                $detail = $p->details->first();
                $barang = $detail?->barang;
                $jumlah = (float) ($detail?->jumlah ?? 0);
                return [
                    'id'                => $p->id,
                    'nomor_pengeluaran' => $p->nomor_pengeluaran,
                    'tanggal_keluar'    => optional($p->tanggal_keluar)->toDateString(),
                    'tujuan'            => $p->tujuan,
                    'barang'            => $barang?->nama_barang,
                    'satuan'            => $barang?->satuan,
                    'jumlah'            => $jumlah,
                    'total_nilai'       => $jumlah * (float) ($barang?->harga_satuan ?? 0),
                ];
            });

        return response()->json([
            'transaksi_hari_ini'  => $transaksiHariIni,
            'transaksi_bulan_ini' => $transaksiBulanIni,
            'nilai_bulan_ini'     => (float) $nilaiBulanIni,
            'stok_menipis'        => $stokMenipis,
            'terbaru'             => $terbaru,
        ]);
    }
}
