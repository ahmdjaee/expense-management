// resources/js/pages/expense/mockExpenseData.ts

export interface MockUser {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'head' | 'director' | 'finance' | 'staff';
    division: string;
    bankName?: string;
    accountHolder?: string;
    bankAccount?: string;
}

export interface MockRequest {
    id: string;
    title: string;
    description: string;
    type: 'reimbursement' | 'advance';
    amount: number;
    status: 'draft' | 'submitted' | 'head_approved' | 'director_approved' | 'paid' | 'rejected';
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    paymentMethod?: 'transfer' | 'cash';
    items?: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
}

export const mockUsers: MockUser[] = [
    {
        id: '1',
        name: 'Ahmad Rizki',
        email: 'ahmad@example.com',
        role: 'staff',
        division: 'IT',
        bankName: 'BCA',
        accountHolder: 'Ahmad Rizki',
        bankAccount: '1234567890',
    },
    {
        id: '2',
        name: 'Siti Nurhaliza',
        email: 'siti@example.com',
        role: 'head',
        division: 'IT',
        bankName: 'Mandiri',
        accountHolder: 'Siti Nurhaliza',
        bankAccount: '0987654321',
    },
    {
        id: '3',
        name: 'Budi Santoso',
        email: 'budi@example.com',
        role: 'director',
        division: 'Management',
        bankName: 'BNI',
        accountHolder: 'Budi Santoso',
        bankAccount: '1122334455',
    },
    {
        id: '4',
        name: 'Dewi Lestari',
        email: 'dewi@example.com',
        role: 'finance',
        division: 'Finance',
        bankName: 'BRI',
        accountHolder: 'Dewi Lestari',
        bankAccount: '5544332211',
    },
    {
        id: '5',
        name: 'Eko Prasetyo',
        email: 'eko@example.com',
        role: 'staff',
        division: 'HR',
        bankName: 'BCA',
        accountHolder: 'Eko Prasetyo',
        bankAccount: '9988776655',
    },
];

export const mockRequests: MockRequest[] = [
    {
        id: 'REQ001',
        title: 'Pembelian Laptop Baru',
        description: 'Pengajuan pembelian laptop untuk keperluan kerja',
        type: 'reimbursement',
        amount: 15000000,
        status: 'submitted',
        userId: '1',
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-01'),
        paymentMethod: 'transfer',
        items: [{ name: 'Laptop Dell XPS 13', quantity: 1, price: 15000000 }],
    },
    {
        id: 'REQ002',
        title: 'Uang Muka Perjalanan Dinas',
        description: 'Pengajuan uang muka untuk perjalanan dinas ke Surabaya',
        type: 'advance',
        amount: 5000000,
        status: 'head_approved',
        userId: '5',
        createdAt: new Date('2023-06-05'),
        updatedAt: new Date('2023-06-06'),
        paymentMethod: 'transfer',
    },
    {
        id: 'REQ003',
        title: 'Biaya Training',
        description: 'Pengajuan biaya training React.js Advanced',
        type: 'reimbursement',
        amount: 7500000,
        status: 'director_approved',
        userId: '1',
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date('2023-06-12'),
        paymentMethod: 'transfer',
        items: [
            { name: 'Biaya Pendaftaran', quantity: 1, price: 3000000 },
            { name: 'Akomodasi', quantity: 3, price: 1500000 },
        ],
    },
    {
        id: 'REQ004',
        title: 'Biaya Internet Bulanan',
        description: 'Penggantian biaya internet bulanan untuk WFH',
        type: 'reimbursement',
        amount: 500000,
        status: 'paid',
        userId: '1',
        createdAt: new Date('2023-05-15'),
        updatedAt: new Date('2023-05-20'),
        paymentMethod: 'transfer',
    },
    {
        id: 'REQ005',
        title: 'Uang Muka Renovasi Kantor',
        description: 'Pengajuan uang muka untuk renovasi ruang meeting',
        type: 'advance',
        amount: 20000000,
        status: 'rejected',
        userId: '2',
        createdAt: new Date('2023-06-08'),
        updatedAt: new Date('2023-06-09'),
        paymentMethod: 'cash',
    },
];

// Helper function to get mock auth user
export const getMockAuthUser = (userId: string = '1'): MockUser => {
    return mockUsers.find((user) => user.id === userId) || mockUsers[0];
};
