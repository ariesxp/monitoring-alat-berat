<?php

namespace App\Http\Controllers;

use App\Models\LaporanHarian;
use App\Models\Spk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanHarianController extends Controller
{
    public function index(Request $request)
    {
        $query = LaporanHarian::with(['spk', 'alatBerat', 'operator']);

        if ($search = $request->get('search')) {
            $query->whereHas('spk', fn ($q) => $q->where('nomor_spk', 'like', "%{$search}%"));
        }

        if ($tanggal = $request->get('tanggal')) {
            $query->whereDate('tanggal', $tanggal);
        }

        return Inertia::render('LaporanHarian/Index', [
            'laporan' => $query->orderByDesc('tanggal')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'tanggal']),
        ]);
    }

    public function create()
    {
        return Inertia::render('LaporanHarian/Form', [
            'spkList' => Spk::whereIn('status', ['disetujui', 'berlangsung'])
                ->with(['alatBerat', 'operator'])
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'spk_id' => 'required|exists:spk,id',
            'tanggal' => 'required|date',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'bbm_liter' => 'required|numeric|min:0',
            'hm_awal' => 'required|numeric|min:0',
            'hm_akhir' => 'required|numeric|min:0|gte:hm_awal',
            'km_awal' => 'nullable|numeric|min:0',
            'km_akhir' => 'nullable|numeric|min:0',
            'jenis_pekerjaan' => 'required|string|max:255',
            'volume_pekerjaan' => 'nullable|numeric|min:0',
            'satuan_volume' => 'nullable|string|max:50',
            'kondisi_alat' => 'required|in:baik,kurang_baik,rusak',
            'catatan' => 'nullable|string',
        ]);

        $spk = Spk::findOrFail($validated['spk_id']);
        $validated['alat_berat_id'] = $spk->alat_berat_id;
        $validated['operator_id'] = $spk->operator_id;
        $validated['created_by'] = auth()->id();

        $start = strtotime($validated['jam_mulai']);
        $end = strtotime($validated['jam_selesai']);
        $validated['jam_kerja'] = round(($end - $start) / 3600, 2);

        LaporanHarian::create($validated);

        return redirect()->route('laporan-harian.index')
            ->with('success', 'Laporan harian berhasil dibuat.');
    }

    public function show(LaporanHarian $laporanHarian)
    {
        $laporanHarian->load(['spk.kontrakKerja', 'alatBerat', 'operator']);

        return Inertia::render('LaporanHarian/Show', [
            'laporan' => $laporanHarian,
        ]);
    }

    public function edit(LaporanHarian $laporanHarian)
    {
        return Inertia::render('LaporanHarian/Form', [
            'laporan' => $laporanHarian,
            'spkList' => Spk::whereIn('status', ['disetujui', 'berlangsung'])
                ->with(['alatBerat', 'operator'])
                ->get(),
        ]);
    }

    public function update(Request $request, LaporanHarian $laporanHarian)
    {
        $validated = $request->validate([
            'spk_id' => 'required|exists:spk,id',
            'tanggal' => 'required|date',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'bbm_liter' => 'required|numeric|min:0',
            'hm_awal' => 'required|numeric|min:0',
            'hm_akhir' => 'required|numeric|min:0|gte:hm_awal',
            'km_awal' => 'nullable|numeric|min:0',
            'km_akhir' => 'nullable|numeric|min:0',
            'jenis_pekerjaan' => 'required|string|max:255',
            'volume_pekerjaan' => 'nullable|numeric|min:0',
            'satuan_volume' => 'nullable|string|max:50',
            'kondisi_alat' => 'required|in:baik,kurang_baik,rusak',
            'catatan' => 'nullable|string',
        ]);

        $spk = Spk::findOrFail($validated['spk_id']);
        $validated['alat_berat_id'] = $spk->alat_berat_id;
        $validated['operator_id'] = $spk->operator_id;

        $start = strtotime($validated['jam_mulai']);
        $end = strtotime($validated['jam_selesai']);
        $validated['jam_kerja'] = round(($end - $start) / 3600, 2);

        $laporanHarian->update($validated);

        return redirect()->route('laporan-harian.index')
            ->with('success', 'Laporan harian berhasil diperbarui.');
    }

    public function destroy(LaporanHarian $laporanHarian)
    {
        $laporanHarian->delete();

        return redirect()->route('laporan-harian.index')
            ->with('success', 'Laporan harian berhasil dihapus.');
    }
}
