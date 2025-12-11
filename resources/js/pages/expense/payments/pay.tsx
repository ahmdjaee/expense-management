import AppLayout from '@/layouts/app/app-sidebar-layout';
import { formatCurrency } from '@/lib/utils';
import { router } from '@inertiajs/react';
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

interface PayPageProps {
    request: ExpenseRequest;
    auth: {
        user: User;
    };
}

export default function PayPage({ request, auth }: PayPageProps) {
    const [paymentMethod, setPaymentMethod] = useState(request.payment_method);
    const [referenceNumber, setReferenceNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = () => {
        setIsProcessing(true);
        router.post(
            `/expenses/payments/${request.id}/process`,
            {
                payment_method: paymentMethod,
                reference_number: referenceNumber,
                notes: notes,
            },
            {
                onSuccess: () => {
                    // Redirect to payments index
                    router.visit('/expenses/payments');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <AppLayout>
            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="bg-linear-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                    <h1 className="mb-2 text-3xl font-bold">Proses Pembayaran</h1>
                    <p className="opacity-90">Proses pembayaran reimbursement dan kasbon</p>
                </div>

                {/* Content */}
                <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-4 md:p-6">
                    {/* Request Details */}
                    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
                        <h2 className="text-lg font-bold text-foreground">Detail Pengajuan</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Pengajuan</p>
                                <p className="font-medium">{request.title}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Pemohon</p>
                                <p className="font-medium">{request.user.name}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Nominal</p>
                                <p className="font-bold text-primary">{formatCurrency(request.amount)}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Tipe</p>
                                <p className="font-medium">
                                    {request.type === 'reimbursement' ? 'Reimbursement' : 'Advance/Kasbon'}
                                </p>
                            </div>
                        </div>

                        {request.user.rekening && (
                            <div className="rounded bg-blue-50 p-3 text-sm">
                                <p className="mb-1 text-muted-foreground">Rekening Penerima</p>
                                <p className="font-medium">
                                    {request.user.bank} - {request.user.rekening_name}
                                </p>
                                <p className="font-mono">*** *** *** {request.user.rekening.slice(-4)}</p>
                            </div>
                        )}
                    </div>

                    {/* Payment Form */}
                    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
                        <h2 className="text-lg font-bold text-foreground">Informasi Pembayaran</h2>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">
                                Metode Pembayaran <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                disabled={isProcessing}
                            >
                                <option value="cash">Cash</option>
                                <option value="transfer">Transfer Bank</option>
                            </select>
                        </div>

                        {paymentMethod === 'transfer' && (
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Nomor Referensi <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    placeholder="Contoh: TRF-20230601-001"
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    disabled={isProcessing}
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">Catatan (Opsional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Tambahkan catatan pembayaran..."
                                rows={3}
                                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                disabled={isProcessing}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing || (paymentMethod === 'transfer' && !referenceNumber.trim())}
                                className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                            >
                                {isProcessing ? 'Memproses...' : 'Proses Pembayaran'}
                            </button>
                            <button
                                onClick={() => router.visit('/expenses/payments')}
                                disabled={isProcessing}
                                className="flex-1 rounded-lg border border-border px-4 py-2 font-medium text-foreground transition hover:bg-accent disabled:opacity-50"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
