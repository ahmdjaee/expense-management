import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import flasher from '@flasher/flasher';
import { useEffect, type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    messages?: any;
}

export default ({ children, breadcrumbs, messages, ...props }: AppLayoutProps) => {
    // Render flash messages ketika mount atau messages berubah
    useEffect(() => {
        if (messages) {
            flasher.render(messages);
        }
    }, [messages]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
};
