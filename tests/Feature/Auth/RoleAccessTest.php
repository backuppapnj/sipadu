<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->admin = User::factory()->admin()->create();
    $this->admin->assignRole('admin');

    $this->panitera = User::factory()->panitera()->create();
    $this->panitera->assignRole('panitera');

    $this->petugas = User::factory()->petugas()->create();
    $this->petugas->assignRole('petugas_layanan');

    $this->masyarakat = User::factory()->masyarakat()->create();
    $this->masyarakat->assignRole('masyarakat');
});

// === Akses Guest (tidak login) ===

test('guest bisa mengakses halaman utama', function () {
    $this->get('/')->assertStatus(200);
});

test('guest bisa mengakses form pengaduan', function () {
    $this->get('/pengaduan/buat')->assertStatus(200);
});

test('guest bisa mengakses halaman cek pengaduan', function () {
    $this->get('/pengaduan/cek')->assertStatus(200);
});

test('guest tidak bisa mengakses dashboard', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('guest tidak bisa mengakses admin area', function () {
    $this->get('/admin/dashboard')->assertRedirect('/login');
});

test('guest tidak bisa mengakses petugas area', function () {
    $this->get('/petugas/dashboard')->assertRedirect('/login');
});

test('guest tidak bisa mengakses panitera area', function () {
    $this->get('/panitera/dashboard')->assertRedirect('/login');
});

// === Akses Admin ===

test('admin bisa mengakses admin dashboard', function () {
    $this->actingAs($this->admin)
        ->get('/admin/dashboard')
        ->assertStatus(200);
});

test('admin bisa mengakses manajemen pengguna', function () {
    $this->actingAs($this->admin)
        ->get('/admin/users')
        ->assertStatus(200);
});

// === Akses Panitera ===

test('panitera bisa mengakses panitera dashboard', function () {
    $this->actingAs($this->panitera)
        ->get('/panitera/dashboard')
        ->assertStatus(200);
});

test('panitera bisa assign pengaduan', function () {
    expect($this->panitera->can('complaints.assign'))->toBeTrue();
});

// === Akses Petugas ===

test('petugas bisa mengakses petugas dashboard', function () {
    $this->actingAs($this->petugas)
        ->get('/petugas/dashboard')
        ->assertStatus(200);
});

test('petugas tidak bisa mengakses admin users', function () {
    $this->actingAs($this->petugas)
        ->get('/admin/users')
        ->assertStatus(403);
});

test('petugas tidak bisa assign pengaduan', function () {
    expect($this->petugas->can('complaints.assign'))->toBeFalse();
});

// === Akses Masyarakat ===

test('masyarakat bisa mengakses dashboard', function () {
    $this->actingAs($this->masyarakat)
        ->get('/dashboard')
        ->assertStatus(200);
});

test('masyarakat tidak bisa mengakses admin area', function () {
    $this->actingAs($this->masyarakat)
        ->get('/admin/dashboard')
        ->assertStatus(403);
});

test('masyarakat tidak bisa mengakses petugas area', function () {
    $this->actingAs($this->masyarakat)
        ->get('/petugas/dashboard')
        ->assertStatus(403);
});

test('masyarakat tidak bisa mengakses panitera area', function () {
    $this->actingAs($this->masyarakat)
        ->get('/panitera/dashboard')
        ->assertStatus(403);
});

test('masyarakat tidak bisa assign pengaduan', function () {
    expect($this->masyarakat->can('complaints.assign'))->toBeFalse();
});

// === Verifikasi Permission sesuai RolePermissionSeeder ===

test('admin memiliki semua permission', function () {
    expect($this->admin->can('complaints.create'))->toBeTrue();
    expect($this->admin->can('complaints.view.all'))->toBeTrue();
    expect($this->admin->can('complaints.assign'))->toBeTrue();
    expect($this->admin->can('complaints.update.status'))->toBeTrue();
    expect($this->admin->can('users.view'))->toBeTrue();
    expect($this->admin->can('users.create'))->toBeTrue();
    expect($this->admin->can('users.edit'))->toBeTrue();
    expect($this->admin->can('users.delete'))->toBeTrue();
    expect($this->admin->can('settings.manage'))->toBeTrue();
    expect($this->admin->can('audit_log.view'))->toBeTrue();
    expect($this->admin->can('reports.view'))->toBeTrue();
    expect($this->admin->can('categories.manage'))->toBeTrue();
    expect($this->admin->can('holidays.manage'))->toBeTrue();
});

test('panitera memiliki permission yang sesuai', function () {
    expect($this->panitera->can('complaints.view.all'))->toBeTrue();
    expect($this->panitera->can('complaints.assign'))->toBeTrue();
    expect($this->panitera->can('complaints.update.status'))->toBeTrue();
    expect($this->panitera->can('complaints.respond'))->toBeTrue();
    expect($this->panitera->can('reports.view'))->toBeTrue();
    expect($this->panitera->can('audit_log.view'))->toBeTrue();
    // Panitera TIDAK bisa manage users
    expect($this->panitera->can('users.create'))->toBeFalse();
    expect($this->panitera->can('settings.manage'))->toBeFalse();
});

test('petugas hanya bisa view own, update status, dan respond', function () {
    expect($this->petugas->can('complaints.view.own'))->toBeTrue();
    expect($this->petugas->can('complaints.update.status'))->toBeTrue();
    expect($this->petugas->can('complaints.respond'))->toBeTrue();
    // Petugas TIDAK bisa assign atau manage users
    expect($this->petugas->can('complaints.assign'))->toBeFalse();
    expect($this->petugas->can('users.view'))->toBeFalse();
    expect($this->petugas->can('settings.manage'))->toBeFalse();
});

test('masyarakat hanya bisa create dan view own', function () {
    expect($this->masyarakat->can('complaints.create'))->toBeTrue();
    expect($this->masyarakat->can('complaints.view.own'))->toBeTrue();
    // Masyarakat TIDAK bisa assign, respond, atau manage
    expect($this->masyarakat->can('complaints.assign'))->toBeFalse();
    expect($this->masyarakat->can('complaints.respond'))->toBeFalse();
    expect($this->masyarakat->can('users.view'))->toBeFalse();
    expect($this->masyarakat->can('settings.manage'))->toBeFalse();
});
