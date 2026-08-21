<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Membuat akun demo petugas gudang untuk login aplikasi Android (AOB Gudang).
 * Login: username "GDG001" ATAU email, password "12345".
 * Jalankan: php artisan db:seed --class=Database\\Seeders\\AndroidUserSeeder
 */
class AndroidUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'gudang@aob.test'],
            [
                'name'      => 'Ahmad',
                'username'  => 'GDG001',
                'password'  => Hash::make('12345'),
                'role'      => 'operator',
                'phone'     => null,
                'is_active' => true,
            ]
        );

        $this->command?->info('User Android dibuat: username=GDG001 / password=12345');
    }
}
