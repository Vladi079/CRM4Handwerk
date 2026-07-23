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
import { useDeleteAuftrag, type Auftrag } from './auftraege-queries'

interface DeleteAuftragDialogProps {
  auftrag: Auftrag | null
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function DeleteAuftragDialog({
  auftrag,
  onOpenChange,
  onDeleted,
}: DeleteAuftragDialogProps) {
  const open = auftrag !== null
  const deleteAuftrag = useDeleteAuftrag()

  const handleDelete = async () => {
    if (!auftrag) return
    await deleteAuftrag.mutateAsync(auftrag.id)
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
          <AlertDialogTitle>Auftrag löschen</AlertDialogTitle>
          <AlertDialogDescription>
            {auftrag
              ? `Möchtest du den Auftrag „${auftrag.titel}" (${auftrag.auftragsnummer}) wirklich löschen? Das kann nicht rückgängig gemacht werden.`
              : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleDelete()
            }}
            disabled={deleteAuftrag.isPending}
          >
            {deleteAuftrag.isPending ? 'Wird gelöscht …' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
