<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Office;
use Illuminate\Http\Request;

/**
 * Kelola lokasi kantor cabang untuk validasi radius absensi (multi-office).
 * Semua aksi tulis hanya untuk supervisor/admin.
 */
class OfficeController extends Controller
{
    /** GET /offices — Daftar semua kantor (termasuk yang nonaktif). */
    public function index(Request $request)
    {
        $this->authorizeSupervisor($request);

        $offices = Office::orderBy('id')->get()->map(fn (Office $o) => $this->payload($o));

        return response()->json(['data' => $offices]);
    }

    /** POST /offices — Tambah kantor baru. */
    public function store(Request $request)
    {
        $this->authorizeSupervisor($request);

        $data = $this->validated($request);
        $office = Office::create($data);

        return response()->json([
            'message' => "Kantor \"{$office->nama}\" ditambahkan.",
            'data'    => $this->payload($office),
        ], 201);
    }

    /** PUT/PATCH /offices/{office} — Perbarui data kantor. */
    public function update(Request $request, Office $office)
    {
        $this->authorizeSupervisor($request);

        $data = $this->validated($request);
        $office->update($data);

        return response()->json([
            'message' => "Kantor \"{$office->nama}\" diperbarui.",
            'data'    => $this->payload($office->fresh()),
        ]);
    }

    /** DELETE /offices/{office} — Hapus kantor. */
    public function destroy(Request $request, Office $office)
    {
        $this->authorizeSupervisor($request);

        $nama = $office->nama;
        $office->delete();

        return response()->json([
            'message' => "Kantor \"{$nama}\" dihapus.",
        ]);
    }

    // ---------------------------------------------------------------------

    protected function authorizeSupervisor(Request $request): void
    {
        abort_unless(
            in_array($request->user()->role, ['supervisor', 'admin'], true),
            403,
            'Hanya supervisor yang dapat mengelola kantor.'
        );
    }

    protected function validated(Request $request): array
    {
        return $request->validate([
            'nama'     => 'required|string|max:255',
            'lat'      => 'required|numeric|between:-90,90',
            'lng'      => 'required|numeric|between:-180,180',
            'radius_m' => 'required|integer|min:5|max:5000',
            // Jam kerja per kantor (HH:MM). Kosong -> pakai setingan global.
            'jam_masuk'       => 'nullable|date_format:H:i',
            'batas_terlambat' => 'nullable|date_format:H:i',
            'jam_pulang'      => 'nullable|date_format:H:i',
            'aktif'    => 'nullable|boolean',
        ]);
    }

    protected function payload(Office $o): array
    {
        return [
            'id'       => $o->id,
            'nama'     => $o->nama,
            'lat'      => (float) $o->lat,
            'lng'      => (float) $o->lng,
            'radius_m' => (int) $o->radius_m,
            'jam_masuk'       => $o->jam_masuk,
            'batas_terlambat' => $o->batas_terlambat,
            'jam_pulang'      => $o->jam_pulang,
            'aktif'    => (bool) $o->aktif,
        ];
    }
}
