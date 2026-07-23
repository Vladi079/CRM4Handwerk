import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { canDeleteKunde, kundeAnzeigename } from '@/domain/kunde'
import {
  useDeleteKunde,
  useKundeAuftragCount,
  type Kunde,
} from './kunden-queries'

interface DeleteKundeDialogProps {
  /** The customer to delete, or null when the dialog is closed. */
  kunde: Kunde | null
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function DeleteKundeDialog({
  kunde,
  onOpenChange,
  onDeleted,
}: DeleteKundeDialogProps) {
  const open = kunde !== null
  // Only ask the database for the job count while the dialog is actually open.
  const countQuery = useKundeAuftragCount(kunde?.id ?? '', open)
  const deleteKunde = useDeleteKunde()

  const check = canDeleteKunde(countQuery.data ?? 0)
  const checking = open && countQuery.isLoading

  const handleDelete = async () => {
    if (!kunde || !check.allowed) return
    await deleteKunde.mutateAsync(kunde.id)
    onOpenChange(false)
    onDeleted?.()
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !next && onOpenChange(false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kunde löschen</AlertDialogTitle>
          <AlertDialogDescription>
            {checking
              ? 'Wird geprüft …'
              : check.allowed
                ? `Möchtest du ${
                    kunde ? kundeAnzeigename(kunde) : 'diesen Kunden'
                  } wirklich löschen? Das kann nicht rückgängig gemacht werden.`
                : check.reason}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          {check.allowed && !checking && (
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
              disabled={deleteKunde.isPending}
            >
              {deleteKunde.isPending ? 'Wird gelöscht …' : 'Löschen'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
