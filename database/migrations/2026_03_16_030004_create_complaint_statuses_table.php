<?php

/**
 * Migrasi: Tabel riwayat status pengaduan (timeline).
 *
 * Klasifikasi Data SPBE:
 * - Seluruh kolom: INTERNAL (riwayat proses penanganan)
 * - Berfungsi sebagai audit trail perubahan status
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete()->comment('INTERNAL');
            $table->string('status', 20)->comment('INTERNAL');
            $table->text('note')->nullable()->comment('INTERNAL');
            $table->foreignId('updated_by')->constrained('users')->comment('INTERNAL — petugas yang mengubah status');
            $table->timestamps();

            $table->index('complaint_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_statuses');
    }
};
