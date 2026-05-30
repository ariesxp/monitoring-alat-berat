<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\KategoriBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BarangController extends Controller
{
    public function index(Request $request)
    {
        $query = Barang::with('kategori');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_barang', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('nama_barang', 'like', "%{$search}%")
                  ->orWhereHas('kategori', fn ($q2) => $q2->where('nama', 'like', "%{$search}%"));
            });
        }

        if ($kategoriId = $request->get('kategori_barang_id')) {
            $query->where('kategori_barang_id', $kategoriId);
        }

        $barang = $query->orderBy('nama_barang')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Barang/Index', [
            'barang' => $barang,
            'filters' => $request->only(['search', 'kategori_barang_id']),
            'kategoriList' => KategoriBarang::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Barang/Form', [
            'kategoriList' => KategoriBarang::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori_barang_id' => 'required|exists:kategori_barang,id',
            'kode_barang' => 'required|string|max:50|unique:barang,kode_barang',
            'barcode' => 'nullable|string|max:100|unique:barang,barcode',
            'nama_barang' => 'required|string|max:255',
            'satuan' => 'required|string|max:50',
            'stok_minimum' => 'required|numeric|min:0',
            'harga_satuan' => 'required|numeric|min:0',
            'lokasi_gudang' => 'nullable|string|max:255',
            'gambar' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = $request->file('gambar')->store('barang', 'public');
        }

        Barang::create($validated);

        return redirect()->route('barang.index')
            ->with('success', 'Barang berhasil ditambahkan.');
    }

    public function show(Barang $barang)
    {
        $barang->load('kategori');

        return Inertia::render('Barang/Show', [
            'barang' => $barang,
        ]);
    }

    public function edit(Barang $barang)
    {
        return Inertia::render('Barang/Form', [
            'barang' => $barang,
            'kategoriList' => KategoriBarang::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function update(Request $request, Barang $barang)
    {
        $validated = $request->validate([
            'kategori_barang_id' => 'required|exists:kategori_barang,id',
            'kode_barang' => 'required|string|max:50|unique:barang,kode_barang,' . $barang->id,
            'barcode' => 'nullable|string|max:100|unique:barang,barcode,' . $barang->id,
            'nama_barang' => 'required|string|max:255',
            'satuan' => 'required|string|max:50',
            'stok_minimum' => 'required|numeric|min:0',
            'harga_satuan' => 'required|numeric|min:0',
            'lokasi_gudang' => 'nullable|string|max:255',
            'gambar' => 'nullable|image|max:5120',
            'hapus_gambar' => 'nullable|boolean',
        ]);

        if ($request->hasFile('gambar')) {
            if ($barang->gambar) {
                Storage::disk('public')->delete($barang->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('barang', 'public');
        } elseif ($request->boolean('hapus_gambar')) {
            if ($barang->gambar) {
                Storage::disk('public')->delete($barang->gambar);
            }
            $validated['gambar'] = null;
        } else {
            unset($validated['gambar']);
        }

        unset($validated['hapus_gambar']);
        $barang->update($validated);

        return redirect()->route('barang.index')
            ->with('success', 'Barang berhasil diperbarui.');
    }

    public function destroy(Barang $barang)
    {
        if ($barang->detailPenerimaan()->exists() || $barang->detailPengeluaran()->exists()) {
            return redirect()->route('barang.index')
                ->with('error', 'Barang tidak dapat dihapus karena masih digunakan di transaksi gudang.');
        }

        if ($barang->gambar) {
            Storage::disk('public')->delete($barang->gambar);
        }

        $barang->delete();

        return redirect()->route('barang.index')
            ->with('success', 'Barang berhasil dihapus.');
    }
}
