import { usePage } from '@inertiajs/react';
import type { SharedPageProps } from '@/types';

/**
 * Hook untuk memeriksa permission dan role pengguna saat ini.
 */
export function usePermission() {
    const { auth } = usePage<SharedPageProps>().props;

    return {
        /** Memeriksa apakah pengguna memiliki permission tertentu */
        can: (permission: string): boolean =>
            auth.user?.permissions?.includes(permission) ?? false,

        /** Memeriksa apakah pengguna memiliki role tertentu */
        hasRole: (role: string): boolean =>
            auth.user?.roles?.includes(role) ?? false,

        /** Mendapatkan data pengguna saat ini */
        user: auth.user,

        /** Memeriksa apakah pengguna sudah login */
        isAuthenticated: auth.user !== null,
    };
}
