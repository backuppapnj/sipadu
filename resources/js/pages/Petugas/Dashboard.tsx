import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { StatsCard } from '@/components/sipadu/StatsCard';
import { DataTable, type Column } from '@/components/sipadu/DataTable';
import { StatusBadge } from '@/components/sipadu/StatusBadge';
import { SlaIndicator } from '@/components/sipadu/SlaIndicator';
import { FlashAlert } from '@/components/sipadu/FlashAlert';
import { formatDate, PRIORITY_LABELS } from '@/lib/sipadu-utils';
import { ClipboardListIcon, ClockIcon, AlertTriangleIcon } from 'lucide-react';
import type { Complaint, PaginationLink, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Petugas', href: '/petugas/dashboard' },
];

interface PetugasDashboardProps {
    complaints: Complaint[];
    paginationLinks?: PaginationLink[];
    stats: {
        total_assigned: number;
        in_progress: number;
        overdue: number;
    };
}

/**
 * Dashboard petugas layanan — pengaduan yang ditugaskan kepadanya.
 */
export default function PetugasDashboard({ complaints = [], paginationLinks, stats }: PetugasDashboardProps) {
    const columns: Column<Complaint & Record<string, unknown>>[] = [
        {
            key: 'ticket_no',
            label: 'No. Tiket',
            sortable: true,
            render: (c) => <span className="font-mono text-sm font-medium text-primary">{c.ticket_no}</span>,
        },
        {
            key: 'title',
            label: 'Judul',
            sortable: true,
            render: (c) => <span className="line-clamp-1">{c.title}</span>,
        },
        {
            key: 'category_name',
            label: 'Kategori',
            render: (c) => c.category?.name ?? '-',
            hiddenOnMobile: true,
        },
        {
            key: 'status',
            label: 'Status',
            render: (c) => <StatusBadge status={c.status} />,
        },
        {
            key: 'sla_deadline',
            label: 'Batas SLA',
            sortable: true,
            render: (c) => (
                <SlaIndicator
                    createdAt={c.created_at}
                    deadline={c.sla_deadline}
                    resolved={c.status === 'resolved'}
                    compact
                />
            ),
        },
        {
            key: 'priority',
            label: 'Prioritas',
            render: (c) => PRIORITY_LABELS[c.priority] ?? c.priority,
            hiddenOnMobile: true,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Petugas" />
            <div className="flex flex-col gap-6 p-4">
                <FlashAlert />

                <h1 className="text-2xl font-bold">Dashboard Petugas</h1>

                {/* Kartu statistik */}
                <div className="grid gap-4 md:grid-cols-3">
                    <StatsCard
                        title="Total Ditugaskan"
                        value={stats?.total_assigned ?? 0}
                        icon={ClipboardListIcon}
                    />
                    <StatsCard
                        title="Sedang Diproses"
                        value={stats?.in_progress ?? 0}
                        icon={ClockIcon}
                    />
                    <StatsCard
                        title="Terlambat"
                        value={stats?.overdue ?? 0}
                        icon={AlertTriangleIcon}
                        iconClassName="bg-red-100 dark:bg-red-900"
                    />
                </div>

                {/* Tabel pengaduan */}
                <DataTable
                    columns={columns}
                    data={complaints as (Complaint & Record<string, unknown>)[]}
                    paginationLinks={paginationLinks}
                    keyExtractor={(c) => c.id}
                    emptyMessage="Belum ada pengaduan yang ditugaskan."
                    searchPlaceholder="Cari pengaduan..."
                    onRowClick={(c) => router.visit(`/petugas/pengaduan/${c.id}`)}
                />
            </div>
        </AppLayout>
    );
}
