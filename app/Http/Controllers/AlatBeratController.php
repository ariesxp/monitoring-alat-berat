<?php

namespace App\Http\Controllers;

use App\Models\AlatBerat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlatBeratController extends Controller
{
    public function index(Request $request)
    {
        $query = AlatBerat::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_alat', 'like', "%{$search}%")
                  ->orWhere('nama_alat', 'like', "%{$search}%")
                  ->orWhere('jenis', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        return Inertia::render('AlatBerat/Index', [
            'alatBerat' => $query->orderByDesc('created_at')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('AlatBerat/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_alat' => 'required|string|max:50|unique:alat_berat',
            'nama_alat' => 'required|string|max:255',
            'jenis' => 'required|string|max:100',
            'merk' => 'required|string|max:100',
            'tahun' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'status_kepemilikan' => 'required|in:milik,sewa',
            'nomor_seri' => 'nullable|string|max:100',
            'nomor_polisi' => 'nullable|string|max:20',
            'no_mesin' => 'nullable|string|max:100',
            'no_chassis' => 'nullable|string|max:100',
            'dealer' => 'nullable|string|max:255',
            'harga' => 'nullable|numeric|min:0',
            'invoice' => 'nullable|string|max:100',
            'hm_awal' => 'nullable|numeric|min:0',
            'hm_sewa_awal' => 'nullable|numeric|min:0',
            'status' => 'required|in:tersedia,beroperasi,maintenance,rusak',
            'lokasi_terakhir' => 'nullable|string|max:255',
            'catatan' => 'nullable|string',
        ]);

        AlatBerat::create($validated);

        return redirect()->route('alat-berat.index')
            ->with('success', 'Alat berat berhasil ditambahkan.');
    }

    public function show(AlatBerat $alatBerat)
    {
        $alatBerat->load(['spk.kontrakKerja', 'laporanHarian' => fn ($q) => $q->latest('tanggal')->limit(10)]);

        return Inertia::render('AlatBerat/Show', [
            'alatBerat' => $alatBerat,
        ]);
    }

    public function edit(AlatBerat $alatBerat)
    {
        return Inertia::render('AlatBerat/Form', [
            'alatBerat' => $alatBerat,
        ]);
    }

    public function update(Request $request, AlatBerat $alatBerat)
    {
        $validated = $request->validate([
            'kode_alat' => 'required|string|max:50|unique:alat_berat,kode_alat,' . $alatBerat->id,
            'nama_alat' => 'required|string|max:255',
            'jenis' => 'required|string|max:100',
            'merk' => 'required|string|max:100',
            'tahun' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'status_kepemilikan' => 'required|in:milik,sewa',
            'nomor_seri' => 'nullable|string|max:100',
            'nomor_polisi' => 'nullable|string|max:20',
            'no_mesin' => 'nullable|string|max:100',
            'no_chassis' => 'nullable|string|max:100',
            'dealer' => 'nullable|string|max:255',
            'harga' => 'nullable|numeric|min:0',
            'invoice' => 'nullable|string|max:100',
            'hm_awal' => 'nullable|numeric|min:0',
            'hm_sewa_awal' => 'nullable|numeric|min:0',
            'status' => 'required|in:tersedia,beroperasi,maintenance,rusak',
            'lokasi_terakhir' => 'nullable|string|max:255',
            'catatan' => 'nullable|string',
        ]);

        $alatBerat->update($validated);

        return redirect()->route('alat-berat.index')
            ->with('success', 'Alat berat berhasil diperbarui.');
    }

    public function destroy(AlatBerat $alatBerat)
    {
        $alatBerat->delete();

        return redirect()->route('alat-berat.index')
            ->with('success', 'Alat berat berhasil dihapus.');
    }
}
