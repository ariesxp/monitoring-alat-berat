<?php

namespace Database\Seeders;

use App\Models\AlatBerat;
use App\Models\Barang;
use App\Models\Client;
use App\Models\KategoriBarang;
use App\Models\Operator;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Database\Seeders\GolonganSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@monitoring.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '081234567890',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Supervisor',
            'email' => 'supervisor@monitoring.test',
            'password' => Hash::make('password'),
            'role' => 'supervisor',
            'phone' => '081234567891',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Operator',
            'email' => 'operator@monitoring.test',
            'password' => Hash::make('password'),
            'role' => 'operator',
            'phone' => '081234567892',
            'email_verified_at' => now(),
        ]);

        // Golongan
        $this->call(GolonganSeeder::class);

        // Alat Berat
        $alatData = [
            ['kode_alat' => 'EXC-001', 'nama_alat' => 'Excavator Komatsu PC200-8', 'jenis' => 'Excavator', 'merk' => 'Komatsu', 'tahun' => 2020, 'status' => 'tersedia', 'no_mesin' => 'SAA6D107E-1', 'no_chassis' => 'KMTPC249J9A012345', 'dealer' => 'United Tractors', 'harga' => 2500000000, 'invoice' => 'INV-2020-0456', 'hm_awal' => 0],
            ['kode_alat' => 'EXC-002', 'nama_alat' => 'Excavator CAT 320D', 'jenis' => 'Excavator', 'merk' => 'Caterpillar', 'tahun' => 2019, 'status' => 'beroperasi', 'no_mesin' => 'C6.4 ACERT', 'no_chassis' => 'CAT0320DXKA054321', 'dealer' => 'Trakindo Utama', 'harga' => 2800000000, 'invoice' => 'INV-2019-0789', 'hm_awal' => 1250.5],
            ['kode_alat' => 'BUL-001', 'nama_alat' => 'Bulldozer Komatsu D65', 'jenis' => 'Bulldozer', 'merk' => 'Komatsu', 'tahun' => 2021, 'status' => 'tersedia', 'no_mesin' => 'SAA6D114E-5', 'no_chassis' => 'KMTD65PX21B098765', 'dealer' => 'United Tractors', 'harga' => 3200000000, 'invoice' => 'INV-2021-0123', 'hm_awal' => 0],
            ['kode_alat' => 'DMP-001', 'nama_alat' => 'Dump Truck Hino 500', 'jenis' => 'Dump Truck', 'merk' => 'Hino', 'tahun' => 2022, 'status' => 'beroperasi', 'no_mesin' => 'J08E-WJ', 'no_chassis' => 'MJEFM8JN7N0012345', 'dealer' => 'Hino Motors Sales', 'harga' => 850000000, 'invoice' => 'INV-2022-0234', 'hm_awal' => 320],
            ['kode_alat' => 'CRN-001', 'nama_alat' => 'Crane Tadano TR-250M', 'jenis' => 'Crane', 'merk' => 'Tadano', 'tahun' => 2018, 'status' => 'maintenance', 'no_mesin' => 'J05E-TE', 'no_chassis' => 'TDN250MJ8A007890', 'dealer' => 'Tadano Indonesia', 'harga' => 4500000000, 'invoice' => 'INV-2018-0567', 'hm_awal' => 2100.8],
            ['kode_alat' => 'LOD-001', 'nama_alat' => 'Wheel Loader CAT 950H', 'jenis' => 'Wheel Loader', 'merk' => 'Caterpillar', 'tahun' => 2020, 'status' => 'tersedia', 'no_mesin' => 'C7 ACERT', 'no_chassis' => 'CAT0950HXLA065432', 'dealer' => 'Trakindo Utama', 'harga' => 3100000000, 'invoice' => 'INV-2020-0890', 'hm_awal' => 580.3],
        ];
        foreach ($alatData as $alat) {
            AlatBerat::create($alat);
        }

        // Operators
        $operatorData = [
            ['nama' => 'Budi Santoso', 'nik' => '3201010101010001', 'no_hp' => '08111111001', 'jabatan' => 'Operator Excavator', 'gaji_pokok' => 5000000, 'tunjangan' => 1000000, 'tanggal_masuk' => '2020-01-15'],
            ['nama' => 'Agus Prabowo', 'nik' => '3201010101010002', 'no_hp' => '08111111002', 'jabatan' => 'Operator Bulldozer', 'gaji_pokok' => 5000000, 'tunjangan' => 1000000, 'tanggal_masuk' => '2020-03-01'],
            ['nama' => 'Dedi Kurniawan', 'nik' => '3201010101010003', 'no_hp' => '08111111003', 'jabatan' => 'Supir Dump Truck', 'gaji_pokok' => 4500000, 'tunjangan' => 800000, 'tanggal_masuk' => '2021-06-10'],
            ['nama' => 'Eko Prasetyo', 'nik' => '3201010101010004', 'no_hp' => '08111111004', 'jabatan' => 'Operator Crane', 'gaji_pokok' => 5500000, 'tunjangan' => 1200000, 'tanggal_masuk' => '2019-08-20'],
            ['nama' => 'Fajar Hidayat', 'nik' => '3201010101010005', 'no_hp' => '08111111005', 'jabatan' => 'Mekanik', 'gaji_pokok' => 4800000, 'tunjangan' => 900000, 'tanggal_masuk' => '2022-01-05'],
        ];
        foreach ($operatorData as $op) {
            Operator::create($op);
        }

        // Clients
        Client::create(['nama_perusahaan' => 'PT Pembangunan Jaya', 'nama_pic' => 'Hendra Wijaya', 'no_hp_pic' => '08122222001', 'email' => 'hendra@pbjaya.co.id', 'alamat' => 'Jl. Sudirman No. 100, Jakarta']);
        Client::create(['nama_perusahaan' => 'CV Mitra Konstruksi', 'nama_pic' => 'Susanto', 'no_hp_pic' => '08122222002', 'email' => 'susanto@mitrakons.com', 'alamat' => 'Jl. Gatot Subroto No. 50, Bandung']);
        Client::create(['nama_perusahaan' => 'PT Infrastruktur Nusantara', 'nama_pic' => 'Diana Putri', 'no_hp_pic' => '08122222003', 'email' => 'diana@infranusa.co.id', 'alamat' => 'Jl. Ahmad Yani No. 75, Surabaya']);

        // Kategori Barang
        $kategoriData = ['BBM', 'Sparepart', 'Oli & Pelumas', 'Filter', 'Ban', 'Hydraulic'];
        foreach ($kategoriData as $kat) {
            KategoriBarang::create(['nama' => $kat]);
        }

        // Barang
        $barangData = [
            ['kategori_barang_id' => 1, 'kode_barang' => 'BBM-001', 'nama_barang' => 'Solar', 'satuan' => 'liter', 'stok_minimum' => 500, 'stok_saat_ini' => 2000, 'harga_satuan' => 12500],
            ['kategori_barang_id' => 2, 'kode_barang' => 'SPR-001', 'nama_barang' => 'V-Belt Excavator', 'satuan' => 'pcs', 'stok_minimum' => 5, 'stok_saat_ini' => 12, 'harga_satuan' => 350000],
            ['kategori_barang_id' => 3, 'kode_barang' => 'OLI-001', 'nama_barang' => 'Oli Mesin SAE 15W-40', 'satuan' => 'liter', 'stok_minimum' => 50, 'stok_saat_ini' => 120, 'harga_satuan' => 65000],
            ['kategori_barang_id' => 3, 'kode_barang' => 'OLI-002', 'nama_barang' => 'Oli Hidrolik ISO 68', 'satuan' => 'liter', 'stok_minimum' => 40, 'stok_saat_ini' => 30, 'harga_satuan' => 55000],
            ['kategori_barang_id' => 4, 'kode_barang' => 'FLT-001', 'nama_barang' => 'Filter Oli Komatsu', 'satuan' => 'pcs', 'stok_minimum' => 10, 'stok_saat_ini' => 25, 'harga_satuan' => 180000],
            ['kategori_barang_id' => 4, 'kode_barang' => 'FLT-002', 'nama_barang' => 'Filter Solar', 'satuan' => 'pcs', 'stok_minimum' => 10, 'stok_saat_ini' => 8, 'harga_satuan' => 150000],
            ['kategori_barang_id' => 5, 'kode_barang' => 'BAN-001', 'nama_barang' => 'Ban Loader 17.5-25', 'satuan' => 'pcs', 'stok_minimum' => 2, 'stok_saat_ini' => 4, 'harga_satuan' => 8500000],
            ['kategori_barang_id' => 6, 'kode_barang' => 'HYD-001', 'nama_barang' => 'Selang Hydraulic 1/2"', 'satuan' => 'meter', 'stok_minimum' => 20, 'stok_saat_ini' => 50, 'harga_satuan' => 95000],
        ];
        foreach ($barangData as $brg) {
            Barang::create($brg);
        }
    }
}
