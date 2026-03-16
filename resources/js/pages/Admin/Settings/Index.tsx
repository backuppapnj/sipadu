import { Head, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FlashAlert } from '@/components/sipadu/FlashAlert';
import InputError from '@/components/input-error';
import { SaveIcon } from 'lucide-react';
import type { SystemSetting, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Pengaturan', href: '/admin/settings' },
];

interface SettingsIndexProps {
    settings: SystemSetting[];
}

/** Kelompokkan settings berdasarkan group */
function groupSettings(settings: SystemSetting[]): Record<string, SystemSetting[]> {
    return settings.reduce<Record<string, SystemSetting[]>>((acc, setting) => {
        const group = setting.group || 'general';
        if (!acc[group]) acc[group] = [];
        acc[group].push(setting);
        return acc;
    }, {});
}

/** Label grup pengaturan */
const GROUP_LABELS: Record<string, string> = {
    general: 'Umum',
    notification: 'Notifikasi',
    sla: 'SLA',
    security: 'Keamanan',
};

export default function SettingsIndex({ settings = [] }: SettingsIndexProps) {
    const initialValues: Record<string, string> = {};
    settings.forEach((s) => {
        initialValues[s.key] = s.value;
    });

    const form = useForm(initialValues);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.put('/admin/settings');
    };

    const grouped = groupSettings(settings);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Sistem" />
            <div className="flex flex-col gap-6 p-4 max-w-2xl">
                <FlashAlert />

                <h1 className="text-2xl font-bold">Pengaturan Sistem</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {Object.entries(grouped).map(([group, groupSettings]) => (
                        <Card key={group}>
                            <CardHeader>
                                <CardTitle>{GROUP_LABELS[group] ?? group}</CardTitle>
                                <CardDescription>
                                    Pengaturan {(GROUP_LABELS[group] ?? group).toLowerCase()} sistem.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {groupSettings.map((setting) => (
                                    <div key={setting.key} className="space-y-2">
                                        <Label htmlFor={setting.key}>
                                            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Label>
                                        <Input
                                            id={setting.key}
                                            value={form.data[setting.key] ?? ''}
                                            onChange={(e) => form.setData(setting.key, e.target.value)}
                                        />
                                        <InputError message={form.errors[setting.key]} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.processing}>
                            <SaveIcon className="mr-2 h-4 w-4" />
                            {form.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
