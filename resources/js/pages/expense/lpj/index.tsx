// resources/js/pages/expense/lpj/index.tsx

import AppLayout from '@/layouts/app/app-sidebar-layout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    divisions: Array<{ id: number; name: string }>;
}

interface ExpenseRequest {
    id: number;
    title: string;
    amount: number;
    actual_amount: number;
    lpj_submitted_at: string;
    user: User;
}

interface LPJIndexPageProps {
    auth: {
        user: User;
    };
    requests: ExpenseRequest[];
}

export default function LPJIndexPage({ auth, requests }: LPJIndexPageProps) {
    return (
        <AppLayout>
            <Head title="Verifikasi LPJ" />

            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Verifikasi LPJ</h1>
                            <p className="mt-1 text-muted-foreground">
                                Verifikasi laporan pertanggungjawaban advance/kasbon
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 p-4 md:p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-1 text-xs text-muted-foreground">Menunggu Verifikasi</p>
                            <p className="text-2xl font-bold text-yellow-600">{requests.length}</p>
                        </div>
                    </div>

                    {/* LPJ List */}
                    <div className="space-y-3">
                        {requests.length > 0 ? (
                            requests.map((request) => {
                                const difference = request.actual_amount - request.amount;
                                return (
                                    <Link key={request.id} href={`/expenses/lpj/${request.id}`}>
                                        <div className="rounded-lg border border-border bg-card p-4 transition hover:shadow-md">
                                            <div className="mb-3 flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="mb-1 font-semibold text-foreground">
                                                        {request.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {request.user.name} (
                                                        {request.user.divisions.map((d) => d.name).join(', ')})
                                                    </p>
                                                </div>
                                                <span className="rounded bg-yellow-100 px-3 py-1 text-xs font-medium whitespace-nowrap text-yellow-800">
                                                    Menunggu Verifikasi
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm md:grid-cols-4">
                                                <div>
                                                    <p className="text-muted-foreground">Advance</p>
                                                    <p className="font-bold text-primary">
                                                        {formatCurrency(request.amount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Aktual</p>
                                                    <p className="font-bold text-foreground">
                                                        {formatCurrency(request.actual_amount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Selisih</p>
                                                    <p
                                                        className={`font-bold ${difference > 0 ? 'text-red-600' : difference < 0 ? 'text-green-600' : 'text-foreground'}`}
                                                    >
                                                        {difference > 0 ? '+' : ''}
                                                        {formatCurrency(difference)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Tanggal Submit</p>
                                                    <p className="font-medium">
                                                        {formatDate(request.lpj_submitted_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="rounded-lg border border-border bg-card py-12 text-center">
                                <p className="text-muted-foreground">Tidak ada LPJ yang menunggu verifikasi</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
