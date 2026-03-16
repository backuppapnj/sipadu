<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Membuat pengguna dengan peran Spatie untuk development.
     */
    public function run(): void
    {
        $password = Hash::make('Password123!');

        // Admin SIPADU
        $admin = User::updateOrCreate(
            ['email' => 'admin@pa-penajam.go.id'],
            [
                'name' => 'Admin SIPADU',
                'password' => $password,
                'phone' => '08221234567',
                'address' => 'Jl. Provinsi KM. 9, Kec. Penajam, Kab. PPU, Kaltim',
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // Petugas Layanan 1
        $petugas1 = User::updateOrCreate(
            ['email' => 'siti.aminah@pa-penajam.go.id'],
            [
                'name' => 'Siti Aminah',
                'password' => $password,
                'phone' => '08225678901',
                'address' => 'Jl. Raya Penajam No. 12, Kec. Penajam, Kab. PPU',
                'role' => 'petugas_layanan',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $petugas1->assignRole('petugas_layanan');

        // Petugas Layanan 2
        $petugas2 = User::updateOrCreate(
            ['email' => 'budi.santoso@pa-penajam.go.id'],
            [
                'name' => 'Budi Santoso',
                'password' => $password,
                'phone' => '08229876543',
                'address' => 'Jl. Propinsi KM. 5, Kel. Nipah-Nipah, Kec. Penajam',
                'role' => 'petugas_layanan',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $petugas2->assignRole('petugas_layanan');

        // Panitera
        $panitera = User::updateOrCreate(
            ['email' => 'ahmad.fauzi@pa-penajam.go.id'],
            [
                'name' => 'Ahmad Fauzi',
                'password' => $password,
                'phone' => '08221112233',
                'address' => 'Jl. Provinsi KM. 9, Kec. Penajam, Kab. PPU',
                'role' => 'panitera',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $panitera->assignRole('panitera');

        // 10 Masyarakat dengan nama Indonesia realistis
        $masyarakat = [
            ['name' => 'Rahmat Hidayat',   'email' => 'rahmat.hidayat@gmail.com',   'phone' => '081234567890', 'address' => 'Jl. Mangga No. 5, Kel. Penajam, Kec. Penajam, Kab. PPU'],
            ['name' => 'Nur Aisyah',       'email' => 'nur.aisyah@gmail.com',       'phone' => '081345678901', 'address' => 'Jl. Durian No. 10, Kel. Saloloang, Kec. Penajam, Kab. PPU'],
            ['name' => 'Muhammad Rizki',    'email' => 'mrizki99@yahoo.com',         'phone' => '085678901234', 'address' => 'Jl. Nelayan RT. 03, Kel. Nipah-Nipah, Kec. Penajam, Kab. PPU'],
            ['name' => 'Dewi Kartika',      'email' => 'dewi.kartika@outlook.com',   'phone' => '082198765432', 'address' => 'Jl. Pahlawan No. 15, Kel. Gunung Seteleng, Kec. Penajam, Kab. PPU'],
            ['name' => 'Agus Setiawan',     'email' => 'agus.setiawan77@gmail.com',  'phone' => '087812345678', 'address' => 'Jl. Pattimura No. 8, Kel. Tanjung Tengah, Kec. Penajam, Kab. PPU'],
            ['name' => 'Fatimah Zahra',     'email' => 'fatimah.zahra@gmail.com',    'phone' => '081567890123', 'address' => 'Jl. Mawar No. 22, Kel. Petung, Kec. Penajam, Kab. PPU'],
            ['name' => 'Hendra Prasetyo',   'email' => 'hendra.p@yahoo.co.id',      'phone' => '085234567890', 'address' => 'Jl. Melati RT. 10, Kel. Nenang, Kec. Penajam, Kab. PPU'],
            ['name' => 'Sri Wahyuni',       'email' => 'sriwahyuni85@gmail.com',     'phone' => '082345678901', 'address' => 'Jl. Anggrek No. 3, Kel. Penajam, Kec. Penajam, Kab. PPU'],
            ['name' => 'Irfan Hakim',       'email' => 'irfan.hakim@gmail.com',      'phone' => '081890123456', 'address' => 'Jl. Kenanga No. 7, Kel. Girimukti, Kec. Penajam, Kab. PPU'],
            ['name' => 'Lestari Handayani', 'email' => 'lestari.h@outlook.com',      'phone' => '087654321098', 'address' => 'Jl. Flamboyan No. 11, Kel. Sungai Parit, Kec. Penajam, Kab. PPU'],
        ];

        foreach ($masyarakat as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'password' => $password,
                    'role' => 'masyarakat',
                    'is_active' => true,
                    'email_verified_at' => now(),
                ])
            );
            $user->assignRole('masyarakat');
        }
    }
}
