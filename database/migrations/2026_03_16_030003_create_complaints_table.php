<?php

/**
 * Migrasi: Tabel utama pengaduan.
 *
 * Klasifikasi Data SPBE:
 * - ticket_no: PUBLIK (digunakan untuk pelacakan)
 * - title, description, incident_location: INTERNAL
 * - reported_party: RAHASIA
 * - complainant_nik: RAHASIA (encrypted) — UU PDP 27/2022
 * - complainant_name, phone, email, address: INTERNAL/RAHASIA (tergantung is_confidential)
 * - status, priority, SLA: INTERNAL
 * - deleted_at: Soft delete wajib SPBE
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_no', 20)->unique()->comment('PUBLIK — nomor tiket pengaduan');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()->comment('INTERNAL — NULL untuk anonim');
            $table->foreignId('category_id')->constrained('complaint_categories')->comment('INTERNAL');
            $table->string('title')->comment('INTERNAL');
            $table->text('description')->comment('INTERNAL/RAHASIA');
            $table->string('reported_party')->nullable()->comment('RAHASIA');
            $table->date('incident_date')->comment('INTERNAL');
            $table->string('incident_location', 500)->nullable()->comment('INTERNAL');
            $table->string('status', 20)->default('submitted')->comment('INTERNAL — lihat ComplaintStatusEnum');
            $table->string('priority', 10)->default('normal')->comment('INTERNAL — lihat PriorityEnum');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete()->comment('INTERNAL');
            $table->date('sla_deadline')->comment('INTERNAL — tenggat waktu SLA');
            $table->timestamp('resolved_at')->nullable()->comment('INTERNAL');
            $table->boolean('is_anonymous')->default(false)->comment('INTERNAL');
            $table->boolean('is_confidential')->default(false)->comment('INTERNAL');
            $table->string('data_classification', 20)->default('internal')->comment('SPBE — klasifikasi data: public/internal/confidential');
            $table->string('complainant_name')->comment('INTERNAL');
            $table->text('complainant_nik')->comment('RAHASIA — NIK terenkripsi (UU PDP 27/2022)');
            $table->string('complainant_phone', 20)->comment('INTERNAL');
            $table->string('complainant_email')->nullable()->comment('INTERNAL');
            $table->text('complainant_address')->nullable()->comment('INTERNAL');
            $table->timestamps();
            $table->softDeletes()->comment('Soft delete wajib SPBE');

            $table->index('status');
            $table->index('priority');
            $table->index('sla_deadline');
            $table->index('assigned_to');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
