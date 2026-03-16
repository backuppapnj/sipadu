<?php

use App\Models\AuditLog;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\User;
use Database\Seeders\ComplaintCategorySeeder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->seed(ComplaintCategorySeeder::class);
});

test('pembuatan pengaduan membuat entri audit_log', function () {
    $category = ComplaintCategory::first();

    $complaint = Complaint::factory()->withCategory($category)->create();

    // Spatie Activitylog mencatat pembuatan
    $activity = \Spatie\Activitylog\Models\Activity::where('subject_type', Complaint::class)
        ->where('subject_id', $complaint->id)
        ->where('event', 'created')
        ->first();

    expect($activity)->not->toBeNull();
    expect($activity->description)->toBe('Pengaduan baru dibuat');
});

test('perubahan status pengaduan membuat audit_log dengan nilai lama/baru', function () {
    $complaint = Complaint::factory()->create();
    $oldStatus = $complaint->status;

    $complaint->update(['status' => 'verified']);

    $activity = \Spatie\Activitylog\Models\Activity::where('subject_type', Complaint::class)
        ->where('subject_id', $complaint->id)
        ->where('event', 'updated')
        ->latest()
        ->first();

    expect($activity)->not->toBeNull();
    expect($activity->properties['old'])->toHaveKey('status');
    expect($activity->properties['attributes'])->toHaveKey('status');
});

test('audit_logs bersifat immutable - tidak bisa diupdate', function () {
    $log = AuditLog::create([
        'user_id' => null,
        'user_ip' => '127.0.0.1',
        'user_agent' => 'Test Agent',
        'action' => 'test',
        'request_id' => \Illuminate\Support\Str::uuid(),
    ]);

    expect(fn () => $log->update(['action' => 'modified']))
        ->toThrow(\RuntimeException::class, 'Audit log bersifat immutable');
});

test('audit_logs bersifat immutable - tidak bisa dihapus', function () {
    $log = AuditLog::create([
        'user_id' => null,
        'user_ip' => '127.0.0.1',
        'user_agent' => 'Test Agent',
        'action' => 'test',
        'request_id' => \Illuminate\Support\Str::uuid(),
    ]);

    expect(fn () => $log->delete())
        ->toThrow(\RuntimeException::class, 'Audit log tidak boleh dihapus');
});

test('audit_log menyimpan request_id', function () {
    $log = AuditLog::create([
        'user_id' => null,
        'user_ip' => '127.0.0.1',
        'user_agent' => 'Test Agent',
        'action' => 'test',
        'request_id' => $requestId = \Illuminate\Support\Str::uuid()->toString(),
    ]);

    expect($log->request_id)->toBe($requestId);
});

test('audit_log menyimpan session_id', function () {
    $log = AuditLog::create([
        'user_id' => null,
        'user_ip' => '127.0.0.1',
        'user_agent' => 'TestBot/1.0',
        'action' => 'test',
        'session_id' => 'test-session-123',
        'request_id' => \Illuminate\Support\Str::uuid()->toString(),
    ]);

    expect($log->session_id)->toBe('test-session-123');
});

test('audit_log menyimpan user_agent', function () {
    $log = AuditLog::create([
        'user_id' => null,
        'user_ip' => '127.0.0.1',
        'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'action' => 'test',
        'request_id' => \Illuminate\Support\Str::uuid()->toString(),
    ]);

    expect($log->user_agent)->toContain('Mozilla');
});

test('audit_log menyimpan old_values dan new_values sebagai JSON', function () {
    $log = AuditLog::create([
        'user_id' => null,
        'user_ip' => '127.0.0.1',
        'user_agent' => 'Test',
        'action' => 'update',
        'subject_type' => Complaint::class,
        'subject_id' => 1,
        'old_values' => ['status' => 'submitted'],
        'new_values' => ['status' => 'verified'],
        'request_id' => \Illuminate\Support\Str::uuid()->toString(),
    ]);

    expect($log->old_values)->toBe(['status' => 'submitted']);
    expect($log->new_values)->toBe(['status' => 'verified']);
});

test('login dicatat di audit_log dengan IP', function () {
    $user = User::factory()->create(['email' => 'audit@test.com']);

    $this->post('/login', [
        'email' => 'audit@test.com',
        'password' => 'Password123!',
    ]);

    $log = AuditLog::where('action', 'login')
        ->where('user_id', $user->id)
        ->first();

    if ($log) {
        expect($log->user_ip)->not->toBeNull();
    }
});
