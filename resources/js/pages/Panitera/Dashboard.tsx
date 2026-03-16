import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { StatsCard } from '@/components/sipadu/StatsCard';
import { DataTable, type Column } from '@/components/sipadu/DataTable';
import { StatusBadge } from '@/components/sipadu/StatusBadge';
import { SlaIndicator } from '@/components/sipadu/SlaIndicator';
import { FlashAlert } from '@/components/sipadu/FlashAlert';
import { formatDate, PRIORITY_LABELS, STATUS_LABELS } from '@/lib/sipadu-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    FileTextIcon,
    ClockIcon,
    AlertTriangleIcon,
    CheckCircleIcon,
    PercentIcon,
} from 'lucide-react';
import type { Complaint, ComplaintStatus, PaginationLink, User, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Panitera', href: '/panitera/dashboard' },
];

interface PaniteraDashboardProps {
    complaints: Complaint[];
    paginationLinks?: PaginationLink[];
    petugasList: User[];
    stats: {
        total: number;
        by_status: { status: ComplaintStatus; count: number }[];
        sla_compliance: number;
        overdue: number;
    };
    filters?: {
        status?: string;
        category_id?: string;
        assigned_to?: string;
        date_from?: string;
        date_to?: string;
    };
}

/**
 * Dashboard panitera — semua pengaduan, filter, assignment, dan eskalasi.
 */
export default function PaniteraDashboard({
    complaints = [],
    paginationLinks,
    petugasList = [],
    stats,
    filters = {},
}: PaniteraDashboardProps) {
    const filterForm = useForm({
        status: filters.status ?? '',
        assigned_to: filters.assigned_to ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        filterForm.get('/panitera/dashboard', { preserveState: true });
    };

    const columns: Column<Complaint & Record<string, unknown>>[] = [
        {
            key: 'ticket_no',
            label: 'No. Tiket',
            sortable: true,
            render: (c) => (
                <span className={`font-mono text-sm font-medium ${
                    new Date(c.sla_deadline) < new Date() && c.status !== 'resolved'
                        ? 'text-red-600'
                        : 'text-primary'
                }`}>
                    {c.ticket_no}
                </span>
            ),
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
            label: 'SLA',
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
            key: 'assigned_name',
            label: 'Petugas',
            render: (c) => c.assigned_to?.name ?? '-',
            hiddenOnMobile: true,
        },
        {
            key: 'created_at',
            label: 'Tanggal',
            sortable: true,
            render: (c) => formatDate(c.created_at),
            hiddenOnMobile: true,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Panitera" />
            <div className="flex flex-col gap-6 p-4">
                <FlashAlert />

                <h1 className="text-2xl font-bold">Dashboard Panitera</h1>

                {/* Statistik */}
                <div className="grid gap-4 md:grid-cols-4">
                    <StatsCard
                        title="Total Pengaduan"
                        value={stats?.total ?? 0}
                        icon={FileTextIcon}
                    />
                    <StatsCard
                        title="Kepatuhan SLA"
                        value={`${stats?.sla_compliance ?? 0}%`}
                        icon={PercentIcon}
                    />
                    <StatsCard
                        title="Terlambat"
                        value={stats?.overdue ?? 0}
                        icon={AlertTriangleIcon}
                        iconClassName="bg-red-100 dark:bg-red-900"
                    />
                    <StatsCard
                        title="Selesai"
                        value={stats?.by_status?.find((s) => s.status === 'resolved')?.count ?? 0}
                        icon={CheckCircleIcon}
                        iconClassName="bg-green-100 dark:bg-green-900"
                    />
                </div>

                {/* Filter */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Filter Pengaduan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="grid gap-4 md:grid-cols-5">
                            <div className="space-y-1">
                                <Label className="text-xs">Status</Label>
                                <Select
                                    value={filterForm.data.status}
                                    onValueChange={(v) => filterForm.setData('status', v)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua</SelectItem>
                                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Petugas</Label>
                                <Select
                                    value={filterForm.data.assigned_to}
                                    onValueChange={(v) => filterForm.setData('assigned_to', v)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua</SelectItem>
                                        {petugasList.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Dari Tanggal</Label>
                                <Input
                                    type="date"
                                    value={filterForm.data.date_from}
                                    onChange={(e) => filterForm.setData('date_from', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Sampai Tanggal</Label>
                                <Input
                                    type="date"
                                    value={filterForm.data.date_to}
                                    onChange={(e) => filterForm.setData('date_to', e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="w-full" disabled={filterForm.processing}>
                                    Terapkan Filter
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Tabel */}
                <DataTable
                    columns={columns}
                    data={complaints as (Complaint & Record<string, unknown>)[]}
                    paginationLinks={paginationLinks}
                    keyExtractor={(c) => c.id}
                    emptyMessage="Tidak ada pengaduan yang sesuai filter."
                    searchPlaceholder="Cari pengaduan..."
                    onRowClick={(c) => router.visit(`/panitera/pengaduan/${c.id}`)}
                />
            </div>
        </AppLayout>
    );
}
