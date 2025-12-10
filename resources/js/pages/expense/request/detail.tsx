import { PrintForm } from '@/components/request/print-form';
import AppLayout from '@/layouts/expense-app-layout';
import { ExpenseRequest } from '@/lib/types';
import { formatCurrency, formatDateTime, getStatusBadgeColor, getStatusLabel } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function RequestDetailPage({ request }: { request: ExpenseRequest }) {
    const { auth } = usePage<{ auth: { user: { position: string; divisions: [{ id: number; name: string }] } } }>()
        .props; // Simulasi user login sebagai 'head'

    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!request) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                    <p className="mb-4 text-xl text-muted-foreground">Pengajuan tidak ditemukan</p>
                    <button onClick={() => router.visit('/requests')} className="text-primary hover:underline">
                        Kembali ke Daftar Pengajuan
                    </button>
                </div>
            </div>
        );
    }

    const requester = request.user;
    // const director = mockUsers.find((u) => u.role === 'director');

    const isHead =
        auth.user?.position === 'head' &&
        auth.user?.divisions.some((div: { id: number; name: string }) =>
            request.user?.divisions.some((reqDiv: { id: number; name: string }) => div.id === reqDiv.id),
        );
    const isDirector = auth.user?.position === 'director';
    const isFinance = auth.user?.position === 'finance';
    const canApproveAsHead = isHead && request.status === 'submitted';
    const canApproveAsDirector = isDirector && request.status === 'head_approved';
    const canPay = isFinance && request.status === 'director_approved';

    const handleApprove = async () => {};

    const handleReject = async () => {};

    const handlePayment = async () => {};

    return (
        <AppLayout>
            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="p-6 text-black md:rounded-bl-2xl">
                    <h1 className="mb-2 text-3xl font-bold">{request.title}</h1>
                    <p className="opacity-90">Detail Pengajuan #{request.id}</p>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 p-4 md:p-6">
                    {/* Main Card */}
                    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
                        {/* Amount & Status */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Nominal</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(request.amount)}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Status</p>
                                <p
                                    className={`inline-block rounded px-3 py-1 text-sm font-medium ${getStatusBadgeColor(request.status)}`}
                                >
                                    {getStatusLabel(request.status)}
                                </p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Tipe</p>
                                <p className="text-sm font-medium">
                                    {request.type === 'reimbursement' ? '📄 Reimbursement' : '💵 Advance/Kasbon'}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <p className="mb-2 text-xs text-muted-foreground">Deskripsi</p>
                            <p className="text-foreground">{request.description}</p>
                        </div>

                        {/* Requester Info */}
                        <div className="rounded-lg bg-secondary/30 p-4">
                            <p className="mb-2 text-xs text-muted-foreground">Pemohon</p>
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">{requester.name}</p>
                                <p className="text-sm text-muted-foreground">{requester.email}</p>
                                <p className="text-sm text-muted-foreground">{requester.phone}</p>
                                <p className="text-sm text-muted-foreground">
                                    Divisi: {requester.divisions.map((div) => div.name).join(', ')}
                                </p>
                                {requester.bankAccount && (
                                    <div className="mt-2 border-t border-border/50 pt-2">
                                        <p className="text-xs text-muted-foreground">Rekening: {requester.bankName}</p>
                                        <p className="font-mono text-sm">{requester.accountHolder}</p>
                                        <p className="font-mono text-sm">
                                            *** *** *** {requester.bankAccount.slice(-4)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-foreground">Riwayat Persetujuan</p>
                            <div className="space-y-3">
                                {/* Submission */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                        <div className="h-12 w-0.5 bg-gray-200"></div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Pengajuan Dibuat</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(request.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Head Approval */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`h-3 w-3 rounded-full ${request.head_approved_at ? 'bg-green-500' : 'bg-gray-300'}`}
                                        ></div>
                                        <div className="h-12 w-0.5 bg-gray-200"></div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Persetujuan Head</p>
                                        {request.head_approved_at ? (
                                            <p className="text-sm text-muted-foreground">
                                                {formatDateTime(request.head_approved_at)}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-yellow-600">Menunggu persetujuan</p>
                                        )}
                                    </div>
                                </div>

                                {/* Director Approval */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`h-3 w-3 rounded-full ${request.director_approved_at ? 'bg-green-500' : 'bg-gray-300'}`}
                                        ></div>
                                        <div className="h-12 w-0.5 bg-gray-200"></div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Persetujuan Direktur</p>
                                        {request.director_approved_at ? (
                                            <p className="text-sm text-muted-foreground">
                                                {formatDateTime(request.director_approved_at)}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-yellow-600">Menunggu persetujuan</p>
                                        )}
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`h-3 w-3 rounded-full ${request.paid_at ? 'bg-green-500' : 'bg-gray-300'}`}
                                        ></div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Pembayaran</p>
                                        {request.paid_at ? (
                                            <p className="text-sm text-muted-foreground">
                                                {formatDateTime(request.paid_at)}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-yellow-600">Menunggu pembayaran</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <p className="mb-2 text-sm font-semibold text-foreground">Metode Pembayaran</p>
                            <p className="text-sm">
                                {request.payment_method === 'transfer'
                                    ? '🏦 Transfer ke Rekening Bank'
                                    : '💵 Pembayaran Cash'}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-border pt-4">
                            <p className="mb-3 text-sm font-semibold text-foreground">Aksi</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setShowPrintModal(!showPrintModal)}
                                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90"
                                >
                                    🖨️ Cetak Form
                                </button>

                                {canApproveAsHead && (
                                    <button
                                        onClick={() => setShowApprovalModal(true)}
                                        className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:opacity-90"
                                    >
                                        ✓ Setujui (Head)
                                    </button>
                                )}

                                {canApproveAsDirector && (
                                    <button
                                        onClick={() => setShowApprovalModal(true)}
                                        className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:opacity-90"
                                    >
                                        ✓ Setujui (Direktur)
                                    </button>
                                )}

                                {canPay && (
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:opacity-90"
                                    >
                                        💳 Proses Pembayaran
                                    </button>
                                )}

                                {(canApproveAsHead || canApproveAsDirector) && (
                                    <button
                                        onClick={() => setShowApprovalModal(true)}
                                        className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-600 transition hover:bg-red-50"
                                    >
                                        ✕ Tolak
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Print Modal */}
                    {showPrintModal && (
                        <div className="rounded-lg border border-border bg-card p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-foreground">Preview Cetak</h2>
                                <button
                                    onClick={() => setShowPrintModal(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    ✕
                                </button>
                            </div>
                            <PrintForm request={request} />
                        </div>
                    )}

                    {/* Approval Modal */}
                    {showApprovalModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="w-full max-w-md space-y-4 rounded-lg bg-card p-6">
                                <h2 className="text-lg font-bold text-foreground">Keputusan Persetujuan</h2>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Memproses...' : '✓ Setujui Pengajuan'}
                                    </button>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            Alasan Penolakan (jika ditolak)
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Masukkan alasan penolakan..."
                                            rows={3}
                                            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                            disabled={isProcessing}
                                        />
                                    </div>

                                    <button
                                        onClick={handleReject}
                                        disabled={isProcessing || !rejectionReason.trim()}
                                        className="w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Memproses...' : '✕ Tolak Pengajuan'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowApprovalModal(false);
                                            setRejectionReason('');
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

                    {/* Payment Modal */}
                    {showPaymentModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="w-full max-w-md space-y-4 rounded-lg bg-card p-6">
                                <h2 className="text-lg font-bold text-foreground">Konfirmasi Pembayaran</h2>

                                <div className="space-y-2 rounded-lg bg-secondary/30 p-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Penerima:</span>
                                        <span className="font-medium">{requester.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Nominal:</span>
                                        <span className="font-bold text-primary">{formatCurrency(request.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Metode:</span>
                                        <span className="font-medium">
                                            {request.payment_method === 'transfer' ? 'Transfer Bank' : 'Cash'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={handlePayment}
                                        disabled={isProcessing}
                                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Memproses...' : '✓ Konfirmasi Pembayaran'}
                                    </button>

                                    <button
                                        onClick={() => setShowPaymentModal(false)}
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
            </div>
        </AppLayout>
    );
}
