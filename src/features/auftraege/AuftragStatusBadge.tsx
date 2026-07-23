import type { Status } from '@/domain/status'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { STATUS_DOT, STATUS_LABELS } from './auftrag-labels'

/** Status shown as a coloured dot plus its German label (theme-agnostic). */
export function AuftragStatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className={cn('size-2 rounded-full', STATUS_DOT[status])}
        aria-hidden
      />
      {STATUS_LABELS[status]}
    </Badge>
  )
}
