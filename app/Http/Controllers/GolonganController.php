<?php

namespace App\Http\Controllers;

use App\Models\Golongan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GolonganController extends Controller
{
    public function index(Request $request)
    {
        $query = Golongan::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_golongan', 'like', "%{$search}%")
                  ->orWhere('nama_golongan', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Golongan/Index', [
            'golongans' => $query->orderBy('kode_golongan')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Golongan/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_golongan' => 'required|string|max:20|unique:golongans,kode_golongan',
            'nama_golongan' => 'required|string|max:255',
            'gaji_golongan' => 'required|numeric|min:0',
        ]);

        Golongan::create($validated);

        return redirect()->route('golongan.index')
            ->with('success', 'Golongan berhasil ditambahkan.');
    }

    public function edit(Golongan $golongan)
    {
        return Inertia::render('Golongan/Form', [
            'golongan' => $golongan,
        ]);
    }

    public function update(Request $request, Golongan $golongan)
    {
        $validated = $request->validate([
            'kode_golongan' => 'required|string|max:20|unique:golongans,kode_golongan,' . $golongan->id,
            'nama_golongan' => 'required|string|max:255',
            'gaji_golongan' => 'required|numeric|min:0',
        ]);

        $golongan->update($validated);

        return redirect()->route('golongan.index')
            ->with('success', 'Golongan berhasil diperbarui.');
    }

    public function destroy(Golongan $golongan)
    {
        $golongan->delete();

        return redirect()->route('golongan.index')
            ->with('success', 'Golongan berhasil dihapus.');
    }
}
