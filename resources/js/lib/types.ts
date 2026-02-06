export type UserRole = 'user' | 'head' | 'director' | 'finance' | 'admin';
export type Location = 'jkt' | 'jkt1' | 'sby';
export type RequestType = 'reimbursement' | 'advance' | 'bill';
export type ReqCategory = 'biaya allowance' | 'biaya gaji' | 'biaya komisi' | 'biaya sewa' | 'biaya utilitas' |
                             'biaya service charge' | 'biaya operasional' | 'biaya promosi' | 'biaya promosi' | 
                             'biaya reward' | 'biaya pajak' | 'biaya bpjs' | 'biaya lainya';
export type RequestStatus = 'draft' | 'submitted' | 'head_approved' | 'director_approved' | 'paid' | 'rejected';
export type PaymentMethod = 'transfer' | 'cash';

export interface User {
    id: number;
    name: string;
    email: string;
    location: Location;
    phone?: string;
    role: UserRole;
    position: string;
    divisions: Division[];
    bankAccount?: string;
    bankName?: string;
    accountHolder?: string;
    rekening?: string;
    bank?: string;
    rekening_name?: string;
    createdAt: Date;
}

export interface RequestItem {
    id: number;
    description: string;
    amount: number;
    actual_amount?: number | null;
}

export interface ExpenseRequest {
    id: number;
    user_id: number; // Tambahkan properti yang hilang
    title: string;
    description: string;
    amount: number;
    actual_amount?: number;
    status: string;
    is_closed: boolean;
    type: string;
    category: ReqCategory;
    payment_method: string;
    created_at: string;
    updated_at: string; // Tambahkan properti yang hilang
    currency?: string;
    paid_at?: string;
    head_approved_at?: string;
    director_approved_at?: string;
    items: RequestItem[];
    user: {
        id: number;
        name: string;
        email: string;
        location: Location;
        position: string;
        divisions: Array<{ id: number; name: string }>;
    };
    approvals: Array<{
        id: number;
        approver_position: string;
        status: string;
        notes?: string;
        approved_at?: string;
        approver?: {
            name: string;
        };
    }>;
}

export interface Approval {
    id: string;
    requestId: string;
    approverRole: 'head' | 'director' | 'finance';
    approverId: string;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Payment {
    id: string;
    requestId: string;
    userId: string;
    amount: number;
    method: PaymentMethod;
    status: 'pending' | 'completed' | 'failed';
    referenceNumber?: string;
    paidAt?: Date;
    createdAt: Date;
}

export interface Division {
    id: number;
    name: string;
}
