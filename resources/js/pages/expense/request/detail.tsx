// resources/js/pages/expense/request/detail.tsx

import { ApprovalTimeline } from '@/components/request/approval-timeline';
import { PrintForm } from '@/components/request/print-form';
import AppLayout from '@/layouts/expense-app-layout';
import { formatCurrency } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    position: string;
    phone?: string;
    rekening?: string;
    bank?: string;
    rekening_name?: string;
    divisions: Array<{ id: number; name: string }>;
}

interface Approval {
    id: number;
    approver_position: string;
    status: string;
    notes?: string;
    approved_at?: string;
    approver?: {
        name: string;
    };
}

interface ExpenseRequest {
    id: number;
    user_id: number;
    title: string;
    description: string;
    amount: number;
    actual_amount?: number;
    status: string;
    type: string;
    category: string;
    payment_method: string;
    attachments?: string[];
    created_at: string;
    updated_at: string;
    paid_at?: string;
    head_approved_at?: string;
    director_approved_at?: string;
    lpj_attachment?: string;
    lpj_submitted_at?: string;
    lpj_verified_at?: string;
    user: User;
    approvals: Approval[];
}

interface DetailPageProps {
    request: ExpenseRequest;
    canApprove: boolean;
    canPay: boolean;
    auth: {
        user: User;
    };
}

