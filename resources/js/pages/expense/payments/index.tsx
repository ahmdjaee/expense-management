// resources/js/pages/expense/payments/index.tsx

import AppLayout from '@/layouts/app/app-sidebar-layout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    position: string;
    rekening?: string;
    bank?: string;
    rekening_name?: string;
}

interface ExpenseRequest {
    id: number;
    title: string;
    amount: number;
    status: string;
    type: string;
    payment_method: string;
    created_at: string;
    user: User;
}

interface PaymentsPageProps {
    auth: {
        user: User;
    };
    readyForPayment: ExpenseRequest[];
    paidRequests: ExpenseRequest[];
}

export default function PaymentsPage({ auth, readyForPayment, paidRequests }: PaymentsPageProps) {
    const [processingId, setProcessingId] = useState<number | null>(null);

    const handlePayment = (requestId: number, paymentMethod: string) => {
        if (confirm('Apakah Anda yakin ingin memproses pembayaran ini?')) {
            setProcessingId(requestId);
            router.post(
                `/expenses/payments/${requestId}/process`,
                {
                    payment_method: paymentMethod,
                    reference_number: `PAY-${Date.now()}`,
                },
                {
                    onFinish: () => setProcessingId(null),
                },
            );
        }
    };

    // Calculate total amounts
    const totalReadyAmount = readyForPayment.reduce((acc, r) => acc + r.amount, 0);
    const totalPaidAmount = paidRequests.reduce((acc, r) => acc + r.amount, 0);

    return (
        <AppLayout>
            <Head title="Dashboard Pembayaran" />

            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="bg-linear-to-r from-primary to-primary/80 p-6 text-primary-foreground">
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
                            <p className="mb-1 text-xs text-muted-foreground">Total Siap Dibayar</p>
                            <p className="text-lg font-bold text-yellow-600">{formatCurrency(totalReadyAmount)}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Sudah Dibayar</p>
                            <p className="text-2xl font-bold text-green-600">{paidRequests.length}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Total Terbayar</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaidAmount)}</p>
                        </div>
                    </div>

                    {/* Siap Dibayar */}
                    <div>
                        <h2 className="mb-4 text-lg font-bold text-foreground">Pengajuan Siap Dibayar</h2>
                        <div className="space-y-3">
                            {readyForPayment.length > 0 ? (
                                readyForPayment.map((request) => (
                                    <div key={request.id} className="rounded-lg border border-border bg-card p-4">
                                        <div className="mb-3 flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="mb-1 font-semibold text-foreground">{request.title}</h3>
                                                <p className="text-sm text-muted-foreground">{request.user.name}</p>
                                            </div>
                                            <span className="rounded bg-yellow-100 px-3 py-1 text-xs font-medium whitespace-nowrap text-yellow-800">
                                                Siap Dibayar
                                            </span>
                                        </div>

                                        <div className="mb-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                                            <div>
                                                <p className="text-muted-foreground">Metode</p>
                                                <p className="font-medium">
                                                    {request.payment_method === 'transfer' ? '🏦 Transfer' : '💵 Cash'}
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
                                                <p className="font-medium">{formatDate(request.created_at)}</p>
                                            </div>
                                        </div>

                                        {request.user.rekening && (
                                            <div className="mb-4 rounded bg-blue-50 p-3 text-sm">
                                                <p className="mb-1 text-muted-foreground">Rekening Penerima</p>
                                                <p className="font-medium">
                                                    {request.user.bank} - {request.user.rekening_name}
                                                </p>
                                                <p className="font-mono">
                                                    *** *** *** {request.user.rekening.slice(-4)}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePayment(request.id, request.payment_method)}
                                                disabled={processingId === request.id}
                                                className="flex-1 rounded-lg bg-green-600 py-2 text-center text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                                            >
                                                {processingId === request.id ? 'Memproses...' : 'Bayar Sekarang'}
                                            </button>
                                            <Link
                                                href={`/expenses/request/${request.id}`}
                                                className="flex-1 rounded-lg border border-border py-2 text-center text-sm font-medium text-foreground transition hover:bg-accent"
                                            >
                                                Detail
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-lg border border-border bg-card py-8 text-center">
                                    <p className="text-muted-foreground">Tidak ada pengajuan yang siap dibayar</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sudah Dibayar */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-foreground">Riwayat Pembayaran</h2>
                            <Link href="/expenses/payments-history" className="text-sm text-primary hover:underline">
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {paidRequests.length > 0 ? (
                                paidRequests.slice(0, 5).map((request) => (
                                    <Link
                                        key={request.id}
                                        href={`/expenses/request/${request.id}`}
                                        className="block rounded-lg border border-border bg-card p-4 transition hover:border-primary hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="mb-1 font-semibold text-foreground">{request.title}</h3>
                                                <p className="mb-2 text-sm text-muted-foreground">
                                                    {request.user.name}
                                                </p>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="font-medium">
                                                        {request.payment_method === 'transfer'
                                                            ? '🏦 Transfer'
                                                            : '💵 Cash'}
                                                    </span>
                                                    <span className="font-bold text-primary">
                                                        {formatCurrency(request.amount)}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {formatDate(request.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="rounded bg-green-100 px-3 py-1 text-xs font-medium whitespace-nowrap text-green-800">
                                                {request.status === 'closed' ? 'Selesai' : 'Sudah Dibayar'}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="rounded-lg border border-border bg-card py-8 text-center">
                                    <p className="text-muted-foreground">Belum ada pembayaran</p>
                                </div>
                            )}
                        </div>
                        {paidRequests.length > 5 && (
                            <div className="mt-4 text-center">
                                <Link
                                    href="/expenses/payments-history"
                                    className="inline-block rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
                                >
                                    Lihat {paidRequests.length - 5} Pembayaran Lainnya
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
