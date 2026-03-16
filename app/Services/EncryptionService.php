<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;

class EncryptionService
{
    /**
     * Mengenkripsi NIK menggunakan Laravel Crypt.
     */
    public function encryptNik(string $nik): string
    {
        return Crypt::encryptString($nik);
    }

    /**
     * Mendekripsi NIK yang terenkripsi.
     */
    public function decryptNik(string $encrypted): string
    {
        return Crypt::decryptString($encrypted);
    }
}
