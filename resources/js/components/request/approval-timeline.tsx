// resources/js/components/request/approval-timeline.tsx

import { getApprovalFlowSteps, getPositionLabel, type Approval } from '@/lib/approval-flow-helper';
import { formatDateTime } from '@/lib/utils';

interface ApprovalTimelineProps {
    request: {
        user: {
            name: string;
            position: string;
        };
        approvals: Approval[];
        created_at: string;
        paid_at?: string;
        type: string;
        status: string;
    };
}

export function ApprovalTimeline({ request }: ApprovalTimelineProps) {
    const flowSteps = getApprovalFlowSteps(request.user.position, request.approvals);
    const isRejected = request.status === 'rejected';
    const isAdvance = request.type === 'advance';
    const isPaid = request.status === 'paid'; 
    const isLPJMade = request.status === 'lpj_made';
    const isLPJVerified = request.status === 'lpj_verified';
    const isLPJPaid = request.status === 'lpj_paid';
    
    return (
        <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Riwayat Persetujuan</p>
            <div className="space-y-3">
                {/* Submission */}
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <div className="h-12 w-0.5 bg-gray-200"></div>
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-foreground">Pengajuan Dibuat</p>
                        <p className="text-sm text-muted-foreground">
                            oleh {request.user.name} ({getPositionLabel(request.user.position)})
                        </p>
                        <p className="text-sm text-muted-foreground">{formatDateTime(request.created_at)}</p>
                    </div>
                </div>

                {/* Approval Steps */}
                {flowSteps.map((step, index) => {
                    const isLast = index === flowSteps.length - 1;
                    const approval = request.approvals.find((a) => a.approver_position === step.position);
                    const isThisRejected = approval?.status === 'rejected';

                    return (
                        <div key={step.position} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`h-3 w-3 rounded-full ${
                                        isThisRejected ? 'bg-red-500' : step.approved ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                ></div>
                                {(!isLast || !isRejected) && <div className="h-12 w-0.5 bg-gray-200"></div>}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-foreground">Persetujuan {step.label}</p>
                                {step.approved ? (
                                    <>
                                        <p className="text-sm text-green-600">✓ Disetujui oleh {step.approver?.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {step.approver?.approved_at && formatDateTime(step.approver.approved_at)}
                                        </p>
                                    </>
                                ) : isThisRejected ? (
                                    <>
                                        <p className="text-sm text-red-600">
                                            ✗ Ditolak oleh {approval?.approver?.name}
                                        </p>
                                        {approval?.notes && (
                                            <p className="mt-1 rounded bg-red-50 p-2 text-sm text-red-900">
                                                <span className="font-medium">Alasan:</span> {approval.notes}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            {approval?.approved_at && formatDateTime(approval.approved_at)}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-yellow-600">
                                        {isRejected ? '- Proses dihentikan' : '⏳ Menunggu persetujuan'}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Payment */}
                {!isRejected && (
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`h-3 w-3 rounded-full ${isPaid || isLPJMade || isLPJVerified || isLPJPaid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            {isAdvance && (
                                <div className="h-12 w-0.5 bg-gray-200"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">Pembayaran Finance</p>
                            {isPaid || isLPJMade || isLPJVerified || isLPJPaid ? (
                                <>
                                    <p className="text-sm text-green-600">✓ Sudah dibayar</p>
                                    <p className="text-sm text-muted-foreground">
                                        {request.paid_at && formatDateTime(request.paid_at)}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-yellow-600">
                                    {flowSteps.every((s) => s.approved)
                                        ? '⏳ Menunggu pembayaran oleh Finance'
                                        : '- Menunggu approval selesai'}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Refund (Only for reimbursement type) */}
                {isAdvance && (
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`h-3 w-3 rounded-full ${isLPJMade || isLPJVerified || isLPJPaid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className="h-12 w-0.5 bg-gray-200"></div>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">Pembuatan LPJ</p>
                            {isLPJMade || isLPJVerified || isLPJPaid ? (
                                <>
                                    <p className="text-sm text-green-600">✓ Sudah dibuat</p>
                                    <p className="text-sm text-muted-foreground">
                                        {request.paid_at && formatDateTime(request.paid_at)}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-yellow-600">
                                    {flowSteps.every((s) => s.approved)
                                        ? '⏳ Menunggu pembuatan LPJ'
                                        : '- Menunggu pembuatan LPJ selesai'}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* LPJ Verification (Only for reimbursement type) */}
                {isAdvance && (
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`h-3 w-3 rounded-full ${isLPJVerified || isLPJPaid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className="h-12 w-0.5 bg-gray-200"></div>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">Verifikasi LPJ</p>
                            {isLPJVerified || isLPJPaid ? (
                                <>
                                    <p className="text-sm text-green-600">✓ Sudah diverifikasi</p>
                                    <p className="text-sm text-muted-foreground">
                                        {request.paid_at && formatDateTime(request.paid_at)}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-yellow-600">
                                    {flowSteps.every((s) => s.approved)
                                        ? '⏳ Menunggu verifikasi LPJ'
                                        : '- Menunggu verifikasi LPJ selesai'}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* LPJ Payment (Only for reimbursement type) */}
                {isAdvance && (
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`h-3 w-3 rounded-full ${isLPJPaid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">Pembayaran LPJ</p>
                            {isLPJPaid ? (
                                <>
                                    <p className="text-sm text-green-600">✓ Sudah dibayar</p>
                                    <p className="text-sm text-muted-foreground">
                                        {request.paid_at && formatDateTime(request.paid_at)}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-yellow-600">
                                    {flowSteps.every((s) => s.approved)
                                        ? '⏳ Menunggu pembayaran LPJ'
                                        : '- Menunggu pembayaran LPJ selesai'}
                                </p>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
