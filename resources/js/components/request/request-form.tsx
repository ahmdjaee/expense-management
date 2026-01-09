// resources/js/components/request/request-form.tsx

'use client';

import { ExpenseRequest } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Form } from '@inertiajs/react';
import { File, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

// Komponen untuk menampilkan error
function InputError({ message }: { message?: string }) {
    return message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null;
}

interface RequestFormProps {
    initialData?: ExpenseRequest;
    isEdit?: boolean;
}

export function RequestForm({ initialData, isEdit = false }: RequestFormProps) {
    const [type, setType] = useState<'reimbursement' | 'advance' | null>(
        initialData ? (initialData.type as 'reimbursement' | 'advance') : null,
    );
    const [amount, setAmount] = useState(initialData ? initialData.amount.toString() : '');
    const [method, setMethod] = useState<'transfer' | 'cash'>(
        initialData ? (initialData.payment_method as 'transfer' | 'cash') : 'transfer',
    );
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize form with initial data if in edit mode
    useEffect(() => {
        if (initialData && isEdit) {
            // Set initial values
            setAmount(initialData.amount.toString());
            setMethod(initialData.payment_method as 'transfer' | 'cash');
            setType(initialData.type as 'reimbursement' | 'advance');
        }
    }, [initialData, isEdit]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAttachments((prev) => [...prev, ...newFiles]);
        }
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    if (!type && !isEdit) {
        return (
            <div className="mx-auto w-full max-w-2xl">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-foreground">Buat Pengajuan Baru</h1>
                    <p className="text-muted-foreground">Pilih jenis pengajuan yang ingin Anda buat</p>
                </div>

                <div className="grid gap-4">
                    <button
                        onClick={() => setType('reimbursement')}
                        className="group rounded-xl border-2 border-border p-6 text-left transition-all hover:border-primary hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                                    Tagihan
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Pengembalian dana yang sudah Anda keluarkan untuk kebutuhan perusahaan
                                </p>
                            </div>
                            <div className="text-2xl">💰</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setType('advance')}
                        className="group rounded-xl border-2 border-border p-6 text-left transition-all hover:border-primary hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                                    Pengajuan
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Dana dimuka untuk keperluan bisnis yang akan dilaporkan kemudian
                                </p>
                            </div>
                            <div className="text-2xl">📋</div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Form
            className="mx-auto w-full max-w-2xl"
            action={isEdit ? `/expenses/request/${initialData?.id}` : '/expenses/request/new'}
            method={isEdit ? 'put' : 'post'}
            encType="multipart/form-data"
        >
            {({ processing, errors }) => (
                <>
                    <div className="mb-8">
                        {!isEdit && (
                            <button
                                type="button"
                                onClick={() => setType(null)}
                                className="mb-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                                ← Kembali memilih jenis
                            </button>
                        )}
                        <h1 className="mb-2 text-3xl font-bold text-foreground">
                            {isEdit
                                ? 'Edit Pengajuan'
                                : type === 'reimbursement'
                                  ? 'Tagihan'
                                  : 'Pengajuan'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEdit ? 'Perbarui detail pengajuan Anda' : 'Lengkapi semua detail pengajuan Anda'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <input type="hidden" name="type" value={type} className="hidden" />
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-foreground">Judul Pengajuan</label>
                            <Input
                                type="text"
                                name="title"
                                placeholder="Contoh: Pembelian Stationery Kantor"
                                defaultValue={initialData?.title}
                                required
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Berikan judul yang jelas untuk pengajuan Anda
                            </p>
                            <InputError message={errors.title} />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-foreground">Kategori</label>
                            <Select name="category" defaultValue={initialData?.category} required>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kantor">Kantor</SelectItem>
                                    <SelectItem value="sumber daya manusia">Sumber Daya Manusia</SelectItem>
                                    <SelectItem value="operasional umum">Operasional Umum</SelectItem>
                                    <SelectItem value="pemasaran">Pemasaran</SelectItem>
                                    <SelectItem value="it dan sistem">IT dan Sistem</SelectItem>
                                    <SelectItem value="pembelian asset, inventaris, & aksesories">Pembelian Asset, Inventaris, & Aksesories</SelectItem>
                                    <SelectItem value="keuangan & pajak">Keuangan & Pajak</SelectItem>
                                    <SelectItem value="komisi & bonus marketing">Komisi & Bonus Marketing</SelectItem>
                                    <SelectItem value="lainya">Lainya</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Pilih kategori yang sesuai
                            </p>
                            <InputError message={errors.category} />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-foreground">Deskripsi</label>
                            <Textarea
                                name="description"
                                placeholder="Jelaskan secara detail tentang pengajuan Anda, apa yang dibeli, kapan, dan untuk apa..."
                                rows={4}
                                defaultValue={initialData?.description}
                                required
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Semakin detail, semakin cepat proses approval
                            </p>
                            <InputError message={errors.description} />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-foreground">
                                Nominal Pengajuan
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="min-w-fit font-medium text-muted-foreground">Rp</span>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    name="amount"
                                    placeholder="0"
                                    required
                                    min="1"
                                />
                                <InputError message={errors.amount} />
                            </div>
                            {amount && Number.parseInt(amount) > 0 && (
                                <p className="mt-2 text-sm font-semibold text-primary">
                                    Total: {formatCurrency(Number.parseInt(amount))}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-3 block text-sm font-semibold text-foreground">
                                Metode Pembayaran
                            </label>
                            <div className="flex gap-4">
                                <label
                                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-primary hover:bg-secondary"
                                    style={{ opacity: method === 'transfer' ? 1 : 0.6 }}
                                >
                                    <input
                                        type="radio"
                                        value="transfer"
                                        checked={method === 'transfer'}
                                        onChange={(e) => setMethod(e.target.value as 'transfer' | 'cash')}
                                        name="payment_method"
                                        className="h-4 w-4 cursor-pointer"
                                    />
                                    <span className="font-medium">Transfer Bank</span>
                                </label>
                                <label
                                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-primary hover:bg-secondary"
                                    style={{ opacity: method === 'cash' ? 1 : 0.6 }}
                                >
                                    <input
                                        type="radio"
                                        value="cash"
                                        checked={method === 'cash'}
                                        onChange={(e) => setMethod(e.target.value as 'transfer' | 'cash')}
                                        className="h-4 w-4 cursor-pointer"
                                        name="payment_method"
                                    />
                                    <span className="font-medium">Cash</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-foreground">Lampiran / Bukti</label>
                            <div
                                className="cursor-pointer rounded-lg border-2 border-dashed border-border p-6 text-center transition-all hover:border-primary hover:bg-secondary/30"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium text-foreground">Upload bukti / lampiran</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Drag and drop atau klik untuk memilih file
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    name="attachment"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Format: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
                            </p>

                            <InputError message={errors.attachment} />

                            {attachments.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-sm font-medium text-foreground">
                                        Lampiran yang sudah diupload ({attachments.length}):
                                    </p>
                                    <div className="space-y-2">
                                        {attachments.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border border-border bg-secondary p-3"
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <span className="truncate text-sm font-medium text-foreground">
                                                        {file.name}
                                                    </span>
                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                        ({(file.size / 1024).toFixed(1)}KB)
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAttachment(index)}
                                                    className="rounded p-1 transition-colors hover:bg-background"
                                                >
                                                    <X className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3 border-t border-border pt-6">
                        {!isEdit && (
                            <button
                                type="button"
                                onClick={() => setType(null)}
                                className="flex-1 rounded-lg border border-border px-4 py-3 font-medium text-foreground transition-colors hover:bg-secondary"
                            >
                                Ubah Jenis
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : isEdit ? 'Perbarui Pengajuan' : 'Ajukan Pengajuan'}
                        </button>
                    </div>
                </>
            )}
        </Form>
    );
}
