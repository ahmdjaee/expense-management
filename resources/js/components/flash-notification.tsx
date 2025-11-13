import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface FlasherEnvelope {
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    options: any[];
    metadata: {
        plugin: string;
        created_at: string;
        id: string;
        priority: number;
    };
}

interface FlasherMessages {
    envelopes: FlasherEnvelope[];
    scripts: string[];
    styles: string[];
    options: any;
    context: any[];
}

interface PageProps {
    messages?: FlasherMessages;
}

export function FlashNotification() {
    const { messages } = usePage<PageProps>().props;
    const processedIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!messages?.envelopes || messages.envelopes.length === 0) {
            return;
        }

        // Loop through all envelopes dan tampilkan toast
        messages.envelopes.forEach((envelope) => {
            const { type, message, metadata } = envelope;

            // Skip jika sudah pernah ditampilkan
            if (processedIds.current.has(metadata.id)) {
                return;
            }

            // Tandai sebagai sudah diproses
            processedIds.current.add(metadata.id);

            switch (type) {
                case 'success':
                    toast.success(message, {
                        duration: 3000,
                    });
                    break;
                case 'error':
                    toast.error(message, {
                        duration: 4000,
                    });
                    break;
                case 'warning':
                    toast(message, {
                        icon: '⚠️',
                        duration: 3000,
                    });
                    break;
                case 'info':
                    toast(message, {
                        icon: 'ℹ️',
                        duration: 3000,
                    });
                    break;
                default:
                    toast(message);
            }
        });
    }, [messages]);

    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                duration: 3000,
                // style: {
                //     background: 'hsl(var(--background))',
                //     color: 'hsl(var(--foreground))',
                //     border: '1px solid hsl(var(--border))',
                // },
                // success: {
                //     style: {
                //         background: 'hsl(var(--background))',
                //         color: 'hsl(var(--foreground))',
                //     },
                // },
                // error: {
                //     duration: 4000,
                //     style: {
                //         background: 'hsl(var(--background))',
                //         color: 'hsl(var(--foreground))',
                //     },
                // },
            }}
        />
    );
}
