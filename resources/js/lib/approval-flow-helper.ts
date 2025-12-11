// resources/js/lib/approval-flow-helper.ts

export interface ApprovalFlowStep {
    position: string;
    label: string;
    approved: boolean;
    approver?: {
        name: string;
        approved_at?: string;
    };
}

export interface Approval {
    approver_position: string;
    status: string;
    approver?: {
        name: string;
    };
    approved_at?: string;
    notes?: string;
}

/**
 * Get approval flow steps based on requester position
 */
export function getApprovalFlowSteps(requesterPosition: string, approvals: Approval[]): ApprovalFlowStep[] {
    let flowPositions: string[] = [];

    switch (requesterPosition) {
        case 'karyawan':
            flowPositions = ['head', 'direktur', 'finance'];
            break;
        case 'head':
            flowPositions = ['direktur', 'finance'];
            break;
        case 'direktur':
            flowPositions = ['finance'];
            break;
        case 'finance':
            flowPositions = ['direktur'];
            break;
        default:
            flowPositions = [];
    }

    const positionLabels: Record<string, string> = {
        head: 'Head Division',
        direktur: 'Direktur',
        finance: 'Finance',
    };

    return flowPositions.map((position) => {
        const approval = approvals.find((a) => a.approver_position === position && a.status === 'approved');

        return {
            position,
            label: positionLabels[position] || position,
            approved: !!approval,
            approver: approval
                ? {
                      name: approval.approver?.name || '',
                      approved_at: approval.approved_at,
                  }
                : undefined,
        };
    });
}

/**
 * Get position label in Indonesian
 */
export function getPositionLabel(position: string): string {
    const labels: Record<string, string> = {
        karyawan: 'Karyawan',
        head: 'Head',
        direktur: 'Direktur',
        finance: 'Finance',
    };
    return labels[position] || position;
}

/**
 * Check if all approvals are complete
 */
export function isAllApprovalsComplete(flowSteps: ApprovalFlowStep[]): boolean {
    return flowSteps.every((step) => step.approved);
}

/**
 * Get next pending approval step
 */
export function getNextPendingStep(flowSteps: ApprovalFlowStep[]): ApprovalFlowStep | null {
    return flowSteps.find((step) => !step.approved) || null;
}

/**
 * Get approval progress percentage
 */
export function getApprovalProgress(flowSteps: ApprovalFlowStep[]): number {
    if (flowSteps.length === 0) return 0;
    const approved = flowSteps.filter((step) => step.approved).length;
    return Math.round((approved / flowSteps.length) * 100);
}

/**
 * Get approval status color
 */
export function getApprovalStatusColor(status: string): string {
    const colors: Record<string, string> = {
        submitted: 'bg-yellow-100 text-yellow-800',
        head_approved: 'bg-blue-100 text-blue-800',
        director_approved: 'bg-green-100 text-green-800',
        paid: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}
