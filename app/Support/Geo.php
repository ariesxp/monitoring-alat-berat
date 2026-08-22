<?php

namespace App\Support;

use App\Models\Setting;

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
