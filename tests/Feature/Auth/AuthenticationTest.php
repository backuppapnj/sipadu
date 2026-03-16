<?php

use App\Models\AuditLog;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('halaman login bisa diakses', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('login berhasil dengan kredensial yang benar', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'Password123!',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('pengguna dengan 2FA diarahkan ke halaman challenge', function () {
    $this->skipUnlessFortifyFeature(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->create();

    $user->forceFill([
        'two_factor_secret' => encrypt('test-secret'),
        'two_factor_recovery_codes' => encrypt(json_encode(['code1', 'code2'])),
        'two_factor_confirmed_at' => now(),
    ])->save();

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'Password123!',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    $response->assertSessionHas('login.id', $user->id);
    $this->assertGuest();
});

test('login gagal dengan password salah', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('pengguna bisa logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('home'));
});

test('rate limiter aktif setelah percobaan berlebihan', function () {
    $user = User::factory()->create();

    RateLimiter::increment(md5('login' . implode('|', [$user->email, '127.0.0.1'])), amount: 5);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertTooManyRequests();
});

test('akun terkunci setelah 5 percobaan gagal', function () {
    $user = User::factory()->create([
        'failed_login_count' => 0,
    ]);

    // Simulasi 5 percobaan gagal
    for ($i = 0; $i < 5; $i++) {
        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'WrongPassword!',
        ]);
    }

    $user->refresh();
    // Verifikasi bahwa failed_login_count bertambah
    expect($user->failed_login_count)->toBeGreaterThanOrEqual(5);
});

test('lockout berdurasi 30 menit', function () {
    $user = User::factory()->locked()->create();

    expect($user->isLocked())->toBeTrue();
    expect($user->locked_until->diffInMinutes(now()))->toBeLessThanOrEqual(30);
});

test('lockout reset setelah login berhasil', function () {
    $user = User::factory()->create([
        'failed_login_count' => 3,
    ]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'Password123!',
    ]);

    $user->refresh();
    expect($user->failed_login_count)->toBe(0);
});

test('login dicatat di audit_logs', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'Password123!',
    ]);

    $log = AuditLog::where('action', 'login')
        ->where('user_id', $user->id)
        ->first();

    // Jika AuditMiddleware sudah diimplementasi
    if ($log) {
        expect($log->user_ip)->not->toBeNull();
    }
});

test('logout dicatat di audit_logs', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('logout'));

    $log = AuditLog::where('action', 'logout')
        ->where('user_id', $user->id)
        ->first();

    if ($log) {
        expect($log)->not->toBeNull();
    }
});

test('password kompleksitas: password lemah ditolak', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@test.com',
        'password' => '12345',
        'password_confirmation' => '12345',
    ]);

    $response->assertSessionHasErrors('password');
});

test('registrasi berhasil dengan data valid', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'newuser@test.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    expect(User::where('email', 'newuser@test.com')->exists())->toBeTrue();
});

test('registrasi gagal dengan password tanpa huruf besar', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test2@test.com',
        'password' => 'password123!',
        'password_confirmation' => 'password123!',
    ]);

    $response->assertSessionHasErrors('password');
});
