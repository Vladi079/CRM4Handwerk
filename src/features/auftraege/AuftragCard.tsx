import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  getAllowedTransitions,
  getResetTarget,
  type Status,
} from '@/domain/status'
import { euroToCents } from '@/domain/money'
import { formatCurrency } from '@/lib/formatters'
import { STATUS_LABELS } from './auftrag-labels'
import type { Auftrag } from './auftraege-queries'

interface AuftragCardProps {
  auftrag: Auftrag
  kundeName: string
  onEdit: (auftrag: Auftrag) => void
  onDelete: (auftrag: Auftrag) => void
  onChangeStatus: (auftrag: Auftrag, to: Status) => void
}

/**
 * A Kanban card. Drag-and-drop is a mouse enhancement; the dropdown menu is the
 * accessible path and only ever offers transitions the state machine permits.
 */
export function AuftragCard({
  auftrag,
  kundeName,
  onEdit,
  onDelete,
  onChangeStatus,
}: AuftragCardProps) {
  const transitions = getAllowedTransitions(auftrag.status)
  const resetTarget = getResetTarget(auftrag.status)

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', auftrag.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
      className="bg-card rounded-lg border p-3 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/auftraege/${auftrag.id}`}
            draggable={false}
            className="block truncate text-sm font-medium hover:underline"
          >
            {auftrag.titel}
          </Link>
          <p className="text-muted-foreground truncate text-xs">{kundeName}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={`Aktionen für ${auftrag.auftragsnummer}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Status ändern</DropdownMenuLabel>
            {transitions.map((status) => (
              <DropdownMenuItem
                key={status}
                onSelect={() => onChangeStatus(auftrag, status)}
              >
                {STATUS_LABELS[status]}
              </DropdownMenuItem>
            ))}
            {resetTarget && (
              <DropdownMenuItem
                onSelect={() => onChangeStatus(auftrag, resetTarget)}
              >
                Zurücksetzen: {STATUS_LABELS[resetTarget]}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onEdit(auftrag)}>
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => onDelete(auftrag)}
            >
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-muted-foreground font-mono text-xs">
          {auftrag.auftragsnummer}
        </span>
        <span className="text-sm tabular-nums">
          {formatCurrency(euroToCents(auftrag.betrag_netto))}
        </span>
      </div>
    </div>
  )
}
