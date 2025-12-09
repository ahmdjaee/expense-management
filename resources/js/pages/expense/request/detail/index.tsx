import { PrintForm } from "@/components/request/print-form";
import AppLayout from "@/layouts/expense-app-layout";
import { formatCurrency, formatDateTime, getStatusBadgeColor, getStatusLabel } from "@/lib/utils";
import { mockRequests, mockUsers } from "@/pages/mockdata";
import { router } from "@inertiajs/react";
import { useState } from "react";
const findRequestById = (id: string) => mockRequests.find(r => r.id === id);


export default function RequestDetailPage() {
  const request = findRequestById('1');
  const auth = { user: mockUsers.find(u => u.role === 'head') }; // Simulasi user login sebagai 'head'

  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  if (!request) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Pengajuan tidak ditemukan</p>
          <button onClick={() => router.visit('/requests')} className="text-primary hover:underline">
            Kembali ke Daftar Pengajuan
          </button>
        </div>
      </div>
    )
  }

  const requester = mockUsers.find((u) => u.id === request.userId)
  const director = mockUsers.find((u) => u.role === "director")

  const isHead = auth.user?.role === "head" && auth.user.division === requester.division
  const isDirector = auth.user?.role === "director"
  const isFinance = auth.user?.role === "finance"
  const canApproveAsHead = isHead && request.status === "submitted"
  const canApproveAsDirector = isDirector && request.status === "head_approved"
  const canPay = isFinance && request.status === "director_approved"

  const handleApprove = async () => {
  
  }

  const handleReject = async () => {
   
  }

  const handlePayment = async () => {

  }

  return (
   <AppLayout>
     <div className="flex-1 flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <div className=" text-black p-6 md:rounded-bl-2xl">
        <h1 className="text-3xl font-bold mb-2">{request.title}</h1>
        <p className="opacity-90">Detail Pengajuan #{request.id}</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 space-y-6">
        {/* Main Card */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Amount & Status */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Nominal</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(request.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusBadgeColor(request.status)}`}
              >
                {getStatusLabel(request.status)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tipe</p>
              <p className="text-sm font-medium">
                {request.type === "reimbursement" ? "📄 Reimbursement" : "💵 Advance/Kasbon"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Deskripsi</p>
            <p className="text-foreground">{request.description}</p>
          </div>

          {/* Requester Info */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">Pemohon</p>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{requester.name}</p>
              <p className="text-sm text-muted-foreground">{requester.email}</p>
              <p className="text-sm text-muted-foreground">{requester.phone}</p>
              <p className="text-sm text-muted-foreground">Divisi: {requester.division}</p>
              {requester.bankAccount && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">Rekening: {requester.bankName}</p>
                  <p className="text-sm font-mono">{requester.accountHolder}</p>
                  <p className="text-sm font-mono">*** *** *** {requester.bankAccount.slice(-4)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Riwayat Persetujuan</p>
            <div className="space-y-3">
              {/* Submission */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="w-0.5 h-12 bg-gray-200"></div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Pengajuan Dibuat</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(request.createdAt)}</p>
                </div>
              </div>

              {/* Head Approval */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${request.headApprovedAt ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>
                  <div className="w-0.5 h-12 bg-gray-200"></div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Persetujuan Head</p>
                  {request.headApprovedAt ? (
                    <p className="text-sm text-muted-foreground">{formatDateTime(request.headApprovedAt)}</p>
                  ) : (
                    <p className="text-sm text-yellow-600">Menunggu persetujuan</p>
                  )}
                </div>
              </div>

              {/* Director Approval */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${request.directorApprovedAt ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>
                  <div className="w-0.5 h-12 bg-gray-200"></div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Persetujuan Direktur</p>
                  {request.directorApprovedAt ? (
                    <p className="text-sm text-muted-foreground">{formatDateTime(request.directorApprovedAt)}</p>
                  ) : (
                    <p className="text-sm text-yellow-600">Menunggu persetujuan</p>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${request.paidAt ? "bg-green-500" : "bg-gray-300"}`}></div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Pembayaran</p>
                  {request.paidAt ? (
                    <p className="text-sm text-muted-foreground">{formatDateTime(request.paidAt)}</p>
                  ) : (
                    <p className="text-sm text-yellow-600">Menunggu pembayaran</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Metode Pembayaran</p>
            <p className="text-sm">
              {request.paymentMethod === "transfer" ? "🏦 Transfer ke Rekening Bank" : "💵 Pembayaran Cash"}
            </p>
          </div>

          {/* Actions */}
          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground mb-3">Aksi</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowPrintModal(!showPrintModal)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
              >
                🖨️ Cetak Form
              </button>

              {canApproveAsHead && (
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition"
                >
                  ✓ Setujui (Head)
                </button>
              )}

              {canApproveAsDirector && (
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition"
                >
                  ✓ Setujui (Direktur)
                </button>
              )}

              {canPay && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition"
                >
                  💳 Proses Pembayaran
                </button>
              )}

              {(canApproveAsHead || canApproveAsDirector) && (
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                >
                  ✕ Tolak
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Print Modal */}
        {showPrintModal && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-foreground">Preview Cetak</h2>
              <button onClick={() => setShowPrintModal(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <PrintForm request={request} requester={requester} director={director} />
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full space-y-4">
              <h2 className="text-lg font-bold text-foreground">Keputusan Persetujuan</h2>

              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {isProcessing ? "Memproses..." : "✓ Setujui Pengajuan"}
                </button>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Alasan Penolakan (jika ditolak)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Masukkan alasan penolakan..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    disabled={isProcessing}
                  />
                </div>

                <button
                  onClick={handleReject}
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {isProcessing ? "Memproses..." : "✕ Tolak Pengajuan"}
                </button>

                <button
                  onClick={() => {
                    setShowApprovalModal(false)
                    setRejectionReason("")
                  }}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full space-y-4">
              <h2 className="text-lg font-bold text-foreground">Konfirmasi Pembayaran</h2>

              <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
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
                  <span className="font-medium">{request.paymentMethod === "transfer" ? "Transfer Bank" : "Cash"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {isProcessing ? "Memproses..." : "✓ Konfirmasi Pembayaran"}
                </button>

                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition disabled:opacity-50"
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
  )
}
