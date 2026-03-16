<?php

/**
 * Migrasi: Tabel kategori pengaduan.
 *
 * Klasifikasi Data SPBE:
 * - Seluruh kolom: PUBLIK (informasi kategori layanan bersifat terbuka)
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('PUBLIK — nama kategori pengaduan');
            $table->string('code', 10)->unique()->comment('PUBLIK — kode unik kategori');
            $table->integer('sla_days')->default(14)->comment('PUBLIK — target hari kerja penyelesaian');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_categories');
    }
};
