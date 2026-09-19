<?php

namespace App\Http\Controllers;

use App\Models\Office;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Modul Pengaturan (web): konfigurasi umum (tabel settings) & kantor cabang
 * untuk validasi radius absensi (tabel offices). Admin only.
 */
class PengaturanController extends Controller
{
    /** Kunci setting yang dikelola dari halaman ini. */
    private const SETTING_KEYS = [
        'office_name', 'office_lat', 'office_lng', 'office_radius_m',
        'jam_masuk', 'batas_terlambat', 'jam_pulang',
        'rp_per_ritase', 'rp_per_hm',
    ];

    public function index()
    {
        // Ambil semua setting sebagai map key => value (untuk form + tabel mentah).
        $settings = Setting::orderBy('key')->get(['key', 'value']);
        $map = $settings->pluck('value', 'key');

        return Inertia::render('Pengaturan/Index', [
            'settings' => [
                'office_name'     => (string) ($map['office_name'] ?? 'Kantor Head Office'),
                'office_lat'      => (float) ($map['office_lat'] ?? -6.2),
                'office_lng'      => (float) ($map['office_lng'] ?? 106.816666),
                'office_radius_m' => (int) ($map['office_radius_m'] ?? 20),
                'jam_masuk'       => (string) ($map['jam_masuk'] ?? '07:00'),
                'batas_terlambat' => (string) ($map['batas_terlambat'] ?? '07:15'),
                'jam_pulang'      => (string) ($map['jam_pulang'] ?? '17:00'),
                'rp_per_ritase'   => (int) ($map['rp_per_ritase'] ?? 28000),
                'rp_per_hm'       => (int) ($map['rp_per_hm'] ?? 28000),
            ],
            'settingsRaw' => $settings,
            'offices' => Office::orderBy('id')->get(),
        ]);
    }

    /** Simpan konfigurasi umum (settings). */
    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'office_name'     => 'required|string|max:255',
            'office_lat'      => 'required|numeric|between:-90,90',
            'office_lng'      => 'required|numeric|between:-180,180',
            'office_radius_m' => 'required|integer|min:5|max:5000',
            'jam_masuk'       => 'required|date_format:H:i',
            'batas_terlambat' => 'required|date_format:H:i',
            'jam_pulang'      => 'required|date_format:H:i',
            'rp_per_ritase'   => 'required|numeric|min:0',
            'rp_per_hm'       => 'required|numeric|min:0',
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, (string) $value);
        }

        return back()->with('success', 'Pengaturan umum berhasil disimpan.');
    }

    /** Tambah kantor cabang. */
    public function storeOffice(Request $request)
    {
        Office::create($this->validateOffice($request));

        return back()->with('success', 'Kantor cabang berhasil ditambahkan.');
    }

    /** Perbarui kantor cabang. */
    public function updateOffice(Request $request, Office $office)
    {
        $office->update($this->validateOffice($request));

        return back()->with('success', "Kantor \"{$office->nama}\" berhasil diperbarui.");
    }

    /** Hapus kantor cabang. */
    public function destroyOffice(Office $office)
    {
        $nama = $office->nama;
        $office->delete();

        return back()->with('success', "Kantor \"{$nama}\" berhasil dihapus.");
    }

    private function validateOffice(Request $request): array
    {
        return $request->validate([
            'nama'            => 'required|string|max:255',
            'lat'             => 'required|numeric|between:-90,90',
            'lng'             => 'required|numeric|between:-180,180',
            'radius_m'        => 'required|integer|min:5|max:5000',
            'jam_masuk'       => 'nullable|date_format:H:i',
            'batas_terlambat' => 'nullable|date_format:H:i',
            'jam_pulang'      => 'nullable|date_format:H:i',
            'aktif'           => 'nullable|boolean',
        ]);
    }
}
