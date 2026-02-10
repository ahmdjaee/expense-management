import { RequestForm } from '@/components/request/request-form';
import AppLayout from '@/layouts/expense-app-layout';
import { useEffect } from 'react';

export default function NewRequestPage({ initialType }: { initialType?: string }) {

    useEffect(() => {
        // Cek apakah ada query string di URL (tanda ?)
        if (window.location.search) {
            // Ambil URL saat ini
            const url = new URL(window.location.href);
            
            // Hapus semua search params (query strings)
            url.search = ''; 
            
            // Ganti state history browser dengan URL yang sudah bersih
            // tanpa memicu reload halaman
            window.history.replaceState({}, '', url.toString());
        }
    }, []);

    return (
        <AppLayout>
            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="bg-linear-to-r from-primary to-primary/80 p-4 text-primary-foreground md:p-6">
                    <h1 className="mb-1 text-2xl font-bold md:text-3xl">Buat Pengajuan Baru</h1>
                    <p className="text-sm opacity-90 md:text-base">Tagihan atau Pengajuan</p>
                </div>

                {/* Form */}
                <div className="mx-auto w-full max-w-2xl flex-1 p-4 md:p-6">
                    <RequestForm initialType={initialType} />
                </div>
            </div>
        </AppLayout>
    );
}
