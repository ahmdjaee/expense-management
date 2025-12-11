import { ApprovalTimeline } from '@/components/request/approval-timeline';
import AppLayout from '@/layouts/app/app-sidebar-layout';
import { formatCurrency } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    position: string;
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
    title: string;
    description: string;
    amount: number;
    status: string;
    type: string;
    category: string;
    payment_method: string;
    created_at: string;
    paid_at?: string;
    head_approved_at?: string;
    director_approved_at?: string;
    user: User;
    approvals: Approval[];
}

interface ShowApprovalPageProps {
    request: ExpenseRequest;
    auth: {
        user: User;
    };
}

export default function ShowApprovalPage({ request, auth }: ShowApprovalPageProps) {
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalNotes, setApprovalNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const user = auth.user;
    const canApprove = user.position === 'head' || user.position === 'direktur';

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
            alert('Alasan penolakan harus diisi');
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
                                <p className="font-semibold text-foreground">{request.user.name}</p>
                                <p className="text-sm text-muted-foreground">{request.user.email}</p>
                                <p className="text-sm text-muted-foreground">
                                    Divisi: {request.user.divisions.map((div) => div.name).join(', ')}
                                </p>
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
                        {canApprove && request.status !== 'rejected' && request.status !== 'paid' && (
                            <div className="border-t border-border pt-4">
                                <p className="mb-3 text-sm font-semibold text-foreground">Aksi</p>
                                <div className="flex flex-wrap gap-2">
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
                                </div>
                            </div>
                        )}
                    </div>

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
                                        <span className="font-medium">{request.user.name}</span>
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
                </div>
            </div>
        </AppLayout>
    );
}
