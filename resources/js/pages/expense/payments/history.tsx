// resources/js/pages/expense/payments/history.tsx

import AppLayout from '@/layouts/app/app-sidebar-layout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    position: string;
}

interface Payment {
    id: number;
    amount: number;
    payment_method: string;
    status: string;
    reference_number?: string;
    paid_at: string;
    request: {
        id: number;
        title: string;
        type: string;
        user: User;
    };
}

interface HistoryPageProps {
    auth: {
        user: User;
    };
    payments: {
        data: Payment[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
}

export default function PaymentHistoryPage({ auth, payments }: HistoryPageProps) {
    // Calculate statistics
    const totalAmount = payments.data.reduce((acc, p) => acc + p.amount, 0);
    const transferCount = payments.data.filter((p) => p.payment_method === 'transfer').length;
    const cashCount = payments.data.filter((p) => p.payment_method === 'cash').length;

    return (
        <AppLayout>
            <Head title="Riwayat Pembayaran" />

            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Riwayat Pembayaran</h1>
                            <p className="mt-1 text-muted-foreground">Daftar semua pembayaran yang telah diproses</p>
                        </div>
                        <Link
                            href="/expenses/payments"
                            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90"
                        >
                            Kembali ke Dashboard
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 p-4 md:p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Total Pembayaran</p>
                            <p className="text-2xl font-bold text-foreground">{payments.data.length}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Total Nominal</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(totalAmount)}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Transfer</p>
                            <p className="text-2xl font-bold text-foreground">{transferCount}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Cash</p>
                            <p className="text-2xl font-bold text-foreground">{cashCount}</p>
                        </div>
                    </div>

                    {/* Payment List */}
                    <div className="rounded-lg border border-border bg-card">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary/30">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                            ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                            Pengajuan
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                            Pemohon
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                            Nominal
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                            Metode
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                            Tanggal
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {payments.data.length > 0 ? (
                                        payments.data.map((payment) => (
                                            <tr key={payment.id} className="transition hover:bg-secondary/20">
                                                <td className="px-4 py-3 font-mono text-sm">#{payment.id}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {payment.request.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {payment.request.type === 'reimbursement'
                                                                ? 'Reimbursement'
                                                                : 'Advance'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">
                                                    {payment.request.user.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-primary">
                                                    {formatCurrency(payment.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className="inline-flex items-center gap-1">
                                                        {payment.payment_method === 'transfer' ? '🏦' : '💵'}{' '}
                                                        {payment.payment_method === 'transfer' ? 'Transfer' : 'Cash'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {formatDate(payment.paid_at)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <Link
                                                        href={`/expenses/request/${payment.request.id}`}
                                                        className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
                                                    >
                                                        Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                Belum ada pembayaran yang diproses
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {payments.links.length > 3 && (
                            <div className="flex justify-center gap-1 border-t border-border px-4 py-3">
                                {payments.links.map((link, index) => {
                                    // Skip if no URL (disabled button)
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={index}
                                                className="cursor-not-allowed rounded bg-secondary/30 px-3 py-1 text-sm text-muted-foreground opacity-50"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`rounded px-3 py-1 text-sm transition ${
                                                link.active
                                                    ? 'bg-primary font-medium text-primary-foreground'
                                                    : 'bg-secondary/30 text-foreground hover:bg-secondary/50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
