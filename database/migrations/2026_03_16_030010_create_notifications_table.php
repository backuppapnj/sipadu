<?php

/**
 * Migrasi: Tabel notifikasi kustom SIPADU.
 *
 * Klasifikasi Data SPBE:
 * - subject, message: INTERNAL
 * - channel: INTERNAL (email/whatsapp)
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('notifiable_type')->comment('INTERNAL — tipe model penerima');
            $table->unsignedBigInteger('notifiable_id')->comment('INTERNAL — ID penerima');
            $table->string('channel', 20)->comment('INTERNAL — email/sms/whatsapp');
            $table->string('subject')->comment('INTERNAL');
            $table->text('message')->comment('INTERNAL');
            $table->timestamp('sent_at')->nullable()->comment('INTERNAL');
            $table->timestamp('read_at')->nullable()->comment('INTERNAL');
            $table->timestamps();

            $table->index(['notifiable_type', 'notifiable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
