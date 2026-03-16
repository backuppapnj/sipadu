<?php

/**
 * Migrasi: Tabel hari libur untuk kalkulasi SLA.
 *
 * Klasifikasi Data SPBE:
 * - Seluruh kolom: PUBLIK (informasi hari libur bersifat umum)
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique()->comment('PUBLIK — tanggal libur');
            $table->string('name')->comment('PUBLIK — nama hari libur');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};
