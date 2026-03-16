<?php

namespace App\Actions\Attachment;

use App\Models\Complaint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StoreAttachmentsAction
{
    /**
     * Menyimpan lampiran pengaduan terenkripsi dengan checksum SHA-256.
     *
     * @param  Complaint  $complaint
     * @param  array<UploadedFile>  $files
     */
    public function execute(Complaint $complaint, array $files): void
    {
        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            // Membaca konten file asli
            $content = file_get_contents($file->getRealPath());

            // Menghitung checksum SHA-256 sebelum enkripsi (integritas — BSSN)
            $checksum = hash('sha256', $content);

            // Mengenkripsi konten file (at rest — SPBE)
            $encryptedContent = Crypt::encrypt($content);

            // Membuat path penyimpanan
            $path = "complaints/{$complaint->id}/" . Str::uuid() . '.' . $file->getClientOriginalExtension();

            // Menyimpan file terenkripsi ke disk private
            Storage::disk('complaints')->put($path, $encryptedContent);

            // Membuat record lampiran
            $complaint->attachments()->create([
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'checksum' => $checksum,
            ]);
        }
    }
}
