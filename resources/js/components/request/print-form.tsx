import { ExpenseRequest } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PrintFormProps {
    request: ExpenseRequest;
}

export function PrintForm({ request }: PrintFormProps) {

    return (
        <div className="mx-auto max-w-3xl">
            <div id="print-content" className="print-area rounded-lg bg-white p-8 text-black print:p-0">
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
                        <p className="text-sm">
                            {request.user.divisions && request.user.divisions.length > 0
                                ? request.user.divisions.map((d) => d.name).join(', ')
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="mb-1 text-sm font-semibold">Tanggal Pengajuan</p>
                        <p className="text-sm">{formatDate(request.created_at)}</p>
                    </div>
                    <div>
                        <p className="mb-1 text-sm font-semibold">Status</p>
                        <p className="text-sm capitalize">{request.status.replace(/_/g, ' ')}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="mb-1 text-sm font-semibold">Judul Pengajuan</p>
                    <p className="text-sm">{request.title}</p>
                </div>

                <div className="mb-6">
                    <p className="mb-1 text-sm font-semibold">Deskripsi</p>
                    <p className="text-sm whitespace-pre-wrap">{request.description}</p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                        <p className="mb-1 text-sm font-semibold">Kategori</p>
                        <p className="text-sm capitalize">{request.category}</p>
                    </div>
                    <div>
                        <p className="mb-1 text-sm font-semibold">Metode Pembayaran</p>
                        <p className="text-sm capitalize">
                            {request.payment_method === 'transfer' ? 'Transfer Bank' : 'Cash'}
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="mb-1 text-sm font-semibold">Nominal</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(request.amount)}</p>
                </div>

                <div className="mb-6">
                    <p className="mb-3 text-sm font-semibold">Riwayat Persetujuan</p>
                    <div className="space-y-2">
                        {request.approvals && request.approvals.length > 0 ? (
                            request.approvals.map((approval) => (
                                <div key={approval.id} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                                    <span className="font-medium">{approval.approver_position}</span>
                                    <span>
                                        {approval.status === 'approved' ? 'Disetujui' : 'Ditolak'} oleh{' '}
                                        <span className="font-medium">{approval.approver?.name}</span>
                                    </span>
                                    <span className="text-gray-500">{approval.approved_at && formatDate(approval.approved_at)}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 italic">Belum ada riwayat persetujuan</p>
                        )}
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <p className="mb-8 text-sm">Pemohon</p>
                        <p className="border-t border-black pt-2 text-sm font-semibold">{request.user.name}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="mb-8 text-sm">Disetujui oleh</p>
                        <p className="border-t border-black pt-2 text-sm font-semibold">
                            {request.approvals?.find((a) => a.status === 'approved')?.approver?.name || '-'}
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="mb-8 text-sm">Dibayar oleh</p>
                        <p className="border-t border-black pt-2 text-sm font-semibold">-</p>
                    </div>
                </div>

                <div className="mt-12 text-center text-xs text-gray-400">
                    <p>Dokumen ini dicetak pada {formatDate(new Date().toISOString())}</p>
                </div>
            </div>

            {/* Print Button */}
            <div className="mt-4 flex justify-end gap-3">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M6 9V2h12v7" />
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                        <path d="M6 14h12v8H6z" />
                    </svg>
                    Cetak PDF
                </button>
            </div>
        </div>
    );
}