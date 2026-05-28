<?php

namespace App\Http\Controllers;

use App\Models\AlatBerat;
use App\Models\Barang;
use App\Models\PengeluaranGudang;
use App\Models\Spk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PengeluaranGudangController extends Controller
{
    public function index(Request $request)
    {
        $query = PengeluaranGudang::with(['spk', 'alatBerat', 'createdBy']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_pengeluaran', 'like', "%{$search}%")
                  ->orWhere('tujuan', 'like', "%{$search}%");
            });
        }

        return Inertia::render('PengeluaranGudang/Index', [
            'pengeluaran' => $query->orderByDesc('tanggal_keluar')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('PengeluaranGudang/Form', [
            'barangList' => Barang::with('kategori')->where('stok_saat_ini', '>', 0)->orderBy('nama_barang')->get(),
            'spkList' => Spk::whereIn('status', ['disetujui', 'berlangsung'])->get(),
            'alatBerat' => AlatBerat::orderBy('nama_alat')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal_keluar' => 'required|date',
            'spk_id' => 'nullable|exists:spk,id',
            'alat_berat_id' => 'nullable|exists:alat_berat,id',
            'tujuan' => 'required|string|max:255',
            'catatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.jumlah' => 'required|numeric|min:0.01',
        ]);

        DB::transaction(function () use ($validated) {
            $pengeluaran = PengeluaranGudang::create([
                'nomor_pengeluaran' => PengeluaranGudang::generateNumber('PK'),
                'tanggal_keluar' => $validated['tanggal_keluar'],
                'spk_id' => $validated['spk_id'] ?? null,
                'alat_berat_id' => $validated['alat_berat_id'] ?? null,
                'tujuan' => $validated['tujuan'],
                'catatan' => $validated['catatan'] ?? null,
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $barang = Barang::findOrFail($item['barang_id']);
                if ($barang->stok_saat_ini < $item['jumlah']) {
                    throw new \Exception("Stok {$barang->nama_barang} tidak mencukupi.");
                }

                $pengeluaran->details()->create([
                    'barang_id' => $item['barang_id'],
                    'jumlah' => $item['jumlah'],
                ]);

                $barang->decrement('stok_saat_ini', $item['jumlah']);
            }
        });

        return redirect()->route('pengeluaran-gudang.index')
            ->with('success', 'Pengeluaran gudang berhasil dicatat.');
    }

    public function show(PengeluaranGudang $pengeluaranGudang)
    {
        $pengeluaranGudang->load(['details.barang', 'spk', 'alatBerat', 'createdBy']);

        return Inertia::render('PengeluaranGudang/Show', [
            'pengeluaran' => $pengeluaranGudang,
        ]);
    }

    public function destroy(PengeluaranGudang $pengeluaranGudang)
    {
        DB::transaction(function () use ($pengeluaranGudang) {
            foreach ($pengeluaranGudang->details as $detail) {
                Barang::where('id', $detail->barang_id)
                    ->increment('stok_saat_ini', $detail->jumlah);
            }
            $pengeluaranGudang->delete();
        });

        return redirect()->route('pengeluaran-gudang.index')
            ->with('success', 'Pengeluaran gudang berhasil dihapus.');
    }
}
