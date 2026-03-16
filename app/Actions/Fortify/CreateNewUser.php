<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Rules\StrongPassword;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

/**
 * Action untuk registrasi pengguna baru (masyarakat).
 *
 * Setiap pengguna baru otomatis mendapat role 'masyarakat'.
 * Validasi password sesuai standar BSSN 4/2021.
 */
class CreateNewUser implements CreatesNewUsers
{
    /**
     * Validasi dan buat pengguna baru.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'phone' => ['required', 'string', 'max:20', 'regex:/^(\+62|62|0)8[1-9][0-9]{6,10}$/'],
            'nik' => ['required', 'string', 'digits:16'],
            'password' => ['required', 'string', new StrongPassword, 'confirmed'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.max' => 'Nama lengkap maksimal 255 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'phone.required' => 'Nomor HP wajib diisi.',
            'phone.regex' => 'Format nomor HP tidak valid. Contoh: 08123456789.',
            'nik.required' => 'NIK wajib diisi.',
            'nik.digits' => 'NIK harus terdiri dari 16 digit angka.',
            'password.required' => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'],
            'nik' => $input['nik'],
            'password' => $input['password'],
            'role' => 'masyarakat',
            'password_changed_at' => now(),
        ]);

        // Assign role masyarakat via Spatie Permission
        $user->assignRole('masyarakat');

        return $user;
    }
}
