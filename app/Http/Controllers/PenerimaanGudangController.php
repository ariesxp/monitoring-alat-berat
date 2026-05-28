<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\PenerimaanGudang;
use App\Traits\HasDocumentNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PenerimaanGudangController extends Controller
{
    public function index(Request $request)
    {
        $query = PenerimaanGudang::with('createdBy');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_penerimaan', 'like', "%{$search}%")
                  ->orWhere('supplier', 'like', "%{$search}%");
            });
        }

        return Inertia::render('PenerimaanGudang/Index', [
            'penerimaan' => $query->orderByDesc('tanggal_terima')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('PenerimaanGudang/Form', [
            'barangList' => Barang::with('kategori')->orderBy('nama_barang')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal_terima' => 'required|date',
            'supplier' => 'required|string|max:255',
            'nomor_surat_jalan' => 'nullable|string|max:100',
            'catatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.jumlah' => 'required|numeric|min:0.01',
            'items.*.harga_satuan' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $penerimaan = PenerimaanGudang::create([
                'nomor_penerimaan' => PenerimaanGudang::generateNumber('PG'),
                'tanggal_terima' => $validated['tanggal_terima'],
                'supplier' => $validated['supplier'],
                'nomor_surat_jalan' => $validated['nomor_surat_jalan'] ?? null,
                'catatan' => $validated['catatan'] ?? null,
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $penerimaan->details()->create([
                    'barang_id' => $item['barang_id'],
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $item['harga_satuan'],
                    'total_harga' => $item['jumlah'] * $item['harga_satuan'],
                ]);

                Barang::where('id', $item['barang_id'])
                    ->increment('stok_saat_ini', $item['jumlah']);
            }
        });

        return redirect()->route('penerimaan-gudang.index')
            ->with('success', 'Penerimaan gudang berhasil dicatat.');
    }

    public function show(PenerimaanGudang $penerimaanGudang)
    {
        $penerimaanGudang->load(['details.barang', 'createdBy']);

        return Inertia::render('PenerimaanGudang/Show', [
            'penerimaan' => $penerimaanGudang,
        ]);
    }

    public function destroy(PenerimaanGudang $penerimaanGudang)
    {
        DB::transaction(function () use ($penerimaanGudang) {
            foreach ($penerimaanGudang->details as $detail) {
                Barang::where('id', $detail->barang_id)
                    ->decrement('stok_saat_ini', $detail->jumlah);
            }
            $penerimaanGudang->delete();
        });

        return redirect()->route('penerimaan-gudang.index')
            ->with('success', 'Penerimaan gudang berhasil dihapus.');
    }
}
