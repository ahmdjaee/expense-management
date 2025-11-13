import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

export default function UserPage({ users }: { users: User[] }) {
    // Ambil data auth user
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;
    const userRole = auth.user.role;

    // Cek apakah user memiliki akses admin
    const canManageUsers = ['superadmin', 'admin'].includes(userRole);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/users/${id}`);
        }
    };

    const handleEdit = (id: number) => {
        router.visit(`/users/${id}/edit`);
    };

    const getDivisionColor = (division: string) => {
        const colors = {
            Design: 'bg-purple-50 text-purple-700 border-purple-200',
            Marketing: 'bg-blue-50 text-blue-700 border-blue-200',
            IT: 'bg-pink-50 text-pink-700 border-pink-200',
            Finance: 'bg-green-50 text-green-700 border-green-200',
            "Human Resources": 'bg-orange-50 text-orange-700 border-orange-200',
        };
        return colors[division] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex-1 overflow-auto">
                <div className="mx-auto max-w-7xl p-4 md:p-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">All Users</h1>
                                <p className="mt-1 text-muted-foreground">
                                    View and manage all users across your organization
                                </p>
                            </div>
                            {/* Tombol New User hanya muncul untuk superadmin & admin */}
                            {canManageUsers && (
                                <Link href="/users/create">
                                    <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                                        <Plus className="h-4 w-4" />
                                        New User
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className={'space-y-4'}>
                        {users.length > 0 ? (
                            users.map((user) => {
                                return (
                                    <div
                                        key={user.id}
                                        className="relative rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg"
                                    >
                                        {/* Dropdown Menu hanya muncul untuk superadmin & admin */}
                                        {canManageUsers && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(user.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(user.id)}
                                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                        
                                        <h3 className="mb-2 pr-8 text-base font-semibold text-foreground">
                                            {user.name}
                                        </h3>
                                        <p className="mb-4 text-sm text-muted-foreground">{user.email}</p>

                                        {/* Tags */}
                                        <div className="mb-4 flex flex-wrap items-center gap-2">
                                            {user.divisions &&
                                                user.divisions.map((division, index) => (
                                                    <span
                                                        key={index}
                                                        className={`rounded-md border px-2.5 py-1 text-xs font-medium ${getDivisionColor(division.name)}`}
                                                    >
                                                        {division.name}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">
                                <div className="text-center">
                                    <p className="text-lg font-medium">No users found</p>
                                    <p className="text-sm">Try adjusting your filters</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}