// resources/js/pages/expense/lpj/create.tsx

import AppLayout from '@/layouts/expense-app-layout';
import { formatCurrency } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface ExpenseRequest {
    id: number;
    title: string;
    amount: number;
    type: string;
    user: User;
}

interface LPJCreatePageProps {
    request: ExpenseRequest;
    auth: {
        user: User;
    };
}

export default function LPJCreatePage({ request, auth }: LPJCreatePageProps) {
    const [actualAmount, setActualAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const difference = actualAmount ? parseFloat(actualAmount) - request.amount : 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!attachment) {
            alert('Bukti pengeluaran harus dilampirkan');
            return;
        }

        setIsProcessing(true);

        const formData = new FormData();
        formData.append('actual_amount', actualAmount);
        formData.append('lpj_notes', notes);
        formData.append('lpj_attachment', attachment);

        router.post(`/expenses/lpj/${request.id}/submit`, formData, {
            onFinish: () => setIsProcessing(false),
        });
    };

    return (
        <AppLayout>
            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="bg-linear-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                    <h1 className="mb-2 text-3xl font-bold">Laporan Pertanggungjawaban (LPJ)</h1>
                    <p className="opacity-90">Submit bukti pengeluaran untuk advance/kasbon</p>
                </div>

                {/* Content */}
                <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-4 md:p-6">
                    {/* Request Info */}
                    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
                        <h2 className="text-lg font-bold text-foreground">Informasi Pengajuan</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Judul</p>
                                <p className="font-medium">{request.title}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Nominal Advance</p>
                                <p className="font-bold text-primary">{formatCurrency(request.amount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* LPJ Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
                        <h2 className="text-lg font-bold text-foreground">Form LPJ</h2>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">
                                Nominal Pengeluaran Aktual <span className="text-red-600">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="min-w-fit font-medium text-muted-foreground">Rp</span>
                                <input
                                    type="number"
                                    value={actualAmount}
                                    onChange={(e) => setActualAmount(e.target.value)}
                                    placeholder="0"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    disabled={isProcessing}
                                />
                            </div>
                            {actualAmount && parseFloat(actualAmount) > 0 && (
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm font-semibold text-primary">
                                        Total Pengeluaran: {formatCurrency(parseFloat(actualAmount))}
                                    </p>
                                    {difference !== 0 && (
                                        <p
                                            className={`text-sm font-semibold ${difference > 0 ? 'text-red-600' : 'text-green-600'}`}
                                        >
                                            {difference > 0 ? 'Kekurangan' : 'Kelebihan'}:{' '}
                                            {formatCurrency(Math.abs(difference))}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">
                                Keterangan/Rincian Pengeluaran <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Jelaskan rincian pengeluaran Anda..."
                                rows={5}
                                required
                                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                disabled={isProcessing}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">
                                Bukti Pengeluaran <span className="text-red-600">*</span>
                            </label>
                            <div
                                className="cursor-pointer rounded-lg border-2 border-dashed border-border p-6 text-center transition-all hover:border-primary hover:bg-secondary/30"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium text-foreground">Upload bukti pengeluaran</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {attachment ? attachment.name : 'Klik untuk memilih file'}
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    disabled={isProcessing}
                                />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Format: PDF, JPG, PNG (Max 10MB). Lampirkan nota, kwitansi, atau bukti pembayaran
                                lainnya.
                            </p>
                        </div>

                        {difference !== 0 && actualAmount && (
                            <div className="rounded-lg bg-yellow-50 p-4">
                                <p className="text-sm font-medium text-yellow-900">⚠️ Informasi Penting:</p>
                                <p className="mt-1 text-sm text-yellow-800">
                                    {difference > 0
                                        ? `Terdapat kelebihan dana sebesar ${formatCurrency(difference)}. Anda perlu mengembalikan kelebihan ini ke perusahaan.`
                                        : `Terdapat kekurangan dana sebesar ${formatCurrency(Math.abs(difference))}. Finance akan memproses penambahan pembayaran.`}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="flex-1 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                            >
                                {isProcessing ? 'Memproses...' : 'Submit LPJ'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.visit(`/expenses/request/${request.id}`)}
                                disabled={isProcessing}
                                className="flex-1 rounded-lg border border-border px-4 py-2 font-medium text-foreground transition hover:bg-accent disabled:opacity-50"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
