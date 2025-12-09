import { BottomNav } from '@/components/bottom-nav';
import { FlashNotification } from '@/components/flash-notification';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            {/* Tambahkan Flash Notification */}
            <FlashNotification />
            {/* Spacer untuk prevent content tertutup bottom nav */}
            <div className="h-20 md:hidden" />
            <BottomNav />
        </AppLayoutTemplate>
    );
};
