<?php

namespace App\Support;

use App\Models\Office;
use App\Models\Setting;
use Illuminate\Support\Collection;

class Geo
{
    /**
     * Jarak antara dua titik koordinat dalam meter (rumus Haversine).
     */
    public static function distanceMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earth = 6371000.0; // radius bumi (meter)

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earth * $c;
    }

    /**
     * Daftar kantor aktif untuk absensi (multi-office).
     *
     * Jika tabel offices belum diisi, fallback ke satu kantor dari settings
     * agar tetap kompatibel dengan konfigurasi lama.
     *
     * @return Collection<int, array{id:?int,nama:string,lat:float,lng:float,radius_m:int}>
     */
    public static function offices(): Collection
    {
        $rows = Office::query()->where('aktif', true)->orderBy('id')->get();

        if ($rows->isNotEmpty()) {
            $c = self::officeConfig();
            return $rows->map(fn (Office $o) => [
                'id'       => $o->id,
                'nama'     => $o->nama,
                'lat'      => (float) $o->lat,
                'lng'      => (float) $o->lng,
                'radius_m' => (int) $o->radius_m,
                // Jam kerja per kantor; kosong -> pakai setingan global.
                'jam_masuk'       => $o->jam_masuk ?: $c['jam_masuk'],
                'batas_terlambat' => $o->batas_terlambat ?: $c['batas_terlambat'],
                'jam_pulang'      => $o->jam_pulang ?: $c['jam_pulang'],
            ])->values();
        }

        // Fallback: satu kantor dari settings (format lama).
        $c = self::officeConfig();
        return collect([[
            'id'       => null,
            'nama'     => $c['nama'],
            'lat'      => $c['lat'],
            'lng'      => $c['lng'],
            'radius_m' => $c['radius_m'],
            'jam_masuk'       => $c['jam_masuk'],
            'batas_terlambat' => $c['batas_terlambat'],
            'jam_pulang'      => $c['jam_pulang'],
        ]]);
    }

    /**
     * Cari kantor terdekat yang MASIH berada dalam radiusnya dari titik
     * [$lat, $lng]. Mengembalikan array kantor + jarak (m), atau null bila
     * berada di luar radius semua kantor.
     *
     * @return array{office:array,jarak:int}|null
     */
    public static function nearestOfficeInRadius(float $lat, float $lng): ?array
    {
        $best = null;
        $bestDist = INF;

        foreach (self::offices() as $office) {
            $d = self::distanceMeters($lat, $lng, $office['lat'], $office['lng']);
            if ($d <= $office['radius_m'] && $d < $bestDist) {
                $best = $office;
                $bestDist = $d;
            }
        }

        if ($best === null) {
            return null;
        }

        return ['office' => $best, 'jarak' => (int) round($bestDist)];
    }

    /**
     * Konfigurasi lokasi kantor + aturan absensi dari tabel settings.
     */
    public static function officeConfig(): array
    {
        return [
            'lat'        => (float) Setting::get('office_lat', -6.2000000),
            'lng'        => (float) Setting::get('office_lng', 106.8166660),
            'radius_m'   => (int) Setting::get('office_radius_m', 20),
            'nama'       => (string) Setting::get('office_name', 'Kantor Head Office'),
            'jam_masuk'  => (string) Setting::get('jam_masuk', '07:00'),
            'batas_terlambat' => (string) Setting::get('batas_terlambat', '07:15'),
            'jam_pulang' => (string) Setting::get('jam_pulang', '17:00'),
        ];
    }
}
