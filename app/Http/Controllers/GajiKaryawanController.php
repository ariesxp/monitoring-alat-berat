<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\DetailGaji;
use App\Models\Operator;
use App\Models\Penggajian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GajiKaryawanController extends Controller
{
    public function index(Request $request)
    {
        $query = Penggajian::withCount('details');

        return Inertia::render('Gaji/Index', [
            'penggajian' => $query->orderByDesc('periode')->paginate(10)->withQueryString(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Gaji/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'periode' => 'required|string|size:7',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
            'catatan' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();

        $penggajian = Penggajian::create($validated);

        return redirect()->route('gaji.show', $penggajian)
            ->with('success', 'Periode penggajian berhasil dibuat.');
    }

    public function show(Penggajian $gaji)
    {
        $gaji->load('details.operator');

        return Inertia::render('Gaji/Show', [
            'penggajian' => $gaji,
        ]);
    }

    public function hitung(Penggajian $penggajian)
    {
        DB::transaction(function () use ($penggajian) {
            $penggajian->details()->delete();

            $operators = Operator::where('status', 'aktif')->get();

            foreach ($operators as $operator) {
                $hariKerja = $this->hitungHariKerja($penggajian->tanggal_mulai, $penggajian->tanggal_selesai);

                $hariHadir = Absensi::where('operator_id', $operator->id)
                    ->whereBetween('tanggal', [$penggajian->tanggal_mulai, $penggajian->tanggal_selesai])
                    ->where('status', 'hadir')
                    ->count();

                $gajiProrata = ($hariKerja > 0)
                    ? ($operator->gaji_pokok / $hariKerja) * $hariHadir
                    : 0;

                $totalGaji = $gajiProrata + $operator->tunjangan;

                DetailGaji::create([
                    'penggajian_id' => $penggajian->id,
                    'operator_id' => $operator->id,
                    'gaji_pokok' => $operator->gaji_pokok,
                    'tunjangan' => $operator->tunjangan,
                    'hari_kerja' => $hariKerja,
                    'hari_hadir' => $hariHadir,
                    'lembur_jam' => 0,
                    'upah_lembur' => 0,
                    'potongan' => 0,
                    'total_gaji' => $totalGaji,
                ]);
            }

            $penggajian->update(['status' => 'diproses']);
        });

        return redirect()->back()
            ->with('success', 'Gaji berhasil dihitung.');
    }

    public function destroy(Penggajian $gaji)
    {
        $gaji->delete();

        return redirect()->route('gaji.index')
            ->with('success', 'Periode penggajian berhasil dihapus.');
    }

    private function hitungHariKerja($mulai, $selesai): int
    {
        $count = 0;
        $current = \Carbon\Carbon::parse($mulai);
        $end = \Carbon\Carbon::parse($selesai);

        while ($current->lte($end)) {
            if (!$current->isWeekend()) {
                $count++;
            }
            $current->addDay();
        }

        return $count;
    }
}
