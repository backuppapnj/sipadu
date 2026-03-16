import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { SharedPageProps, FlashMessages } from '@/types';

/**
 * Hook untuk membaca flash messages dari Inertia shared data.
 * Auto-dismiss setelah timeout.
 */
export function useFlash(timeout = 5000) {
    const { flash } = usePage<SharedPageProps>().props;
    const [visible, setVisible] = useState<FlashMessages>({});

    useEffect(() => {
        if (flash?.success || flash?.error || flash?.warning || flash?.info) {
            setVisible(flash);

            // Auto-dismiss untuk pesan non-error
            if (!flash.error) {
                const timer = setTimeout(() => setVisible({}), timeout);
                return () => clearTimeout(timer);
            }
        }
    }, [flash, timeout]);

    const dismiss = () => setVisible({});

    return { flash: visible, dismiss };
}
