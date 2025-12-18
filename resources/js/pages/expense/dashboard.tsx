// resources/js/pages/expense/dashboard.tsx

import { RequestCard } from '@/components/request/request-card';
import AppLayout from '@/layouts/expense-app-layout';
import { ExpenseRequest, User } from '@/lib/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

interface DashboardProps {
    auth: {
        user: User;
    };
    recentRequests: ExpenseRequest[];
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
}

export default function Dashboard({ auth, recentRequests, stats }: DashboardProps) {
    return (
        <AppLayout>
            <div className="flex flex-1 flex-col">
                <Head title="Dashboard" />
                <div className="px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                            <p className="mt-1 text-muted-foreground">Ringkasan pengajuan dan aktivitas terbaru Anda</p>
                        </div>
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
                            href="/expenses/request/new"
                            className="rounded-lg border-2 border-primary bg-primary p-4 text-center font-bold text-primary-foreground transition hover:shadow-lg"
                        >
                            <Plus size={42} className="mb-1 inline-block" />
                            <p className="text-sm font-bold">Buat Pengajuan</p>
                        </Link>
                        <Link
                            href="/expenses/request"
                            className="rounded-lg border border-border bg-card p-4 text-center transition hover:shadow-md"
                        >
                            <p className="mb-2 text-3xl">📋</p>
                            <p className="text-sm font-medium text-foreground">Lihat Semua</p>
                        </Link>
                        <Link
                            href="/expenses/reports"
                            className="rounded-lg border border-border bg-card p-4 text-center transition hover:shadow-md"
                        >
                            <p className="mb-2 text-3xl">📊</p>
                            <p className="text-sm font-medium text-foreground">Laporan</p>
                        </Link>
                        <Link
                            href="/settings/profile"
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
                            <Link href="/expenses/request" className="text-sm text-primary hover:underline">
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
                                <Link href="/expenses/request/new" className="font-medium text-primary hover:underline">
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
