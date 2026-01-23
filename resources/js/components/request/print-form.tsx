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
                    <h1 className="text-lg font-bold leading-tight">
                        Form Pengajuan {request.type === 'reimbursement' ? 'Reimbursement' : 'Advance'}
                    </h1>
                    <p className="text-xs text-gray-600">Nomor: #{request.id}</p>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-x-4 gap-y-2 print:grid-cols-3">
                    <div>
                        <p className="text-[11px] font-semibold leading-tight">Nama Pemohon</p>
                        <p className="text-[11px] leading-tight">{request.user.name}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold leading-tight">Divisi</p>
                        <p className="text-[11px] leading-tight">
                            {request.user.divisions && request.user.divisions.length > 0
                                ? request.user.divisions.map((d) => d.name).join(', ')
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold leading-tight">Tanggal Pengajuan</p>
                        <p className="text-[11px]">{formatDate(request.created_at)}</p>
                    </div>
                </div>

                <div className='mb-4 grid grid-cols-3 gap-x-4 gap-y-2 print:grid-cols-3'>
                    <div>
                        <p className="text-[11px] font-semibold leading-tight">Status</p>
                        <p className="text-[11px] capitalize">{request.status.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold leading-tight">Judul Pengajuan</p>
                        <p className="text-[11px]">{request.title}</p>
                    </div>

                    <div>
                        <p className="text-[11px] font-semibold leading-tight">Deskripsi</p>
                        <p className="text-[11px] whitespace-pre-wrap">{request.description}</p>
                    </div>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-x-4 gap-y-2 print:grid-cols-3">
                    <div>
                        <p className="text-[11px] font-semibold leading-tight">Kategori</p>
                        <p className="text-[11px] capitalize">{request.category}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold leading-tight">Metode Pembayaran</p>
                        <p className="text-[11px] capitalize">
                            {request.payment_method === 'transfer' ? 'Transfer Bank' : 'Cash'}
                        </p>
                    </div>
                </div>

                <div className="mb-6 text-center">
                    <p className="text-[11px] font-semibold leading-tight">Nominal</p>
                    <p className="text-[14px] font-bold text-gray-900">{formatCurrency(request.amount)}</p>
                </div>

                <div className="mb-6">
                    <p className="mb-3 text-[11px] font-semibold">Riwayat Persetujuan</p>
                    <div className="space-y-2">
                        {request.approvals && request.approvals.length > 0 ? (
                            request.approvals.map((approval) => (
                                <div key={approval.id} className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-1 text-[10.5px]">
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
                        <p className="mb-6 text-xs">Pemohon</p>
                        <p className="border-t border-black pt-2 text-sm font-semibold">{request.user.name}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="mb-6 text-xs">Disetujui oleh</p>
                        <p className="border-t border-black pt-2 text-sm font-semibold">
                            {request.approvals?.find((a) => a.status === 'approved')?.approver?.name || '-'}
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="mb-6 text-xs">Dibayar oleh</p>
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