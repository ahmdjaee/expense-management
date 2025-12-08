import { RequestCard } from "@/components/request/request-card";
import AppLayout from "@/layouts/app-layout";
import { ExpenseRequest, User } from "@/lib/types";
import { Link } from '@inertiajs/react';

const userRequests: User[] = [
    {
        accountHolder: 'Budi Santoso',
        bankAccount: '1234567890',
        bankName: 'BCA',
        createdAt: new Date('2023-01-15T10:00:00Z'),
        division: 'IT',
        email: 'budi@company.com',
        id: '1',
        name: 'Budi Santoso',
        phone: '0812345678',
        role: 'user',
    },
];

const recentRequests: ExpenseRequest[] = [
    {
        id: 'req1',
        userId: '1',
        type: 'expense',
        amount: 50000,
        title: 'Belanja',
        description: 'Belanja di toko online',
        status: 'submitted',
        paymentMethod: 'cash',
        currency: 'IDR',
        createdAt: new Date('2023-01-15T10:00:00Z'),
        updatedAt: new Date('2023-01-15T10:00:00Z'),
    },
];

export default function Dashboard() {
    const stats = {
        total: userRequests.length,
        pending: userRequests.filter((r) => r.status === 'submitted').length,
        approved: userRequests.filter((r) => r.status === 'director_approved' || r.status === 'paid').length,
        rejected: userRequests.filter((r) => r.status === 'rejected').length,
    };

    return (
        <AppLayout>
<div className="flex flex-1 flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-white to-white/80 p-6 text-primary-foreground md:rounded-bl-2xl">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
                        <p className="opacity-90">Selamat datang kembali, Ahmad Jaelani</p>
                    </div>
                    <Link
                        href="/requests/new"
                        className="ml-4 hidden rounded-lg bg-primary-foreground px-6 py-2 text-sm font-bold whitespace-nowrap text-primary transition hover:opacity-90 md:block"
                    >
                        + Buat Pengajuan
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6 p-4 md:p-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-border bg-card p-4">
                        <p className="mb-1 text-xs text-muted-foreground">Total Pengajuan</p>
                        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4">
                        <p className="mb-1 text-xs text-muted-foreground">Menunggu Approval</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4">
                        <p className="mb-1 text-xs text-muted-foreground">Disetujui</p>
                        <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4">
                        <p className="mb-1 text-xs text-muted-foreground">Ditolak</p>
                        <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Link
                        href="/requests/new"
                        className="rounded-lg border-2 border-primary bg-primary p-4 text-center font-bold text-primary-foreground transition hover:shadow-lg"
                    >
                        <p className="mb-2 text-3xl">➕</p>
                        <p className="text-sm font-bold">Buat Pengajuan</p>
                    </Link>
                    <Link
                        href="/requests"
                        className="rounded-lg border border-border bg-card p-4 text-center transition hover:shadow-md"
                    >
                        <p className="mb-2 text-3xl">📋</p>
                        <p className="text-sm font-medium text-foreground">Lihat Semua</p>
                    </Link>
                    <Link
                        href="/reports"
                        className="rounded-lg border border-border bg-card p-4 text-center transition hover:shadow-md"
                    >
                        <p className="mb-2 text-3xl">📊</p>
                        <p className="text-sm font-medium text-foreground">Laporan</p>
                    </Link>
                    <Link
                        href="/profile"
                        className="rounded-lg border border-border bg-card p-4 text-center transition hover:shadow-md"
                    >
                        <p className="mb-2 text-3xl">👤</p>
                        <p className="text-sm font-medium text-foreground">Profil</p>
                    </Link>
                </div>

                {/* Recent Requests */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-foreground">Pengajuan Terbaru</h2>
                        <Link href="/requests" className="text-sm text-primary hover:underline">
                            Lihat Semua
                        </Link>
                    </div>
                    {recentRequests.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {recentRequests.map((request) => (
                                <RequestCard key={request.id} request={request} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border bg-card py-12 text-center">
                            <p className="mb-4 text-muted-foreground">Belum ada pengajuan</p>
                            <Link href="/requests/new" className="font-medium text-primary hover:underline">
                                Buat pengajuan sekarang
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </AppLayout>
    );
}
