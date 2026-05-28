<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Operator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AbsensiController extends Controller
{
    public function index(Request $request)
    {
        $bulan = $request->get('bulan', date('Y-m'));
        [$year, $month] = explode('-', $bulan);

        $operators = Operator::aktif()->orderBy('nama')->get();

        $absensi = Absensi::whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month)
            ->get()
            ->groupBy('operator_id');

        return Inertia::render('Absensi/Index', [
            'operators' => $operators,
            'absensi' => $absensi,
            'bulan' => $bulan,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'operator_id' => 'required|exists:operators,id',
            'tanggal' => 'required|date',
            'jam_masuk' => 'nullable|date_format:H:i',
            'jam_pulang' => 'nullable|date_format:H:i',
            'status' => 'required|in:hadir,sakit,izin,alpha,cuti,libur',
            'keterangan' => 'nullable|string',
        ]);

        Absensi::updateOrCreate(
            ['operator_id' => $validated['operator_id'], 'tanggal' => $validated['tanggal']],
            collect($validated)->except(['operator_id', 'tanggal'])->toArray()
        );

        return redirect()->back()
            ->with('success', 'Absensi berhasil disimpan.');
    }
}
