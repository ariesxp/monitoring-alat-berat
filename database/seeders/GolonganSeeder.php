<?php

namespace Database\Seeders;

use App\Models\Golongan;
use Illuminate\Database\Seeder;

class GolonganSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['kode_golongan' => 'GOL-01', 'nama_golongan' => 'Direksi', 'gaji_golongan' => 10000000],
            ['kode_golongan' => 'GOL-02', 'nama_golongan' => 'Group Manager', 'gaji_golongan' => 9900000],
            ['kode_golongan' => 'GOL-03', 'nama_golongan' => 'Senior Manager', 'gaji_golongan' => 9800000],
            ['kode_golongan' => 'GOL-04', 'nama_golongan' => 'Manager', 'gaji_golongan' => 9700000],
            ['kode_golongan' => 'GOL-05', 'nama_golongan' => 'Askep', 'gaji_golongan' => 9600000],
            ['kode_golongan' => 'GOL-06', 'nama_golongan' => 'Asisten 2', 'gaji_golongan' => 9500000],
            ['kode_golongan' => 'GOL-07', 'nama_golongan' => 'Asisten 1', 'gaji_golongan' => 9400000],
            ['kode_golongan' => 'GOL-08', 'nama_golongan' => 'KLB3', 'gaji_golongan' => 9300000],
            ['kode_golongan' => 'GOL-09', 'nama_golongan' => 'KLB2', 'gaji_golongan' => 9200000],
            ['kode_golongan' => 'GOL-10', 'nama_golongan' => 'KLB1', 'gaji_golongan' => 9100000],
            ['kode_golongan' => 'GOL-11', 'nama_golongan' => 'KHT', 'gaji_golongan' => 9000000],
            ['kode_golongan' => 'GOL-12', 'nama_golongan' => 'KHL', 'gaji_golongan' => 8900000],
        ];

        foreach ($data as $item) {
            Golongan::updateOrCreate(
                ['kode_golongan' => $item['kode_golongan']],
                $item
            );
        }
    }
}
