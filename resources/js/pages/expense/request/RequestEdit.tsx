// resources/js/pages/expense/request/RequestEdit.tsx

import { RequestForm } from '@/components/request/request-form';
import AppLayout from '@/layouts/expense-app-layout';
import { ExpenseRequest } from '@/lib/types';
import { Head } from '@inertiajs/react';

interface EditRequestPageProps {
    request: ExpenseRequest;
}

export default function EditRequestPage({ request }: EditRequestPageProps) {
    return (
        <AppLayout>
            <Head title="Edit Pengajuan" />

            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                {/* Header */}
                <div className="bg-linear-to-r from-primary to-primary/80 p-4 text-primary-foreground md:p-6">
                    <h1 className="mb-1 text-2xl font-bold md:text-3xl">Edit Pengajuan</h1>
                    <p className="text-sm opacity-90 md:text-base">Perbarui detail pengajuan Anda</p>
                </div>

                {/* Form */}
                <div className="mx-auto w-full max-w-2xl flex-1 p-4 md:p-6">
                    <RequestForm initialData={request} isEdit={true} />
                </div>
            </div>
        </AppLayout>
    );
}
