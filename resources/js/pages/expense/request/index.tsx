import { RequestCard } from '@/components/request/request-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/expense-app-layout';
import { ExpenseRequest } from '@/lib/types';
import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function RequestsPage({ requests }: { requests: ExpenseRequest[] }) {
    const [filterType, setFilterType] = useState<'all' | 'reimbursement' | 'advance'>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showSuccess, setShowSuccess] = useState(false);

    const filtered = requests.filter((r) => {
        const typeMatch = filterType === 'all' || r.type === filterType;
        const statusMatch = filterStatus === 'all' || r.status === filterStatus;
        return typeMatch && statusMatch;
    });

    return (
        <AppLayout>
            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                 <div className="px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Pengajuan Saya</h1>
                            <p className="mt-1 text-muted-foreground">Kelola semua pengajuan tagihan dan kasbon Anda</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 p-4 md:p-6">
                    {/* Success Alert */}
                    {showSuccess && (
                        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-900">
                            <span>✓ Pengajuan berhasil dibuat!</span>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="text-green-900 hover:text-green-800"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Tipe</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as any)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                >
                                    <option value="all">Semua</option>
                                    <option value="reimbursement">Reimbursement</option>
                                    <option value="advance">Advance</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                >
                                    <option value="all">Semua</option>
                                    <option value="draft">Draft</option>
                                    <option value="submitted">Menunggu Approval</option>
                                    <option value="head_approved">Disetujui Head</option>
                                    <option value="director_approved">Disetujui Direktur</option>
                                    <option value="paid">Sudah Dibayar</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>
                            <Link className="mt-auto" href="/expenses/request/new?type=reimbursement">
                                <Button className="w-full">
                                    <Plus />
                                    Reimbursement
                                </Button>
                            </Link>
                            <Link className="mt-auto" href="/expenses/request/new?type=advance">
                                <Button className="w-full">
                                    <Plus />
                                    Advance
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Request List */}
                    <div className="space-y-3">
                        {filtered.length > 0 ? (
                            filtered.map((request) => <RequestCard key={request.id} request={request} />)
                        ) : (
                            <div className="rounded-lg border border-border bg-card py-12 text-center">
                                <p className="mb-4 text-muted-foreground">Tidak ada pengajuan sesuai filter</p>
                                <div className="flex justify-center gap-2">
                                    <Link
                                        href="/expenses/request/new?type=reimbursement"
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        Buat Reimbursement
                                    </Link>
                                    <span className="text-muted-foreground">atau</span>
                                    <Link
                                        href="/expenses/request/new?type=advance"
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        Buat Advance
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
