import { useMemo, useState } from 'react'
import { MoreHorizontal, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { euroToCents } from '@/domain/money'
import { kundeAnzeigename } from '@/domain/kunde'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { useKunden } from '@/features/kunden/kunden-queries'
import { AuftragStatusBadge } from './AuftragStatusBadge'
import { AuftragFormDialog } from './AuftragFormDialog'
import { DeleteAuftragDialog } from './DeleteAuftragDialog'
import { AuftraegeFilters, type AuftraegeFilterState } from './AuftraegeFilters'
import { useAuftraege, type Auftrag } from './auftraege-queries'

const INITIAL_FILTERS: AuftraegeFilterState = {
  status: 'alle',
  kundeId: 'alle',
  von: '',
  bis: '',
}

export function AuftraegeTablePage() {
  const { data: auftraege, isLoading, isError } = useAuftraege()
  const { data: kunden } = useKunden()
  const [filters, setFilters] = useState<AuftraegeFilterState>(INITIAL_FILTERS)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Auftrag | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Auftrag | null>(null)

  const kundenById = useMemo(
    () => new Map((kunden ?? []).map((kunde) => [kunde.id, kunde])),
    [kunden],
  )
  const kundenOptions = useMemo(
    () =>
      (kunden ?? []).map((kunde) => ({
        value: kunde.id,
        label: kundeAnzeigename(kunde),
      })),
    [kunden],
  )

  const filtered = useMemo(() => {
    return (auftraege ?? []).filter((auftrag) => {
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

  const openCreate = () => {
    setEditing(undefined)
    setFormOpen(true)
  }
  const openEdit = (auftrag: Auftrag) => {
    setEditing(auftrag)
    setFormOpen(true)
  }

  const kundeName = (auftrag: Auftrag) => {
    const kunde = kundenById.get(auftrag.kunde_id)
    return kunde ? kundeAnzeigename(kunde) : '—'
  }

  const hasAuftraege = (auftraege ?? []).length > 0

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Aufträge</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Neuer Auftrag
        </Button>
      </div>

      {hasAuftraege && (
        <AuftraegeFilters
          value={filters}
          onChange={setFilters}
          kundenOptions={kundenOptions}
        />
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p role="alert" className="text-destructive text-sm">
          Die Aufträge konnten nicht geladen werden. Läuft die Datenbank?
        </p>
      ) : !hasAuftraege ? (
        <EmptyState onCreate={openCreate} />
      ) : filtered.length === 0 ? (
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
                  <TableCell className="font-medium">{auftrag.titel}</TableCell>
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
                        <DropdownMenuItem onSelect={() => openEdit(auftrag)}>
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setDeleteTarget(auftrag)}
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

      <AuftragFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        auftrag={editing}
      />
      <DeleteAuftragDialog
        auftrag={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </section>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center">
      <h2 className="font-medium">Noch keine Aufträge</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Lege deinen ersten Auftrag an, um loszulegen.
      </p>
      <Button className="mt-4" onClick={onCreate}>
        <Plus className="size-4" />
        Neuer Auftrag
      </Button>
    </div>
  )
}
