// resources/js/pages/expense/lpj/show.tsx

import AppLayout from '@/layouts/app/app-sidebar-layout';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    divisions: Array<{ id: number; name: string }>;
}

interface ExpenseRequest {
    id: number;
    title: string;
    amount: number;
    actual_amount: number;
    lpj_notes: string;
    lpj_attachment: string;
    lpj_submitted_at: string;
    user: User;
}

interface LPJShowPageProps {
    request: ExpenseRequest;
    auth: {
        user: User;
    };
}

export default function LPJShowPage({ request, auth }: LPJShowPageProps) {
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const difference = request.amount - request.actual_amount;

    const handleVerify = () => {
        setIsProcessing(true);
        router.post(
            `/expenses/lpj/${request.id}/verify`,
            {
                verification_notes: verificationNotes,
            },
            {
                onSuccess: () => {
                    setShowVerifyModal(false);
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <AppLayout>
            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="p-6">
                    <h1 className="mb-2 text-3xl font-bold text-foreground">Verifikasi LPJ</h1>
                    <p className="text-muted-foreground">Detail Laporan Pertanggungjawaban #{request.id}</p>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 p-4 md:p-6">
                    {/* Request Info */}
                    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
                        <h2 className="text-lg font-bold text-foreground">Informasi Pengajuan</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Judul</p>
                                <p className="font-medium">{request.title}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Pemohon</p>
                                <p className="font-medium">{request.user.name}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Divisi</p>
                                <p className="font-medium">{request.user.divisions.map((d) => d.name).join(', ')}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Tanggal Submit LPJ</p>
                                <p className="font-medium">{formatDateTime(request.lpj_submitted_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Amount Comparison */}
                    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
                        <h2 className="text-lg font-bold text-foreground">Perbandingan Nominal</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-lg bg-blue-50 p-4">
                                <p className="mb-1 text-xs text-blue-600">Advance/Kasbon</p>
                                <p className="text-2xl font-bold text-blue-900">{formatCurrency(request.amount)}</p>
                            </div>
                            <div className="rounded-lg bg-green-50 p-4">
                                <p className="mb-1 text-xs text-green-600">Pengeluaran Aktual</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {formatCurrency(request.actual_amount)}
                                </p>
                            </div>
                            <div
                                className={`rounded-lg p-4 ${difference > 0 ? 'bg-red-50' : difference < 0 ? 'bg-yellow-50' : 'bg-gray-50'}`}
                            >
                                <p
                                    className={`mb-1 text-xs ${difference > 0 ? 'text-red-600' : difference < 0 ? 'text-yellow-600' : 'text-gray-600'}`}
                                >
                                    {difference > 0
                                        ? 'Kelebihan (Dikembalikan)'
                                        : difference < 0
                                          ? 'Kekurangan (Ditambah)'
                                          : 'Selisih'}
                                </p>
                                <p
                                    className={`text-2xl font-bold ${difference > 0 ? 'text-red-900' : difference < 0 ? 'text-yellow-900' : 'text-gray-900'}`}
                                >
                                    {difference > 0 ? '+' : ''}
                                    {formatCurrency(difference)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* LPJ Details */}
                    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
                        <h2 className="text-lg font-bold text-foreground">Detail LPJ</h2>

                        <div>
                            <p className="mb-2 text-xs text-muted-foreground">Keterangan/Rincian Pengeluaran</p>
                            <div className="rounded-lg bg-secondary/30 p-4">
                                <p className="text-sm whitespace-pre-wrap text-foreground">{request.lpj_notes}</p>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-xs text-muted-foreground">Bukti Pengeluaran</p>
                            <a
                                href={`/storage/${request.lpj_attachment}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary/50"
                            >
                                📎 Lihat Lampiran
                            </a>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-4 text-lg font-bold text-foreground">Aksi Verifikasi</h2>
                        <button
                            onClick={() => setShowVerifyModal(true)}
                            className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:opacity-90"
                        >
                            ✓ Verifikasi Request
                        </button>
                    </div>
                </div>

                {/* Verify Modal */}
                {showVerifyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md space-y-4 rounded-lg bg-card p-6">
                            <h2 className="text-lg font-bold text-foreground">Konfirmasi Verifikasi LPJ</h2>

                            <div className="space-y-2 rounded-lg bg-secondary/30 p-4">
                                <p className="text-sm font-medium text-foreground">Ringkasan:</p>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Advance:</span>
                                        <span className="font-medium">{formatCurrency(request.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Aktual:</span>
                                        <span className="font-medium">{formatCurrency(request.actual_amount)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-border pt-1">
                                        <span className="text-muted-foreground">Selisih:</span>
                                        <span
                                            className={`font-bold ${difference > 0 ? 'text-red-600' : difference < 0 ? 'text-green-600' : 'text-foreground'}`}
                                        >
                                            {difference > 0 ? '+' : ''}
                                            {formatCurrency(difference)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {difference !== 0 && (
                                <div className="rounded-lg bg-yellow-50 p-4">
                                    <p className="text-sm text-yellow-900">
                                        {difference > 0
                                            ? '⚠️ Kelebihan dana harus dikembalikan oleh pemohon'
                                            : '⚠️ Kekurangan dana akan diproses pembayarannya'}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Catatan Verifikasi (Opsional)
                                </label>
                                <textarea
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                    placeholder="Tambahkan catatan jika perlu..."
                                    rows={3}
                                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    disabled={isProcessing}
                                />
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={handleVerify}
                                    disabled={isProcessing}
                                    className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                                >
                                    {isProcessing ? 'Memproses...' : '✓ Verifikasi'}
                                </button>

                                <button
                                    onClick={() => {
                                        setShowVerifyModal(false);
                                        setVerificationNotes('');
                                    }}
                                    disabled={isProcessing}
                                    className="w-full rounded-lg border border-border px-4 py-2 font-medium text-foreground transition hover:bg-accent disabled:opacity-50"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
