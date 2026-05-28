<?php

namespace App\Http\Controllers;

use App\Models\AlatBerat;
use App\Models\Client;
use App\Models\KontrakAlat;
use App\Models\KontrakKerja;
use App\Models\Operator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KontrakKerjaController extends Controller
{
    public function index(Request $request)
    {
        $query = KontrakKerja::with('client');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_kontrak', 'like', "%{$search}%")
                  ->orWhere('nama_proyek', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        return Inertia::render('KontrakKerja/Index', [
            'kontrak' => $query->orderByDesc('created_at')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('KontrakKerja/Form', [
            'clients' => Client::orderBy('nama_perusahaan')->get(),
            'alatBerat' => AlatBerat::orderBy('nama_alat')->get(),
            'operators' => Operator::aktif()->orderBy('nama')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_kontrak' => 'required|string|max:50|unique:kontrak_kerja',
            'client_id' => 'required|exists:clients,id',
            'nama_proyek' => 'required|string|max:255',
            'lokasi_proyek' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
            'nilai_kontrak' => 'required|numeric|min:0',
            'catatan' => 'nullable|string',
            'alat' => 'nullable|array',
            'alat.*.alat_berat_id' => 'required|exists:alat_berat,id',
            'alat.*.operator_id' => 'nullable|exists:operators,id',
            'alat.*.tarif_harian' => 'required|numeric|min:0',
            'alat.*.tarif_bulanan' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $kontrak = KontrakKerja::create(collect($validated)->except('alat')->toArray());

            if (!empty($validated['alat'])) {
                foreach ($validated['alat'] as $alat) {
                    $kontrak->kontrakAlat()->create($alat);
                }
            }
        });

        return redirect()->route('kontrak-kerja.index')
            ->with('success', 'Kontrak kerja berhasil dibuat.');
    }

    public function show(KontrakKerja $kontrakKerja)
    {
        $kontrakKerja->load(['client', 'kontrakAlat.alatBerat', 'kontrakAlat.operator', 'spk', 'approvedBy']);

        return Inertia::render('KontrakKerja/Show', [
            'kontrak' => $kontrakKerja,
        ]);
    }

    public function edit(KontrakKerja $kontrakKerja)
    {
        $kontrakKerja->load('kontrakAlat');

        return Inertia::render('KontrakKerja/Form', [
            'kontrak' => $kontrakKerja,
            'clients' => Client::orderBy('nama_perusahaan')->get(),
            'alatBerat' => AlatBerat::orderBy('nama_alat')->get(),
            'operators' => Operator::aktif()->orderBy('nama')->get(),
        ]);
    }

    public function update(Request $request, KontrakKerja $kontrakKerja)
    {
        $validated = $request->validate([
            'nomor_kontrak' => 'required|string|max:50|unique:kontrak_kerja,nomor_kontrak,' . $kontrakKerja->id,
            'client_id' => 'required|exists:clients,id',
            'nama_proyek' => 'required|string|max:255',
            'lokasi_proyek' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
            'nilai_kontrak' => 'required|numeric|min:0',
            'catatan' => 'nullable|string',
            'alat' => 'nullable|array',
            'alat.*.alat_berat_id' => 'required|exists:alat_berat,id',
            'alat.*.operator_id' => 'nullable|exists:operators,id',
            'alat.*.tarif_harian' => 'required|numeric|min:0',
            'alat.*.tarif_bulanan' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $kontrakKerja) {
            $kontrakKerja->update(collect($validated)->except('alat')->toArray());

            $kontrakKerja->kontrakAlat()->delete();
            if (!empty($validated['alat'])) {
                foreach ($validated['alat'] as $alat) {
                    $kontrakKerja->kontrakAlat()->create($alat);
                }
            }
        });

        return redirect()->route('kontrak-kerja.index')
            ->with('success', 'Kontrak kerja berhasil diperbarui.');
    }

    public function destroy(KontrakKerja $kontrakKerja)
    {
        $kontrakKerja->delete();

        return redirect()->route('kontrak-kerja.index')
            ->with('success', 'Kontrak kerja berhasil dihapus.');
    }

    public function approve(KontrakKerja $kontrakKerja)
    {
        $kontrakKerja->update([
            'status' => 'aktif',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Kontrak kerja berhasil disetujui.');
    }
}
