import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import type { User, SharedPageProps, BreadcrumbItem } from '@/types';

interface EditProps {
    editUser: User;
}

export default function UsersEdit({ editUser }: EditProps) {
    const { auth } = usePage<SharedPageProps>().props;
    const isOwnAccount = auth.user?.id === editUser.id;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Pengguna', href: '/admin/users' },
        { title: editUser.name, href: `/admin/users/${editUser.id}/edit` },
    ];

    const form = useForm({
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone ?? '',
        role: editUser.roles?.[0] ?? 'masyarakat',
        is_active: editUser.is_active,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.put(`/admin/users/${editUser.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Pengguna — ${editUser.name}`} />
            <div className="flex flex-col gap-6 p-4 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/users">
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Pengguna</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    aria-invalid={!!form.errors.name}
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    aria-invalid={!!form.errors.email}
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor HP</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                />
                                <InputError message={form.errors.phone} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                                <Select
                                    value={form.data.role}
                                    onValueChange={(v) => form.setData('role', v)}
                                    disabled={isOwnAccount}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="petugas_layanan">Petugas Layanan</SelectItem>
                                        <SelectItem value="panitera">Panitera</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                {isOwnAccount && (
                                    <p className="text-xs text-muted-foreground">
                                        Anda tidak dapat mengubah role akun sendiri.
                                    </p>
                                )}
                                <InputError message={form.errors.role} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password Baru (kosongkan jika tidak diubah)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                />
                                <InputError message={form.errors.password} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(c) => form.setData('is_active', c === true)}
                                    disabled={isOwnAccount}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">Aktif</Label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/admin/users">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={form.processing}>
                                    <SaveIcon className="mr-2 h-4 w-4" />
                                    {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
