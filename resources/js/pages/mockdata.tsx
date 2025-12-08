import type { ExpenseRequest, User } from '@/lib/types';

export const DIVISIONS = [
    { id: 1, name: 'Engineering', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { id: 2, name: 'Design', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    { id: 3, name: 'Marketing', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
    { id: 4, name: 'Product', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { id: 5, name: 'HR', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
];

export const USERS = [
    { id: 1, name: 'Ahmad Rizki', email: 'ahmad@company.com', division: 1, avatar: '👨‍💼' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', division: 2, avatar: '👩‍💼' },
    { id: 3, name: 'Michael Chen', email: 'michael@company.com', division: 1, avatar: '👨‍💻' },
    { id: 4, name: 'Eka Putri', email: 'eka@company.com', division: 3, avatar: '👩‍💻' },
    { id: 5, name: 'Budi Santoso', email: 'budi@company.com', division: 4, avatar: '👨‍💼' },
    { id: 6, name: 'Lisa Wang', email: 'lisa@company.com', division: 2, avatar: '👩‍🎨' },
    { id: 7, name: 'Rinto Harahap', email: 'rinto@company.com', division: 5, avatar: '👨‍💼' },
    { id: 8, name: 'Nina Sari', email: 'nina@company.com', division: 3, avatar: '👩‍💼' },
];

export const TASKS = [
    {
        id: 1,
        title: 'Redesign Landing Page',
        description: 'Complete redesign of the main landing page with modern UI/UX principles',
        division: 2,
        assignedTo: 2,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
        id: 2,
        title: 'API Integration for User Dashboard',
        description: 'Integrate backend API endpoints with frontend dashboard components',
        division: 1,
        assignedTo: 3,
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days (notification should trigger)
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
        id: 3,
        title: 'Q4 Marketing Campaign Planning',
        description: 'Plan and strategize marketing initiatives for Q4 launch',
        division: 3,
        assignedTo: 8,
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
        id: 4,
        title: 'Database Optimization',
        description: 'Optimize database queries and improve overall performance',
        division: 1,
        assignedTo: 1,
        status: 'completed',
        priority: 'medium',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
        id: 5,
        title: 'Mobile App Responsive Testing',
        description: 'Test mobile app responsiveness across multiple device sizes',
        division: 1,
        assignedTo: 3,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
        id: 6,
        title: 'Brand Guidelines Update',
        description: 'Update brand guidelines document with new color palette and typography',
        division: 2,
        assignedTo: 6,
        status: 'pending',
        priority: 'low',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
        id: 7,
        title: 'Social Media Content Calendar',
        description: 'Create content calendar for next 3 months of social media posts',
        division: 3,
        assignedTo: 4,
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
        id: 8,
        title: 'Security Audit Implementation',
        description: 'Implement recommended security measures from recent audit report',
        division: 1,
        assignedTo: 1,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
        id: 9,
        title: 'Employee Onboarding Process',
        description: 'Streamline and improve employee onboarding procedures',
        division: 5,
        assignedTo: 7,
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
        id: 10,
        title: 'Product Roadmap for 2025',
        description: 'Define and document product roadmap and milestones for 2025',
        division: 4,
        assignedTo: 5,
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
        id: 11,
        title: 'Performance Testing Suite',
        description: 'Build comprehensive performance testing suite for new features',
        division: 1,
        assignedTo: 3,
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
        id: 12,
        title: 'UI Component Library',
        description: 'Create reusable UI component library for design consistency',
        division: 2,
        assignedTo: 2,
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
];

export type Task = (typeof TASKS)[0];
export type Division = (typeof DIVISIONS)[0];

// Mock data untuk development

export const mockUsers: User[] = [
    {
        id: '1',
        name: 'Budi Santoso',
        email: 'budi@company.com',
        phone: '0812345678',
        role: 'user',
        division: 'IT',
        bankAccount: '1234567890',
        bankName: 'BCA',
        accountHolder: 'Budi Santoso',
        createdAt: new Date('2024-01-01'),
    },
    {
        id: '2',
        name: 'Siti Nurhaliza',
        email: 'siti@company.com',
        phone: '0812345679',
        role: 'head',
        division: 'IT',
        bankAccount: '9876543210',
        bankName: 'Mandiri',
        accountHolder: 'Siti Nurhaliza',
        createdAt: new Date('2024-01-01'),
    },
    {
        id: '3',
        name: 'Ahmad Wijaya',
        email: 'ahmad@company.com',
        phone: '0812345680',
        role: 'director',
        division: 'Finance',
        bankAccount: '5555555555',
        bankName: 'BNI',
        accountHolder: 'Ahmad Wijaya',
        createdAt: new Date('2024-01-01'),
    },
    {
        id: '4',
        name: 'Dewi Lestari',
        email: 'dewi@company.com',
        phone: '0812345681',
        role: 'finance',
        division: 'Finance',
        bankAccount: '4444444444',
        bankName: 'BCA',
        accountHolder: 'Dewi Lestari',
        createdAt: new Date('2024-01-01'),
    },
    {
        id: '5',
        name: 'Raka Pratama',
        email: 'raka@company.com',
        phone: '0812345682',
        role: 'user',
        division: 'HR',
        bankAccount: '7777777777',
        bankName: 'Mandiri',
        accountHolder: 'Raka Pratama',
        createdAt: new Date('2024-01-01'),
    },
];

export const mockRequests: ExpenseRequest[] = [
    {
        id: '1',
        userId: '1',
        type: 'reimbursement',
        amount: 500000,
        title: 'Pembelian Stationery',
        description: 'Pembelian alat tulis kantor untuk departemen IT',
        status: 'submitted',
        paymentMethod: 'transfer',
        currency: 'IDR',
        createdAt: new Date('2024-11-20'),
        updatedAt: new Date('2024-11-20'),
    },
    {
        id: '2',
        userId: '5',
        type: 'advance',
        amount: 2000000,
        title: 'Dana Advance Perjalanan Dinas',
        description: 'Advance untuk perjalanan dinas ke Jakarta',
        status: 'head_approved',
        paymentMethod: 'cash',
        currency: 'IDR',
        headApprovedAt: new Date('2024-11-21'),
        headApprovedBy: '2',
        createdAt: new Date('2024-11-20'),
        updatedAt: new Date('2024-11-21'),
    },
];
