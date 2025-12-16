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
import { approvals, expenseDashboard, payments, reports, requestIndex } from '@/routes/expense';
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
    // Menu User telah dipindahkan dari sini
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
        title: 'Persetujuan',
        href: approvals(),
        icon: CheckSquare,
        position: ['head', 'direktur', 'finance'], // Hanya untuk head, direktur, dan finance
    },
    {
        title: 'Pembayaran',
        href: payments(),
        icon: Wallet,
        position: ['finance'], // Hanya untuk finance
    },
    {
        title: 'Laporan',
        href: reports(),
        icon: FileText,
        position: ['finance', 'direktur'], // Hanya untuk finance dan direktur
    },
];

// Grup baru untuk menu User
const userNavItems: NavItem[] = [
    {
        title: 'User',
        href: users(),
        icon: User,
        // Tidak ada batasan role, semua user bisa melihatnya
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    // Ambil data user dari Inertia
    const { auth } = usePage<{ auth: { user: { role: string; position: string } } }>().props;
    const userRole = auth.user.role;
    const userPosition = auth.user.position;

    // Filter menu Task Management berdasarkan role
    const filteredNavItemsTask = useMemo(() => {
        return taskNavItems.filter((item) => {
            // Jika item tidak punya batasan role, tampilkan
            if (!item.role) return true;

            // Jika ada batasan role, cek apakah user role termasuk
            return item.role.includes(userRole);
        });
    }, [userRole]);

    // Filter menu Expense Management berdasarkan role dan position
    const filteredNavItemsExpense = useMemo(() => {
        return expenseNavItems.filter((item) => {
            // Filter berdasarkan role jika ada
            if (item.role && !item.role.includes(userRole)) {
                return false;
            }

            // Filter berdasarkan position jika ada
            if (item.position && !item.position.includes(userPosition)) {
                return false;
            }

            // Jika tidak ada batasan atau user memenuhi kriteria, tampilkan
            return true;
        });
    }, [userRole, userPosition]);

    // Tidak perlu filter userNavItems karena bisa diakses semua user

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
                {/* Grup baru untuk menu User Management */}
                <NavMain items={userNavItems} groupLabel="User Management" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
