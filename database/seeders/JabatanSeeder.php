<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use Illuminate\Database\Seeder;

class JabatanSeeder extends Seeder
{
    /**
     * Jabatan standar (kode mengikuti pemetaan kode karyawan pada OperatorController).
     */
    public function run(): void
    {
        $data = [
            ['kode_jabatan' => 'DIR', 'nama_jabatan' => 'Direksi'],
            ['kode_jabatan' => 'SHO', 'nama_jabatan' => 'Staff HO'],
            ['kode_jabatan' => 'SIT', 'nama_jabatan' => 'Staff Site'],
            ['kode_jabatan' => 'OEX', 'nama_jabatan' => 'Operator Excavator'],
            ['kode_jabatan' => 'ODZ', 'nama_jabatan' => 'Operator Dozer'],
            ['kode_jabatan' => 'OTR', 'nama_jabatan' => 'Operator Tractor'],
            ['kode_jabatan' => 'DRV', 'nama_jabatan' => 'Driver'],
            ['kode_jabatan' => 'MDR', 'nama_jabatan' => 'Mandor'],
            ['kode_jabatan' => 'MKK', 'nama_jabatan' => 'Mekanik'],
            ['kode_jabatan' => 'ADM', 'nama_jabatan' => 'Admin'],
            ['kode_jabatan' => 'HLP', 'nama_jabatan' => 'Helper'],
        ];

        foreach ($data as $row) {
            Jabatan::firstOrCreate(
                ['nama_jabatan' => $row['nama_jabatan']],
                ['kode_jabatan' => $row['kode_jabatan']]
            );
        }
    }
}
