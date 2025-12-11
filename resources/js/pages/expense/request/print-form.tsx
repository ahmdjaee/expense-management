// resources/js/components/request/print-form.tsx

import { ExpenseRequest } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PrintFormProps {
    request: ExpenseRequest;
}

export function PrintForm({ request }: PrintFormProps) {
    return (
        <div className="print-form bg-white p-8 text-black">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold">
                    Form Pengajuan {request.type === 'reimbursement' ? 'Reimbursement' : 'Advance'}
                </h1>
                <p className="text-sm text-gray-600">Nomor: #{request.id}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                    <p className="mb-1 text-sm font-semibold">Nama Pemohon</p>
                    <p className="text-sm">{request.user.name}</p>
                </div>
                <div>
                    <p className="mb-1 text-sm font-semibold">Divisi</p>
                    <p className="text-sm">{request.user.divisions.map((d) => d.name).join(', ')}</p>
                </div>
                <div>
                    <p className="mb-1 text-sm font-semibold">Tanggal Pengajuan</p>
                    <p className="text-sm">{formatDate(request.created_at)}</p>
                </div>
                <div>
                    <p className="mb-1 text-sm font-semibold">Status</p>
                    <p className="text-sm">{request.status}</p>
                </div>
            </div>

            <div className="mb-6">
                <p className="mb-1 text-sm font-semibold">Judul Pengajuan</p>
                <p className="text-sm">{request.title}</p>
            </div>

            <div className="mb-6">
                <p className="mb-1 text-sm font-semibold">Deskripsi</p>
                <p className="text-sm">{request.description}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                    <p className="mb-1 text-sm font-semibold">Kategori</p>
                    <p className="text-sm">{request.category}</p>
                </div>
                <div>
                    <p className="mb-1 text-sm font-semibold">Metode Pembayaran</p>
                    <p className="text-sm">{request.payment_method === 'transfer' ? 'Transfer Bank' : 'Cash'}</p>
                </div>
            </div>

            <div className="mb-6">
                <p className="mb-1 text-sm font-semibold">Nominal</p>
                <p className="text-xl font-bold">{formatCurrency(request.amount)}</p>
            </div>

            <div className="mb-6">
                <p className="mb-3 text-sm font-semibold">Riwayat Persetujuan</p>
                <div className="space-y-2">
                    {request.approvals.map((approval) => (
                        <div key={approval.id} className="flex justify-between text-sm">
                            <span>{approval.approver_position}</span>
                            <span>
                                {approval.status === 'approved' ? 'Disetujui' : 'Ditolak'} oleh{' '}
                                {approval.approver?.name}
                            </span>
                            <span>{approval.approved_at && formatDate(approval.approved_at)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="mb-8 text-sm">Pemohon</p>
                    <p className="text-sm font-semibold">{request.user.name}</p>
                </div>
                <div>
                    <p className="mb-8 text-sm">Disetujui oleh</p>
                    <p className="text-sm font-semibold">
                        {request.approvals.find((a) => a.status === 'approved')?.approver?.name || '-'}
                    </p>
                </div>
                <div>
                    <p className="mb-8 text-sm">Dibayar oleh</p>
                    <p className="text-sm font-semibold">-</p>
                </div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-500">
                <p>Dokumen ini dicetak pada {formatDate(new Date().toISOString())}</p>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        .print-form {
                            box-shadow: none;
                            margin: 0;
                            padding: 20px;
                        }
                    }
                `,
                }}
            />
        </div>
    );
}
