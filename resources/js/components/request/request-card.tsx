"use client"

import { ExpenseRequest } from "@/lib/types"
import { formatCurrency, formatDate, getStatusBadgeColor, getStatusLabel } from "@/lib/utils"
import { Link } from "@inertiajs/react"

interface RequestCardProps {
  request: ExpenseRequest
}

export function RequestCard({ request }: RequestCardProps) {
  const isReimbursement = request.type === "reimbursement"

  return (
    <Link href={`/requests/${request.id}`}>
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{isReimbursement ? "📄" : "💵"}</span>
              <h3 className="font-semibold text-foreground line-clamp-1">{request.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</p>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(request.status)}`}
          >
            {getStatusLabel(request.status)}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {request.paymentMethod === "transfer" ? "🏦 Transfer" : "💵 Cash"}
            </span>
            <span className="font-bold text-primary">{formatCurrency(request.amount)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
