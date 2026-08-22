<?php

namespace Database\Seeders;

use App\Models\Office;
use Illuminate\Database\Seeder;

/**
 * Lokasi kantor untuk absensi multi-office.
 *
 * PENTING: koordinat di bawah masih PLACEHOLDER (titik pusat kota). Ganti
 * dengan titik GPS kantor yang persis — radius 20 m sangat kecil sehingga
 * butuh koordinat akurat. Cara mendapatkan: buka Google Maps di titik kantor,
 * klik kanan → salin "lat, lng".
 *
 * Jalankan: php artisan db:seed --class=Database\\Seeders\\OfficeSeeder
 */
class OfficeSeeder extends Seeder
{
    public function run(): void
    {
        $offices = [
            ['id' => 1, 'nama' => 'Kantor Jakarta', 'lat' => -6.1753920, 'lng' => 106.8271530, 'radius_m' => 20, 'aktif' => true],
            ['id' => 2, 'nama' => 'Kantor Merauke', 'lat' => -8.4936900, 'lng' => 140.4019300, 'radius_m' => 20, 'aktif' => true],
            ['id' => 3, 'nama' => 'Kantor Ambon',   'lat' => -3.6547030, 'lng' => 128.1906430, 'radius_m' => 20, 'aktif' => true],
        ];

        foreach ($offices as $o) {
            Office::updateOrCreate(['id' => $o['id']], $o);
        }

        $this->command?->info('OfficeSeeder selesai: ' . count($offices) . ' kantor (koordinat placeholder — harap diganti).');
    }
}
