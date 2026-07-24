import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getAllowedTransitions,
  getResetTarget,
  type Status,
} from '@/domain/status'
import { kundeAnzeigename } from '@/domain/kunde'
import { useKunden } from '@/features/kunden/kunden-queries'
import { useProfile } from '@/features/einstellungen/profile-queries'
import { AuftragStatusBadge } from './AuftragStatusBadge'
import { AuftragStatusTimeline } from './AuftragStatusTimeline'
import { AuftragMoneyCard } from './AuftragMoneyCard'
import { AuftragNotizen } from './AuftragNotizen'
import { AuftragFormDialog } from './AuftragFormDialog'
import { DeleteAuftragDialog } from './DeleteAuftragDialog'
import { STATUS_LABELS } from './auftrag-labels'
import { useAuftrag, useChangeAuftragStatus } from './auftraege-queries'

export function AuftragDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: auftrag, isLoading, isError } = useAuftrag(id)
  const { data: kunden } = useKunden()
  const { data: profile } = useProfile()
  const changeStatus = useChangeAuftragStatus()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (isError || !auftrag) {
    return (
      <div className="space-y-4">
        <BackLink />
        <p role="alert" className="text-destructive text-sm">
          Dieser Auftrag konnte nicht geladen werden.
        </p>
      </div>
    )
  }

  const kunde = (kunden ?? []).find((item) => item.id === auftrag.kunde_id)
  const transitions = getAllowedTransitions(auftrag.status)
  const resetTarget = getResetTarget(auftrag.status)

  const changeTo = (to: Status) => changeStatus.mutate({ auftrag, to })

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-muted-foreground font-mono text-xs">
            {auftrag.auftragsnummer}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {auftrag.titel}
          </h1>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <AuftragStatusBadge status={auftrag.status} />
            {kunde && (
              <Link
                to={`/kunden/${kunde.id}`}
                className="hover:text-foreground"
              >
                {kundeAnzeigename(kunde)}
              </Link>
            )}
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

      {(transitions.length > 0 || resetTarget) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">Status ändern:</span>
          {transitions.map((status) => (
            <Button
              key={status}
              size="sm"
              disabled={changeStatus.isPending}
              onClick={() => changeTo(status)}
            >
              {STATUS_LABELS[status]}
            </Button>
          ))}
          {resetTarget && (
            <Button
              variant="outline"
              size="sm"
              disabled={changeStatus.isPending}
              onClick={() => changeTo(resetTarget)}
            >
              Zurücksetzen: {STATUS_LABELS[resetTarget]}
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Verlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <AuftragStatusTimeline auftrag={auftrag} today={new Date()} />
          </CardContent>
        </Card>

        <AuftragMoneyCard
          auftrag={auftrag}
          kleinunternehmer={profile?.kleinunternehmer ?? false}
        />
      </div>

      {auftrag.beschreibung && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Beschreibung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {auftrag.beschreibung}
            </p>
          </CardContent>
        </Card>
      )}

      <AuftragNotizen auftragId={auftrag.id} />

      <AuftragFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        auftrag={auftrag}
      />
      <DeleteAuftragDialog
        auftrag={deleteOpen ? auftrag : null}
        onOpenChange={setDeleteOpen}
        onDeleted={() => void navigate('/auftraege')}
      />
    </div>
  )
}

function BackLink() {
  return (
    <Link
      to="/auftraege"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
    >
      <ArrowLeft className="size-4" />
      Zurück zu den Aufträgen
    </Link>
  )
}
