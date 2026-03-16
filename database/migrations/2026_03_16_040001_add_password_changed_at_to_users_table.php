<?php

/**
 * Migrasi: Menambahkan kolom password_changed_at ke tabel users.
 * Digunakan untuk fitur password expiry reminder (SPBE keamanan).
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('password_changed_at')
                ->nullable()
                ->after('locked_until')
                ->comment('INTERNAL — Tanggal terakhir password diubah, untuk reminder expiry 90 hari');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('password_changed_at');
        });
    }
};
