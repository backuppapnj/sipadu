import { Head, useForm, Link } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import type { ComplaintCategory, BreadcrumbItem } from '@/types';

interface EditProps {
    category: ComplaintCategory;
}

export default function CategoriesEdit({ category }: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Kategori', href: '/admin/categories' },
        { title: category.name, href: `/admin/categories/${category.id}/edit` },
    ];

    const form = useForm({
        name: category.name,
        code: category.code,
        sla_days: category.sla_days,
        is_active: category.is_active,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.put(`/admin/categories/${category.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Kategori — ${category.name}`} />
            <div className="flex flex-col gap-6 p-4 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/categories"><ArrowLeftIcon className="h-4 w-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Kategori</h1>
                </div>

                <Card>
                    <CardHeader><CardTitle>Data Kategori</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Kategori <span className="text-red-500">*</span></Label>
                                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} aria-invalid={!!form.errors.name} />
                                <InputError message={form.errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode <span className="text-red-500">*</span></Label>
                                <Input id="code" value={form.data.code} onChange={(e) => form.setData('code', e.target.value.toUpperCase())} maxLength={10} aria-invalid={!!form.errors.code} />
                                <InputError message={form.errors.code} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sla_days">SLA (Hari Kerja) <span className="text-red-500">*</span></Label>
                                <Input id="sla_days" type="number" min={1} max={60} value={form.data.sla_days} onChange={(e) => form.setData('sla_days', parseInt(e.target.value) || 14)} aria-invalid={!!form.errors.sla_days} />
                                <InputError message={form.errors.sla_days} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="is_active" checked={form.data.is_active} onCheckedChange={(c) => form.setData('is_active', c === true)} />
                                <Label htmlFor="is_active" className="cursor-pointer">Aktif</Label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" asChild><Link href="/admin/categories">Batal</Link></Button>
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
