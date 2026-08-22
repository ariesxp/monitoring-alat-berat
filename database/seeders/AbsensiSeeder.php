<?php

namespace Database\Seeders;

use App\Models\Absensi;
use App\Models\IzinCuti;
use App\Models\Operator;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seed untuk aplikasi AOB ABSENSI:
 *  - Konfigurasi lokasi kantor + jam kerja (tabel settings)
 *  - Akun supervisor (login aplikasi) : SPV001 / 12345
 *  - Akun karyawan (operator)         : NIK   / 12345  (ditautkan ke operator)
 *  - Contoh data absensi hari ini & pengajuan izin/cuti
 *
 * Jalankan: php artisan db:seed --class=Database\\Seeders\\AbsensiSeeder
 */
class AbsensiSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Konfigurasi lokasi kantor (default Jakarta) & jam kerja.
        $settings = [
            'office_name'     => 'Kantor Head Office',
            'office_lat'      => '-6.2000000',
            'office_lng'      => '106.8166660',
            'office_radius_m' => '20',
            'jam_masuk'       => '07:00',
            'batas_terlambat' => '07:15',
            'jam_pulang'      => '17:00',
        ];
        foreach ($settings as $k => $v) {
            Setting::set($k, $v);
        }

        // 1b) Lokasi kantor multi-office (Jakarta, Merauke, Ambon).
        $this->call(OfficeSeeder::class);

        // 2) Supervisor (pengguna aplikasi supervisi).
        $spv = User::updateOrCreate(
            ['username' => 'SPV001'],
            [
                'name'      => 'Ahmad Supervisor',
                'email'     => 'supervisor@aob.test',
                'password'  => Hash::make('12345'),
                'role'      => 'supervisor',
                'is_active' => true,
            ]
        );

        // 3) Tautkan tiap operator ke akun user (login karyawan) + password.
        $operators = Operator::orderBy('id')->get();
        foreach ($operators as $op) {
            $nik = $op->nik_karyawan ?: $op->nik;
            $username = $nik ?: ('OP' . str_pad((string) $op->id, 3, '0', STR_PAD_LEFT));

            $user = User::updateOrCreate(
                ['username' => $username],
                [
                    'name'      => $op->nama,
                    'email'     => 'op' . $op->id . '@aob.test',
                    'password'  => Hash::make('12345'),
                    'role'      => 'operator',
                    'is_active' => true,
                ]
            );

            $op->forceFill([
                'user_id'  => $user->id,
                'password' => $op->password ?: Hash::make('12345'),
            ])->save();
        }

        // 4) Contoh absensi hari ini (dalam radius kantor).
        $lat = -6.2000900; $lng = 106.8167100; // ~15 m dari titik kantor
        $today = now()->toDateString();
        $contoh = [
            ['idx' => 0, 'jam' => '07:05'],   // hadir
            ['idx' => 1, 'jam' => '07:32'],   // terlambat
            ['idx' => 2, 'jam' => null, 'status' => 'izin'], // izin
            ['idx' => 3, 'jam' => '07:01'],   // hadir
            ['idx' => 4, 'jam' => '07:45'],   // terlambat
        ];
        foreach ($contoh as $c) {
            $op = $operators->get($c['idx']);
            if (!$op) continue;

            Absensi::updateOrCreate(
                ['operator_id' => $op->id, 'tanggal' => $today],
                [
                    'jam_masuk'    => $c['jam'],
                    'status'       => $c['status'] ?? 'hadir',
                    'metode'       => 'GPS',
                    'lokasi'       => 'Kantor Head Office',
                    'lat_masuk'    => $c['jam'] ? $lat : null,
                    'lng_masuk'    => $c['jam'] ? $lng : null,
                    'jarak_masuk'  => $c['jam'] ? 15 : null,
                    'sumber_input' => $c['jam'] ? 'android' : 'web',
                ]
            );
        }

        // 5) Contoh pengajuan izin/cuti (menunggu).
        $izinContoh = [
            ['idx' => 3, 'jenis' => 'sakit', 'mulai' => $today, 'selesai' => $today, 'alasan' => 'Demam'],
            ['idx' => 1, 'jenis' => 'izin', 'mulai' => now()->addDay()->toDateString(), 'selesai' => now()->addDay()->toDateString(), 'alasan' => 'Urusan pribadi'],
            ['idx' => 2, 'jenis' => 'cuti', 'mulai' => now()->addDays(3)->toDateString(), 'selesai' => now()->addDays(5)->toDateString(), 'alasan' => 'Cuti tahunan'],
        ];
        foreach ($izinContoh as $iz) {
            $op = $operators->get($iz['idx']);
            if (!$op) continue;

            $hari = \Carbon\Carbon::parse($iz['mulai'])->diffInDays(\Carbon\Carbon::parse($iz['selesai'])) + 1;

            IzinCuti::updateOrCreate(
                ['operator_id' => $op->id, 'tanggal_mulai' => $iz['mulai'], 'jenis' => $iz['jenis']],
                [
                    'tanggal_selesai' => $iz['selesai'],
                    'jumlah_hari'     => $hari,
                    'alasan'          => $iz['alasan'],
                    'status'          => 'menunggu',
                ]
            );
        }

        $this->command?->info('AbsensiSeeder selesai. Supervisor: SPV001/12345. Karyawan: NIK/12345.');
    }
}
