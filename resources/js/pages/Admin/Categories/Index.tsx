import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { DataTable, type Column } from '@/components/sipadu/DataTable';
import { FlashAlert } from '@/components/sipadu/FlashAlert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import type { ComplaintCategory, PaginationLink, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Kategori', href: '/admin/categories' },
];

interface CategoriesIndexProps {
    categories: ComplaintCategory[];
    paginationLinks?: PaginationLink[];
}

export default function CategoriesIndex({ categories = [], paginationLinks }: CategoriesIndexProps) {
    const columns: Column<ComplaintCategory & Record<string, unknown>>[] = [
        { key: 'code', label: 'Kode', sortable: true },
        { key: 'name', label: 'Nama Kategori', sortable: true },
        {
            key: 'sla_days',
            label: 'SLA (Hari Kerja)',
            sortable: true,
            render: (c) => `${c.sla_days} hari`,
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (c) => (
                <Badge variant={c.is_active ? 'default' : 'destructive'}>
                    {c.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Kategori" />
            <div className="flex flex-col gap-6 p-4">
                <FlashAlert />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Kelola Kategori Pengaduan</h1>
                    <Button asChild>
                        <Link href="/admin/categories/create">
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Tambah Kategori
                        </Link>
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={categories as (ComplaintCategory & Record<string, unknown>)[]}
                    paginationLinks={paginationLinks}
                    keyExtractor={(c) => c.id}
                    emptyMessage="Belum ada kategori."
                    searchPlaceholder="Cari kategori..."
                    onRowClick={(c) => router.visit(`/admin/categories/${c.id}/edit`)}
                />
            </div>
        </AppLayout>
    );
}
