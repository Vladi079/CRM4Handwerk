import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Status } from '@/domain/status'
import { kundeAnzeigename } from '@/domain/kunde'
import { useKunden } from '@/features/kunden/kunden-queries'
import { AuftraegeKanban } from './AuftraegeKanban'
import { AuftraegeTable } from './AuftraegeTable'
import { AuftragFormDialog } from './AuftragFormDialog'
import { DeleteAuftragDialog } from './DeleteAuftragDialog'
import {
  useAuftraege,
  useChangeAuftragStatus,
  type Auftrag,
} from './auftraege-queries'

type ViewMode = 'kanban' | 'tabelle'

export function AuftraegePage() {
  const { data: auftraege, isLoading, isError } = useAuftraege()
  const { data: kunden } = useKunden()
  const changeStatus = useChangeAuftragStatus()

  const [view, setView] = useState<ViewMode>('kanban')
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
  const kundeName = (auftrag: Auftrag) => {
    const kunde = kundenById.get(auftrag.kunde_id)
    return kunde ? kundeAnzeigename(kunde) : '—'
  }

  const openCreate = () => {
    setEditing(undefined)
    setFormOpen(true)
  }
  const openEdit = (auftrag: Auftrag) => {
    setEditing(auftrag)
    setFormOpen(true)
  }
  const onChangeStatus = (auftrag: Auftrag, to: Status) => {
    changeStatus.mutate({ auftrag, to })
  }

  const hasAuftraege = (auftraege ?? []).length > 0

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Aufträge</h1>
        <div className="flex items-center gap-3">
          {hasAuftraege && (
            <Tabs
              value={view}
              onValueChange={(value) => setView(value as ViewMode)}
            >
              <TabsList>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
                <TabsTrigger value="tabelle">Tabelle</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Neuer Auftrag
          </Button>
        </div>
      </div>

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
      ) : view === 'kanban' ? (
        <AuftraegeKanban
          auftraege={auftraege ?? []}
          kundeName={kundeName}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onChangeStatus={onChangeStatus}
        />
      ) : (
        <AuftraegeTable
          auftraege={auftraege ?? []}
          kundeName={kundeName}
          kundenOptions={kundenOptions}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
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
