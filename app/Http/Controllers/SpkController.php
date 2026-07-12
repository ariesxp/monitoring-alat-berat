<?php

namespace App\Http\Controllers;

use App\Models\AlatBerat;
use App\Models\KontrakKerja;
use App\Models\Operator;
use App\Models\Spk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpkController extends Controller
{
    public function index(Request $request)
    {
        $query = Spk::with(['kontrakKerja', 'alatBerat', 'operator']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_spk', 'like', "%{$search}%")
                  ->orWhere('jenis_pekerjaan', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        return Inertia::render('Spk/Index', [
            'spkList' => $query->orderByDesc('created_at')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Spk/Form', [
            'kontrak' => KontrakKerja::aktif()->with('kontrakAlat.alatBerat', 'kontrakAlat.operator')->get(),
            'alatBerat' => AlatBerat::orderBy('nama_alat')->get(),
            'operators' => Operator::aktif()->orderBy('nama')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_spk' => 'required|string|max:50|unique:spk,nomor_spk',
            'kontrak_kerja_id' => 'required|exists:kontrak_kerja,id',
            'alat_berat_id' => 'required|exists:alat_berat,id',
            'operator_id' => 'required|exists:operators,id',
            'tanggal_spk' => 'required|date',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'jenis_pekerjaan' => 'required|string|max:255',
            'lokasi_kerja' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();

        Spk::create($validated);

        return redirect()->route('spk.index')
            ->with('success', 'SPK berhasil dibuat.');
    }

    public function show(Spk $spk)
    {
        $spk->load(['kontrakKerja.client', 'alatBerat', 'operator', 'approvedBy', 'laporanHarian' => fn ($q) => $q->latest('tanggal')]);

        return Inertia::render('Spk/Show', [
            'spk' => $spk,
        ]);
    }

    public function edit(Spk $spk)
    {
        return Inertia::render('Spk/Form', [
            'spk' => $spk,
            'kontrak' => KontrakKerja::aktif()->with('kontrakAlat.alatBerat', 'kontrakAlat.operator')->get(),
            'alatBerat' => AlatBerat::orderBy('nama_alat')->get(),
            'operators' => Operator::aktif()->orderBy('nama')->get(),
        ]);
    }

    public function update(Request $request, Spk $spk)
    {
        $validated = $request->validate([
            'nomor_spk' => 'required|string|max:50|unique:spk,nomor_spk,' . $spk->id,
            'kontrak_kerja_id' => 'required|exists:kontrak_kerja,id',
            'alat_berat_id' => 'required|exists:alat_berat,id',
            'operator_id' => 'required|exists:operators,id',
            'tanggal_spk' => 'required|date',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'jenis_pekerjaan' => 'required|string|max:255',
            'lokasi_kerja' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ]);

        $spk->update($validated);

        return redirect()->route('spk.index')
            ->with('success', 'SPK berhasil diperbarui.');
    }

    public function destroy(Spk $spk)
    {
        $spk->delete();

        return redirect()->route('spk.index')
            ->with('success', 'SPK berhasil dihapus.');
    }

    public function approve(Spk $spk)
    {
        $spk->update([
            'status' => 'disetujui',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'SPK berhasil disetujui.');
    }
}
