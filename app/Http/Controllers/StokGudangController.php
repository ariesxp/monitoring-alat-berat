<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\KategoriBarang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StokGudangController extends Controller
{
    public function index(Request $request)
    {
        $query = Barang::with('kategori');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_barang', 'like', "%{$search}%")
                  ->orWhere('nama_barang', 'like', "%{$search}%");
            });
        }

        if ($kategori = $request->get('kategori')) {
            $query->where('kategori_barang_id', $kategori);
        }

        if ($request->get('stok_menipis')) {
            $query->stokMenipis();
        }

        return Inertia::render('StokGudang/Index', [
            'barang' => $query->orderBy('nama_barang')->paginate(15)->withQueryString(),
            'kategori' => KategoriBarang::orderBy('nama')->get(),
            'filters' => $request->only(['search', 'kategori', 'stok_menipis']),
            'stokMenipisCount' => Barang::stokMenipis()->count(),
        ]);
    }
}
