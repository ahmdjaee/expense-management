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
  division: string
  bankAccount?: string
  bankName?: string
  accountHolder?: string
  createdAt: Date
}

export interface ExpenseRequest {
  id: string
  userId: string
  type: RequestType
  amount: number
  title: string
  description: string
  status: RequestStatus
  paymentMethod: PaymentMethod
  currency: string
  attachments?: string[]
  headApprovedAt?: Date
  headApprovedBy?: string
  directorApprovedAt?: Date
  directorApprovedBy?: string
  paidAt?: Date
  paidBy?: string
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
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