export default function RequestDetailPage({ request, canApprove, canPay, auth }: DetailPageProps) {
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalNotes, setApprovalNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!request) {
        return (
            <AppLayout>
                <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <p className="mb-4 text-xl text-muted-foreground">Pengajuan tidak ditemukan</p>
                        <button
                            onClick={() => router.visit('/expenses/request')}
                            className="text-primary hover:underline"
                        >
                            Kembali ke Daftar Pengajuan
                        </button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const requester = request.user;
    const isOwner = request.user_id === auth.user.id;

    const handleApprove = () => {
        setIsProcessing(true);
        router.post(
            `/expenses/approvals/${request.id}/approve`,
            {
                notes: approvalNotes,
            },
            {
                onSuccess: () => {
                    setShowApprovalModal(false);
                    setApprovalNotes('');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            alert('Alasan penolakan harus diisi!');
            return;
        }

        setIsProcessing(true);
        router.post(
            `/expenses/approvals/${request.id}/reject`,
            {
                notes: rejectionReason,
            },
            {
                onSuccess: () => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handlePayment = () => {
        setIsProcessing(true);
        router.post(
            `/expenses/payments/${request.id}/process`,
            {
                payment_method: request.payment_method,
                reference_number: `PAY-${Date.now()}`,
            },
            {
                onSuccess: () => {
                    setShowPaymentModal(false);
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
                    <h1 className="mb-2 text-3xl font-bold text-foreground">{request.title}</h1>
                    <p className="text-muted-foreground">Detail Pengajuan #{request.id}</p>
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
                                <p className="inline-block rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                    {request.status}
                                </p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Tipe</p>
                                <p className="text-sm font-medium">
                                    {request.type === 'reimbursement' ? '📄 Reimbursement' 
                                    : request.type === 'advance' ? '💵 Advance/Kasbon' 
                                    : '📋 Bill'}
                                </p>
                            </div>
                        </div>

                        {/* LPJ Info if exists */}
                        {request.type === 'advance' && request.actual_amount && (
                            <div className="rounded-lg bg-purple-50 p-4">
                                <p className="mb-2 text-sm font-semibold text-purple-900">Informasi LPJ</p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-purple-600">Nominal Aktual</p>
                                        <p className="font-bold text-purple-900">
                                            {formatCurrency(request.actual_amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-purple-600">Selisih</p>
                                        <p
                                            className={`font-bold ${
                                                request.actual_amount - request.amount > 0
                                                    ? 'text-red-600'
                                                    : request.actual_amount - request.amount < 0
                                                      ? 'text-green-600'
                                                      : 'text-purple-900'
                                            }`}
                                        >
                                            {request.actual_amount - request.amount > 0 ? '+' : ''}
                                            {formatCurrency(request.actual_amount - request.amount)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                {requester.phone && <p className="text-sm text-muted-foreground">{requester.phone}</p>}
                                <p className="text-sm text-muted-foreground">
                                    Divisi: {requester.divisions.map((div) => div.name).join(', ')}
                                </p>
                                {requester.rekening && (
                                    <div className="mt-2 border-t border-border/50 pt-2">
                                        <p className="text-xs text-muted-foreground">Rekening: {requester.bank}</p>
                                        <p className="font-mono text-sm">{requester.rekening_name}</p>
                                        <p className="font-mono text-sm">*** *** *** {requester.rekening.slice(-4)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline using Component */}
                        <ApprovalTimeline request={request} />

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

                                {canApprove &&
                                    request.status !== 'rejected' &&
                                    request.status !== 'paid' &&
                                    request.status !== 'closed' && (
                                        <>
                                            <button
                                                onClick={() => setShowApprovalModal(true)}
                                                className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:opacity-90"
                                            >
                                                ✓ Setujui
                                            </button>
                                            <button
                                                onClick={() => setShowRejectModal(true)}
                                                className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-600 transition hover:bg-red-50"
                                            >
                                                ✕ Tolak
                                            </button>
                                        </>
                                    )}

                                {canPay && request.status !== 'paid' && request.status !== 'closed' && (
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:opacity-90"
                                    >
                                        💳 Proses Pembayaran
                                    </button>
                                )}

                                {/* LPJ Submit Button - Only for advance/kasbon owner after paid */}
                                {request.type === 'advance' &&
                                    request.status === 'paid' &&
                                    !request.lpj_submitted_at &&
                                    isOwner && (
                                        <Link
                                            href={`/expenses/lpj/${request.id}/create`}
                                            className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:opacity-90"
                                        >
                                            📋 Submit LPJ
                                        </Link>
                                    )}

                                {/* LPJ Status Indicators */}
                                {request.lpj_submitted_at && !request.lpj_verified_at && (
                                    <span className="rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
                                        ⏳ Menunggu Verifikasi LPJ
                                    </span>
                                )}

                                {/* {Open LPJ Attachment} */}
                                    {request.lpj_attachment && (
                                    <a
                                        href={`/storage/${request.lpj_attachment}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center rounded-lg border border-border bg-secondary/30 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary/50"
                                    >
                                        📎 Lampiran LPJ
                                    </a>
                                    )}
                                
                                {/* {Open Attachment if exist} */}
                                    {request.attachments?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {request.attachments.map((path, index) => (
                                            <a
                                                key={index}
                                                href={`/storage/${path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center rounded-lg border border-border bg-secondary/30 px-4 py-2 text-sm font-medium hover:bg-secondary/50"
                                            >
                                                📎 Lampiran {index + 1}
                                            </a>
                                            ))}
                                        </div>
                                        )}

                                    {/* {Edit Request Button} */}
                                        {isOwner && request.status === 'rejected' && (
                                            <Link
                                                href={`/expenses/request/${request.id}/edit`}
                                                className="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-white transition hover:opacity-90"
                                            >
                                                ✏️ Edit Pengajuan
                                            </Link>
                                        )}

                                {request.status === 'closed' && (
                                    <span className="rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
                                        ✓ Request Ditutup
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Print Modal */}
                    {showPrintModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            {/* Container Modal Putih */}
                            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-card p-6 shadow-xl relative"> 
                                
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-foreground">Preview Cetak</h2>
                                    <button
                                        onClick={() => setShowPrintModal(false)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        ✕
                                    </button>
                                </div>
                                
                                {/* Component Form */}
                                <PrintForm request={request} />
                            </div>
                        </div>
                    )}

                    {/* Approval Modal */}
                    {showApprovalModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="w-full max-w-md space-y-4 rounded-lg bg-card p-6">
                                <h2 className="text-lg font-bold text-foreground">Konfirmasi Persetujuan</h2>

                                <div className="space-y-2 rounded-lg bg-secondary/30 p-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Pengajuan:</span>
                                        <span className="font-medium">{request.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Pemohon:</span>
                                        <span className="font-medium">{requester.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Nominal:</span>
                                        <span className="font-bold text-primary">{formatCurrency(request.amount)}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Catatan (Opsional)
                                    </label>
                                    <textarea
                                        value={approvalNotes}
                                        onChange={(e) => setApprovalNotes(e.target.value)}
                                        placeholder="Tambahkan catatan jika perlu..."
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                        disabled={isProcessing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Memproses...' : '✓ Setujui Pengajuan'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowApprovalModal(false);
                                            setApprovalNotes('');
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

                    {/* Reject Modal */}
                    {showRejectModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="w-full max-w-md space-y-4 rounded-lg bg-card p-6">
                                <h2 className="text-lg font-bold text-foreground">Konfirmasi Penolakan</h2>

                                <div className="space-y-2 rounded-lg bg-red-50 p-4">
                                    <p className="text-sm text-red-900">
                                        Anda akan menolak pengajuan ini. Proses approval akan dihentikan.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Alasan Penolakan <span className="text-red-600">*</span>
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Masukkan alasan penolakan..."
                                        rows={4}
                                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                                        disabled={isProcessing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={handleReject}
                                        disabled={isProcessing || !rejectionReason.trim()}
                                        className="w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Memproses...' : '✕ Tolak Pengajuan'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowRejectModal(false);
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

                                {request.type === 'advance' && (
                                    <div className="rounded-lg bg-yellow-50 p-4">
                                        <p className="text-sm text-yellow-900">
                                            ℹ️ Setelah pembayaran, pemohon harus submit LPJ (Laporan Pertanggungjawaban)
                                        </p>
                                    </div>
                                )}

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
