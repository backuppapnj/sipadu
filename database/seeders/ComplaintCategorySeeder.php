<?php

namespace Database\Seeders;

use App\Models\ComplaintCategory;
use Illuminate\Database\Seeder;

class ComplaintCategorySeeder extends Seeder
{
    /**
     * Menjalankan seeder kategori pengaduan PA Penajam.
     */
    public function run(): void
    {
        $categories = [
            ['code' => 'ADM',  'name' => 'Pelayanan Administrasi Perkara', 'sla_days' => 14, 'is_active' => true],
            ['code' => 'KET',  'name' => 'Keterlambatan Penanganan Perkara', 'sla_days' => 14, 'is_active' => true],
            ['code' => 'PEG',  'name' => 'Perilaku Pegawai/Aparat Pengadilan', 'sla_days' => 60, 'is_active' => true],
            ['code' => 'PTSP', 'name' => 'Pelayanan PTSP', 'sla_days' => 14, 'is_active' => true],
            ['code' => 'INFO', 'name' => 'Pelayanan Informasi', 'sla_days' => 5, 'is_active' => true],
            ['code' => 'FAS',  'name' => 'Fasilitas dan Sarana Pengadilan', 'sla_days' => 14, 'is_active' => true],
            ['code' => 'NIK',  'name' => 'Administrasi Pernikahan/Perceraian', 'sla_days' => 14, 'is_active' => true],
            ['code' => 'LAIN', 'name' => 'Lainnya', 'sla_days' => 14, 'is_active' => true],
        ];

        foreach ($categories as $category) {
            ComplaintCategory::updateOrCreate(
                ['code' => $category['code']],
                $category
            );
        }
    }
}
