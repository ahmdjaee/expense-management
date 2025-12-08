import { formatCurrency } from "@/lib/utils"
import { Upload, X, File } from "lucide-react"
import { useRef, useState } from "react"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

export function RequestForm() {
  const [type, setType] = useState<"reimbursement" | "advance" | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<"transfer" | "cash">("transfer")
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
   
  }

  if (!type) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Buat Pengajuan Baru</h1>
          <p className="text-muted-foreground">Pilih jenis pengajuan yang ingin Anda buat</p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => setType("reimbursement")}
            className="p-6 border-2 border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  Reimbursement
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Pengembalian dana yang sudah Anda keluarkan untuk kebutuhan perusahaan
                </p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </button>

          <button
            onClick={() => setType("advance")}
            className="p-6 border-2 border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  Advance / Kasbon
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Dana dimuka untuk keperluan bisnis yang akan dilaporkan kemudian
                </p>
              </div>
              <div className="text-2xl">📋</div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => setType(null)}
          className="text-primary hover:underline text-sm font-medium mb-4 flex items-center gap-1"
        >
          ← Kembali memilih jenis
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {type === "reimbursement" ? "Pengajuan Reimbursement" : "Pengajuan Advance / Kasbon"}
        </h1>
        <p className="text-muted-foreground">Lengkapi semua detail pengajuan Anda</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Judul Pengajuan</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Pembelian Stationery Kantor"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Berikan judul yang jelas untuk pengajuan Anda</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Deskripsi Detail</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan secara detail tentang pengajuan Anda, apa yang dibeli, kapan, dan untuk apa..."
            rows={4}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Semakin detail, semakin cepat proses approval</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Nominal Pengajuan</label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium min-w-fit">Rp</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              min="1"
            />
          </div>
          {amount && Number.parseInt(amount) > 0 && (
            <p className="text-sm font-semibold text-primary mt-2">Total: {formatCurrency(Number.parseInt(amount))}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">Metode Pembayaran</label>
          <div className="flex gap-4">
            <label
              className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg hover:border-primary hover:bg-secondary transition-all"
              style={{ opacity: method === "transfer" ? 1 : 0.6 }}
            >
              <input
                type="radio"
                value="transfer"
                checked={method === "transfer"}
                onChange={(e) => setMethod(e.target.value as "transfer" | "cash")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="font-medium">Transfer Bank</span>
            </label>
            <label
              className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg hover:border-primary hover:bg-secondary transition-all"
              style={{ opacity: method === "cash" ? 1 : 0.6 }}
            >
              <input
                type="radio"
                value="cash"
                checked={method === "cash"}
                onChange={(e) => setMethod(e.target.value as "transfer" | "cash")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="font-medium">Cash</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Lampiran / Bukti</label>
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary hover:bg-secondary/30 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">Upload bukti / lampiran</p>
            <p className="text-xs text-muted-foreground mt-1">Drag and drop atau klik untuk memilih file</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Format: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)</p>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                Lampiran yang sudah diupload ({attachments.length}):
              </p>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        ({(file.size / 1024).toFixed(1)}KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="p-1 hover:bg-background rounded transition-colors"
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

      <div className="flex gap-3 mt-8 pt-6 border-t border-border">
        <button
          type="button"
          onClick={() => setType(null)}
          className="flex-1 px-4 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-secondary transition-colors"
        >
          Ubah Jenis
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isLoading ? "Memproses..." : "Ajukan Pengajuan"}
        </button>
      </div>
    </form>
  )
}
