import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { kundeAnzeigename } from '@/domain/kunde'
import { KundeListItem } from './KundeListItem'
import { KundeFormDialog } from './KundeFormDialog'
import { DeleteKundeDialog } from './DeleteKundeDialog'
import { useKunden, type Kunde } from './kunden-queries'

type TypFilter = 'alle' | 'privat' | 'firma'

export function KundenListPage() {
  const { data: kunden, isLoading, isError } = useKunden()
  const [search, setSearch] = useState('')
  const [typFilter, setTypFilter] = useState<TypFilter>('alle')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Kunde | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Kunde | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (kunden ?? []).filter((kunde) => {
      if (typFilter !== 'alle' && kunde.typ !== typFilter) return false
      if (!term) return true
      const haystack = [kundeAnzeigename(kunde), kunde.email ?? '', kunde.ort]
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [kunden, search, typFilter])

  const openCreate = () => {
    setEditing(undefined)
    setFormOpen(true)
  }
  const openEdit = (kunde: Kunde) => {
    setEditing(kunde)
    setFormOpen(true)
  }

  const hasKunden = (kunden ?? []).length > 0

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Kunden</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Neuer Kunde
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          placeholder="Kunden suchen …"
          aria-label="Kunden suchen"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="sm:max-w-xs"
        />
        <Tabs
          value={typFilter}
          onValueChange={(value) => setTypFilter(value as TypFilter)}
        >
          <TabsList>
            <TabsTrigger value="alle">Alle</TabsTrigger>
            <TabsTrigger value="privat">Privat</TabsTrigger>
            <TabsTrigger value="firma">Firma</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <ul className="space-y-3" aria-hidden>
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="rounded-lg border p-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-2 h-4 w-32" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <p role="alert" className="text-destructive text-sm">
          Die Kunden konnten nicht geladen werden. Läuft die Datenbank
          (Supabase)?
        </p>
      ) : !hasKunden ? (
        <EmptyState onCreate={openCreate} />
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Keine Kunden gefunden. Passe deine Suche oder den Filter an.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((kunde) => (
            <KundeListItem
              key={kunde.id}
              kunde={kunde}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </ul>
      )}

      <KundeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        kunde={editing}
      />
      <DeleteKundeDialog
        kunde={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </section>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center">
      <h2 className="font-medium">Noch keine Kunden</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Lege deinen ersten Kunden an, um loszulegen.
      </p>
      <Button className="mt-4" onClick={onCreate}>
        <Plus className="size-4" />
        Neuer Kunde
      </Button>
    </div>
  )
}
