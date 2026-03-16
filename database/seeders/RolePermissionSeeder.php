<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Seeder untuk role dan permission SIPADU.
 *
 * Role disesuaikan dengan struktur organisasi PA Penajam:
 * - admin: Admin TI, akses penuh
 * - panitera: Panitera/Sekretaris, pengawasan pengaduan
 * - petugas_layanan: Petugas PTSP, penanganan pengaduan
 * - masyarakat: Masyarakat/Pencari Keadilan, pengajuan pengaduan
 */
class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cache permission
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Definisi semua permission secara granular
        $permissions = [
            // Pengaduan
            'complaints.view.own',
            'complaints.view.all',
            'complaints.create',
            'complaints.assign',
            'complaints.update.status',
            'complaints.respond',
            'complaints.delete',
            'complaints.export',

            // Manajemen pengguna
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Pengaturan sistem
            'settings.manage',

            // Audit log
            'audit_log.view',

            // Laporan
            'reports.view',
            'reports.export',

            // Kategori pengaduan
            'categories.manage',

            // Hari libur (untuk kalkulasi SLA)
            'holidays.manage',
        ];

        // Buat semua permission
        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Buat role dan assign permission
        $admin = Role::findOrCreate('admin', 'web');
        $admin->syncPermissions($permissions); // Admin mendapat SEMUA permission

        $panitera = Role::findOrCreate('panitera', 'web');
        $panitera->syncPermissions([
            'complaints.view.all',
            'complaints.assign',
            'complaints.update.status',
            'complaints.respond',
            'complaints.export',
            'reports.view',
            'reports.export',
            'audit_log.view',
        ]);

        $petugasLayanan = Role::findOrCreate('petugas_layanan', 'web');
        $petugasLayanan->syncPermissions([
            'complaints.view.own',
            'complaints.update.status',
            'complaints.respond',
        ]);

        $masyarakat = Role::findOrCreate('masyarakat', 'web');
        $masyarakat->syncPermissions([
            'complaints.view.own',
            'complaints.create',
        ]);
    }
}
