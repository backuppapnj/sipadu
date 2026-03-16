import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { StatsCard } from '@/components/sipadu/StatsCard';
import { ComplaintCard } from '@/components/sipadu/ComplaintCard';
import { FlashAlert } from '@/components/sipadu/FlashAlert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileTextIcon,
    ClockIcon,
    AlertTriangleIcon,
    CheckCircleIcon,
    PercentIcon,
    UsersIcon,
    TagsIcon,
    SettingsIcon,
} from 'lucide-react';
import type { Complaint, DashboardStats, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
];

interface AdminDashboardProps {
    stats: DashboardStats;
    recentComplaints: Complaint[];
}

/**
 * Dashboard admin — statistik lengkap dan aksi cepat.
 */
export default function AdminDashboard({ stats, recentComplaints = [] }: AdminDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <FlashAlert />

                <h1 className="text-2xl font-bold">Dashboard Admin</h1>

                {/* Statistik utama */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                    <StatsCard title="Total Pengaduan" value={stats?.total ?? 0} icon={FileTextIcon} />
                    <StatsCard title="Menunggu" value={stats?.pending ?? 0} icon={ClockIcon} />
                    <StatsCard title="Diproses" value={stats?.in_progress ?? 0} icon={ClockIcon} />
                    <StatsCard title="Selesai" value={stats?.resolved ?? 0} icon={CheckCircleIcon} iconClassName="bg-green-100 dark:bg-green-900" />
                    <StatsCard title="Terlambat" value={stats?.overdue ?? 0} icon={AlertTriangleIcon} iconClassName="bg-red-100 dark:bg-red-900" />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Kepatuhan SLA & rata-rata */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Kinerja</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Kepatuhan SLA</span>
                                <span className="text-lg font-bold">{stats?.sla_compliance ?? 0}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted">
                                <div
                                    className="h-2 rounded-full bg-primary transition-all"
                                    style={{ width: `${Math.min(stats?.sla_compliance ?? 0, 100)}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Rata-rata Penyelesaian</span>
                                <span className="text-lg font-bold">{stats?.avg_resolution_days ?? 0} hari</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pengaduan per kategori */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Pengaduan per Kategori</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats?.by_category && stats.by_category.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.by_category.map((item) => (
                                        <div key={item.category} className="flex items-center gap-3">
                                            <span className="text-sm min-w-[160px] truncate">{item.category}</span>
                                            <div className="flex-1 h-3 rounded-full bg-muted">
                                                <div
                                                    className="h-3 rounded-full bg-primary transition-all"
                                                    style={{
                                                        width: `${Math.min(
                                                            (item.count / Math.max(stats.total, 1)) * 100,
                                                            100,
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Belum ada data.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Aksi cepat */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                        <Link href="/admin/users">
                            <UsersIcon className="h-6 w-6" />
                            <span>Kelola Pengguna</span>
                        </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                        <Link href="/admin/categories">
                            <TagsIcon className="h-6 w-6" />
                            <span>Kelola Kategori</span>
                        </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                        <Link href="/admin/settings">
                            <SettingsIcon className="h-6 w-6" />
                            <span>Pengaturan Sistem</span>
                        </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                        <Link href="/admin/audit-log">
                            <FileTextIcon className="h-6 w-6" />
                            <span>Audit Log</span>
                        </Link>
                    </Button>
                </div>

                {/* Pengaduan terbaru */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Pengaduan Terbaru</h2>
                    {recentComplaints.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {recentComplaints.map((complaint) => (
                                <ComplaintCard
                                    key={complaint.id}
                                    complaint={complaint}
                                    href={`/admin/pengaduan/${complaint.id}`}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Belum ada pengaduan.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
