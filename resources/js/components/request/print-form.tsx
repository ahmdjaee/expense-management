import { ExpenseRequest } from "@/lib/types"
import { formatCurrency, formatDateTime, getStatusLabel } from "@/lib/utils"

interface PrintFormProps {
  request: ExpenseRequest
}

export function PrintForm({ request }: PrintFormProps) {
  return (
    <div className="print-area bg-white p-8 rounded-lg border border-gray-300 print:border-0 print:p-0">
      <div className="text-center mb-8 border-b pb-6">
        <h1 className="text-2xl font-bold mb-2">FORM PENGAJUAN</h1>
        <p className="text-gray-600">Advance & Expense System</p>
      </div>

      <div className="space-y-6">
        {/* Data Pengajuan */}
        <div>
          <h2 className="font-bold text-lg mb-4 border-b pb-2">DATA PENGAJUAN</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">No. Pengajuan</p>
              <p className="font-semibold">{request.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipe</p>
              <p className="font-semibold">
                {request.type === "reimbursement" ? "Reimbursement" : "Advance/Kasbon"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tanggal Pengajuan</p>
              <p className="font-semibold">{formatDateTime(request.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold">{getStatusLabel(request.status)}</p>
            </div>
          </div>
        </div>

        {/* Detail Pengajuan */}
        <div>
          <h2 className="font-bold text-lg mb-4 border-b pb-2">DETAIL PENGAJUAN</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Judul</p>
              <p className="font-semibold">{request.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deskripsi</p>
              <p>{request.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nominal</p>
              <p className="font-bold text-lg text-green-600">
                {formatCurrency(request.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Metode Pembayaran</p>
              <p className="font-semibold">
                {request.payment_method === "transfer" ? "Transfer Bank" : "Cash"}
              </p>
            </div>
          </div>
        </div>

        {/* Approval Area */}
        <div>
          <h2 className="font-bold text-lg mb-4 border-b pb-2">TANDATANGAN</h2>
          <div className="grid grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-12">Pemohon</p>
              <div className="border-t-2 border-gray-400 pt-2">
                <p className="font-semibold text-sm">{request.userId}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-12">Kepala Divisi</p>
              <div className="border-t-2 border-gray-400 pt-2"></div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-12">Direktur Utama</p>
              <div className="border-t-2 border-gray-400 pt-2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol print hilang saat print */}
      <div className="mt-8 text-center print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90"
        >
          Print Form
        </button>
      </div>
    </div>
  )
}
