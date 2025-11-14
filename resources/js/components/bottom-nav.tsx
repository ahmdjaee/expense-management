import { cn } from '@/lib/utils';
import { dashboard, mytasks, tasks, users } from '@/routes';
import profile, { edit } from '@/routes/profile';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ClipboardCheck, LayoutGrid, Settings, User, Workflow } from 'lucide-react';
import { useEffect, useState } from 'react';

const mainNavItems: NavItem[] = [
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
        isCenter: true,
    },
    {
        title: 'Users',
        href: users(),
        icon: User,
        role: ['admin', 'superadmin'],
    },
    {
        title: 'Settings',
        href: edit(),
        icon: Settings,
    },
];

export function BottomNav() {
    const page = usePage<{ auth: { user: { role: string } } }>();
    const userRole = page.props.auth.user.role;
    const currentUrl = page.url || '';
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Filter menu berdasarkan role
    const filteredNavItems = mainNavItems.filter((item) => {
        if (!item.role) return true;
        return item.role.includes(userRole);
    });

    if (!mounted) return null;

    const isItemActive = (href: string) => {
        if (!currentUrl) return false;
        return currentUrl === href || currentUrl.startsWith(href + '/');
    };

    // Hitung grid columns berdasarkan jumlah items
    const gridCols = {
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
    }[filteredNavItems.length] || 'grid-cols-5';

    return (
        <>


            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
                <div className={cn('mx-auto grid h-16 max-w-screen-xl', gridCols)}>
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isItemActive(item.href);
                        const isCenter = item.isCenter;

                        if (isCenter) {
                            return (
                                <div key={item.href} className="relative flex items-center justify-center">
                                    <Link
                                        href={item.href}
                                        className="absolute -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
                                    >
                                        <Icon className="h-6 w-6" />
                                    </Link>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                                    isActive
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Icon className={cn('h-5 w-5', isActive && 'fill-current')} />
                                <span className="truncate max-w-[60px] text-center">{item.title}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}