<?php

/**
 * Migrasi: Tabel pengaturan sistem.
 *
 * Klasifikasi Data SPBE:
 * - Seluruh kolom: INTERNAL (konfigurasi sistem internal)
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->string('key')->primary()->comment('INTERNAL — kunci pengaturan');
            $table->text('value')->comment('INTERNAL — nilai pengaturan');
            $table->string('group', 50)->default('general')->comment('INTERNAL — kelompok pengaturan');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete()->comment('INTERNAL');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
