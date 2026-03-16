<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Aturan validasi password kuat sesuai standar BSSN 4/2021.
 *
 * Persyaratan:
 * - Minimal 8 karakter
 * - Minimal 1 huruf kapital
 * - Minimal 1 angka
 * - Minimal 1 simbol (!@#$%^&*...)
 */
class StrongPassword implements ValidationRule
{
    /**
     * Validasi atribut.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (strlen($value) < 8) {
            $fail('Password harus minimal 8 karakter.');

            return;
        }

        if (! preg_match('/[A-Z]/', $value)) {
            $fail('Password harus mengandung minimal 1 huruf kapital.');

            return;
        }

        if (! preg_match('/[0-9]/', $value)) {
            $fail('Password harus mengandung minimal 1 angka.');

            return;
        }

        if (! preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~`]/', $value)) {
            $fail('Password harus mengandung minimal 1 simbol (!@#$%^&*...).');
        }
    }
}
