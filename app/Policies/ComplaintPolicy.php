<?php

namespace App\Policies;

use App\Models\Complaint;
use App\Models\User;

/**
 * Policy untuk otorisasi akses terhadap pengaduan.
 *
 * Mengimplementasikan RBAC sesuai Perpres 95/2018 dan
 * perlindungan identitas pelapor sesuai PERMA 9/2016.
 */
class ComplaintPolicy
{
    /**
     * Lihat daftar pengaduan.
     * - admin, panitera: semua pengaduan
     * - petugas_layanan: pengaduan yang ditugaskan
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'panitera', 'petugas_layanan']);
    }

    /**
     * Lihat detail pengaduan tertentu.
     */
    public function view(User $user, Complaint $complaint): bool
    {
        // Admin dan panitera bisa lihat semua
        if ($user->hasAnyRole(['admin', 'panitera'])) {
            return true;
        }

        // Petugas hanya bisa lihat yang ditugaskan
        if ($user->hasRole('petugas_layanan')) {
            return $complaint->assigned_to === $user->id;
        }

        return false;
    }

    /**
     * Buat pengaduan baru.
     * Semua pengguna terautentikasi bisa membuat pengaduan.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Perbarui pengaduan (status, dll).
     */
    public function update(User $user, Complaint $complaint): bool
    {
        // Admin dan panitera bisa update semua
        if ($user->hasAnyRole(['admin', 'panitera'])) {
            return true;
        }

        // Petugas hanya bisa update yang ditugaskan
        if ($user->hasRole('petugas_layanan')) {
            return $complaint->assigned_to === $user->id;
        }

        return false;
    }

    /**
     * Hapus pengaduan (soft delete).
     * Hanya admin yang boleh menghapus.
     */
    public function delete(User $user, Complaint $complaint): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Tugaskan pengaduan ke petugas.
     */
    public function assign(User $user, Complaint $complaint): bool
    {
        return $user->hasAnyRole(['admin', 'panitera']);
    }

    /**
     * Berikan tanggapan terhadap pengaduan.
     */
    public function respond(User $user, Complaint $complaint): bool
    {
        // Admin dan panitera bisa merespons semua
        if ($user->hasAnyRole(['admin', 'panitera'])) {
            return true;
        }

        // Petugas hanya bisa merespons yang ditugaskan
        if ($user->hasRole('petugas_layanan')) {
            return $complaint->assigned_to === $user->id;
        }

        return false;
    }

    /**
     * Lihat pengaduan rahasia.
     * Hanya admin dan panitera yang bisa melihat pengaduan rahasia,
     * sesuai PERMA 9/2016 tentang perlindungan identitas pelapor.
     */
    public function viewConfidential(User $user, Complaint $complaint): bool
    {
        if (! $complaint->is_confidential) {
            return true;
        }

        // Admin dan panitera selalu bisa lihat
        if ($user->hasAnyRole(['admin', 'panitera'])) {
            return true;
        }

        // Petugas hanya jika ditugaskan
        if ($user->hasRole('petugas_layanan') && $complaint->assigned_to === $user->id) {
            return true;
        }

        return false;
    }
}
