import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { DataTable, type Column } from '@/components/sipadu/DataTable';
import { FlashAlert } from '@/components/sipadu/FlashAlert';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, formatDateTime } from '@/lib/sipadu-utils';
import type { ComplaintStatus, PaginationLink, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Pengaduan', href: '/admin/complaints' },
];

interface ComplaintRow {
    id: number;
    ticket_no: string;
    title: string;
    category: string;
    complainant_name: string;
    status: ComplaintStatus;
    status_label: string;
    status_color: string;
    priority: string;
    priority_label: string;
    assigned_to_name: string | null;
    sla_deadline: string;
    is_overdue: boolean;
    created_at: string;
}

interface ComplaintsIndexProps {
    complaints: ComplaintRow[];
    paginationLinks?: PaginationLink[];
    filters: {
        status?: string;
        category_id?: string;
        search?: string;
    };
    statuses: Array<{ value: string; label: string }>;
}

export default function ComplaintsIndex({ complaints = [], paginationLinks }: ComplaintsIndexProps) {
    const columns: Column<ComplaintRow & Record<string, unknown>>[] = [
        { key: 'ticket_no', label: 'No. Tiket', sortable: true },
        { key: 'title', label: 'Judul', sortable: true },
        { key: 'category', label: 'Kategori', hiddenOnMobile: true },
        { key: 'complainant_name', label: 'Pelapor', hiddenOnMobile: true },
        {
            key: 'status',
            label: 'Status',
            render: (c) => (
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[c.status as ComplaintStatus] ?? ''}`}>
                    {STATUS_LABELS[c.status as ComplaintStatus] ?? c.status_label}
                </span>
            ),
        },
        {
            key: 'priority',
            label: 'Prioritas',
            render: (c) => (
                <Badge variant="outline">
                    {PRIORITY_LABELS[c.priority as string] ?? c.priority_label}
                </Badge>
            ),
            hiddenOnMobile: true,
        },
        {
            key: 'assigned_to_name',
            label: 'Petugas',
            render: (c) => (c.assigned_to_name as string) ?? '-',
            hiddenOnMobile: true,
        },
        {
            key: 'sla_deadline',
            label: 'Batas SLA',
            render: (c) => (
                <span className={c.is_overdue ? 'text-destructive font-semibold' : ''}>
                    {c.sla_deadline as string}
                    {c.is_overdue && ' (Terlambat)'}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Tanggal',
            sortable: true,
            render: (c) => formatDateTime(c.created_at as string),
            hiddenOnMobile: true,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Pengaduan" />
            <div className="flex flex-col gap-6 p-4">
                <FlashAlert />

                <h1 className="text-2xl font-bold">Kelola Pengaduan</h1>

                <DataTable
                    columns={columns}
                    data={complaints as (ComplaintRow & Record<string, unknown>)[]}
                    paginationLinks={paginationLinks}
                    keyExtractor={(c) => c.id as number}
                    emptyMessage="Belum ada pengaduan."
                    searchPlaceholder="Cari tiket, judul, atau pelapor..."
                    onRowClick={(c) => router.visit(`/admin/complaints/${c.id}`)}
                />
            </div>
        </AppLayout>
    );
}
