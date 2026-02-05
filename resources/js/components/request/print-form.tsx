import { ExpenseRequest } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PrintFormProps {
    request: ExpenseRequest;
    actual_amount?: number | null;
}

export function PrintForm({ request, actual_amount }: PrintFormProps) {

    const difference =
    actual_amount !== undefined
        ? actual_amount - request.amount
        : 0;


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

                <div className="mt-4 rounded-md border border-transparent p-3 print:p-2">
                    <h3 className="mb-2 text-sm font-semibold text-foreground print:mb-1">
                        Rincian
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-[11px] table-fixed">
                            <thead>
                                <tr className="border-b border-border text-black font-bold">
                                    <th className="w-8 px-2 py-1 text-left align-top tracking-tight ">
                                        No
                                    </th>

                                    <th className="px-2 py-1 text-left align-top leading-tight tracking-tight">
                                        Deskripsi
                                    </th>

                                    <th className="w-24 px-2 py-1 text-right align-top tracking-tight">
                                        Nominal
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {request.items.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-border last:border-b-0"
                                    >
                                        <td className="px-2 py-1 text-left align-top tracking-tight">
                                            {index + 1}
                                        </td>

                                        <td className="px-2 py-1 text-left align-top leading-tight tracking-tight">
                                            {item.description}
                                        </td>

                                        <td className="px-2 py-1 text-right align-top whitespace-nowrap tracking-tight">
                                            {formatCurrency(item.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mb-4 text-end p-4 gap-2 print:mb-2 text-[11px]">
                    <div className="flex justify-between">
                        <span>Total</span>
                        <span className="font-normal">
                            {formatCurrency(request.amount)}
                        </span>
                    </div>

                    {request.actual_amount !== null && (
                        <div className="flex justify-between">
                            <span>
                                {request.actual_amount > request.amount
                                    ? 'Kekurangan'
                                    : 'Kelebihan'}
                            </span>
                            <span>
                                {formatCurrency(
                                    Math.abs(request.actual_amount - request.amount)
                                )}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between font-semibold">
                        <span>Pengeluaran Aktual</span>
                        <span className="font-semibold underline">
                            {request.actual_amount
                                ? formatCurrency(request.actual_amount)
                                : '-'}
                        </span>
                    </div>
                </div>




                <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs">
                    <div className="flex flex-col items-center">
                        <p className="mb-6">Pemohon</p>
                        <div className="w-full border-t border-black pt-2">&nbsp;</div>
                    </div>

                    <div className="flex flex-col items-center">
                        <p className="mb-6">Disetujui oleh</p>
                        <div className="w-full border-t border-black pt-2">&nbsp;</div>
                    </div>

                    <div className="flex flex-col items-center">
                        <p className="mb-6">Dibayar oleh</p>
                        <div className="w-full border-t border-black pt-2">&nbsp;</div>
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