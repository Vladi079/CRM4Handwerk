import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ALL_STATUSES,
  canTransition,
  getResetTarget,
  type Status,
} from '@/domain/status'
import { AuftragCard } from './AuftragCard'
import { STATUS_DOT, STATUS_LABELS } from './auftrag-labels'
import type { Auftrag } from './auftraege-queries'

interface AuftraegeKanbanProps {
  auftraege: Auftrag[]
  kundeName: (auftrag: Auftrag) => string
  onEdit: (auftrag: Auftrag) => void
  onDelete: (auftrag: Auftrag) => void
  onChangeStatus: (auftrag: Auftrag, to: Status) => void
}

function groupByStatus(auftraege: Auftrag[]): Record<Status, Auftrag[]> {
  const groups = Object.fromEntries(
    ALL_STATUSES.map((status) => [status, [] as Auftrag[]]),
  ) as Record<Status, Auftrag[]>
  for (const auftrag of auftraege) {
    groups[auftrag.status].push(auftrag)
  }
  return groups
}

export function AuftraegeKanban({
  auftraege,
  kundeName,
  onEdit,
  onDelete,
  onChangeStatus,
}: AuftraegeKanbanProps) {
  const byStatus = useMemo(() => groupByStatus(auftraege), [auftraege])

  // Only apply a drop that the state machine allows; ignore illegal ones.
  const handleDrop = (id: string, to: Status) => {
    const auftrag = auftraege.find((item) => item.id === id)
    if (!auftrag || auftrag.status === to) return
    if (
      canTransition(auftrag.status, to) ||
      getResetTarget(auftrag.status) === to
    ) {
      onChangeStatus(auftrag, to)
    }
  }

  // Phones stack the columns and scroll the page; from `sm` up the board
  // becomes the usual side-by-side, horizontally scrollable Kanban.
  return (
    <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:overflow-x-auto">
      {ALL_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          auftraege={byStatus[status]}
          kundeName={kundeName}
          onEdit={onEdit}
          onDelete={onDelete}
          onChangeStatus={onChangeStatus}
          onDropCard={handleDrop}
        />
      ))}
    </div>
  )
}

interface KanbanColumnProps {
  status: Status
  auftraege: Auftrag[]
  kundeName: (auftrag: Auftrag) => string
  onEdit: (auftrag: Auftrag) => void
  onDelete: (auftrag: Auftrag) => void
  onChangeStatus: (auftrag: Auftrag, to: Status) => void
  onDropCard: (id: string, to: Status) => void
}

function KanbanColumn({
  status,
  auftraege,
  kundeName,
  onEdit,
  onDelete,
  onChangeStatus,
  onDropCard,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false)

  return (
    <div className="w-full shrink-0 sm:w-72">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn('size-2 rounded-full', STATUS_DOT[status])}
          aria-hidden
        />
        <h2 className="text-sm font-medium">{STATUS_LABELS[status]}</h2>
        <span className="text-muted-foreground text-xs">
          {auftraege.length}
        </span>
      </div>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsOver(true)
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsOver(false)
          onDropCard(event.dataTransfer.getData('text/plain'), status)
        }}
        className={cn(
          'min-h-12 space-y-2 rounded-lg border border-dashed p-2 transition-colors sm:min-h-24',
          isOver && 'bg-muted',
        )}
      >
        {auftraege.map((auftrag) => (
          <AuftragCard
            key={auftrag.id}
            auftrag={auftrag}
            kundeName={kundeName(auftrag)}
            onEdit={onEdit}
            onDelete={onDelete}
            onChangeStatus={onChangeStatus}
          />
        ))}
        {auftraege.length === 0 && (
          <p className="text-muted-foreground p-2 text-xs">Keine Aufträge</p>
        )}
      </div>
    </div>
  )
}
