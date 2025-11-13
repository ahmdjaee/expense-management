import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export function FlashNotification() {
    const { flash } = usePage<{ flash: FlashMessages }>().props;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success, {
                duration: 3000,
                position: 'top-right',
            });
        }
        if (flash.error) {
            toast.error(flash.error, {
                duration: 4000,
                position: 'top-right',
            });
        }
        if (flash.warning) {
            toast(flash.warning, {
                icon: '⚠️',
                duration: 3000,
                position: 'top-right',
            });
        }
        if (flash.info) {
            toast(flash.info, {
                icon: 'ℹ️',
                duration: 3000,
                position: 'top-right',
            });
        }
    }, [flash]);

    return (
        <Toaster
            toastOptions={{
                style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                },
            }}
        />
    );
}