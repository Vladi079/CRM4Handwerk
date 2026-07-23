import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { KundeForm } from './KundeForm'
import {
  emptyKundeFormValues,
  kundeToFormValues,
  type Kunde,
  type KundeFormValues,
} from './kunde-schema'
import { useCreateKunde, useUpdateKunde } from './kunden-queries'

interface KundeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When set, the dialog edits this customer; otherwise it creates a new one. */
  kunde?: Kunde
}

export function KundeFormDialog({
  open,
  onOpenChange,
  kunde,
}: KundeFormDialogProps) {
  const formId = useId()
  const isEdit = kunde !== undefined
  const createKunde = useCreateKunde()
  const updateKunde = useUpdateKunde(kunde?.id ?? '')
  const mutation = isEdit ? updateKunde : createKunde
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (values: KundeFormValues) => {
    setErrorMessage(null)
    try {
      await mutation.mutateAsync(values)
      onOpenChange(false)
    } catch {
      setErrorMessage('Speichern fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Kunde bearbeiten' : 'Neuer Kunde'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Ändere die Stammdaten des Kunden.'
              : 'Lege einen neuen Kunden an.'}
          </DialogDescription>
        </DialogHeader>

        <KundeForm
          key={kunde?.id ?? 'new'}
          formId={formId}
          defaultValues={
            kunde ? kundeToFormValues(kunde) : emptyKundeFormValues
          }
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
      </DialogContent>
    </Dialog>
  )
}
