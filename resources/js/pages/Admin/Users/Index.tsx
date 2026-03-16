import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { DataTable, type Column } from '@/components/sipadu/DataTable';
import { FlashAlert } from '@/components/sipadu/FlashAlert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/sipadu-utils';
import { PlusIcon } from 'lucide-react';
import type { User, PaginationLink, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Pengguna', href: '/admin/users' },
];

/** Label role dalam Bahasa Indonesia */
const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    panitera: 'Panitera',
    petugas_layanan: 'Petugas Layanan',
};

interface UsersIndexProps {
    users: User[];
    paginationLinks?: PaginationLink[];
}

export default function UsersIndex({ users = [], paginationLinks }: UsersIndexProps) {
    const columns: Column<User & Record<string, unknown>>[] = [
        {
            key: 'name',
            label: 'Nama',
            sortable: true,
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            hiddenOnMobile: true,
        },
        {
            key: 'roles',
            label: 'Role',
            render: (u) => (
                <div className="flex flex-wrap gap-1">
                    {u.roles?.map((role: string) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                            {ROLE_LABELS[role] ?? role}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (u) => (
                <Badge variant={u.is_active ? 'default' : 'destructive'}>
                    {u.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            label: 'Terdaftar',
            sortable: true,
            render: (u) => formatDate(u.created_at),
            hiddenOnMobile: true,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Pengguna" />
            <div className="flex flex-col gap-6 p-4">
                <FlashAlert />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
                    <Button asChild>
                        <Link href="/admin/users/create">
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Tambah Pengguna
                        </Link>
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={users as (User & Record<string, unknown>)[]}
                    paginationLinks={paginationLinks}
                    keyExtractor={(u) => u.id}
                    emptyMessage="Belum ada pengguna."
                    searchPlaceholder="Cari pengguna..."
                    onRowClick={(u) => router.visit(`/admin/users/${u.id}/edit`)}
                />
            </div>
        </AppLayout>
    );
}
