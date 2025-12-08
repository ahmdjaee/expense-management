// resources/js/pages/expense/approvals/index.tsx

import AppLayout from '@/layouts/app/app-sidebar-layout';
import { formatCurrency, formatDate, getStatusBadgeColor, getStatusLabel } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { getMockAuthUser, MockRequest, mockRequests, MockUser, mockUsers } from '../mockExpenseData';

interface ApprovalsPageProps {
    auth?: {
        user: MockUser;
    };
    requests?: MockRequest[];
}

export default function ApprovalsPage({ auth, requests = mockRequests }: ApprovalsPageProps) {
    // Use mock user if no auth provided
    const user = auth?.user || getMockAuthUser('2'); // Default to head user

    const pendingApprovals = requests.filter((r) => {
        if (user?.role === 'head') {
            const requester = mockUsers.find((u) => u.id === r.userId);
            return (r.status === 'submitted' && requester?.division === user.division) || r.status === 'head_approved';
        }
        if (user?.role === 'director') {
            return r.status === 'head_approved';
        }
        return false;
    });

    return (
        <AppLayout>
            <Head title="Persetujuan Pengajuan" />

            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground md:rounded-bl-2xl">
                    <h1 className="mb-2 text-3xl font-bold">Persetujuan Pengajuan</h1>
                    <p className="opacity-90">Kelola persetujuan reimbursement dan kasbon</p>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 p-4 md:p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Menunggu Persetujuan</p>
                            <p className="text-2xl font-bold text-yellow-600">{pendingApprovals.length}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Total Pengajuan</p>
                            <p className="text-2xl font-bold text-foreground">{requests.length}</p>
                        </div>
                    </div>

                    {/* Approval List */}
                    <div className="space-y-3">
                        {pendingApprovals.length > 0 ? (
                            pendingApprovals.map((request) => {
                                const requester = mockUsers.find((u) => u.id === request.userId);
                                return (
                                    <Link key={request.id} href={`/expense/requests/${request.id}`}>
                                        <div className="rounded-lg border border-border bg-card p-4 transition hover:shadow-md">
                                            <div className="mb-3 flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="mb-1 font-semibold text-foreground">
                                                        {request.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {requester?.name} ({requester?.division})
                                                    </p>
                                                </div>
                                                <span
                                                    className={`rounded px-3 py-1 text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(request.status)}`}
                                                >
                                                    {getStatusLabel(request.status)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-border pt-3">
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(request.createdAt)}
                                                </p>
                                                <p className="font-bold text-primary">
                                                    {formatCurrency(request.amount)}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="rounded-lg border border-border bg-card py-12 text-center">
                                <p className="text-muted-foreground">Tidak ada pengajuan yang menunggu persetujuan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
