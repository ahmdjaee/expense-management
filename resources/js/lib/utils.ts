import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(url1: NonNullable<InertiaLinkProps['href']>, url2: NonNullable<InertiaLinkProps['href']>) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (date: Date | string): string => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) {
            return 'Tanggal tidak valid';
        }
        return new Intl.DateTimeFormat('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(dateObj);
    } catch {
        return 'Tanggal tidak valid';
    }
};

export const formatDateTime = (date: Date | string): string => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) {
            return 'Tanggal tidak valid';
        }
        return new Intl.DateTimeFormat('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj);
    } catch {
        return 'Tanggal tidak valid';
    }
};

export const getStatusBadgeColor = (status: string): string => {
    const statusColors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-800',
        submitted: 'bg-blue-100 text-blue-800',
        head_approved: 'bg-yellow-100 text-yellow-800',
        director_approved: 'bg-purple-100 text-purple-800',
        paid: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        pending: 'bg-blue-100 text-blue-800',
        approved: 'bg-green-100 text-green-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        draft: 'Konsep',
        submitted: 'Menunggu Approval Head',
        head_approved: 'Disetujui Head',
        director_approved: 'Disetujui Direktur',
        paid: 'Sudah Dibayar',
        rejected: 'Ditolak',
        pending: 'Pending',
        approved: 'Disetujui',
    };
    return labels[status] || status;
};
