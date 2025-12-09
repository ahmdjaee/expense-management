import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, mytasks, tasks, users } from '@/routes';
import { approvals, expenseDashboard, payments, reports, requestIndex, requestNew } from '@/routes/expense';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CheckSquare, ClipboardCheck, FileText, LayoutGrid, User, Wallet, Workflow } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

const taskNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        role: ['admin', 'superadmin'],
    },
    {
        title: 'All Tasks',
        href: tasks(),
        icon: Workflow,
    },
    {
        title: 'My Tasks',
        href: mytasks(),
        icon: ClipboardCheck,
    },
    {
        title: 'User',
        href: users(),
        icon: User,
    },
];

const expenseNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: expenseDashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Pengajuan Saya',
        href: requestIndex(),
        icon: FileText,
    },
    {
        title: 'Buat Pengajuan',
        href: requestNew(),
        icon: LayoutGrid,
    },
    {
        title: 'Persetujuan',
        href: approvals(),
        icon: CheckSquare,
        role: ['admin', 'superadmin'], // Hanya untuk admin dan superadmin
    },
    {
        title: 'Pembayaran',
        href: payments(),
        icon: Wallet,
        role: ['superadmin'], // Hanya untuk superadmin
    },
    {
        title: 'Laporan',
        href: reports(),
        icon: FileText,
        role: ['superadmin'], // Hanya untuk superadmin
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    // Ambil data user dari Inertia
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;
    const userRole = auth.user.role;

    // Filter menu Task Management berdasarkan role
    const filteredNavItemsTask = useMemo(() => {
        return taskNavItems.filter((item) => {
            // Jika item tidak punya batasan role, tampilkan
            if (!item.role) return true;

            // Jika ada batasan role, cek apakah user role termasuk
            return item.role.includes(userRole);
        });
    }, [userRole]);

    // Filter menu Expense Management berdasarkan role
    const filteredNavItemsExpense = useMemo(() => {
        return expenseNavItems.filter((item) => {
            // Jika item tidak punya batasan role, tampilkan
            if (!item.role) return true;

            // Jika ada batasan role, cek apakah user role termasuk
            return item.role.includes(userRole);
        });
    }, [userRole]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItemsTask} groupLabel="Task Management" />
                <NavMain items={filteredNavItemsExpense} groupLabel="Expense Management" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
