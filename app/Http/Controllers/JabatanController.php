<?php

namespace App\Http\Controllers;

use App\Models\Jabatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JabatanController extends Controller
{
    public function index(Request $request)
    {
        $query = Jabatan::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_jabatan', 'like', "%{$search}%")
                  ->orWhere('nama_jabatan', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Jabatan/Index', [
            'jabatans' => $query->orderBy('kode_jabatan')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Jabatan/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_jabatan' => 'required|string|max:20|unique:jabatans,kode_jabatan',
            'nama_jabatan' => 'required|string|max:100',
            'keterangan' => 'nullable|string|max:255',
        ]);

        Jabatan::create($validated);

        return redirect()->route('jabatan.index')
            ->with('success', 'Jabatan berhasil ditambahkan.');
    }

    public function edit(Jabatan $jabatan)
    {
        return Inertia::render('Jabatan/Form', [
            'jabatan' => $jabatan,
        ]);
    }

    public function update(Request $request, Jabatan $jabatan)
    {
        $validated = $request->validate([
            'kode_jabatan' => 'required|string|max:20|unique:jabatans,kode_jabatan,' . $jabatan->id,
            'nama_jabatan' => 'required|string|max:100',
            'keterangan' => 'nullable|string|max:255',
        ]);

        $jabatan->update($validated);

        return redirect()->route('jabatan.index')
            ->with('success', 'Jabatan berhasil diperbarui.');
    }

    public function destroy(Jabatan $jabatan)
    {
        $jabatan->delete();

        return redirect()->route('jabatan.index')
            ->with('success', 'Jabatan berhasil dihapus.');
    }
}
