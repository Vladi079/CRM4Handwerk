import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { kundeAnzeigename } from '@/domain/kunde'
import { KundeFormDialog } from './KundeFormDialog'
import { DeleteKundeDialog } from './DeleteKundeDialog'
import { useKunde, type Kunde } from './kunden-queries'

export function KundeDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: kunde, isLoading, isError } = useKunde(id)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (isError || !kunde) {
    return (
      <div className="space-y-4">
        <BackLink />
        <p role="alert" className="text-destructive text-sm">
          Dieser Kunde konnte nicht geladen werden.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {kundeAnzeigename(kunde)}
            </h1>
            <Badge variant="secondary">
              {kunde.typ === 'firma' ? 'Firma' : 'Privat'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Bearbeiten
          </Button>
          <Button variant="outline" onClick={() => setDeleteOpen(true)}>
            Löschen
          </Button>
        </div>
      </div>

      <Stammdaten kunde={kunde} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Objekte</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Die Objektverwaltung folgt in einer späteren Phase.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Auftragshistorie</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Die Aufträge dieses Kunden erscheinen hier, sobald die
          Auftragsverwaltung gebaut ist.
        </CardContent>
      </Card>

      <KundeFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        kunde={kunde}
      />
      <DeleteKundeDialog
        kunde={deleteOpen ? kunde : null}
        onOpenChange={setDeleteOpen}
        onDeleted={() => void navigate('/kunden')}
      />
    </div>
  )
}

function BackLink() {
  return (
    <Link
      to="/kunden"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
    >
      <ArrowLeft className="size-4" />
      Zurück zur Kundenliste
    </Link>
  )
}

function Stammdaten({ kunde }: { kunde: Kunde }) {
  const rows: { label: string; value: string }[] = [
    { label: 'Anrede', value: kunde.anrede ?? '—' },
    { label: 'Name', value: `${kunde.vorname} ${kunde.nachname}`.trim() },
    { label: 'E-Mail', value: kunde.email ?? '—' },
    { label: 'Telefon', value: kunde.telefon ?? '—' },
    { label: 'Adresse', value: `${kunde.strasse}, ${kunde.plz} ${kunde.ort}` },
    { label: 'Notizen', value: kunde.notizen ?? '—' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Stammdaten</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-muted-foreground text-sm">{row.label}</dt>
              <dd className="text-sm break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
