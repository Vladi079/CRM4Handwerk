import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { euroToCents } from '@/domain/money'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { AuftragStatusBadge } from './AuftragStatusBadge'
import { AuftraegeFilters, type AuftraegeFilterState } from './AuftraegeFilters'
import type { KundeOption } from './AuftragForm'
import type { Auftrag } from './auftraege-queries'

const INITIAL_FILTERS: AuftraegeFilterState = {
  status: 'alle',
  kundeId: 'alle',
  von: '',
  bis: '',
}

interface AuftraegeTableProps {
  auftraege: Auftrag[]
  kundeName: (auftrag: Auftrag) => string
  kundenOptions: KundeOption[]
  onEdit: (auftrag: Auftrag) => void
  onDelete: (auftrag: Auftrag) => void
}

export function AuftraegeTable({
  auftraege,
  kundeName,
  kundenOptions,
  onEdit,
  onDelete,
}: AuftraegeTableProps) {
  const [filters, setFilters] = useState<AuftraegeFilterState>(INITIAL_FILTERS)

  const filtered = useMemo(() => {
    return auftraege.filter((auftrag) => {
      if (filters.status !== 'alle' && auftrag.status !== filters.status)
        return false
      if (filters.kundeId !== 'alle' && auftrag.kunde_id !== filters.kundeId)
        return false
      const createdDay = auftrag.created_at.slice(0, 10)
      if (filters.von && createdDay < filters.von) return false
      if (filters.bis && createdDay > filters.bis) return false
      return true
    })
  }, [auftraege, filters])

  return (
    <div className="space-y-4">
      <AuftraegeFilters
        value={filters}
        onChange={setFilters}
        kundenOptions={kundenOptions}
      />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Keine Aufträge für diese Filter.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nr.</TableHead>
                <TableHead>Titel</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Netto</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead>
                  <span className="sr-only">Aktionen</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((auftrag) => (
                <TableRow key={auftrag.id}>
                  <TableCell className="font-mono text-xs">
                    {auftrag.auftragsnummer}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      to={`/auftraege/${auftrag.id}`}
                      className="hover:underline"
                    >
                      {auftrag.titel}
                    </Link>
                  </TableCell>
                  <TableCell>{kundeName(auftrag)}</TableCell>
                  <TableCell>
                    <AuftragStatusBadge status={auftrag.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(euroToCents(auftrag.betrag_netto))}
                  </TableCell>
                  <TableCell>
                    {formatDate(auftrag.created_at.slice(0, 10))}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Aktionen für ${auftrag.auftragsnummer}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
