'use client';

import { ExpenseRequest } from '@/lib/types';
import { formatCurrency, formatDate, getStatusBadgeColor, getStatusLabel } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface RequestCardProps {
    request: ExpenseRequest;
}

export function RequestCard({ request }: RequestCardProps) {
    const isReimbursement = request.type === 'reimbursement';

    return (
        <Link href={`/expenses/request/${request.id}`}>
            <div className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-lg">{isReimbursement ? '📄' : '💵'}</span>
                            <h3 className="line-clamp-1 font-semibold text-foreground">{request.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(request.created_at)}</p>
                    </div>
                    <span
                        className={`rounded px-2 py-1 text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(request.status)}`}
                    >
                        {getStatusLabel(request.status)}
                    </span>
                </div>

                <div className="space-y-2">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{request.description}</p>

                    <div className="flex items-center justify-between border-t border-border pt-2">
                        <span className="text-xs text-muted-foreground">
                            {request.payment_method === 'transfer' ? '🏦 Transfer' : '💵 Cash'}
                        </span>
                        <span className="font-bold text-primary">{formatCurrency(request.amount)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
