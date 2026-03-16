<?php

/**
 * Migrasi: Tabel audit log SPBE (immutable — wajib Perpres 95/2018).
 *
 * Klasifikasi Data SPBE:
 * - Seluruh kolom: INTERNAL
 * - TABEL INI BERSIFAT IMMUTABLE: tidak ada updated_at, tidak ada soft delete
 * - Catatan: Tidak boleh ada operasi UPDATE atau DELETE pada tabel ini
 * - Retensi minimum: 1 tahun (BSSN 4/2021), 5 tahun untuk audit trail data
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()->comment('INTERNAL — pelaku aksi');
            $table->string('user_ip', 45)->comment('INTERNAL — IP address sumber (BSSN 4/2021)');
            $table->string('user_agent', 500)->comment('INTERNAL — browser/device info');
            $table->string('action', 50)->comment('INTERNAL — create/read/update/delete/login/logout');
            $table->string('subject_type')->nullable()->comment('INTERNAL — model class yang diakses');
            $table->unsignedBigInteger('subject_id')->nullable()->comment('INTERNAL — ID record yang diakses');
            $table->json('old_values')->nullable()->comment('INTERNAL — nilai sebelum perubahan');
            $table->json('new_values')->nullable()->comment('INTERNAL — nilai sesudah perubahan');
            $table->string('session_id')->nullable()->comment('INTERNAL — session tracking');
            $table->uuid('request_id')->comment('INTERNAL — UUID untuk traceability');
            $table->timestamp('created_at')->comment('INTERNAL — IMMUTABLE, tidak ada updated_at');
            // TIDAK ADA updated_at — log bersifat immutable (SPBE)
            // TIDAK ADA deleted_at — log tidak boleh dihapus (SPBE)

            $table->index('user_id');
            $table->index('action');
            $table->index('subject_type');
            $table->index('created_at');
            $table->index('request_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
