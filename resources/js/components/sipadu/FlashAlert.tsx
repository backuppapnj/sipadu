import { useFlash } from '@/hooks/useFlash';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, InfoIcon, XIcon } from 'lucide-react';

/**
 * Komponen alert otomatis dari flash messages Inertia.
 * Menampilkan pesan success, error, warning, atau info.
 */
export function FlashAlert() {
    const { flash, dismiss } = useFlash();

    if (!flash.success && !flash.error && !flash.warning && !flash.info) {
        return null;
    }

    const config = flash.error
        ? { icon: XCircleIcon, title: 'Gagal', message: flash.error, variant: 'destructive' as const, className: 'border-red-300 bg-red-50 dark:bg-red-950' }
        : flash.warning
            ? { icon: AlertTriangleIcon, title: 'Peringatan', message: flash.warning, variant: 'default' as const, className: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950' }
            : flash.success
                ? { icon: CheckCircleIcon, title: 'Berhasil', message: flash.success, variant: 'default' as const, className: 'border-green-300 bg-green-50 dark:bg-green-950' }
                : { icon: InfoIcon, title: 'Informasi', message: flash.info, variant: 'default' as const, className: 'border-blue-300 bg-blue-50 dark:bg-blue-950' };

    return (
        <Alert variant={config.variant} className={config.className}>
            <config.icon className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
                {config.title}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={dismiss}
                    aria-label="Tutup pesan"
                >
                    <XIcon className="h-3 w-3" />
                </Button>
            </AlertTitle>
            <AlertDescription>{config.message}</AlertDescription>
        </Alert>
    );
}
