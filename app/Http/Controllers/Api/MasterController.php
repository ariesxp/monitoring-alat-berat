<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlatBerat;
use App\Models\Barang;
use App\Models\KategoriBarang;
use Illuminate\Http\Request;

/**
 * Endpoint data master untuk mengisi dropdown pada form Pengeluaran Barang:
 * Jenis Pengeluaran (kategori), Unit/Penerima (alat berat), dan Barang.
 */
class MasterController extends Controller
{
    /** Jenis Pengeluaran = kategori barang (mis. BBM, Sparepart). */
    public function kategori()
    {
        return response()->json(
            KategoriBarang::orderBy('nama')->get(['id', 'nama'])
        );
    }

    /** Unit / Penerima = alat berat. */
    public function alatBerat()
    {
        return response()->json(
            AlatBerat::orderBy('nama_alat')->get()->map(fn ($a) => [
                'id'        => $a->id,
                'kode_alat' => $a->kode_alat,
                'nama_alat' => $a->nama_alat,
                'label'     => $a->nama_alat . ($a->kode_alat ? " ({$a->kode_alat})" : ''),
            ])
        );
    }

    /**
     * Daftar barang. Bisa difilter by kategori (Jenis Pengeluaran) dan hanya
     * yang stoknya > 0. Menyertakan stok & harga untuk perhitungan total nilai.
     */
    public function barang(Request $request)
    {
        $query = Barang::query()->with('kategori');

        if ($kategoriId = $request->get('kategori_id')) {
            $query->where('kategori_barang_id', $kategoriId);
        }

        if ($request->boolean('in_stock', false)) {
            $query->where('stok_saat_ini', '>', 0);
        }

        $items = $query->orderBy('nama_barang')->get()->map(fn ($b) => [
            'id'            => $b->id,
            'kode_barang'   => $b->kode_barang,
            'nama_barang'   => $b->nama_barang,
            'satuan'        => $b->satuan,
            'stok_saat_ini' => (float) $b->stok_saat_ini,
            'harga_satuan'  => (float) $b->harga_satuan,
            'kategori_id'   => $b->kategori_barang_id,
            'kategori'      => $b->kategori?->nama,
            'label'         => "{$b->nama_barang} – {$b->satuan}",
        ]);

        return response()->json($items);
    }
}
