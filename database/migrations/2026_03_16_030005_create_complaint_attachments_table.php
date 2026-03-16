<?php

/**
 * Migrasi: Tabel lampiran pengaduan.
 *
 * Klasifikasi Data SPBE:
 * - file_path: INTERNAL (lokasi penyimpanan terenkripsi)
 * - checksum: INTERNAL (SHA-256 untuk verifikasi integritas — BSSN)
 * - Konten file: RAHASIA (terenkripsi at rest)
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete()->comment('INTERNAL');
            $table->string('file_path', 500)->comment('INTERNAL — path file terenkripsi');
            $table->string('original_name')->comment('INTERNAL');
            $table->string('mime_type', 100)->comment('INTERNAL');
            $table->unsignedInteger('file_size')->comment('INTERNAL — ukuran dalam bytes');
            $table->string('checksum', 64)->comment('INTERNAL — SHA-256 untuk integritas (BSSN)');
            $table->timestamps();

            $table->index('complaint_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_attachments');
    }
};
