// resources/js/pages/expense/payments/index.tsx

import AppLayout from '@/layouts/app/app-sidebar-layout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { getMockAuthUser, MockRequest, mockRequests, MockUser, mockUsers } from '../mockExpenseData';

interface PaymentsPageProps {
    auth?: {
        user: MockUser;
    };
    requests?: MockRequest[];
}

export default function PaymentsPage({ auth, requests = mockRequests }: PaymentsPageProps) {
    // Use mock user if no auth provided
    const user = auth?.user || getMockAuthUser('4'); // Default to finance user

    const readyForPayment = requests.filter((r) => r.status === 'director_approved');
    const alreadyPaid = requests.filter((r) => r.status === 'paid');

    return (
        <AppLayout>
            <Head title="Dashboard Pembayaran" />

            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground md:rounded-bl-2xl">
                    <h1 className="mb-2 text-3xl font-bold">Dashboard Pembayaran</h1>
                    <p className="opacity-90">Proses pembayaran reimbursement dan kasbon</p>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 p-4 md:p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Siap Dibayar</p>
                            <p className="text-2xl font-bold text-yellow-600">{readyForPayment.length}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Total Pembayaran</p>
                            <p className="text-2xl font-bold text-foreground">
                                {formatCurrency(readyForPayment.reduce((acc, r) => acc + r.amount, 0))}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Sudah Dibayar</p>
                            <p className="text-2xl font-bold text-green-600">{alreadyPaid.length}</p>
                        </div>
                    </div>

                    {/* Siap Dibayar */}
                    <div>
                        <h2 className="mb-4 text-lg font-bold text-foreground">Pengajuan Siap Dibayar</h2>
                        <div className="space-y-3">
                            {readyForPayment.length > 0 ? (
                                readyForPayment.map((request) => {
                                    const requester = mockUsers.find((u) => u.id === request.userId);
                                    return (
                                        <div key={request.id} className="rounded-lg border border-border bg-card p-4">
                                            <div className="mb-3 flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="mb-1 font-semibold text-foreground">
                                                        {request.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">{requester?.name}</p>
                                                </div>
                                                <span className="rounded bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                                    Siap Dibayar
                                                </span>
                                            </div>

                                            <div className="mb-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                                                <div>
                                                    <p className="text-muted-foreground">Metode</p>
                                                    <p className="font-medium">
                                                        {request.paymentMethod === 'transfer'
                                                            ? '🏦 Transfer'
                                                            : '💵 Cash'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Nominal</p>
                                                    <p className="font-bold text-primary">
                                                        {formatCurrency(request.amount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Tanggal</p>
                                                    <p className="font-medium">{formatDate(request.createdAt)}</p>
                                                </div>
                                            </div>

                                            {requester?.bankAccount && (
                                                <div className="mb-4 rounded bg-blue-50 p-3 text-sm">
                                                    <p className="mb-1 text-muted-foreground">Rekening Penerima</p>
                                                    <p className="font-medium">
                                                        {requester.bankName} - {requester.accountHolder}
                                                    </p>
                                                    <p className="font-mono">
                                                        *** *** *** {requester.bankAccount.slice(-4)}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/expense/requests/${request.id}/pay`}
                                                    className="flex-1 rounded-lg bg-green-600 py-2 text-center text-sm font-medium text-white transition hover:opacity-90"
                                                >
                                                    Bayar Sekarang
                                                </Link>
                                                <Link
                                                    href={`/expense/requests/${request.id}`}
                                                    className="flex-1 rounded-lg border border-border py-2 text-center text-sm font-medium text-foreground transition hover:bg-accent"
                                                >
                                                    Detail
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="rounded-lg border border-border bg-card py-8 text-center">
                                    <p className="text-muted-foreground">Tidak ada pengajuan yang siap dibayar</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sudah Dibayar */}
                    <div>
                        <h2 className="mb-4 text-lg font-bold text-foreground">Riwayat Pembayaran</h2>
                        <div className="space-y-3">
                            {alreadyPaid.length > 0 ? (
                                alreadyPaid.map((request) => {
                                    const requester = mockUsers.find((u) => u.id === request.userId);
                                    return (
                                        <div key={request.id} className="rounded-lg border border-border bg-card p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-foreground">{request.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{requester?.name}</p>
                                                </div>
                                                <span className="rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                    Sudah Dibayar
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="rounded-lg border border-border bg-card py-8 text-center">
                                    <p className="text-muted-foreground">Belum ada pembayaran</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
