<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Panitera;
use App\Http\Controllers\Petugas;
use App\Http\Controllers\Public\ComplaintFormController;
use App\Http\Controllers\Public\TrackComplaintController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Route Publik (Tidak Memerlukan Login)
|--------------------------------------------------------------------------
*/

Route::inertia('/', 'Welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Form pengaduan publik
Route::get('/pengaduan/buat', [ComplaintFormController::class, 'create'])->name('pengaduan.buat');
Route::post('/pengaduan/buat', [ComplaintFormController::class, 'store'])->name('pengaduan.store');

// Cek status pengaduan publik
Route::get('/pengaduan/cek', [TrackComplaintController::class, 'show'])->name('pengaduan.cek');

/*
|--------------------------------------------------------------------------
| Route Terautentikasi
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'password.expiry'])->group(function () {

    /*
    |----------------------------------------------------------------------
    | Dashboard Default — redirect ke dashboard sesuai role
    |----------------------------------------------------------------------
    */
    Route::get('/dashboard', fn () => redirect('/admin/dashboard'))
        ->name('dashboard');

    /*
    |----------------------------------------------------------------------
    | Dashboard Petugas
    |----------------------------------------------------------------------
    */
    Route::middleware('role:petugas_layanan|admin|panitera')->prefix('petugas')->name('petugas.')->group(function () {
        Route::get('/dashboard', [Petugas\DashboardController::class, 'index'])
            ->name('dashboard');
    });

    /*
    |----------------------------------------------------------------------
    | Dashboard Panitera
    |----------------------------------------------------------------------
    */
    Route::middleware('role:panitera|admin')->prefix('panitera')->name('panitera.')->group(function () {
        Route::get('/dashboard', [Panitera\DashboardController::class, 'index'])
            ->name('dashboard');
    });

    /*
    |----------------------------------------------------------------------
    | Admin Routes
    |----------------------------------------------------------------------
    */
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [Admin\DashboardController::class, 'index'])
            ->name('dashboard');

        // Manajemen Pengguna
        Route::resource('users', Admin\UserController::class)->except(['show']);

        // Manajemen Kategori Pengaduan
        Route::resource('categories', Admin\CategoryController::class)->except(['show']);

        // Audit Log (read-only — SPBE)
        Route::get('/audit-logs', [Admin\AuditLogController::class, 'index'])
            ->name('audit-logs.index');

        // Pengaturan Sistem
        Route::get('/settings', [Admin\SettingsController::class, 'index'])
            ->name('settings.index');
        Route::put('/settings', [Admin\SettingsController::class, 'update'])
            ->name('settings.update');

        // Manajemen Pengaduan (Admin)
        Route::get('/complaints', [Admin\ComplaintController::class, 'index'])
            ->name('complaints.index');
        Route::get('/complaints/{complaint}', [Admin\ComplaintController::class, 'show'])
            ->name('complaints.show');
        Route::patch('/complaints/{complaint}/assign', [Admin\ComplaintController::class, 'assign'])
            ->name('complaints.assign');
        Route::patch('/complaints/{complaint}/status', [Admin\ComplaintController::class, 'updateStatus'])
            ->name('complaints.update-status');
        Route::post('/complaints/{complaint}/disposisi', [Admin\ComplaintController::class, 'disposisi'])
            ->name('complaints.disposisi');
    });

    /*
    |----------------------------------------------------------------------
    | Route Panitera untuk Manajemen Pengaduan
    |----------------------------------------------------------------------
    */
    Route::middleware('role:panitera|admin')->prefix('panitera')->name('panitera.')->group(function () {
        Route::patch('/complaints/{complaint}/assign', [Admin\ComplaintController::class, 'assign'])
            ->name('complaints.assign');
        Route::patch('/complaints/{complaint}/status', [Admin\ComplaintController::class, 'updateStatus'])
            ->name('complaints.update-status');
        Route::post('/complaints/{complaint}/disposisi', [Admin\ComplaintController::class, 'disposisi'])
            ->name('complaints.disposisi');
    });

    /*
    |----------------------------------------------------------------------
    | Route Petugas untuk Update Status
    |----------------------------------------------------------------------
    */
    Route::middleware('role:petugas_layanan|admin|panitera')->prefix('petugas')->name('petugas.')->group(function () {
        Route::patch('/complaints/{complaint}/status', [Admin\ComplaintController::class, 'updateStatus'])
            ->name('complaints.update-status');
    });
});

require __DIR__.'/settings.php';
