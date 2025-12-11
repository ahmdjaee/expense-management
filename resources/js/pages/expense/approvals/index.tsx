// resources/js/pages/expense/approvals/index.tsx

import AppLayout from '@/layouts/app/app-sidebar-layout';
import { formatCurrency, formatDate, getStatusBadgeColor, getStatusLabel } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    position: string;
    divisions: Array<{ id: number; name: string }>;
}

interface ExpenseRequest {
    id: number;
    title: string;
    amount: number;
    status: string;
    type: string;
    created_at: string;
    user: User;
}

interface ApprovalsPageProps {
    auth: {
        user: User;
    };
    requests: ExpenseRequest[];
}

export default function ApprovalsPage({ auth, requests }: ApprovalsPageProps) {
    const user = auth.user;

    return (
        <AppLayout>
            <Head title="Persetujuan Pengajuan" />

            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Persetujuan Pengajuan</h1>
                            <p className="mt-1 text-muted-foreground">Kelola persetujuan reimbursement dan kasbon</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 p-4 md:p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Menunggu Persetujuan</p>
                            <p className="text-2xl font-bold text-yellow-600">{requests.length}</p>
                        </div>
                    </div>

                    {/* Approval List */}
                    <div className="space-y-3">
                        {requests.length > 0 ? (
                            requests.map((request) => (
                                <Link key={request.id} href={`/expenses/request/${request.id}`}>
                                    <div className="rounded-lg border border-border bg-card p-4 transition hover:shadow-md">
                                        <div className="mb-3 flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="mb-1 font-semibold text-foreground">{request.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {request.user.name} (
                                                    {request.user.divisions.map((d) => d.name).join(', ')})
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
                                                {formatDate(request.created_at)}
                                            </p>
                                            <p className="font-bold text-primary">{formatCurrency(request.amount)}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
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
