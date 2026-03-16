import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { AuditLogViewer } from '@/components/sipadu/AuditLogViewer';
import { FlashAlert } from '@/components/sipadu/FlashAlert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { AuditLog, PaginationLink, User, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Audit Log', href: '/admin/audit-log' },
];

interface AuditLogIndexProps {
    logs: AuditLog[];
    paginationLinks?: PaginationLink[];
    users: User[];
    filters?: {
        user_id?: string;
        action?: string;
        date_from?: string;
        date_to?: string;
        subject_type?: string;
    };
}

export default function AuditLogIndex({ logs = [], paginationLinks, users = [], filters = {} }: AuditLogIndexProps) {
    const filterForm = useForm({
        user_id: filters.user_id ?? '',
        action: filters.action ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        subject_type: filters.subject_type ?? '',
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        filterForm.get('/admin/audit-log', { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Log" />
            <div className="flex flex-col gap-6 p-4">
                <FlashAlert />

                <h1 className="text-2xl font-bold">Audit Log</h1>
                <p className="text-muted-foreground">
                    Log aktivitas sistem — hanya dapat dilihat, tidak dapat diubah atau dihapus (kepatuhan SPBE).
                </p>

                {/* Filter */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Filter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="grid gap-4 md:grid-cols-5">
                            <div className="space-y-1">
                                <Label className="text-xs">Pengguna</Label>
                                <Select value={filterForm.data.user_id} onValueChange={(v) => filterForm.setData('user_id', v)}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Semua" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua</SelectItem>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Aksi</Label>
                                <Select value={filterForm.data.action} onValueChange={(v) => filterForm.setData('action', v)}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Semua" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua</SelectItem>
                                        <SelectItem value="create">Create</SelectItem>
                                        <SelectItem value="read">Read</SelectItem>
                                        <SelectItem value="update">Update</SelectItem>
                                        <SelectItem value="delete">Delete</SelectItem>
                                        <SelectItem value="login">Login</SelectItem>
                                        <SelectItem value="logout">Logout</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Dari Tanggal</Label>
                                <Input type="date" value={filterForm.data.date_from} onChange={(e) => filterForm.setData('date_from', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Sampai Tanggal</Label>
                                <Input type="date" value={filterForm.data.date_to} onChange={(e) => filterForm.setData('date_to', e.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="w-full" disabled={filterForm.processing}>
                                    Terapkan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Tabel log */}
                <AuditLogViewer logs={logs} paginationLinks={paginationLinks} />
            </div>
        </AppLayout>
    );
}
