// resources/js/pages/expense/reports/index.tsx

import AppLayout from '@/layouts/app/app-sidebar-layout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { getMockAuthUser, MockRequest, mockRequests, MockUser, mockUsers } from '../mockExpenseData';

interface ReportsPageProps {
    auth?: {
        user: MockUser;
    };
    requests?: MockRequest[];
}

export default function ReportsPage({ auth, requests = mockRequests }: ReportsPageProps) {
    // Use mock user if no auth provided
    const user = auth?.user || getMockAuthUser('3'); // Default to director user

    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    // Convert mock users to object for export
    const usersMap = mockUsers.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

    const filtered = requests.filter((r) => {
        const statusMatch = filterStatus === 'all' || r.status === filterStatus;
        const typeMatch = filterType === 'all' || r.type === filterType;
        return statusMatch && typeMatch;
    });

    // Calculate statistics
    const stats = {
        totalRequests: requests.length,
        totalAmount: requests.reduce((sum, r) => sum + r.amount, 0),
        approved: requests.filter((r) => r.status.includes('approved') || r.status === 'paid').length,
        pending: requests.filter((r) => r.status === 'submitted').length,
        rejected: requests.filter((r) => r.status === 'rejected').length,
    };

    // By Division
    const byDivision = requests.reduce(
        (acc, req) => {
            const requester = mockUsers.find((u) => u.id === req.userId);
            const division = requester?.division || 'Unknown';
            if (!acc[division]) acc[division] = { count: 0, amount: 0 };
            acc[division].count += 1;
            acc[division].amount += req.amount;
            return acc;
        },
        {} as Record<string, { count: number; amount: number }>,
    );

    // By Type
    const byType = requests.reduce(
        (acc, req) => {
            const type = req.type === 'reimbursement' ? 'Reimbursement' : 'Advance';
            if (!acc[type]) acc[type] = { count: 0, amount: 0 };
            acc[type].count += 1;
            acc[type].amount += req.amount;
            return acc;
        },
        {} as Record<string, { count: number; amount: number }>,
    );

    // By Status
    const byStatus = requests.reduce(
        (acc, req) => {
            const status = req.status;
            if (!acc[status]) acc[status] = { count: 0, amount: 0 };
            acc[status].count += 1;
            acc[status].amount += req.amount;
            return acc;
        },
        {} as Record<string, { count: number; amount: number }>,
    );

    // Export function
    const exportToCSV = () => {
        const headers = ['ID', 'Title', 'Requester', 'Type', 'Amount', 'Status', 'Date'];
        const rows = filtered.map((req) => {
            const requester = mockUsers.find((u) => u.id === req.userId);
            return [
                req.id,
                req.title,
                requester?.name || 'Unknown',
                req.type,
                req.amount.toString(),
                req.status,
                formatDate(req.createdAt),
            ];
        });

        const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expense_reports.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AppLayout>
            <Head title="Laporan & Analisis" />

            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="bg-linear-to-r from-primary to-primary/80 p-6 text-primary-foreground md:rounded-bl-2xl">
                    <h1 className="mb-2 text-3xl font-bold">Laporan & Analisis</h1>
                    <p className="opacity-90">Dashboard statistik dan laporan pengajuan</p>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 p-4 md:p-6">
                    {/* Export Buttons */}
                    <div className="rounded-lg border border-border bg-card p-4">
                        <p className="mb-3 text-sm font-semibold text-foreground">Export Data</p>
                        <button
                            onClick={exportToCSV}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            Export to CSV
                        </button>
                    </div>

                    {/* Main Statistics */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Total Pengajuan</p>
                            <p className="text-2xl font-bold text-foreground">{stats.totalRequests}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Total Nominal</p>
                            <p className="text-lg font-bold text-primary">{formatCurrency(stats.totalAmount)}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Disetujui</p>
                            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Ditolak</p>
                            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Tipe</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                >
                                    <option value="all">Semua</option>
                                    <option value="reimbursement">Reimbursement</option>
                                    <option value="advance">Advance/Kasbon</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                >
                                    <option value="all">Semua</option>
                                    <option value="submitted">Pending</option>
                                    <option value="head_approved">Disetujui Head</option>
                                    <option value="director_approved">Disetujui Direktur</option>
                                    <option value="paid">Sudah Dibayar</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* By Division */}
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h3 className="mb-4 text-lg font-bold text-foreground">Pengajuan Per Divisi</h3>
                            <div className="space-y-3">
                                {Object.entries(byDivision).map(([division, data]) => (
                                    <div key={division}>
                                        <div className="mb-1 flex justify-between">
                                            <p className="text-sm font-medium text-foreground">{division}</p>
                                            <p className="text-sm text-muted-foreground">{data.count} pengajuan</p>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200">
                                            <div
                                                className="h-2 rounded-full bg-primary"
                                                style={{ width: `${(data.count / stats.totalRequests) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {formatCurrency(data.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* By Type */}
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h3 className="mb-4 text-lg font-bold text-foreground">Pengajuan Per Tipe</h3>
                            <div className="space-y-3">
                                {Object.entries(byType).map(([type, data]) => (
                                    <div key={type}>
                                        <div className="mb-1 flex justify-between">
                                            <p className="text-sm font-medium text-foreground">{type}</p>
                                            <p className="text-sm text-muted-foreground">{data.count} pengajuan</p>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200">
                                            <div
                                                className={`h-2 rounded-full ${type === 'Reimbursement' ? 'bg-blue-500' : 'bg-green-500'}`}
                                                style={{ width: `${(data.count / stats.totalRequests) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {formatCurrency(data.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* By Status */}
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h3 className="mb-4 text-lg font-bold text-foreground">Pengajuan Per Status</h3>
                            <div className="space-y-3">
                                {Object.entries(byStatus).map(([status, data]) => (
                                    <div key={status}>
                                        <div className="mb-1 flex justify-between">
                                            <p className="text-sm font-medium text-foreground capitalize">{status}</p>
                                            <p className="text-sm text-muted-foreground">{data.count}</p>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200">
                                            <div
                                                className="h-2 rounded-full bg-purple-500"
                                                style={{ width: `${(data.count / stats.totalRequests) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {formatCurrency(data.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pie Chart Alternative */}
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h3 className="mb-4 text-lg font-bold text-foreground">Persentase Status</h3>
                            <div className="space-y-2">
                                {Object.entries(byStatus).map(([status, data]) => {
                                    const percentage = ((data.count / stats.totalRequests) * 100).toFixed(1);
                                    return (
                                        <div key={status} className="flex items-center gap-3">
                                            <div className="flex h-6 w-12 items-center justify-center rounded bg-linear-to-r from-primary to-primary/60 text-xs font-bold text-white">
                                                {percentage}%
                                            </div>
                                            <p className="text-sm text-foreground capitalize">{status}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="overflow-x-auto rounded-lg border border-border bg-card p-6">
                        <h3 className="mb-4 text-lg font-bold text-foreground">Detail Pengajuan</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="p-2 text-left font-semibold text-foreground">ID</th>
                                    <th className="p-2 text-left font-semibold text-foreground">Pemohon</th>
                                    <th className="p-2 text-left font-semibold text-foreground">Tipe</th>
                                    <th className="p-2 text-left font-semibold text-foreground">Nominal</th>
                                    <th className="p-2 text-left font-semibold text-foreground">Status</th>
                                    <th className="p-2 text-left font-semibold text-foreground">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.slice(0, 10).map((req) => {
                                    const requester = mockUsers.find((u) => u.id === req.userId);
                                    return (
                                        <tr key={req.id} className="border-b border-border transition hover:bg-accent">
                                            <td className="p-2 font-mono text-xs">{req.id}</td>
                                            <td className="p-2 text-sm">{requester?.name}</td>
                                            <td className="p-2 text-sm capitalize">{req.type}</td>
                                            <td className="p-2 font-bold text-primary">{formatCurrency(req.amount)}</td>
                                            <td className="p-2 text-sm capitalize">{req.status}</td>
                                            <td className="p-2 text-sm text-muted-foreground">
                                                {formatDate(req.createdAt)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filtered.length > 10 && (
                            <p className="mt-3 text-xs text-muted-foreground">
                                Menampilkan 10 dari {filtered.length} data
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
