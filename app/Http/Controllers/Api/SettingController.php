<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\Geo;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /** GET /pengaturan — Konfigurasi lokasi kantor & jam kerja. */
    public function show(Request $request)
    {
        return response()->json(['data' => Geo::officeConfig()]);
    }

    /** POST /pengaturan — Perbarui lokasi kantor, radius, jam kerja (supervisor). */
    public function update(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['supervisor', 'admin'], true), 403, 'Hanya supervisor.');

        $data = $request->validate([
            'office_name'     => 'nullable|string|max:255',
            'office_lat'      => 'required|numeric|between:-90,90',
            'office_lng'      => 'required|numeric|between:-180,180',
            'office_radius_m' => 'required|integer|min:5|max:5000',
            'jam_masuk'       => 'nullable|date_format:H:i',
            'batas_terlambat' => 'nullable|date_format:H:i',
            'jam_pulang'      => 'nullable|date_format:H:i',
        ]);

        foreach ($data as $key => $value) {
            if ($value !== null) {
                Setting::set($key, (string) $value);
            }
        }

        return response()->json([
            'message' => 'Pengaturan berhasil disimpan.',
            'data'    => Geo::officeConfig(),
        ]);
    }
}
