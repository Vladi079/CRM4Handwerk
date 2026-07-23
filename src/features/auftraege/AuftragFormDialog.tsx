import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { kundeAnzeigename } from '@/domain/kunde'
import { useKunden } from '@/features/kunden/kunden-queries'
import { AuftragForm } from './AuftragForm'
import {
  auftragToFormValues,
  emptyAuftragFormValues,
  type Auftrag,
  type AuftragFormValues,
} from './auftrag-schema'
import { useCreateAuftrag, useUpdateAuftrag } from './auftraege-queries'

interface AuftragFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auftrag?: Auftrag
}

export function AuftragFormDialog({
  open,
  onOpenChange,
  auftrag,
}: AuftragFormDialogProps) {
  const formId = useId()
  const isEdit = auftrag !== undefined
  const { data: kunden } = useKunden()
  const createAuftrag = useCreateAuftrag()
  const updateAuftrag = useUpdateAuftrag(auftrag?.id ?? '')
  const mutation = isEdit ? updateAuftrag : createAuftrag
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const kundenOptions = useMemo(
    () =>
      (kunden ?? []).map((kunde) => ({
        value: kunde.id,
        label: kundeAnzeigename(kunde),
      })),
    [kunden],
  )

  const handleSubmit = async (values: AuftragFormValues) => {
    setErrorMessage(null)
    try {
      await mutation.mutateAsync(values)
      onOpenChange(false)
    } catch {
      setErrorMessage('Speichern fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  const hasKunden = kundenOptions.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Auftrag bearbeiten' : 'Neuer Auftrag'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Ändere die Daten des Auftrags.'
              : 'Lege einen neuen Auftrag an. Die Auftragsnummer wird automatisch vergeben.'}
          </DialogDescription>
        </DialogHeader>

        {hasKunden ? (
          <>
            <AuftragForm
              key={auftrag?.id ?? 'new'}
              formId={formId}
              defaultValues={
                auftrag ? auftragToFormValues(auftrag) : emptyAuftragFormValues
              }
              kundenOptions={kundenOptions}
              onSubmit={handleSubmit}
            />

            {errorMessage && (
              <p role="alert" className="text-destructive text-sm">
                {errorMessage}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit" form={formId} disabled={mutation.isPending}>
                {mutation.isPending ? 'Wird gespeichert …' : 'Speichern'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Du brauchst zuerst einen Kunden, bevor du einen Auftrag anlegen
              kannst.
            </p>
            <DialogFooter>
              <Button asChild onClick={() => onOpenChange(false)}>
                <Link to="/kunden">Zu den Kunden</Link>
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
