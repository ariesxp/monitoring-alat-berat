<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Daftar permission per modul: group => [ [slug, name], ... ]
        $modules = [
            'Alat Berat' => 'alat-berat',
            'Operator' => 'operator',
            'Client' => 'client',
            'Golongan' => 'golongan',
            'Kontrak Kerja' => 'kontrak-kerja',
            'SPK' => 'spk',
            'Laporan Harian' => 'laporan-harian',
            'Gudang' => 'gudang',
            'Purchase Request' => 'purchase-request',
            'Keuangan' => 'keuangan',
            'Manajemen User' => 'user',
        ];

        $actions = [
            'view' => 'Lihat',
            'create' => 'Tambah',
            'update' => 'Ubah',
            'delete' => 'Hapus',
        ];

        $allPermissionIds = [];

        foreach ($modules as $group => $prefix) {
            foreach ($actions as $action => $label) {
                $permission = Permission::firstOrCreate(
                    ['slug' => "{$prefix}.{$action}"],
                    [
                        'name' => "{$label} {$group}",
                        'group' => $group,
                        'description' => "{$label} data pada modul {$group}",
                    ]
                );
                $allPermissionIds[] = $permission->id;
            }
        }

        // Role inti (slug cocok dengan nilai pada kolom users.role)
        $admin = Role::firstOrCreate(['slug' => 'admin'], [
            'name' => 'Administrator',
            'description' => 'Akses penuh ke seluruh sistem',
            'is_locked' => true,
        ]);

        $supervisor = Role::firstOrCreate(['slug' => 'supervisor'], [
            'name' => 'Supervisor',
            'description' => 'Mengelola operasional dan laporan',
            'is_locked' => true,
        ]);

        $operator = Role::firstOrCreate(['slug' => 'operator'], [
            'name' => 'Operator',
            'description' => 'Akses terbatas operasional harian',
            'is_locked' => true,
        ]);

        // Admin: semua permission
        $admin->permissions()->sync($allPermissionIds);

        // Supervisor: semua kecuali Manajemen User & Keuangan
        $supervisor->permissions()->sync(
            Permission::whereNotIn('group', ['Manajemen User', 'Keuangan'])->pluck('id')
        );

        // Operator: hanya view + create laporan/gudang dasar
        $operator->permissions()->sync(
            Permission::whereIn('slug', [
                'laporan-harian.view', 'laporan-harian.create',
                'gudang.view', 'gudang.create',
                'purchase-request.view', 'purchase-request.create',
            ])->pluck('id')
        );
    }
}
