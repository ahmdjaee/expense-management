import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Login Codes',
        href: '/login-codes',
    },
];

interface LoginCode {
    id: number;
    code: string;
    users: Array<{
        id: number;
        name: string;
        email: string;
    }>;
    users_count: number;
    created_at: string;
    updated_at: string;
}

interface Filters {
    search: string;
    sort_by: string;
    sort_order: string;
    per_page: number;
}

interface Props {
    loginCodes: {
        data: LoginCode[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: Filters;
}

export default function LoginCodesPage({ loginCodes, filters }: Props) {
    const { flash } = usePage().props as any;
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showBulkDelete, setShowBulkDelete] = useState(false);

    const handleFilter = (key: string, value: any) => {
        router.get(
            '/crm/login-codes',
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true },
        );
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                handleFilter('search', searchTerm);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleDelete = (id: number) => {
        router.delete(`/crm/login-codes/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteId(null);
            },
        });
    };

    const handleBulkDelete = () => {
        router.post(
            '/crm/login-codes/bulk-destroy',
            { ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    setShowBulkDelete(false);
                },
            },
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === loginCodes.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(loginCodes.data.map((code) => code.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Login Codes" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        {flash.error}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Login Codes MT5</h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Manage login codes for MT5 accounts
                        </p>
                    </div>
                    <Link href={'/crm/login-codes/create'}>
                        <Button variant="default">
                            <Plus className="mr-2 h-4 w-4" />
                            New Login Code
                        </Button>
                    </Link>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {/* Search */}
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search by code or user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex gap-2">
                                {/* Per Page */}
                                <Select
                                    value={filters.per_page.toString()}
                                    onValueChange={(value) => handleFilter('per_page', value)}
                                >
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Bulk Delete */}
                                {selectedIds.length > 0 && (
                                    <Button variant="destructive" size="sm" onClick={() => setShowBulkDelete(true)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete ({selectedIds.length})
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loginCodes.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <User className="mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">No login codes found</h3>
                                <p className="mb-4 text-sm text-gray-500">
                                    {filters.search
                                        ? 'Try adjusting your search criteria'
                                        : 'Get started by creating a new login code'}
                                </p>
                                {!filters.search && (
                                    <Link href={'/crm/login-codes/create'}>
                                        <Button variant="default">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Login Code
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <Checkbox
                                                    checked={
                                                        selectedIds.length === loginCodes.data.length &&
                                                        loginCodes.data.length > 0
                                                    }
                                                    onCheckedChange={toggleSelectAll}
                                                />
                                            </TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead>User Count</TableHead>
                                            <TableHead>Assigned Users</TableHead>
                                            <TableHead>Created At</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loginCodes.data.map((loginCode) => (
                                            <TableRow key={loginCode.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedIds.includes(loginCode.id)}
                                                        onCheckedChange={() => toggleSelect(loginCode.id)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-mono font-semibold">
                                                    {loginCode.code}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={loginCode.users_count > 0 ? 'default' : 'secondary'}
                                                        className="text-xs"
                                                    >
                                                        <Users className="mr-1 h-3 w-3" />
                                                        {loginCode.users_count}{' '}
                                                        {loginCode.users_count === 1 ? 'user' : 'users'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {loginCode.users.length === 0 ? (
                                                        <span className="text-xs text-gray-500 italic">
                                                            No users assigned
                                                        </span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1">
                                                            {loginCode.users.slice(0, 3).map((user) => (
                                                                <Badge
                                                                    key={user.id}
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {user.name}
                                                                </Badge>
                                                            ))}
                                                            {loginCode.users.length > 3 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{loginCode.users.length - 3} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {new Date(loginCode.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/crm/login-codes/${loginCode.id}/edit`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeleteId(loginCode.id)}
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                    {loginCodes.data.length > 0 && (
                        <CardFooter className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {(loginCodes.current_page - 1) * loginCodes.per_page + 1} to{' '}
                                {Math.min(loginCodes.current_page * loginCodes.per_page, loginCodes.total)} of{' '}
                                {loginCodes.total} results
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={loginCodes.current_page === 1}
                                    onClick={() =>
                                        router.get(
                                            '/crm/login-codes',
                                            { ...filters, page: loginCodes.current_page - 1 },
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={loginCodes.current_page === loginCodes.last_page}
                                    onClick={() =>
                                        router.get(
                                            '/crm/login-codes',
                                            { ...filters, page: loginCodes.current_page + 1 },
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the login code and remove all
                            user assignments.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleDelete(deleteId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Multiple Login Codes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {selectedIds.length} login code
                            (s) and remove all user assignments.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
