<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Rules\StrongPassword;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\ResetsUserPasswords;

/**
 * Action untuk reset password pengguna.
 * Validasi password sesuai standar BSSN 4/2021.
 */
class ResetUserPassword implements ResetsUserPasswords
{
    /**
     * Validasi dan reset password pengguna.
     *
     * @param  array<string, string>  $input
     */
    public function reset(User $user, array $input): void
    {
        Validator::make($input, [
            'password' => ['required', 'string', new StrongPassword, 'confirmed'],
        ], [
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ])->validate();

        $user->forceFill([
            'password' => $input['password'],
            'password_changed_at' => now(),
        ])->save();
    }
}
