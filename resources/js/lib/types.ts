// Database types dan interfaces
export type UserRole = "user" | "head" | "director" | "finance" | "admin"
export type RequestType = "reimbursement" | "advance"
export type RequestStatus = "draft" | "submitted" | "head_approved" | "director_approved" | "paid" | "rejected"
export type PaymentMethod = "transfer" | "cash"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  divisions: Division[]
  bankAccount?: string
  bankName?: string
  accountHolder?: string
  createdAt: Date
}

export interface ExpenseRequest {
  id: string
  userId: string
  user ?: User
  type: RequestType
  amount: number
  title: string
  description: string
  status: RequestStatus
  payment_method: PaymentMethod
  currency: string
  attachments?: string[]
  head_approved_at?: Date
  head_approved_by?: string
  director_approved_at?: Date
  director_approved_by?: string
  paid_at?: Date
  paid_by?: string
  rejection_reason?: string
  created_at: Date
  updated_at: Date
}

export interface Approval {
  id: string
  requestId: string
  approverRole: "head" | "director" | "finance"
  approverId: string
  status: "pending" | "approved" | "rejected"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  requestId: string
  userId: string
  amount: number
  method: PaymentMethod
  status: "pending" | "completed" | "failed"
  referenceNumber?: string
  paidAt?: Date
  createdAt: Date
}

export interface Division {
  id: number
  name: string
}
