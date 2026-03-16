<?php

/**
 * Migrasi: Modifikasi tabel users untuk SIPADU.
 *
 * Klasifikasi Data SPBE:
 * - nik: RAHASIA (encrypted) — UU PDP 27/2022
 * - name, email, phone, address: INTERNAL
 * - password: RAHASIA
 * - role, is_active, login metadata: INTERNAL
 * - deleted_at: Soft delete wajib SPBE (tidak boleh hard delete)
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('nik')->nullable()->after('id')->comment('RAHASIA — NIK terenkripsi (UU PDP 27/2022)');
            $table->string('phone', 20)->nullable()->after('email')->comment('INTERNAL');
            $table->text('address')->nullable()->after('phone')->comment('INTERNAL');
            $table->string('role', 50)->default('masyarakat')->after('password')->comment('INTERNAL');
            $table->boolean('is_active')->default(true)->after('role');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
            $table->integer('failed_login_count')->default(0)->after('last_login_ip');
            $table->timestamp('locked_until')->nullable()->after('failed_login_count');
            $table->softDeletes()->comment('Soft delete wajib SPBE — tidak boleh hard delete');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn([
                'nik', 'phone', 'address', 'role', 'is_active',
                'last_login_at', 'last_login_ip', 'failed_login_count', 'locked_until',
            ]);
        });
    }
};
