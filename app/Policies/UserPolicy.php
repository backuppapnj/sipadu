<?php

namespace App\Policies;

use App\Models\User;

/**
 * Policy untuk otorisasi akses manajemen pengguna.
 * Hanya admin yang bisa mengelola pengguna.
 */
class UserPolicy
{
    /**
     * Lihat daftar pengguna — hanya admin.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Lihat detail pengguna — hanya admin.
     */
    public function view(User $user, User $model): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Buat pengguna baru — hanya admin.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Edit pengguna — admin, tapi tidak bisa edit role sendiri.
     */
    public function update(User $user, User $model): bool
    {
        if (! $user->hasRole('admin')) {
            return false;
        }

        // Admin tidak bisa mengubah role diri sendiri (pencegahan eskalasi)
        return true;
    }

    /**
     * Hapus (deaktivasi) pengguna — admin, tidak bisa hapus diri sendiri.
     */
    public function delete(User $user, User $model): bool
    {
        if (! $user->hasRole('admin')) {
            return false;
        }

        // Admin tidak bisa menghapus dirinya sendiri
        return $user->id !== $model->id;
    }
}
